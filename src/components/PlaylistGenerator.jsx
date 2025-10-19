import {useRef, useState, useEffect} from 'react'
import vinyl from "../assets/BenBois_Vinyl_records.svg";
import vinyl2 from "../assets/f3.webp";
import cas3 from "../assets/c2.webp";
import cas from "../assets/g1.png";
import cas2 from "../assets/c1.png";
import hi from '../assets/hi.mp4'
import { SongCard } from './SongCard';
import { SpotifyBtn } from './SpotifyBtn';

export const PlaylistGenerator = () => {

    // state for prompt
    const [prompt, setPrompt] = useState("")
    const [playlist, setPlaylist] = useState(null)
    // to store songs data
    const [previewData, setPreviewData] = useState(null)    
    const [isLoading, setIsLoading] = useState(false)     //loading state for animation

    // handler for form submmison 
    const handleSubmit = (e) => {
      e.preventDefault()

    const token = localStorage.getItem('spotify_access_token')

    if(!token) {
      console.error("NO token found!! please login first!!.")
      return
    }

    // submit pr click hote hi bande ko laoding dikhayenge hum 
    setIsLoading(true)
      setPreviewData(null);


      // fetch call for api/generate
      fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt, token: token })
      })
      .then(response => response.json())    //backend se data bhi aayega nah toh
      .then(data => {
        console.log('Got the data yayyy!!!', data)
        setPreviewData(data) 
        // stop the loading and show him the fucking data nigg
        setIsLoading(false)
        setPrompt("")
      })
      .catch(error => {
        console.error("error fetching data", error)
        setIsLoading(false)
        setPreviewData(null)
        // alert the user
        alert("Failed to generate playlist. Please try again!!!")
      })
    }

    // fucntion to add the generated playlist to spotify 
    const handleAddToSpotify = () => {
      if(!previewData) return

      const token = localStorage.getItem('spotify_access_token')

      // start the loading coz abhi toh important kaam start ho rha hai 
      setIsLoading(true)

      // extract the uri from the data 
      const validUris = previewData.songs 
      // arr me jao then eacch element which is an object ke andar jao and found se pata karo ki song mila bhi hai yah sirf bakchodi horhi hai 
        .filter((song) => song.found )
        // ab agarmil gya hai toh finally song se uri nikal lo bc 
        .map(song => song.uri)

      // call the endpoint ki playlist banani hai for these uri 
      fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // send the body mfk 
        body: JSON.stringify({
          playlistName: previewData.playlistName,
          validUris: validUris,
          token: token
        })
      })
      .then(response => response.json() )
      .then(data => {
        console.log('Playlist created: ', data)
        setPlaylist(data)
        setIsLoading(false)
        setPreviewData(null)
        setPrompt("")
        alert("Playlist added to Spotify!!! now dance basanti")
      })
      .catch(error => {
        console.log('Error creatin playlist', error)
        setIsLoading(false)
      })
    }


    const textareaRef = useRef(null)

    useEffect(() => {
      const textarea = textareaRef.current
      if(textarea) {
        textarea.style.height = 'auto'
        const newHeight = Math.min(textarea.scrollHeight, 72)
        textarea.style.height = newHeight + 'px'
      }
    }, [prompt])


  return (
    <div className=' flex flex-col gap-4 items-center py-4 px-8' >

      {/* div for heading */}
      <div className="">
        <h1 className="text-5xl leading-tight text-center bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-400 bg-clip-text text-transparent ">Make Any Playlist <br /> 
        You Can Imagine
        </h1>

        <p className="text-lg text-neutral-300 text-center mt-4 ">Just Enter a Prompt and Get your Playlist</p>
      </div>

        {/* <form 
        className='flex items-center gap-2'
        onSubmit={handleSubmit}
        >
            <input 
            className='rounded-full px-4 pt-2 text-white bg-neutral-800'
            value={prompt}
            onChange={((e) => setPrompt(e.target.value))}
            />
            <button
            disabled = {isLoading}
            className='border rounded-md px-2 py-1'
            >
              {isLoading ? "Generating...": 'Generate Playlist'}
            </button>
            <p className="">
              
            </p>
        </form> */}

        {/* new form */}
        <form className="relative w-[500px] mt-5 "
        onSubmit={handleSubmit}
        >
          
          {/* main container */}
          <div className="relative group w-full ">

            {/* glow layers */}
            <div className="absolute inset-0 border bg-gradient-to-r from-emerald-800 via-teal-500 to-emerald-800 rounded-full blur-xl opacity-50 group-focus-within:opacity-75 transition-opacity duration-300
            
            "></div>
            

            {/* the textarea container*/}
            <div className="relative flex items-center gap-6 bg-neutral-900 rounded-full w-full px-4 pl-6 py-3 border border-neutral-500/30 ">

              {/* main teactarea */}
              <textarea 
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Make a Country Playlist ft. of'
              rows={1}
              className='flex-1 bg-transparent text-neutral-200 placeholder:text-neutral-500 leading-6 resize-none outline-none overflow-y-auto 
              [&::-webkit-scrollbar]:hidden
              [-ms-overflow-style:name]
              [scrollbar-width:none]
              '
              />

              {/* button daalo re */}
              <button
              
              className='bg-gradient-to-r from-emerald-700 to-green-900 text-white rounded-full p-3 hover:bg-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-105 '
              type="submit"
              disabled={isLoading || !prompt.trim()}
              >
                {isLoading ?
                
                (            <svg 
                className='fill-emerald-800'
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">

              <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="25" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></rect>

              <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="85" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></rect>

              <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="145" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></rect>
            
            </svg>) : (
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>

                )}


              </button>

            </div>

          </div>

        </form>

        {/* lets start with this thing of loading */}
        {/* basically if something is true then only show this else fuck urself  */}
        {isLoading && !previewData && (
          // main contaienrr they say
          <div className="flex flex-col justify-center items-center gap-4 mt-4 ">

          <div className="w-32 h-32 ease-in-out  ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">

              <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="25" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></rect>

              <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="85" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></rect>

              <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="145" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></rect>
            
            </svg>
          </div>



            {/* lodidng text they say */}
            <div className="text-center border-b">
              <p className="text-lg">
                Creating Your Playlist...
              </p>
            </div>

          </div>

        )}


        {/* previw sectoin :- only shhow if previewwData exist */}

          {/* the real preview section */}
          {previewData && (
            // main containerr for the thing
            <div className="w-full max-w-4xl mx-auto mt-0 space-y-4">

              {/* playlist header */}
              <div className="text-center mt-4 mb-6">
                <h2 className="text-2xl font-bold text-neutral-300">
                  {previewData.playlistName}
                </h2>
                {/* song kitne nmile woh dikhane ka mn toh nhi hai abhi so we'll see later(shyd) */}
              </div>

              {/* main contianer of the song list nigg */}
              <div className="flex  flex-col items-center justify-center space-y-4">
                {previewData.songs
                  .filter((song) => song.found)     //firs ttake the found songs only 
                  .map((song, index) => (
                    <SongCard 
                    key={index}
                    index={index}
                    songName={song.song}
                    artistName={song.artist}
                    albumArt={song.albumArt}
                    songUrl={song.externalUrl}
                    />
                  ))
                }
              </div>

              {/* add to spotify button lgao bc */}
              <div className="mt-8 flex justify-center items-center ">
                <SpotifyBtn
                disabled={isLoading}
                text={`Add to Spotify`}
                onCLickFn={handleAddToSpotify
                }
                />

              </div>

            </div>

            

          )}


          <div className="max-w-7xl mx-auto mt-8">
            <img 
            src={vinyl2}
            alt="vinyl-img" 
            height={700}
            width={800}
            className="object-contain mask-b-from-20% mask-b-to-80% opacity-60 mx-auto" />
          </div>



    </div>
  )
}
