
export const SongCard = ({index, songName, artistName, albumArt, songUrl }) => {
  return (

    // main container div
        <div className="group border-b border-neutral-400 hover:border-neutral-400/50 hover:scale-102 transition-all duration-200 py-3 w-full flex justify-between px-4 items-center cursor-pointer ">
            {/* div one  */}
            <div className="flex gap-3 items-center min-w-0 flex-10">
                {/* index no. */}
                <span className="text-sm text-neutral-400 w-8 text-right shrink-0 pr-2 ">
                    {index + 1}
                </span>
                {/* icon */}
                {/* yahan par album art dalenge  */}
                <div className="w-[42px] h-[42px] flex shrink-0 ">
                    {albumArt? (
                    <img src={albumArt} alt="album-art" className="w-full h-full object-cover rounded-sm " />
                    ): (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-600 rounded-sm flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                        </div>
                    )}
                    {/* <img src={albumArt} alt="album-art" /> */}
                </div>

                <div className="flex flex-col items-start justify-center min-w-0 flex-1 ">
                    <h3 className="text-lg truncate text-neutral-100">{songName}</h3>
                    <p className="text-sm truncate text-neutral-400 group-hover:text-neutral-300 transition-colors duration-200 ">{artistName}</p>
                </div>
            </div>

            {/* div for spotify icon and link maybe idkd  */}
            <div className="">
                <a 
                href={songUrl || "#"}
                target="_blank"
                rel="nonopener noreferrer"
                className="">

                                      <svg 
                                  
                                  
                                      className="w-6 h-6 group-hover:scale-102 group-hover:rotate-2 transition-transform duration-300"
                                        viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
                </a>
            </div>

        </div>

  )
}
