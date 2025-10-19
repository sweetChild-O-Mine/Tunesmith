import { GoogleGenAI } from "@google/genai";
// create cnnection to gmeini
const ai = new GoogleGenAI({})

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
        res.status(401)({error: "No access token provided "})
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

    // finally the main req 
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: aiPrompt,
        generationConfig: {
            response_mime_type: "application/json"
        }
    })

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

    // create arr usnig promises using .map()
    const searchPromises = songs.map(songObj => {
        return searchSongOnSpotify(songObj, token)
    })

    // w8 for all promise to resolve at the same time
    const songUris = await Promise.all(searchPromises)
    
    // 3. filter nulls
    // const validUris = songUris.filter(uri => uri != null )

    const validUris = songUris
        .filter(data => data !== null)
        .map(data => data.uri)


    console.log('Found URIs', validUris)


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


    res.status(200).json({
        playlistName: playlistName,
        songs: songs.map((song, index) => {
            const songData = songUris[index]
            return {
                song: song.song,
                artist: song.artist,
                uri: songData?.uri || null,
                albumArt: songData?.albumArt || null,
                externalUrl: songData?.externalUrl || null,
                found: songData !== null
            }
        })
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
            albumArt: bestTrack.album.images[2]?.url || track.album.images[0]?.url,
            externalUrl: bestTrack.external_urls.spotify
        }

    }


    return null
}
