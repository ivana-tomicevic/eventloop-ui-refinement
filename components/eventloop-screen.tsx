'use client'

import { useState } from 'react'

const events = Array.from({ length: 6 }, (_, index) => ({
  id: index,
  title: 'Summer Jazz Night 2025',
  date: 'Sat, 12 Oct — 20:00',
  location: 'Sava Center, Beč',
  price: '25 KM',
}))

function EventCard({ event, compact = false }: { event: (typeof events)[number]; compact?: boolean }) {
  const [saved, setSaved] = useState(false)

  return (
    <article className={`event-card ${compact ? 'event-card--compact' : ''}`}>
      <div className="event-card__image" aria-hidden="true">
        <button
          className={`save-button ${saved ? 'save-button--saved' : ''}`}
          type="button"
          aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p><span aria-hidden="true">▣</span>{event.date}</p>
        <p><span aria-hidden="true">⌖</span>{event.location}</p>
        <strong>{event.price}</strong>
      </div>
    </article>
  )
}

function FeaturedEvent() {
  return (
    <article className="featured-card">
      <div className="featured-card__image" aria-hidden="true" />
      <div className="featured-card__content">
        <span className="featured-card__tag">♧ Preporučujemo</span>
        <h2>Jazz Night Live</h2>
        <p>Opusti se uz vrhunski džez, energiju grada.</p>
        <p><span aria-hidden="true">▣</span> 12. oktobar 2025.</p>
        <p><span aria-hidden="true">⌖</span> Jazz Klub Sarajevo</p>
        <div className="featured-card__actions">
          <button type="button" className="outline-button">Više informacija</button>
          <button type="button" className="primary-button">Going</button>
        </div>
      </div>
    </article>
  )
}

export default function EventloopScreen() {
  return (
    <main className="eventloop-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Eventloop home">LOGO</a>
        <button className="search-button" type="button" aria-label="Search events">⌕</button>
        <button className="profile-button" type="button" aria-label="Open profile">L</button>
      </header>

      <div className="eventloop-content" id="top">
        <section className="welcome-section" aria-labelledby="welcome-title">
          <p className="eyebrow">Good morning, Ivana!</p>
          <p className="intro-copy">Ovo jutro je vreme za nešto dobro — evo šta se dešava u tvom gradu.</p>
          <FeaturedEvent />
        </section>

        <section className="event-section" aria-labelledby="upcoming-title">
          <div className="section-heading">
            <h1 id="upcoming-title">Upcoming events</h1>
            <p>Otkrivaj šta se dešava u tvom gradu, pronađi događaj koji te zanima.</p>
          </div>
          <div className="event-grid">
            {events.map((event) => <EventCard event={event} key={event.id} />)}
          </div>
        </section>

        <section className="event-section recommendations" aria-labelledby="recommendations-title">
          <div className="section-heading">
            <h2 id="recommendations-title">Prijatelji i nova dešavanja</h2>
            <p>Ne propusti prilike da se pridružiš prijateljima na zanimljivim događajima.</p>
          </div>
          <div className="recommendation-grid">
            {events.slice(0, 3).map((event) => <EventCard event={event} compact key={`recommendation-${event.id}`} />)}
          </div>
        </section>
      </div>
    </main>
  )
}
