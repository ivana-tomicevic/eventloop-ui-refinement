'use client'

import { useEffect, useMemo, useState } from 'react'
import OrganizerNav from './organizer-nav'
import {eventDate,eventImage,type EventRecord} from './event-data'

const seedEvents = [
  { id: 'summer-music', title: 'Summer Music Festival 2025', date: '15. juni 2025', category: 'Muzika', status: 'Published', sold: 246, capacity: 500, image: '/eventloop-jazz.jpg' },
  { id: 'jazz-nights', title: 'Sarajevo Jazz Nights', date: '18. oktobar 2025', category: 'Muzika', status: 'Published', sold: 84, capacity: 120, image: '/eventloop-jazz.jpg' },
  { id: 'gallery-night', title: 'Noć u galeriji', date: '24. oktobar 2025', category: 'Kultura', status: 'Draft', sold: 0, capacity: 100, image: '/eventloop-workshop.jpg' },
]

export default function MyEventsPage() {
  const [events, setEvents] = useState(seedEvents)
  const [tab, setTab] = useState('All Events')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')

  useEffect(() => { const saved = JSON.parse(window.localStorage.getItem('eventloop-events') || '[]'); if (saved.length) setEvents([...saved, ...seedEvents.filter((seed) => !saved.some((event: { title: string }) => event.title === seed.title))]) }, [])
  const filtered = useMemo(() => events.filter((event) => !search || event.title.toLowerCase().includes(search.toLowerCase())).filter((event) => tab === 'All Events' || (tab === 'Drafts' ? event.status === 'Draft' : tab === 'Published' ? event.status === 'Published' : event.status === 'Completed')).filter((event) => category === 'All categories' || event.category === category).filter((event) => status === 'All statuses' || event.status === status), [events, tab, search, category, status])
  const updateStatus = (id: string, nextStatus: string) => setEvents((current) => { const next = current.map((event) => event.id === id ? { ...event, status: nextStatus } : event); window.localStorage.setItem('eventloop-events', JSON.stringify(next)); return next })
  const remove = (id: string) => { if (!window.confirm('Delete this event? This action cannot be undone.')) return; setEvents((current) => { const next = current.filter((event) => event.id !== id); window.localStorage.setItem('eventloop-events', JSON.stringify(next)); return next }) }
  const published = events.filter((event) => event.status === 'Published').length
  const drafts = events.filter((event) => event.status === 'Draft').length
  const registrations = events.reduce((sum, event) => sum + (Number(event.sold) || 0), 0)

  return <main className="my-events-page el-my-events-page"><OrganizerNav active="events"/><div className="my-events-content"><header className="my-events-heading"><div><p className="eyebrow">Organizer workspace</p><h1>My Events</h1><p>Manage your events, registrations and publishing status.</p></div><a className="organizer-primary" href="/organizer/create">+ Create Event</a></header><section className="events-summary"><article><span>Total events</span><strong>{events.length}</strong></article><article><span>Published events</span><strong>{published}</strong></article><article><span>Draft events</span><strong>{drafts}</strong></article><article><span>Total registrations</span><strong>{Number.isFinite(registrations) ? registrations : 0}</strong></article></section><div className="event-tabs">{['All Events', 'Published', 'Drafts', 'Past'].map((item) => <button className={tab === item ? 'event-tab event-tab--active' : 'event-tab'} type="button" onClick={() => setTab(item)} key={item}>{item}</button>)}</div><div className="event-filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." aria-label="Search events" /><select value={category} onChange={(e) => setCategory(e.target.value)}><option>All categories</option><option>Muzika</option><option>Kultura</option></select><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All statuses</option><option>Published</option><option>Draft</option></select></div><section className="events-table-wrap">{filtered.length ? <table className="events-table"><thead><tr><th>Event</th><th>Date</th><th>Category</th><th>Status</th><th>Registrations</th><th>Actions</th></tr></thead><tbody>{filtered.map((event) => <tr key={event.id}><td><div className="table-event"><img src={eventImage(event)} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/eventloop-jazz.jpg"}}/><strong>{event.title}</strong></div></td><td>{eventDate(event)}</td><td>{event.category}</td><td><span className={`event-status event-status--${event.status.toLowerCase()}`}>{event.status}</span></td><td>{event.sold ?? 0} / {event.capacity ?? ((event as EventRecord).tickets?.reduce((sum,t)=>sum+Number(t.quantity||0),0) ?? 0)}</td><td><div className="table-actions"><a href={`/organizer/create?edit=${event.id}`}>Edit</a>{event.status === 'Draft' ? <button type="button" onClick={() => updateStatus(event.id, 'Published')}>Publish</button> : <button type="button" onClick={() => updateStatus(event.id, 'Draft')}>Unpublish</button>}<button type="button" className="danger-action" onClick={() => remove(event.id)}>Delete</button></div></td></tr>)}</tbody></table> : <div className="events-empty"><h2>No events found</h2><p>Try another filter or create your first event.</p><a className="organizer-primary" href="/organizer/create">Create Event</a></div>}</section></div></main>
}
