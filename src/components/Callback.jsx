import React, { useRef, useEffect } from 'react'

export const Callback = () => {

  // get the link first
  const urlParams = new URLSearchParams(window.location.search) 
  // extract code from the link
  const code = urlParams.get('code')
  console.log(code)
  const hasRun = useRef(false)

  useEffect(() => {
    if(code && !hasRun.current) {
      hasRun.current = true
      fetch('/api/callback', {
        method: "POST",
        // standar header to tell the backend that the data which iam sending is in json format
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code})
      })
      // now backend will snedd the response THE GREAT ACESS TOKEN 
      .then((response) => response.json())      //yeh string hai so we gotta convert this mfk into js object
      .then(data => {
        console.log(`Access Token received: `, data) //this is that THE GREAT ACESS TOKEN jiske liye humne itni ramayan kari

        // using local storage now but we'll use contextAPI later
        localStorage.setItem('spotify_access_token', data.access_token)
        localStorage.setItem('spotify_refresh_token', data.refresh_token)

        // redirect to home page for now 
        window.location.href = '/'

      })
      .catch(error => console.log('Error', error))
    }



  },[code])

  return (

    <div className="min-h-screen w-full relative bg-black">
    {/* Emerald Depths Background with Top Glow */}
    <div
      className="absolute inset-0 z-0"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000",
      }}
    />

      <div className='absolute min-h-screen w-full flex flex-col justify-center items-center '>
        <div className="w-32 h-32">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">

            <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="25" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></rect>

            <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="85" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></rect>

            <rect fill="#00C951" stroke="#00C951" stroke-width="14" width="30" height="30" x="145" y="50"><animate attributeName="y" calcMode="spline" dur="1.5" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></rect>
          
          </svg>

        </div>

        <p className="mt-6 text-neutral-200 text-xl font-semibold">
          Authorizing with Spotify
        </p>
      </div>
    </div>
  )
}
