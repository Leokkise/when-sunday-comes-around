import { createRoot } from 'react-dom/client'
import { ui } from './ui-classes'
import washArt from '../assets/home/home-wash.webp'
import brushArt from '../assets/home/home-brush.webp'
import dressArt from '../assets/home/home-dress.webp'
import basketballArt from '../assets/home/home-basketball.webp'
import pantryArt from '../assets/pantry/preview.webp'
import { BedtimeLink } from './bedtime-transition'
const games = [
  { name: 'Wash up', href: '/wash-up/', art: washArt },
  { name: 'Brush teeth', href: '/brush-teeth/', art: brushArt },
  { name: 'Pick pajamas', href: '/dress-up/', art: dressArt },
  { name: 'After-School Hoops', href: '/basketball/', art: basketballArt },
  { name: 'Pantry Pals', href: '/pantry/', art: pantryArt },
]
function Home() {
  return <main className={ui('home-page')}>
    <p className="text-lg text-[#79563f] sm:text-2xl">When Sunday Comes Around</p>
    <header className="mb-8 mt-12 sm:mb-12 sm:mt-16">
      <h1>Ready to play?</h1>
      <p className="mt-4 text-xl sm:text-2xl">Pick a game and play.</p>
    </header>
    <nav className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Healthy habits games">
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
