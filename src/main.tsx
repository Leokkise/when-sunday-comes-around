import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './game.css'

function App() {
  const [artworkMissing, setArtworkMissing] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)

  async function toggleFullscreen() {
    setFullscreenError(false)
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      setFullscreenError(true)
    }
  }

  return (
    <main className="game h-dvh overflow-hidden bg-[#eee8df]">
      {artworkMissing ? <p className="grid h-full place-items-center p-8 text-center">Room artwork could not load. The project needs public/house.png.</p> : <div className="room-world"><img
        className="room-art block h-full w-full" draggable={false}
        src={'/house.png'}
        alt="Pencil-drawn bedroom and bathroom" onError={() => setArtworkMissing(true)}
      /><img className="boy-sprite" src="/boy.png" alt="Boy in striped pajamas" draggable={false} /></div>}
      {document.fullscreenEnabled && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="fullscreen-control absolute right-4 top-4 rounded-md bg-[#f8f5ef] px-3 py-2 text-sm text-[#4f4941] shadow"
        >
          <span className="enter-fullscreen">Fullscreen</span>
          <span className="exit-fullscreen">Exit fullscreen</span>
        </button>
      )}
      {fullscreenError && (
        <p role="status" className="absolute bottom-4 right-4 rounded-md bg-[#f8f5ef] p-3">
          Fullscreen is unavailable in this window.
        </p>
      )}
      <p className="orientation-message fixed inset-0 m-0 place-items-center bg-[#f8f5ef] p-8 text-center text-[#4f4941]">
        Turn your device sideways to play
      </p>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)




