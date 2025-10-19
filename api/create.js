// What this file will do:

// Receive: playlistName and validUris from frontend
// Get user ID
// Create playlist
// Add songs to playlist
// Return success response

export default async function handler(req, res) {
    if(req.method != 'POST') {
        res.status(405).json({error: "Onlyu POST allowed"})
        return
    }

    // extract data fron its body
    const {playlistName, validUris, token} = req.body

    // validate if token is there ya saare milke hume chutiya bana rhe 
    if(!token) {
        res.status(401).json({error: "No token provided"})
        return
    }

    // do the same with playlistName and validUris
    if(!playlistName || !validUris || validUris.length === 0) {
        res.status(400).json({error: "Missing playlsit data"})
        return
    }

    // the main thing now 
    try {
        // get the fuckin user id mfk
        const userID = await getUserId(token)
        console.log("User ID:", userID)

        // create the empty playlist for this mfk dude and give the playlistId
        const playlistId = await createPlaylist(userID, playlistName, token)
        console.log("Playlist Id: ", playlistId)

        // add songs to the created playlist now 
        await addSongsToPlaylist(playlistId, validUris, token)
        console.log("Songs added in your playlist!!! now fuck off!!! ")

        // send the respopnse to the frontend
        res.status(200).json({
            success:true,
            playlistId: playlistId,
            playlistName: playlistName,
            songsAdded: validUris.length
        })

    } catch (error) {
        console.error('Error creating playlist:', error)
        res.status(500).json({error: error.message})
    }





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





