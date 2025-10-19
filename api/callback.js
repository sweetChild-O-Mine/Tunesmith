// main backedn file 
export default async function handler(req, res) {


    // vercel autometically parses the data into json so you dont need to do it mannualy or also u dont need awai 
    const {code} = req.body

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = "http://127.0.0.1:3000/callback"

    // we do need to add header here Authorization: Basic <base64 encoded clientId:clientSecret>

    // but it also accepts in the format in which we wrote it like directly adding client id and secert into the body so abhi aese kar lo 
    // Use Content-Type: application/x-www-form-urlencoded header

    // spotify expects data in a speci format called url-encodded format just like we ceated authlink waise hi karna hai sab 
    const body = new URLSearchParams({
        grant_type: 'authorization_code', // just a req parameter....which says i am exchanging an autorization code for an access token  
        // basically yeh bata hai ki hum kya bhej rahe hain
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: client_secret
    })
    

    // make the fethc request to spotify endpoint
    const response = await fetch('https://accounts.spotify.com/api/token',{
        method: 'POST',
        // now header mfk 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    } )

    // get the data from the response(yayyy acess token finallyyyy)
    const data = await response.json() //udhar se string me aayaega so make it js object again 

    // send it back to the frontend 
    res.status(200).json(data);


}