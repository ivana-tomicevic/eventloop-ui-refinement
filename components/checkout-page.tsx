'use client'
import SiteNav from './site-nav'

import { useEffect,useMemo, useState } from 'react'
import {getEvent,eventDate,eventLocation,eventImage,type EventRecord} from './event-data'

const ticketTypes = [
  { id: 'general', name: 'Opšti ulaz', price: 25, available: 50, note: '25 KM' },
  { id: 'vip', name: 'VIP', price: 50, available: 20, note: '50 KM' },
  { id: 'student', name: 'Studentski', price: 15, available: 30, note: '15 KM' },
]

export default function CheckoutPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({ general: 0, vip: 0, student: 0 })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [eventId,setEventId]=useState('0');const [selectedEvent,setSelectedEvent]=useState<EventRecord|null>(null);useEffect(()=>{const params=new URLSearchParams(window.location.search);const id=params.get('event')||'0';setEventId(id);setSelectedEvent(getEvent(id));const count={general:Number(params.get('general')||0),vip:Number(params.get('vip')||0),student:Number(params.get('student')||0)};if(Object.values(count).some(Boolean))setQuantities(count)},[])

  const subtotal = useMemo(() => ticketTypes.reduce((sum, ticket) => sum + ticket.price * (quantities[ticket.id] ?? 0), 0), [quantities])
  const selectedCount = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const paymentHref = `/checkout/payment?event=${encodeURIComponent(eventId)}&general=${quantities.general}&vip=${quantities.vip}&student=${quantities.student}`
  const updateQuantity = (id: string, change: number) => setQuantities((current) => ({ ...current, [id]: Math.max(0, Math.min(10, (current[id] ?? 0) + change)) }))

  return (
    <main className="checkout-page">
      <SiteNav/>
      <div className="checkout-content">
        <nav className="checkout-steps" aria-label="Checkout progress"><div className="checkout-step checkout-step--active"><span>1</span><strong>Karte</strong></div><i /><div className="checkout-step"><span>2</span><strong>Plaćanje</strong></div><i /><div className="checkout-step"><span>3</span><strong>Potvrda</strong></div></nav>
        <div className="checkout-layout">
          <div className="checkout-main">
            <section className="checkout-card event-summary"><h1>Tvoj događaj</h1><div className="checkout-event-row"><img src={selectedEvent?eventImage(selectedEvent):"/eventloop-jazz.jpg"} alt="Event cover" /><div><h2>{selectedEvent?.title||"Event"}</h2><p>{selectedEvent?eventDate(selectedEvent):""}</p><p>{selectedEvent?eventLocation(selectedEvent):""}</p></div></div></section>
            <section className="checkout-card"><h2>Odaberi karte</h2><div className="ticket-list">{ticketTypes.map((ticket) => <div className="ticket-row" key={ticket.id}><div><h3>{ticket.name}</h3><p>{ticket.note} • Dostupno: {ticket.available}</p></div><div className="quantity-control"><button type="button" aria-label={`Remove ${ticket.name}`} onClick={() => updateQuantity(ticket.id, -1)}>−</button><output>{quantities[ticket.id]}</output><button type="button" aria-label={`Add ${ticket.name}`} onClick={() => updateQuantity(ticket.id, 1)}>+</button></div></div>)}</div></section>
            <section className="checkout-card"><h2>Tvoji podaci</h2><form className="checkout-form"><label>Ime<input placeholder="Unesi ime" /></label><label>Prezime<input placeholder="Unesi prezime" /></label><label className="form-wide">Email adresa<input type="email" placeholder="tvoj@email.com" /><small>Karte će biti poslane na ovu email adresu</small></label><label className="form-wide">Broj telefona<input placeholder="+387 XX XXX XXX" /></label></form></section>
            <section className="checkout-card"><h2>Način plaćanja</h2><div className="payment-options"><label className={paymentMethod === 'card' ? 'payment-option payment-option--active' : 'payment-option'}><input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Kreditna/Debitna kartica</label><label className={paymentMethod === 'paypal' ? 'payment-option payment-option--active' : 'payment-option'}><input type="radio" name="payment" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} /> PayPal</label></div></section>
          </div>
          <aside className="checkout-summary checkout-card"><h2>Pregled narudžbe</h2><div className="summary-line"><span>Karte ({selectedCount}x)</span><strong>{subtotal} KM</strong></div><div className="summary-line"><span>Servisna naknada</span><strong>0 KM</strong></div><div className="summary-line summary-discount"><span>Studentski popust</span><strong>{quantities.student ? `-${quantities.student * 10} KM` : '0 KM'}</strong></div><div className="summary-total"><span>Ukupno</span><strong>{subtotal - quantities.student * 10} KM</strong></div><a className="checkout-primary" href={selectedCount?paymentHref:"#tickets"} onClick={e=>{if(!selectedCount)e.preventDefault()}} aria-disabled={selectedCount === 0}>Nastavi na plaćanje</a><a className="checkout-secondary" href={`/events/${eventId}`}>Nazad na događaj</a></aside>
        </div>
      </div>
    </main>
  )
}
