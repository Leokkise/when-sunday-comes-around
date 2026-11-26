import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { ui } from './ui-classes'
import washArt from '../assets/home/home-wash.webp'
import brushArt from '../assets/home/home-brush.webp'
import dressArt from '../assets/home/home-dress.webp'
import basketballArt from '../assets/home/home-basketball.webp'
import pantryArt from '../assets/pantry/preview.webp'
import titleWide from '../assets/home/title-court-wide.webp'
import titlePortrait from '../assets/home/title-court-portrait.webp'
import titleCharacter from '../assets/home/title-character.webp'
import titleMusic from '../assets/home/title-music.wav'
import startSound from '../assets/home/title-start.wav'
import clickSound from '../assets/home/title-click.wav'
import { BedtimeLink } from './bedtime-transition'
const games = [
  { name: 'Wash up', href: '/wash-up/', art: washArt },
  { name: 'Brush teeth', href: '/brush-teeth/', art: brushArt },
  { name: 'Pick pajamas', href: '/dress-up/', art: dressArt },
  { name: 'After-School Hoops', href: '/basketball/', art: basketballArt },
  { name: 'Pantry Pals', href: '/pantry/', art: pantryArt },
]

function playCue(source: string, volume: number) {
  const audio = new Audio(source)
  audio.volume = volume
  void audio.play().catch(() => {})
}

function openGame(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  const href = event.currentTarget.href
  // Let the short click play before the browser unloads the title screen.
  window.setTimeout(() => window.location.assign(href), 100)
}

function Home() {
  const [started, setStarted] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const gameHeading = useRef<HTMLHeadingElement>(null)
  const musicTrack = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (started) gameHeading.current?.focus()
  }, [started])
  useEffect(() => () => musicTrack.current?.pause(), [])

  function toggleMusic() {
    playCue(clickSound, .32)
    const track = musicTrack.current ?? new Audio(titleMusic)
    musicTrack.current = track
    track.loop = true
    track.volume = .27
    if (musicOn) {
      track.pause()
      setMusicOn(false)
      return
    }
    setMusicOn(true)
    void track.play().catch(() => {
      if (track.paused) setMusicOn(false)
    })
  }

  const musicButton = <button type="button" className={ui('home-music')} aria-label="Music" aria-pressed={musicOn} onClick={toggleMusic}>
    Music {musicOn ? 'on' : 'off'}
  </button>

  if (!started) return <main className={ui('home-title-screen')}>
    <picture className={ui('home-title-art')}>
      <source media="(orientation: portrait)" srcSet={titlePortrait} width="780" height="1200" />
      <img src={titleWide} width="1600" height="900" alt="" fetchPriority="high" />
    </picture>
    <img className={ui('home-title-character')} src={titleCharacter} width="412" height="608" alt="" fetchPriority="high" />
    <div className={ui('home-title-content')}>
      <h1 className={ui('home-title-heading')}>When Sunday<br />Comes Around</h1>
      <button type="button" className={ui('home-start')} onClick={() => {
        playCue(startSound, .45)
        setStarted(true)
      }}>
        Click to Start
      </button>
    </div>
    <div className="absolute right-4 top-4">{musicButton}</div>
  </main>

  return <main className={ui('home-page')}>
    <header className="mb-8 mt-12 flex flex-wrap items-center justify-between gap-4 sm:mb-12 sm:mt-16">
      <h1 ref={gameHeading} tabIndex={-1}>Pick a game</h1>
      {musicButton}
    </header>
    <nav className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Games" onClickCapture={event => {
      if (event.target instanceof Element && event.target.closest('a[href]')) playCue(clickSound, .32)
    }}>
      {games.map(game => {
        const content = <>
          <img src={game.art} alt="" className="aspect-[4/3] w-full object-cover" width="560" height="420" />
          <span className="flex items-center justify-between gap-3 px-5 py-5 text-2xl sm:text-3xl">
            {game.name}<span aria-hidden="true">→</span>
          </span>
        </>
        return game.href === '/dress-up/'
          ? <BedtimeLink key={game.href} className={ui('home-game')}>{content}</BedtimeLink>
          : <a key={game.href} href={game.href} className={ui('home-game')} onClick={openGame}>{content}</a>
      })}
    </nav>
  </main>
}
createRoot(document.getElementById('root')!).render(<Home />)
