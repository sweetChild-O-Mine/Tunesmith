import { GoogleGenerativeAI } from "@google/genai";

// Initialize Gemini SDK
const ai = new GoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY
});

// --- Function to search one song on Spotify ---
async function searchSongOnSpotify(songObj, token) {
    // take the primary artist only
    const primaryArtist = songObj.artist.split(',')[0].trim();
    console.log(`Searching for: ${songObj.song} by ${primaryArtist}`);
    // using primary artist
    let searchQuery = `${songObj.song} ${primaryArtist}`;
    // let searchQuery = `track:${songObj.song} artist:${primaryArtist}`; // Optional: Try stricter search if needed

    // encode the search query
    const encodedQuery = encodeURIComponent(searchQuery);

    // make the spotifyUrl
    const spotifyUrl = `https://api.spotify.com/v1/search?q=$${encodedQuery}&type=track&limit=3`; // Get top 3 results

    try {
        const spotifyResponse = await fetch(spotifyUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        // Handle specific auth errors immediately
        if (spotifyResponse.status === 401 || spotifyResponse.status === 403) {
            console.error(`Spotify Auth Error (${spotifyResponse.status}) for: ${songObj.song}`);
            throw new Error(`Spotify token error (${spotifyResponse.status})`); // Throw to stop the batch
        }

        if (!spotifyResponse.ok) {
            console.error(`Spotify API Error (${spotifyResponse.status}) for: ${songObj.song}`);
            // Return failure object for non-critical errors
            return { found: false, song: songObj.song, artist: songObj.artist };
        }

        //convert it to json data
        const spotifyData = await spotifyResponse.json();

        if (spotifyData.tracks.items.length > 0) {
            let bestTrack = null;
            const aiArtistLower = primaryArtist.toLowerCase();

            for (let track of spotifyData.tracks.items) {
                const trackArtistsLower = track.artists.map(a => a.name.toLowerCase());
                const isMatch = trackArtistsLower.some(artist =>
                    artist.includes(aiArtistLower) || aiArtistLower.includes(artist) // Simple check
                );

                if (isMatch) {
                    bestTrack = track;
                    break; // Found a good match
                }
            }

            // Fallback to first result if no exact artist match found in top 3
            if (!bestTrack) {
                console.log(`No exact artist match for: ${songObj.song}, using first result.`);
                bestTrack = spotifyData.tracks.items[0];
            }

            // Return detailed object on success
            return {
                found: true,
                uri: bestTrack.uri,
                name: bestTrack.name, // Spotify's name
                artist: bestTrack.artists.map(a => a.name).join(', '), // Spotify's artists
                albumArt: bestTrack.album.images[2]?.url || bestTrack.album.images[0]?.url,
                externalUrl: bestTrack.external_urls.spotify
            };
        } else {
            // If Spotify search returned zero items
             console.log(`Could not find any tracks for: ${songObj.song}`);
             return { found: false, song: songObj.song, artist: songObj.artist };
        }

    } catch (error) {
         console.error(`Network or other error searching "${songObj.song}":`, error);
         // Re-throw critical errors like token expiry to stop the main handler
         if (error.message?.includes('Spotify token error')) {
             throw error;
         }
         // Return failure object for other errors
         return { found: false, song: songObj.song, artist: songObj.artist };
    }
}


// --- Main API Handler ---
export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Only 'POST' method is allowed" });
    }

    const { prompt, token } = req.body;

    // Validate inputs
    if (!token) {
        return res.status(401).json({ error: "No access token provided" });
    }
    if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API Key not configured." });
    }
    if (!prompt) {
        return res.status(400).json({ error: "No prompt provided." });
    }

    try {
        // --- 1. Call AI ---
        const aiPrompt = `
            You are a music curation expert. Analyze the user's request: "${prompt}"
            Return ONLY a JSON object with this exact structure:
            {
                "playlistName": "A creative name for this playlist",
                "songs": [ { "song": "Song Title", "artist": "Artist Name" } ]
            }
            Return ONLY valid JSON. Be specific with song titles and artists.
        `;

        let aiApiResponse; // Renamed from 'response' to avoid conflict
        let MAX_RETRIES = 3;
        let retries = MAX_RETRIES;

        while (retries > 0) {
            try {
                console.log(`Gemini attempt ${MAX_RETRIES - retries + 1} of ${MAX_RETRIES}`);
                
                // --- CORRECTED SDK CALL ---
                const model = ai.getGenerator({ model: "gemini-1.5-flash" }); // Use flash for speed
                const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: aiPrompt }] }] });
                aiApiResponse = await result.response; // Get the response object
                // --- END CORRECTED SDK CALL ---

                console.log("Gemini request successful!");
                break; // Exit loop on success
            } catch (error) {
                console.log(`Gemini Attempt ${MAX_RETRIES - retries + 1} failed:`, error.message);
                retries--;
                if (retries === 0) {
                    console.log("All Gemini retries failed, Giving up!");
                    // Throw the error to be caught by the main try...catch
                    throw new Error("AI service is overloaded. Please try again later."); 
                }
                console.log(`Waiting 2 seconds before next retry... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!aiApiResponse) {
             throw new Error("Failed to get response from AI after retries.");
        }

        const jsonString = aiApiResponse.text().trim(); // Use the .text() method
        // Clean markdown (just in case)
        const cleanedJsonString = jsonString.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
        const aiData = JSON.parse(cleanedJsonString);

        const playlistName = aiData.playlistName;
        const songs = aiData.songs;

        console.log("Playlist Name:", playlistName);
        console.log("Songs from AI:", songs);

        if (!songs || !Array.isArray(songs) || songs.length === 0) {
            return res.status(200).json({ playlistName: playlistName || "Generated Playlist", songs: [], message: "AI could not generate songs for that prompt." });
        }

        // --- 2. Search Spotify in Batches ---
        console.log("Starting batched Spotify search...");
        const foundSongsData = [];
        const batchSize = 5;

        for (let i = 0; i < songs.length; i += batchSize) {
            const batch = songs.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

            const searchPromises = batch.map(songObj =>
                searchSongOnSpotify(songObj, token)
                // searchSongOnSpotify now throws critical errors (401/403)
                // We let Promise.all handle them
            );

            // Use Promise.allSettled to handle individual failures without stopping
            const batchResults = await Promise.allSettled(searchPromises);

            batchResults.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    // Add the object returned by searchSongOnSpotify
                    foundSongsData.push(result.value);
                } else if (result.status === 'rejected') {
                    // If searchSongOnSpotify threw a critical error, re-throw it
                    console.error("Critical Spotify error during batch:", result.reason);
                    throw result.reason; // This will be caught by the outer try...catch
                }
                // Implicitly ignore null or {found: false} if not needed?
                // Or maybe keep {found: false} results:
                // else if (result.status === 'fulfilled' && !result.value?.found) {
                //     foundSongsData.push(result.value); // Keep not found songs too
                // }
            });

            if (i + batchSize < songs.length) {
                await new Promise(resolve => setTimeout(resolve, 300)); // Delay
            }
        }
        console.log("Finished batched search. Processed songs:", foundSongsData.length);

        // --- 3. Send Final Response ---
        res.status(200).json({
            playlistName: playlistName,
            songs: foundSongsData // Send the array with {found: true/false, ...} objects
        });

    } catch (error) {
        // --- Central Error Handling ---
        console.error("Error in main handler:", error);
        if (error.message?.includes('Spotify token error')) {
            // Extract status code if possible e.g., "Spotify token error (401)"
            const statusCode = error.message.includes('401') ? 401 : 403;
            return res.status(statusCode).json({ error: "Spotify token expired or invalid. Please log out and back in." });
        }
        if (error.message?.includes('AI service is overloaded') || error.status === 503) {
             return res.status(503).json({ error: "AI service is currently unavailable. Please try again later." });
        }
        // Generic error
        res.status(500).json({ error: error.message || "An error occurred while processing the request." });
    }
}