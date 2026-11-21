export type EventRecord = { id: string | number; title: string; date?: string; start?: string; end?: string; location?: string; venue?: string; neighbourhood?: string; address?: string; online?: boolean; price?: string; category?: string; subcategory?: string; tags?: string[]; summary?: string; description?: string; status?: string; image?: string; tickets?: {name:string;price:string;quantity:string}[]; sold?:number; capacity?:number; /** Candidate for the big "Pick of the …" card on Explore. */ featured?:boolean }
const pad=(n:number)=>String(n).padStart(2,'0')
/** Local ISO date (YYYY-MM-DDTHH:mm) `days` from today, so demo events always land tonight/tomorrow/this weekend. */
function relativeStart(days:number,time:string){const d=new Date();d.setDate(d.getDate()+days);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${time}`}
/** Days from today to the coming Saturday/Sunday (same rule as the Weekend filter; on Sunday both are today). */
function weekendOffset(day:'sat'|'sun'){const dow=new Date().getDay();if(dow===0)return 0;const sat=6-dow;return day==='sat'?sat:sat+1}
// price: euros as a number string ('0' = Free). image: a path under public/.
export const demoEvents: EventRecord[] = [
 {id:0,title:'Late Jazz in the Basement',start:relativeStart(0,'21:30'),venue:'Sótano Azul',neighbourhood:'Malasaña',price:'12',category:'music',subcategory:'Jazz',tags:['Jazz','Live Music','Chill','Night'],summary:'Tight trio, low lights, zero small talk needed.',image:'/photos/events/jazz.jpg',status:'Published',featured:true},
 {id:1,title:'Rooftop Language Swap',start:relativeStart(0,'20:00'),venue:'Terraza Lumen',neighbourhood:'Lavapiés',price:'0',category:'social',subcategory:'Meetups',tags:['Social','Free','Chill','Languages'],summary:'Swap Spanish for English with half the city’s Erasmus crowd.',image:'/photos/events/language-swap.jpg',status:'Published'},
 {id:2,title:'Open Studio Night',start:relativeStart(1,'19:30'),venue:'Galería Cuarto Verde',neighbourhood:'Chueca',price:'0',category:'culture',subcategory:'Exhibitions',tags:['Art','Free','Creative'],summary:'Meet the artists, steal ideas, stay for the vermouth.',image:'/photos/events/open-studio.jpg',status:'Published'},
 {id:3,title:'Sunset Walk in Retiro',start:relativeStart(weekendOffset('sun'),'17:30'),venue:'Paseo Verde Crew',neighbourhood:'Retiro',price:'0',category:'nature',subcategory:'Walks',tags:['Outdoor','Free','Chill'],summary:'Slow loop round the lake, golden hour guaranteed.',image:'/photos/events/retiro-walk.jpg',status:'Published'},
 {id:4,title:'Vermut Crawl',start:relativeStart(weekendOffset('sun'),'13:00'),venue:'Bodega La Esquina',neighbourhood:'La Latina',price:'15',category:'food',subcategory:'Tastings',tags:['Food','Drinks','Social'],summary:'Three bars, three vermouths, one very good Sunday.',image:'/photos/events/vermut.jpg',status:'Published'},
 {id:5,title:'Wheel Throwing 101',start:relativeStart(1,'18:00'),venue:'Taller Barro Rojo',neighbourhood:'Chamberí',price:'25',category:'workshops',subcategory:'Ceramics',tags:['Creative','Workshop','Hands-on'],summary:'Get your hands muddy and leave with your first cup.',image:'/photos/events/pottery.jpg',status:'Published'},
 {id:6,title:'Pickup Basketball Night',start:relativeStart(5,'20:00'),venue:'Cancha La Paloma',neighbourhood:'La Latina',price:'8',category:'sports',subcategory:'Basketball',tags:['Sport','Active','Social'],summary:'Show up, pick a team, play till the lights go off.',image:'/photos/events/basketball.jpg',status:'Published'},
 {id:7,title:'Student Founders Pitch Night',start:relativeStart(4,'19:00'),venue:'Ideas Bar',neighbourhood:'Chamberí',price:'0',category:'learning',subcategory:'Talks',tags:['Talks','Free','Startups'],summary:'Five pitches, five minutes each, brutal Q&A.',image:'/photos/events/pitch.jpg',status:'Published'},
 {id:8,title:'Indie Night: Static Bloom',start:relativeStart(weekendOffset('sat'),'22:00'),venue:'Sala Ventana',neighbourhood:'Malasaña',price:'18',category:'music',subcategory:'Indie',tags:['Live Music','Indie','Night'],summary:'Loud guitars, sticky floor, best night of your week.',image:'/photos/events/indie.jpg',status:'Published',featured:true},
 {id:9,title:'Comedy in English',start:relativeStart(3,'21:00'),venue:'Bar La Tuerca',neighbourhood:'Lavapiés',price:'10',category:'social',subcategory:'Comedy',tags:['Comedy','Social','Night'],summary:'Fresh sets from Madrid’s expat comics. Sit front row if you dare.',image:'/photos/events/comedy.jpg',status:'Published'}]
const timeFmt=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})
const dayFmt=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short'})
const euro=new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0})
const euroCents=new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR'})
const startOfDay=(d:Date)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()
/** "Tonight · 20:00", "Today · 12:00", "Tomorrow · 19:30", otherwise "Sat 29 Nov · 21:00" (en-GB, 24h). */
export function formatEventDate(date:Date,now=new Date()){const days=Math.round((startOfDay(date)-startOfDay(now))/86400000);const label=days===0?(date.getHours()>=17?'Tonight':'Today'):days===1?'Tomorrow':dayFmt.format(date).replace(',','');return `${label} · ${timeFmt.format(date)}`}
/** True when the event starts today from 17:00 — the same rule that labels it "Tonight". */
export function isTonight(event:EventRecord,now=new Date()){if(!event.start)return false;const d=new Date(event.start);return !Number.isNaN(d.getTime())&&startOfDay(d)===startOfDay(now)&&d.getHours()>=17}
/** Short English category names, shared by the category grid and event cards. */
export const CATEGORY_LABELS:Record<string,string>={music:'Music',culture:'Arts',sports:'Sports',nature:'Outdoors',workshops:'Workshops',learning:'Learning',social:'Social',food:'Food & Drink'}
export function eventCategory(event:EventRecord){return (event.category&&CATEGORY_LABELS[event.category])||event.category||'Event'}
export function eventDate(event: EventRecord) {if(event.start){const date=new Date(event.start);if(!Number.isNaN(date.getTime()))return formatEventDate(date)}return event.date || 'Date TBA'}
/** "Venue · Neighbourhood" — never a distance. */
export function eventLocation(event: EventRecord){if(event.online)return 'Online';const place=[event.venue||event.location,event.neighbourhood].filter(Boolean).join(' · ');return place||event.address||'Location TBA'}
/** €12 / Free. Accepts numbers or numeric strings; any other legacy text is shown as-is. */
export function formatPrice(value:number){return value===0?'Free':(Number.isInteger(value)?euro:euroCents).format(value)}
export function eventPrice(event:EventRecord){if(event.tickets?.length){const min=Math.min(...event.tickets.map(t=>Number(t.price)||0));return min===0?'Free':`From ${formatPrice(min)}`}if(!event.price)return 'See details';const n=Number(event.price);return Number.isFinite(n)?formatPrice(n):event.price}
export function getEvents(){if(typeof window==='undefined')return demoEvents;let saved:EventRecord[]=[];try{const data=JSON.parse(localStorage.getItem('eventloop-events')||'[]');if(Array.isArray(data))saved=data}catch{}return [...saved,...demoEvents.filter(d=>!saved.some(e=>String(e.id)===String(d.id)||e.title===d.title))]}
export function getEvent(id:string|number){return getEvents().find(e=>String(e.id)===String(id))||demoEvents[0]}
export function eventImage(event:EventRecord){return event.image||'/photos/events/jazz.jpg'}
export function getSavedIds(){try{const a=JSON.parse(localStorage.getItem('eventloop-saved')||'[]');return Array.isArray(a)?a.map(String):[]}catch{return []}}
export function toggleSaved(id:string|number){const ids=getSavedIds();const next=ids.includes(String(id))?ids.filter(x=>x!==String(id)):[...ids,String(id)];localStorage.setItem('eventloop-saved',JSON.stringify(next));window.dispatchEvent(new Event('eventloop-saved-changed'));return next}
