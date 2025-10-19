import React from 'react'

export const SpotifyBtn = ({text, onCLickFn, isLoading}) => {
  return (
    <div>
              <button
              onClick={onCLickFn}
              disabled={isLoading}
              // disbale the isLaoding thing on clicking 
              className="group relative px-8 py-4 bg-transparent rounded-full text-neutral-200 font-semibold overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ">
                {/* background glow layer ke liye  */}
                <div className="absolute inset-0 bg-gradient-to-r rounded-full from-neutral-900 via-emerald-800 to-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl "></div>
                {/* for border and all lets see */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-green-600/20 to-emerald-600/20 rounded-full transition-all duration-300 "></div>
                {/* for content */}
                <span className="relative z-10 flex justify-center items-center gap-3">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>

                  <p className="text-lg text-white
                  group-hover:drop-shadow-neutral-950 text-shadow-neutral-950
                  ">{text}</p>
                </span>

              </button>

    </div>
  )
}
