'use client'

import { useState } from 'react'
import {Music2,Palette,Trees,Paintbrush,UtensilsCrossed,Martini,Dumbbell,Users,BookOpen} from 'lucide-react'

const interests = [
  { id: 'music', icon: '♫', title: 'Muzika & Koncerti', description: 'Uživo, festivali, performansi', tone: 'lavender' },
  { id: 'culture', icon: '◉', title: 'Umjetnost & Kultura', description: 'Izložbe, pozorište, filmski festivali', tone: 'rose' },
  { id: 'nature', icon: '♧', title: 'Priroda & Fitness', description: 'Šetnje, Joga, Outdoor aktivnosti', tone: 'mint' },
  { id: 'workshops', icon: '<>', title: 'Radionice', description: 'Učenje, kreativnost, nova iskustva', tone: 'blue' },
  { id: 'food', icon: '⌁', title: 'Hrana & Piće', description: 'Kušanja, pop-up restorani, degustacije', tone: 'peach' },
  { id: 'nightlife', icon: '⚱', title: 'Noćni život', description: 'Klubovi, barovi, zabava', tone: 'green' },
  { id: 'sports', icon: '♕', title: 'Sport & Igre', description: 'Takmičenja, treninzi, druženja', tone: 'pink' },
  { id: 'community', icon: '♧', title: 'Zajednica', description: 'Uživo, festivali, performansi', tone: 'blush' },
  { id: 'learning', icon: '▱', title: 'Predavanja', description: 'Uživo, festivali, performansi', tone: 'teal' },
]

const interestIcons:Record<string,React.ComponentType<{size?:number}>>={music:Music2,culture:Palette,nature:Trees,workshops:Paintbrush,food:UtensilsCrossed,nightlife:Martini,sports:Dumbbell,community:Users,learning:BookOpen}
const discoveryOptions = [
  { id: 'personal', title: 'Posebno za mene', badge: 'Preporučeno', description: 'AI Powered preporuke na osnovu tvojih interesa' },
  { id: 'popular', title: 'Popularno sada', badge: 'U trendu', description: 'Vidi događaje koje cijeli grad otkriva' },
  { id: 'nearby', title: 'Blizu mene', badge: 'Lokalno', description: 'Događaji u tvojoj blizini sortirani po distanci' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [discovery, setDiscovery] = useState('personal')
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])

  const goNext = () => { if (step === 1) window.localStorage.setItem('eventloop-onboarding-interests', JSON.stringify(selected)); setStep((current) => Math.min(3, current + 1)) }
  const goBack = () => setStep((current) => Math.max(1, current - 1))

  return <main className="onboarding-page"><section className={`onboarding-card onboarding-card--step-${step}`} aria-labelledby="onboarding-title"><div className="onboarding-brand"><span className="brand__mark">e</span><span>eventloop</span></div><div className="onboarding-progress"><span className={step >= 1 ? 'onboarding-progress__active' : ''} /><span className={step >= 2 ? 'onboarding-progress__active' : ''} /><span className={step >= 3 ? 'onboarding-progress__active' : ''} /></div>{step === 1 && <><p className="eyebrow">Korak 1 od 3</p><h1 id="onboarding-title">Šta te zanima?</h1><p className="onboarding-subtitle">Odaberi nekoliko oblasti da bismo personalizovali tvoje iskustvo.</p><div className="interest-grid">{interests.map((interest) => <button key={interest.id} type="button" className={`interest-card interest-card--${interest.tone} ${selected.includes(interest.id) ? 'interest-card--selected' : ''}`} aria-pressed={selected.includes(interest.id)} onClick={() => toggle(interest.id)}><span className="interest-icon" aria-hidden="true">{(()=>{const Icon=interestIcons[interest.id];return <Icon size={25}/>})()}</span><strong>{interest.title}</strong><span>{interest.description}</span>{selected.includes(interest.id) && <b className="interest-check" aria-hidden="true">✓</b>}</button>)}</div></>}{step === 2 && <><p className="eyebrow">Korak 2 od 3</p><h1 id="onboarding-title">Kako želiš početi?</h1><p className="onboarding-subtitle">Odaberi kako želiš da otkrivaš događaje.</p><div className="discovery-options">{discoveryOptions.map((option) => <button key={option.id} type="button" className={`discovery-option ${discovery === option.id ? 'discovery-option--selected' : ''}`} aria-pressed={discovery === option.id} onClick={() => setDiscovery(option.id)}><span><strong>{option.title}</strong><em>{option.badge}</em></span><small>{option.description}</small>{discovery === option.id && <b className="interest-check">✓</b>}</button>)}</div></>}{step === 3 && <div className="onboarding-complete"><div className="onboarding-complete-icon">✓</div><p className="eyebrow">Korak 3 od 3</p><h1 id="onboarding-title">Sve je spremno!</h1><p className="onboarding-subtitle">Eventloop je personalizovan prema tvojim interesima. Kreni da otkrivaš događaje koji te zanimaju i stekaj nova iskustva.</p></div>}<div className="onboarding-actions">{step < 3 ? <button className={`onboarding-primary ${step === 1 && selected.length === 0 ? 'onboarding-primary--disabled' : ''}`} type="button" disabled={step === 1 && selected.length === 0} onClick={goNext}>Nastavi</button> : <a className="onboarding-primary" href="/">Otvori Eventloop</a>}{step > 1 && <button className="onboarding-secondary" type="button" onClick={goBack}>Nazad</button>}{step === 1 && <button className="onboarding-secondary" type="button" onClick={() => window.location.assign('/')}>Nazad</button>}</div>{step < 3 && <button className="onboarding-skip" type="button" onClick={() => window.location.assign('/')}>Preskoči za sada</button>}</section></main>
}
