'use client'

import OrganizerNav from './organizer-nav'
import { useEffect, useMemo, useState } from 'react'

const initialEvents = [
  { title: 'Summer Music Festival 2025', date: '15. juni 2025 • Sarajevo', status: 'Published', sold: 246, image: '/eventloop-jazz.jpg' },
  { title: 'Sarajevo Jazz Nights', date: '18. oktobar 2025 • Sarajevo', status: 'Published', sold: 84, image: '/eventloop-jazz.jpg' },
  { title: 'Noć u galeriji', date: '24. oktobar 2025 • Sarajevo', status: 'Draft', sold: 0, image: '/eventloop-workshop.jpg' },
]

const navItems = [
  { label: 'Dashboard', href: '/organizer', active: true },
  { label: 'My Events', href: '/organizer/events' },
  { label: 'Create Event', href: '/organizer/create' },
  { label: 'Analytics', href: '/organizer/analytics', future: true },
  { label: 'Settings', href: '/organizer/settings', future: true },
]

export default function OrganizerDashboard() {
  const [events, setEvents] = useState(initialEvents)
  useEffect(() => {
    const saved = window.localStorage.getItem('eventloop-last-event')
    if (saved) {
      const event = JSON.parse(saved)
      setEvents((current) => [{ title: event.title || 'Untitled event', date: event.start || 'Date not set', status: event.status, sold: 0, image: event.image || '/eventloop-jazz.jpg' }, ...current.filter((item) => item.title !== event.title)])
    }
  }, [])
  const published = useMemo(() => events.filter((event) => event.status === 'Published'), [events])
  const sold = useMemo(() => events.reduce((sum, event) => sum + event.sold, 0), [events])
  const revenue = useMemo(() => sold * 25, [sold])
  return <main className="organizer-page"><OrganizerNav active="dashboard"/><section className="organizer-main"><header className="organizer-topbar"><div><p className="eyebrow">Organizer dashboard</p><h1>Dobrodošla, Ivana</h1><p>Upravljaj događajima, prati prodaju i poveži se sa svojom publikom.</p></div><a className="organizer-primary" href="/organizer/create">+ Create Event</a></header><section className="organizer-metrics" aria-label="Overview metrics"><article><span>Active events</span><strong>{published.length}</strong><small>Published events</small></article><article><span>Tickets sold</span><strong>{sold}</strong><small>Across active events</small></article><article><span>Total revenue</span><strong>{revenue.toLocaleString('en-US')} KM</strong><small>From ticket sales</small></article></section><section className="organizer-section"><div className="organizer-section-heading"><div><h2>My events</h2><p>Pregled tvojih najnovijih događaja.</p></div><a href="/organizer/events">View all</a></div><div className="organizer-events">{events.map((event) => <article className="organizer-event" key={event.title}><img src={event.image} alt="" /><div className="organizer-event__info"><div><h3>{event.title}</h3><p>{event.date}</p></div><span className={`event-status event-status--${event.status.toLowerCase()}`}>{event.status}</span></div><div className="organizer-event__meta"><span>{event.sold} tickets sold</span><a href={`/organizer/events/${event.title.toLowerCase().replaceAll(' ', '-')}`}>Manage event →</a></div></article>)}</div></section><section className="organizer-empty"><div><span className="empty-icon">＋</span><div><h2>Ready for your next event?</h2><p>Kreiraj događaj i počni graditi svoju publiku.</p></div></div><a className="organizer-secondary" href="/organizer/create">Create new event</a></section></section></main>
}
