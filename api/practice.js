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
        console.error({error: "No access token provided "})
        return
    }

    // spotify api end point 
    const spotifyApiEndpoint = "https://api.spotify.com/v1/search"
    // "developer.spotify.com/dashboard0"   gemini isko bol rha tha but i doubt 
    

    // prompt which  we gonna feed to gemini 
    const fullPrompt = `
    Take this playlist description: "${prompt}".
    Generate an array of objects for a Spotify playlist, 
    each with "song", "artist", and "album".
    Output ONLY valid JSON, e.g.:
    [{"song":"Song Title","artist":"Artist","album":"Album"}]
    `
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
    const validUris = songUris.filter(uri => uri != null )

    // get user id by using get userid fn
    const userId = await getUserId(token)
    console.log('User ID: ', userId)

    // get create the playlist and get the playlist id in return 
    const playlistId = await createPlaylist(userId, playlistName, token)
    console.log('Playlist id : ',playlistId )

    // add songs to the playlist 
    await addSongsToPlaylist(playlistId, validUris ,token)





    // send it now also isko json string me convert krdo bhjejne se pehle also one more thing si that res.jsonautometically does JSON.stringfy() for you....aww so sweet nigg
    // res.status(200).json(data) 

    res.status(200).json({
    playlistName: playlistName,
    foundSongs: validUris.length,
    playlistId: playlistId,
    uris: validUris
})

    console.log('Found URIs', validUris)

}

    // funtion to search one song onspotify
async function searchSongOnSpotify(songObj, token) {
    // sobgObj is basically the songs data or we can say it..s song like the each or single element of songs arr
    const searchQuery = `${songObj.song} ${songObj.artist}`

    // encode the seqrch query
    const encodedQuery = encodeURIComponent(searchQuery)

    // make the spootifyUrl 
    const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=1`

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

    if (spotifyData.tracks.items.length > 0) {
        return spotifyData.tracks.items[0].uri
    }

    return null
}

    // get the userID nig
    async function getUserId(token) {
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const userData = await userResponse.json()
        console.log('User Data: ', userData)

        return userData.id
    }

    // now create plalist nigg
    async function createPlaylist(userId, playlistName, token) {
        // contrusct url 
        const url = `https://api.spotify.com/v1/users/${userId}/playlists`

        // make post request
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: 'Handcrafted by Googles best Thinking Model and A Homo.....i mean Homo-sapien(ofc you typed the prompt so its you) ',
                public: false
            })
        })

        const playlistData = await response.json()

        console.log('Created Playlist Data:', playlistData)

        return playlistData.id
    }

    async function addSongsToPlaylist(playlistId, validUris, token) {

        // url banao 
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`

        // 2. post request kro re bc
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: validUris
            })
        })

        const addedSongs = await response.json()
        console.log("Added Songs:", addedSongs)

        return addedSongs

    }
