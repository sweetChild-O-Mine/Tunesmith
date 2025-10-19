import { useState, useEffect } from "react"
import { PlaylistGenerator } from "./components/PlaylistGenerator"
import { Navbar } from "./components/Navbar";
import vinyl from "./assets/BenBois_Vinyl_records.svg";
import vinyl3 from "./assets/f1.png";
import vinyl2 from "./assets/f3.webp";
import cas3 from "./assets/c2.webp";
import cas from "./assets/g1.png";
import cas2 from "./assets/c1.png";


function App() {

  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null)

  // useEffect for our fetch  request and a ll 
  useEffect(() => {

    const accessToken = localStorage.getItem('spotify_access_token')

    if(accessToken) {
      setToken(accessToken)
    }


  },[])

  useEffect(() => {

    if(token != null) {
      testSpotifyAPI()
      console.log('testSpotifyApi executed')
    }

  },[token])
  

    // our fetch fucntion and use this token to get user details 
    const testSpotifyAPI = async () => {
      // makefetch req
      fetch('https://api.spotify.com/v1/me', {
        // type of post 
        method: 'GET',
        headers: {
          'Authorization' : `Bearer ${token}`,
          'Content-Type' : 'application/json'
        }
      })
      .then((response) => {
        if(!response.ok) {    //read it like response ok nhi hai kya ???
          throw new Error(`HTTP error! status ${response.status} `)
        }

        // return the final reponse
        return response.json()  //response milega from spotify so convert krao usko and we'll use that thing
      })
      .then(data => {
        console.log('Success yayyy!!!', data)
        setProfile(data)
      })
      .catch(error => {
        console.error('Error fetching data', error)
      })
    }




  const handleLogin = () => {

    /* 
    https://accounts.spotify.com/authorize?
    client_id=YOUR_CLIENT_ID&
    response_type=code&
    redirect_uri=YOUR_REDIRECT_URI&
    scope=PERMISSIONS_YOU_NEED
    */

    // client id lao 
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID

    // response_type
    const response_type = "code"

    // redirectUrl :- where spotify sends user back to your app after getting the things
    const redirect_url = 'http://127.0.0.1:3000/callback'

    // we gonna use ip address for localhost form now as thats the need of the hour nigga


    // scope :- what are the permission you arer askng for
    // for creatng
    const scope = "playlist-modify-public playlist-modify-private"

    const baseUrl = "https://accounts.spotify.com/authorize"

    // approach one is 
    // let authUrl = baseUrl + "?" + "client_id=" + clientId +"&" + "response_type=" + response_type + "&" + "redirect_url=" + redirect_url + "&" + "scope=" + scope 

    // approach 2 more cleaner 
    // also use endocdeURIComponent for cnverting space and all into actual needed things 
    const authUrl = `${baseUrl}?client_id=${clientId}&response_type=${response_type}&redirect_uri=${encodeURIComponent(redirect_url)}&scope=${encodeURIComponent(scope)}  `
    
    // redirecting browser to our authUrl 
    window.location.replace(authUrl)

    console.log(authUrl)

  }

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token')

    // make the states null
    setToken(null)
    setProfile(null)
  }


return (

<div className="min-h-screen w-full relative bg-black">
    {/* Emerald Depths Background with Top Glow */}
    <div
      className="absolute inset-0 z-0"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000",
      }}
    />

    
  
    {/* Your Content/Components */}

    <Navbar />

           <div className="relative left-32 z-20 w-px h-full bg-gradient-to-b from-neutral-300 via-neutral-200 to-transparent inset-y-0  " />



           {/* main container  */}
      <div className="relative max-w-6xl min-h-screen flex flex-col gap-4  mx-auto">
        

           <div className="absolute left-24 w-px h-full bg-gradient-to-b from-transparent via-neutral-800 to-transparent inset-y-0 " />
           <div className="absolute right-24 w-px h-full bg-gradient-to-b from-transparent via-neutral-800 to-transparent inset-y-0 " />


        {/* <div className="w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/21 h-32 bg-gradient-to-r from-transparent via-green-600/40 to-transparent blur-3xl"/> */}

      {!token ? (

        // treating this as a whole compo.
        // div container for these things
        <div className=" max-w-6xl mt-8 flex flex-col font-sans items-center gap-4 mx-auto p-4 border-white  ">

          {/* div for heading  */}
          <div className=" border-neutral-300 text-neutral-400 ">
            <h1 className="text-6xl text-center bg-gradient-to-r from-stone-200 via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
              Find Your Playlist
            </h1>
          </div>

          {/* <h3 className="text-3xl text-neutral-300 mt-2">More than just Music</h3> */}

          {/* contaier for the BOX parts of the design */}
          {/* <div className=" w-full bg-gradient-to-b from-black/10 to-red-950/40 backdrop-blur-lg gap-10 rounded-3xl text-neutral-200 flex flex-col items-center px-6 py-4 "> */}
          {/* </div> */}

            <p className="text-center my-3 text-base leading-relaxed text-neutral-300  ">
                    Let AI create the perfect playlist for any<br /> 
      Just describe it what you 
            </p>

            <div className="">
              {/* first button  */}
              {/* <button className="px-8 py-2 mt-2 rounded-lg text-md bg-gradient-to-b from-green-800 to-teal-800/20 text-shadow-2xs text-shadow-neutral-800 text-neutral-200 cursor-pointer shadow-lg transition-all duration-200 "
              onClick={handleLogin}
              >
                Login with Spotify
              </button> */}

              <button
              onClick={handleLogin}
              className="group relative px-6 py-2 bg-transparent rounded-full text-neutral-200 font-semibold overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ">
                {/* background glow layer ke liye  */}
                <div className="absolute inset-0 bg-gradient-to-r rounded-full from-neutral-900 via-emerald-800 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl "></div>
                {/* for border and all lets see */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-green-600/20 to-emerald-600/20 rounded-full transition-all duration-300 "></div>
                {/* for content */}
                <span className="relative z-10 flex justify-center items-center gap-3">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>

                  <p className="text-sm text-white
                  group-hover:drop-shadow-neutral-950 text-shadow-neutral-950
                  ">Login with Spotify</p>
                </span>

              </button>

            </div>

            <div className="w-sm mt-4 border-t border-neutral-500" />

            {/* gridd for that old ui but ig not needed now maybe */}
            {/* <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 ">
              <div className=""></div>
              <div className=""></div>
            </div> */}

            {/* div for the image */}
            <div className=" border-white 2 max-w-7xl mx-auto  ">
              <img 
              src={vinyl2}
              alt="vinyl-img" 
              height={700}
              width={900}
              className="object-contain  mask-b-from-20% mask-b-to-80% " />
            </div>

            

        </div>

      ) : (

        // main container
        <div className="w-full mt-20 text-neutral-50 ">

          <div className="flex justify-center items-center flex-col gap-3 py-4">
            {/* div for the heading  */}
            {/* <div className="flex justify-center "> */}
              {/* <h1 className="">Hii..</h1> */}
              {/* if porfile exist then do this else that  */}
              {/* {profile && <p>{`${profile.display_name}!!`}</p> } */}
            {/* </div> */}

            <PlaylistGenerator />
            {/* <button
            className="px-6 py-3 mt-10 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-300 cursor-pointer"
            onClick={handleLogout}
            >Logout</button> */}
          </div>
        </div>
      )}

      </div>
  </div>





  )
}

export default App




