'use client'
import SiteNav from './site-nav'
import {CalendarDays,MapPin} from 'lucide-react'

import { useEffect, useState } from 'react'
import {getEvent,eventImage,eventDate,eventLocation,type EventRecord} from './event-data'
import {FreeSuccess} from './free-join'

const event = { title: 'Summer Music Festival 2025', date: 'Subota, 15. juni 2025', location: 'Sarajevo City Center' }
const prices = { general: 25, vip: 50, student: 15 }

export default function BookingSuccess() {
  const [ready, setReady] = useState(false)
  const [selectedEvent,setSelectedEvent]=useState<EventRecord|null>(null);const [confirmed,setConfirmed]=useState(false)
  const [order, setOrder] = useState({ general: 0, vip: 0, student: 0 })
  const [orderId,setOrderId]=useState('')
  const [free,setFree]=useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id=params.get('event')||'0';setSelectedEvent(getEvent(id));try{const stored=JSON.parse(sessionStorage.getItem('eventloop-demo-order')||'null');if(stored?.confirmed&&String(stored.eventId)===id){setConfirmed(true);setOrder(stored.quantities);setOrderId(stored.orderId||'');setFree(Boolean(stored.free))}}catch{}
    setReady(true)
  }, [])

  const total = order.general * prices.general + order.vip * prices.vip + order.student * prices.student - order.student * 10
  const ticketSummary = [order.general && `${order.general}x Opšti ulaz`, order.vip && `${order.vip}x VIP`, order.student && `${order.student}x Studentski`].filter(Boolean).join(', ')

  if (ready && confirmed && free && selectedEvent) return <FreeSuccess event={selectedEvent} spots={order.general} />

  if (ready && (!ticketSummary || !confirmed)) return <main className="payment-placeholder"><a className="brand" href="/"><span className="brand__mark">e</span><span>eventloop</span></a><section><p className="eyebrow">Potvrda nije dostupna</p><h1>Nema potvrđene narudžbe</h1><p>Pokreni checkout i završi demo plaćanje da bi se prikazala potvrda.</p><a className="checkout-primary" href="/checkout">Nazad na checkout</a></section></main>

  return <main className="success-page"><SiteNav/><div className="success-content"><nav className="checkout-steps" aria-label="Booking progress"><div className="checkout-step checkout-step--complete"><span>✓</span><strong>Karte</strong></div><i /><div className="checkout-step checkout-step--complete"><span>✓</span><strong>Plaćanje</strong></div><i /><div className="checkout-step checkout-step--active"><span>3</span><strong>Potvrda</strong></div></nav><section className="success-card"><div className="success-icon" aria-hidden="true">✓</div><p className="eyebrow">Demo rezervacija uspješna</p><h1>Karte su potvrđene!</h1><p className="success-copy">Tvoje su karte spremne. Ova potvrda predstavlja simulirano plaćanje.</p><div className="success-event"><img src={selectedEvent?eventImage(selectedEvent):"/eventloop-jazz.jpg"} alt="" /><div><h2>{selectedEvent?.title||event.title}</h2><p><CalendarDays size={16}/> {selectedEvent?eventDate(selectedEvent):event.date}</p><p><MapPin size={16}/> {selectedEvent?eventLocation(selectedEvent):event.location}</p></div></div><dl className="confirmation-details"><div><dt>Broj rezervacije</dt><dd>{orderId || "Demo booking"}</dd></div><div><dt>Tip karata</dt><dd>{ticketSummary}</dd></div><div><dt>Ukupan iznos</dt><dd className="confirmation-total">{total} KM</dd></div></dl><div className="success-actions"><a className="checkout-primary" href={`/my-tickets?general=${order.general}&vip=${order.vip}&student=${order.student}`}>Pogledaj moje karte</a><a className="checkout-secondary" href="/">Istraži još događaja</a></div><p className="demo-note">Plaćanje je simulirano za potrebe demonstracije.</p></section></div></main>
}
