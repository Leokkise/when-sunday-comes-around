import { createRoot } from 'react-dom/client'
import { ui } from './ui-classes'
import washArt from '../assets/home-wash.webp'
import brushArt from '../assets/home-brush.webp'
import dressArt from '../assets/home-dress.webp'
import { BedtimeLink } from './bedtime-transition'
const games = [
  { name: 'Wash up', href: '/wash-up/', art: washArt },
  { name: 'Brush teeth', href: '/brush-teeth/', art: brushArt },
  { name: 'Pick pajamas', href: '/dress-up/', art: dressArt },
]
function Home() {
  return <main className={ui('home-page')}>
    <p className="text-lg text-[#79563f] sm:text-2xl">When Sunday Comes Around</p>
    <header className="mb-8 mt-12 sm:mb-12 sm:mt-16">
      <h1>Ready for bed?</h1>
      <p className="mt-4 text-xl sm:text-2xl">Pick a game and play.</p>
    </header>
    <nav className="grid gap-5 md:grid-cols-3" aria-label="Bedtime games">
      {games.map(game => {
        const content = <>
          <img src={game.art} alt="" className="aspect-[4/3] w-full object-cover" width="560" height="420" />
          <span className="flex items-center justify-between gap-3 px-5 py-5 text-2xl sm:text-3xl">
            {game.name}<span aria-hidden="true">→</span>
          </span>
        </>
        return game.href === '/dress-up/'
          ? <BedtimeLink key={game.href} className={ui('home-game')}>{content}</BedtimeLink>
          : <a key={game.href} href={game.href} className={ui('home-game')}>{content}</a>
      })}
    </nav>
  </main>
}
createRoot(document.getElementById('root')!).render(<Home />)
