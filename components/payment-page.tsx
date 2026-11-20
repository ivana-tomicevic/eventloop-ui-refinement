'use client'
import SiteNav from './site-nav'

import { FormEvent, useEffect, useState } from 'react'
import {getEvent,eventImage,eventDate,eventLocation,type EventRecord} from './event-data'

const event = { title: 'Summer Music Festival 2025', date: 'Subota, 15. juni 2025', location: 'Sarajevo City Center' }
const prices = { general: 25, vip: 50, student: 15 }

function formatExpiry(value:string){const digits=value.replace(/\D/g,'').slice(0,4);return digits.length>2?`${digits.slice(0,2)}/${digits.slice(2)}`:digits}
function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export default function PaymentPage() {
  const [searchReady, setSearchReady] = useState(false)
  const [eventId,setEventId]=useState('0');const [selectedEvent,setSelectedEvent]=useState<EventRecord|null>(null)
  const [quantities, setQuantities] = useState({ general: 0, vip: 0, student: 0 })
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id=params.get('event')||'0';setEventId(id);setSelectedEvent(getEvent(id))
    setQuantities({ general: Number(params.get('general') || 0), vip: Number(params.get('vip') || 0), student: Number(params.get('student') || 0) })
    setSearchReady(true)
  }, [])

  const subtotal = quantities.general * prices.general + quantities.vip * prices.vip + quantities.student * prices.student
  const discount = quantities.student * 10
  const total = subtotal - discount
  const selectedCount = quantities.general + quantities.vip + quantities.student

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16 || (!/^\d{2}\/\d{2}$/.test(expiry)||Number(expiry.slice(0,2))<1||Number(expiry.slice(0,2))>12) || cvv.length < 3) {
      setError('Unesi ispravan broj kartice, datum isteka i CVV prije nastavka.')
      return
    }
    window.sessionStorage.setItem('eventloop-demo-order',JSON.stringify({eventId,quantities,total,confirmed:true}));window.location.assign(`/booking/success?event=${encodeURIComponent(eventId)}&general=${quantities.general}&vip=${quantities.vip}&student=${quantities.student}`)
  }

  if (searchReady && selectedCount === 0) return <main className="payment-placeholder"><a className="brand" href="/"><span className="brand__mark">e</span><span>eventloop</span></a><section><p className="eyebrow">Narudžba nije pronađena</p><h1>Vrati se na odabir karata</h1><p>Otvori checkout iz Event Details stranice kako bi se sačuvali event i odabrane karte.</p><a className="checkout-secondary" href="/checkout">Nazad na checkout</a></section></main>

  return (
    <main className="checkout-page payment-page">
      <SiteNav/>
      <div className="checkout-content">
        <nav className="checkout-steps" aria-label="Checkout progress"><div className="checkout-step checkout-step--complete"><span>✓</span><strong>Karte</strong></div><i /><div className="checkout-step checkout-step--active"><span>2</span><strong>Plaćanje</strong></div><i /><div className="checkout-step"><span>3</span><strong>Potvrda</strong></div></nav>
        <div className="checkout-layout">
          <section className="checkout-card payment-form-card"><div className="payment-heading"><div><p className="eyebrow">Korak 2 od 3</p><h1>Detalji plaćanja</h1></div><span className="demo-badge">Demo checkout</span></div><p className="payment-intro">Podaci kartice se koriste samo za ovu demonstraciju i ne šalju se nigdje.</p><form className="card-form" onSubmit={handleSubmit} noValidate><fieldset><legend>Način plaćanja</legend><label className="payment-option payment-option--active"><input type="radio" checked readOnly /> Kreditna/Debitna kartica</label><label className="payment-option payment-option--disabled"><input type="radio" disabled /> PayPal <span>Nije dostupno</span></label></fieldset><label>Broj kartice<input inputMode="numeric" autoComplete="cc-number" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" aria-invalid={Boolean(error && cardNumber.replace(/\s/g, '').length < 16)} /></label><div className="card-form-row"><label>Datum isteka<input inputMode="numeric" autoComplete="cc-exp" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/GG" /></label><label>CVV<input inputMode="numeric" autoComplete="cc-csc" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" /></label></div>{error && <p className={error.startsWith('Demo') ? 'form-message form-message--success' : 'form-message'} role="alert">{error}</p>}<div className="payment-actions"><a className="checkout-secondary" href={`/checkout?event=${encodeURIComponent(eventId)}&general=${quantities.general}&vip=${quantities.vip}&student=${quantities.student}`}>Nazad na pregled</a><button className="checkout-primary" type="submit">Plati {total} KM</button></div></form></section>
          <aside className="checkout-summary checkout-card"><h2>Pregled narudžbe</h2><div className="payment-event-mini"><img src={selectedEvent?eventImage(selectedEvent):"/eventloop-jazz.jpg"} alt="" /><div><strong>{selectedEvent?.title||event.title}</strong><span>{selectedEvent?eventDate(selectedEvent):event.date}</span><span>{selectedEvent?eventLocation(selectedEvent):event.location}</span></div></div><div className="summary-line"><span>Opšti ulaz × {quantities.general}</span><strong>{quantities.general * prices.general} KM</strong></div><div className="summary-line"><span>VIP × {quantities.vip}</span><strong>{quantities.vip * prices.vip} KM</strong></div><div className="summary-line"><span>Studentski × {quantities.student}</span><strong>{quantities.student * prices.student} KM</strong></div>{discount > 0 && <div className="summary-line summary-discount"><span>Studentski popust</span><strong>-{discount} KM</strong></div>}<div className="summary-total"><span>Ukupno</span><strong>{total} KM</strong></div></aside>
        </div>
      </div>
    </main>
  )
}
