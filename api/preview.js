import { GoogleGenAI } from "@google/genai";
// create cnnection to gmeini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

// fucntion for req
export default async function handler(req, res) {

    // checck if the req is post or not 
    if(req.method !== 'POST'){
        res.status(405).json({error: "only 'POST' method  is allowed"})
        return;
    } 

    //extract user's prompt and aceess token from body
    const {prompt, token} = req.body

    if(!token) {
        res.status(401).json({error: "No access token provided "})
        return
    }



    // prompt which  we gonna feed to gemini 
    const aiPrompt = `
    You are a music curation expert. Analyze the user's request and return a list of songs.
    User request: "${prompt}"
    For each song, return EXACT title and artist name as they appear on Spotify.
    Be very specific with song titles.

    Return ONLY a JSON object with this exact structure:
    {
        "playlistName": "A creative name for this playlist",
        "songs": [
        { "song": "Song Title 1", "artist": "Artist Name 1" },
        { "song": "Song Title 2", "artist": "Artist Name 2" }
        ]
    }
    Return ONLY valid JSON.
    `;

    // // finally the main req 
    // const response = await ai.models.generateContent({
    //     model: "gemini-2.5-pro",
    //     contents: aiPrompt,
    //     generationConfig: {
    //         response_mime_type: "application/json"
    //     }
    // })


    // mainreq they say
    let response;
    let MAX_RETRIES = 3;
    let retries = MAX_RETRIES

    while(retries > 0) {
        try {
            console.log(`Gemini attempt ${MAX_RETRIES - retries + 1} of ${MAX_RETRIES}`)
            response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: aiPrompt,
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
            console.log("Gemini request sucessful!!!")
            break;
        } catch (error) {
            console.log(`Gemini Attempt ${MAX_RETRIES -retries + 1} failed:`, error.message)
            retries-- ;
            if(retries === 0) {
                console.log("All gemini retries failed, Giving up!!")
                return res.status(503).json({error: "AI serivce is overloaded pls w8 for 30 seconds"})
            }

            // if stilll attempts bai hain then just let him wait and do the shit 
            console.log(`Waiting 2 seconds before next retry... (${retries} retries left)`)
            await new Promise(resolve => setTimeout(resolve, 2000))
        }

    }

    console.log(response)
    console.log(response.text)

    // cleraing the response as woh mrkdown me bhej rha hai 
    let jsonString = response.text.trim()

    // if it starts with markdown kindsa thing then 
    if(jsonString.startsWith("```")) {
        // begginning ka ```josn hatao 
        jsonString = jsonString.replace(/^```[a-z]*\n?/, '')
        // ending ka ```hatao bc 
        jsonString = jsonString.replace(/\n?```$/, '')
    }

    // now parse the response to json and send it mfk 
    const data = JSON.parse(jsonString.trim())

    // extract the data nigg
    const playlistName = data.playlistName
    const songs = data.songs

    console.log(playlistName)
    console.log(songs)

    // // create arr usnig promises using .map()
    // const searchPromises = songs.map(songObj => {
    //     return searchSongOnSpotify(songObj, token)
    // })

    // // w8 for all promise to resolve at the same time
    // const songUris = await Promise.all(searchPromises)
    
    // // 3. filter nulls
    // // const validUris = songUris.filter(uri => uri != null )

    // const validUris = songUris
    //     .filter(data => data !== null)
    //     .map(data => data.uri)

    // important thing starts from here 
    // console.log('Found URIs', validUris)

    console.log("starting batched spotify search")
    const foundSongsData = []
    const batchSize = 5

    for (let i = 0; i < songs.length ; i +=batchSize) {
        const batch = songs.slice(i, i+batchSize)
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);

// Create search promises for the current batch
      const searchPromises = batch.map(songObj => 
        searchSongOnSpotify(songObj, token) // Call your function for each song
          .catch(err => { // Catch errors within the batch
            console.error(`Error searching "${songObj.song}":`, err);
            return null; // Ensure Promise.all doesn't fail on one error
          })
      );
      
      // Wait for the current batch to resolve
      const batchResults = await Promise.all(searchPromises);
      
      // Add successful results (non-null objects) to our main array
      batchResults.forEach(songData => {
        if (songData) { // Check if it's not null
          foundSongsData.push(songData); 
        } 
      });

      // Optional delay between batches
      if (i + batchSize < songs.length) { 
         await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms
      }
    }
    console.log("Finished batched search. Found songs:", foundSongsData.length);







    // send it now also isko json string me convert krdo bhjejne se pehle also one more thing si that res.jsonautometically does JSON.stringfy() for you....aww so sweet nigg
    // res.status(200).json(data) 

//     res.status(200).json({
//         playlistName: playlistName,
//         songs: songs.map((song, index) => ({
//             song: song.song,
//             artist: song.artist,
//             uri: songUris[index],
//             found: songUris[index] !== null
//         }) )
// })

console.log("Final response being sent:", {
    playlistName: playlistName,
    songs: songs
})



    res.status(200).json({
        playlistName: playlistName,
    songs: foundSongsData.map(songData => ({ 
            song: songData.name, // Use Spotify's name
            artist: songData.artist, // Use Spotify's artists string
            uri: songData.uri,
            albumArt: songData.albumArt,
            externalUrl: songData.externalUrl,
            found: true // All songs in this list were successfully found
        }))
})


}

    // funtion to search one song onspotify
async function searchSongOnSpotify(songObj, token) {
    // sobgObj is basically the songs data or we can say it..s song like the each or single element of songs arr
    // take the primary artist only 
    const primaryArtist = songObj.artist.split(',')[0].trim()
    console.log(`Searching for: ${songObj.song} by ${primaryArtist} `)
    // using primary artist
    let searchQuery = `${songObj.song} ${primaryArtist} `
    // let searchQuery = `track:${songObj.song} artist:${primaryArtist} `

    // encode the seqrch query
    const encodedQuery = encodeURIComponent(searchQuery)

    // make the spootifyUrl 
    const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=3`

    const spotifyResponse = await fetch(spotifyUrl, {
        method: 'GET',
        headers: {
            'Authorization' : `Bearer ${token}`,
        }
    })
    
    if(!spotifyResponse.ok) {
        console.error('Spotify errro:', spotifyResponse.status)
        return null
    }
    
    //convert it to json data
    const spotifyData = await spotifyResponse.json()
    // spotifyResponse = Raw HTTP response (data + headers + status)
    // but .josn() extract the body and parse karke js object bana dega 

    const track = spotifyData.tracks.items[0]

    

    // if (spotifyData.tracks.items.length > 0) {
    //     return spotifyData.tracks.items[0].uri
    // }

    
    if(spotifyData.tracks.items.length > 0 ) {

        let bestTrack = null

        for(let i = 0; i< spotifyData.tracks.items.length; i++) {
            const track = spotifyData.tracks.items[i]
            const trackArtists = track.artists.map(a => a.name.toLowerCase())

            // now find if our expectied artist is in track's artitst list or something 
            const isMatch = trackArtists.some( artist => 
                artist.includes(primaryArtist.toLowerCase())
            )
    
            if (isMatch) {
                bestTrack = track
                break;
            }
        }

        if(!bestTrack){
            console.log(`No exact artist match for: ${songObj.song} `)
            bestTrack = spotifyData.tracks.items[0]
        }

        return {
            uri: bestTrack.uri,
            name: bestTrack.name,
            albumArt: bestTrack.album.images[2]?.url || track.album.images[0]?.url,
            externalUrl: bestTrack.external_urls.spotify
        }

    }


    return null
}
