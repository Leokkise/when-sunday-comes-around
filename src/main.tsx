import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { InkFilters } from './ink-filters'
import './index.css'

const chapters = [
  { name: 'Morning', note: 'Open the curtains, stretch, and pick a breakfast that gives you energy.', drawing: 'M35 24c8-1 13 5 13 12s-5 13-13 13-13-5-13-13 5-12 13-12ZM35 11v7m0 36v7M11 36h6m37 0h7M17 18l5 5m26 26 5 5m0-36-5 5M22 49l-5 5' },
  { name: 'Afternoon', note: 'Help around the house, buckle your helmet, and head out to play.', drawing: 'M9 46a12 12 0 1 0 24 0 12 12 0 1 0-24 0Zm27 0a12 12 0 1 0 24 0 12 12 0 1 0-24 0ZM21 46l8-19 19 19H21m27 0-6-24h8M24 27h10' },
  { name: 'Evening', note: 'Wash up for dinner, put the tablet away, and get ready for bed.', drawing: 'M40 13C24 11 12 23 14 39c2 15 20 24 33 16 5-3 8-7 10-12-17 6-33-12-17-30ZM53 14v12m-6-6h12' },
]

function Doodle({ drawing }: { drawing: string }) {
  return <svg className="ink-wiggle" viewBox="0 0 72 72" fill="none" aria-hidden="true"><path pathLength="1" d={drawing} /></svg>
}

function Hero() {
  const [active, setActive] = useState(0)
  const chapter = chapters[active]

  return (
    <main className="page">
      <InkFilters />
      <div className="masthead"><Doodle drawing={chapters[0].drawing} /> When Sunday Comes Around</div>
      <section className="hero" aria-labelledby="hero-title">
        <div className="intro">
          <h1 id="hero-title" className="ink-wiggle">When Sunday<br /> <span>Comes Around</span></h1>
          <p>Start with a stretch. End with a bedtime brush. See what little things you can do to feel good all day.</p>
          <a href="#sunday-preview" className="cta"><span className="ink-wiggle">Explore the day</span> <span aria-hidden="true">→</span></a>
        </div>
        <div className="day" id="sunday-preview" tabIndex={-1}>
          <h2>My Sunday</h2>
          <div className="chapters" role="group" aria-label="Time of day">
            {chapters.map((item, index) => (
              <button key={item.name} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
                <Doodle drawing={item.drawing} />
                <span className="ink-wiggle">{item.name}</span>
              </button>
            ))}
          </div>
          <p className="note" aria-live="polite">{chapter.note}</p>
          <a className="wash-game-link" href="/wash-up/">Play Ready for Bed →</a>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<Hero />)
