export type EventRecord = { id: string | number; title: string; date?: string; start?: string; end?: string; location?: string; venue?: string; neighbourhood?: string; address?: string; online?: boolean; price?: string; category?: string; subcategory?: string; tags?: string[]; summary?: string; description?: string; status?: string; image?: string; tickets?: {name:string;price:string;quantity:string}[]; sold?:number; capacity?:number; /** Candidate for the big "Pick of the …" card on Explore. */ featured?:boolean; /** Vibe ids (components/moods.ts) read from the title and description. "Free" and "Last-minute" are worked out from the price and start time, not stored. */ moods?:string[]; /** Good to know (optional, shown only when set) */ entry?:string; durationMinutes?:number; language?:string; /** Removed by its organizer */ deleted?:boolean; /** Account that created it ("demo-host" for the demo events) */ ownerId?:string }
const pad=(n:number)=>String(n).padStart(2,'0')
/** Local ISO date (YYYY-MM-DDTHH:mm) `days` from today, so demo events always land tonight/tomorrow/this weekend. */
function relativeStart(days:number,time:string){const d=new Date();d.setDate(d.getDate()+days);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${time}`}
/** Days from today to the coming Saturday/Sunday (same rule as the Weekend filter; on Sunday both are today). */
/** DEMO ONLY: now + `minutes`, rounded to 5 minutes, so one event is always "Last-minute". */
function soonStart(minutes:number){const d=new Date(Date.now()+minutes*60000);d.setMinutes(Math.round(d.getMinutes()/5)*5,0,0);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`}
/** Days from today to the coming Friday (0 on a Friday). */
function fridayOffset(){return (5-new Date().getDay()+7)%7}
function weekendOffset(day:'sat'|'sun'){const dow=new Date().getDay();if(dow===0)return 0;const sat=6-dow;return day==='sat'?sat:sat+1}
// price: euros as a number string ('0' = Free). image: a path under public/.
export const demoEvents: EventRecord[] = [
 {id:0,moods:['date-night','solo'],title:'Late Jazz in the Basement',start:relativeStart(0,'21:30'),venue:'Sótano Azul',neighbourhood:'Malasaña',price:'12',category:'music',subcategory:'Jazz',tags:['Jazz','Live Music','Chill','Night'],summary:'Tight trio, low lights, zero small talk needed.',image:'/photos/events/jazz.jpg',status:'Published',entry:'Ticket required',durationMinutes:120,featured:true},
 {id:1,moods:['solo','easy-to-talk'],title:'Rooftop Language Swap',start:relativeStart(0,'20:00'),venue:'Terraza Lumen',neighbourhood:'Lavapiés',price:'0',category:'social',subcategory:'Meetups',tags:['Social','Free','Chill','Languages'],summary:'Swap Spanish for English with half the city’s Erasmus crowd.',image:'/photos/events/language-swap.jpg',status:'Published',entry:'Free entry',durationMinutes:120,language:'Spanish & English'},
 {id:2,moods:['solo','easy-to-talk','try-new'],title:'Open Studio Night',start:relativeStart(1,'19:30'),venue:'Galería Cuarto Verde',neighbourhood:'Chueca',price:'0',category:'culture',subcategory:'Exhibitions',tags:['Art','Free','Creative'],summary:'Meet the artists, steal ideas, stay for the vermouth.',image:'/photos/events/open-studio.jpg',status:'Published',entry:'Free entry',durationMinutes:180,language:'Spanish & English'},
 {id:3,moods:['date-night','easy-to-talk','get-moving','golden-hour'],title:'Sunset Walk in Retiro',start:relativeStart(weekendOffset('sun'),'17:30'),venue:'Paseo Verde Crew',neighbourhood:'Retiro',price:'0',category:'nature',subcategory:'Walks',tags:['Outdoor','Free','Chill'],summary:'Slow loop round the lake, golden hour guaranteed.',image:'/photos/events/retiro-walk.jpg',status:'Published',entry:'Free entry',durationMinutes:90,language:'English'},
 {id:4,moods:['friends-night'],title:'Vermut Crawl',start:relativeStart(weekendOffset('sun'),'13:00'),venue:'Bodega La Esquina',neighbourhood:'La Latina',price:'15',category:'food',subcategory:'Tastings',tags:['Food','Drinks','Social'],summary:'Three bars, three vermouths, one very good Sunday.',image:'/photos/events/vermut.jpg',status:'Published',entry:'Ticket required',durationMinutes:150,language:'Spanish & English'},
 {id:5,moods:['try-new'],title:'Wheel Throwing 101',start:relativeStart(1,'18:00'),venue:'Taller Barro Rojo',neighbourhood:'Chamberí',price:'25',category:'workshops',subcategory:'Ceramics',tags:['Creative','Workshop','Hands-on'],summary:'Get your hands muddy and leave with your first cup.',image:'/photos/events/pottery.jpg',status:'Published',entry:'Book ahead',durationMinutes:120,language:'English'},
 {id:6,moods:['friends-night','solo','get-moving'],title:'Pickup Basketball Night',start:relativeStart(5,'20:00'),venue:'Cancha La Paloma',neighbourhood:'La Latina',price:'8',category:'sports',subcategory:'Basketball',tags:['Sport','Active','Social'],summary:'Show up, pick a team, play till the lights go off.',image:'/photos/events/basketball.jpg',status:'Published',entry:'Ticket required',durationMinutes:120,language:'Spanish & English'},
 {id:7,moods:['try-new'],title:'Student Founders Pitch Night',start:relativeStart(4,'19:00'),venue:'Ideas Bar',neighbourhood:'Chamberí',price:'0',category:'learning',subcategory:'Talks',tags:['Talks','Free','Startups'],summary:'Five pitches, five minutes each, brutal Q&A.',image:'/photos/events/pitch.jpg',status:'Published',entry:'Free entry',durationMinutes:120,language:'English'},
 {id:8,moods:['friends-night','dance'],title:'Indie Night: Static Bloom',start:relativeStart(0,'22:00'),venue:'Sala Ventana',neighbourhood:'Malasaña',price:'18',category:'music',subcategory:'Indie',tags:['Live Music','Indie','Night'],summary:'Loud guitars, sticky floor, best night of your week.',image:'/photos/events/indie.jpg',status:'Published',entry:'Ticket required',durationMinutes:150,featured:true},
 {id:9,moods:['date-night','friends-night'],title:'Comedy in English',start:relativeStart(3,'21:00'),venue:'Bar La Tuerca',neighbourhood:'Lavapiés',price:'10',category:'social',subcategory:'Comedy',tags:['Comedy','Social','Night'],summary:'Fresh sets from Madrid’s expat comics. Sit front row if you dare.',image:'/photos/events/comedy.jpg',status:'Published',entry:'Ticket required',durationMinutes:90,language:'English'},
 {id:10,moods:['dance','friends-night'],title:'Salsa Social',start:relativeStart(fridayOffset(),'22:00'),venue:'Sala Candela',neighbourhood:'La Latina',price:'10',category:'music',subcategory:'Salsa',tags:['Dance','Salsa','Social','Night'],summary:'Quick beginner class, then dance till late. Bring the crew.',image:'/photos/events/salsa-social.jpg',status:'Published',entry:'Ticket required',durationMinutes:180,language:'Spanish & English'},
 {id:11,moods:['friends-night','easy-to-talk'],title:'Christmas Market in the Centre',start:relativeStart(0,'17:00'),venue:'Madrid Winter Market',neighbourhood:'Centro',price:'0',category:'social',subcategory:'Markets',tags:['Market','Free','Christmas'],summary:'Stalls, hot churros and fairy lights, so wander for as long as you like.',image:'/photos/events/christmas-market.jpg',status:'Published',entry:'Free entry',durationMinutes:180},
 // DEMO ONLY: always starts now + 45 min (rounded to 5), so one event is always "Last-minute".
 {id:12,moods:['get-moving','solo'],title:'Rooftop Run Club',start:soonStart(45),venue:'Sunset Striders',neighbourhood:'Malasaña',price:'0',category:'sports',subcategory:'Running',tags:['Running','Free','Active'],summary:'An easy 5K loop that ends on a rooftop with stretches and city views.',image:'/photos/events/rooftop-run-club.jpg',status:'Published',entry:'Free entry',durationMinutes:90,language:'Spanish & English'},
 {id:13,moods:['friends-night','date-night','easy-to-talk'],title:'Wine & Tapas Crawl',start:relativeStart(0,'19:00'),venue:'La Latina Walks',neighbourhood:'La Latina',price:'18',category:'food',subcategory:'Tastings',tags:['Wine','Tapas','Food'],summary:'Four stops, four glasses and the best small plates in the old town.',image:'/photos/events/wine-tapas-latina.jpg',status:'Published',entry:'Ticket required',durationMinutes:150,language:'Spanish & English'},
 {id:14,moods:['date-night','solo'],title:'Gallery Opening',start:relativeStart(0,'19:30'),venue:'Open Wall Collective',neighbourhood:'Chueca',price:'0',category:'culture',subcategory:'Exhibitions',tags:['Art','Free','Opening'],summary:'New work on the walls, a glass in your hand and artists happy to chat.',image:'/photos/events/gallery-opening.jpg',status:'Published',entry:'Free entry',durationMinutes:120},
 {id:15,moods:['easy-to-talk','solo','try-new'],title:'Board Game Night',start:relativeStart(0,'20:00'),venue:'Dados & Café',neighbourhood:'Chueca',price:'5',category:'social',subcategory:'Games',tags:['Games','Social','Chill'],summary:'Grab a seat, learn a new game in five minutes and stay for the rematch.',image:'/photos/events/board-game-cafe.jpg',status:'Published',entry:'Ticket required',durationMinutes:150,language:'Spanish & English'},
 {id:16,moods:['date-night','friends-night'],title:'Rooftop Cocktail Night',start:relativeStart(0,'21:30'),venue:'Azotea Sessions',neighbourhood:'Centro',price:'16',category:'food',subcategory:'Cocktails',tags:['Cocktails','Rooftop','Night'],summary:'Signature cocktails, low music and the skyline lit up all around you.',image:'/photos/events/rooftop-cocktail.jpg',status:'Published',entry:'Ticket required',durationMinutes:150},
 {id:17,moods:['dance','friends-night'],title:'Vinyl Disco Night',start:relativeStart(0,'23:00'),venue:'Groove Club',neighbourhood:'Lavapiés',price:'12',category:'music',subcategory:'Disco',tags:['Disco','Vinyl','Dance','Night'],summary:'All-vinyl disco and funk until late, so wear shoes you can dance in.',image:'/photos/events/vinyl-disco-night.jpg',status:'Published',entry:'Ticket required',durationMinutes:180},
 {id:18,moods:['date-night','friends-night','try-new'],title:'Rooftop Cinema',start:relativeStart(1,'20:00'),venue:'Cine Azotea',neighbourhood:'Centro',price:'10',category:'culture',subcategory:'Cinema',tags:['Cinema','Rooftop','Outdoor'],summary:'A classic film under the stars, with heaters and blankets for every seat.',image:'/photos/events/rooftop-cinema.jpg',status:'Published',entry:'Ticket required',durationMinutes:150,language:'English with Spanish subtitles'},
 {id:19,moods:['date-night','try-new'],title:'Ballet Evening',start:relativeStart(weekendOffset('sat'),'20:30'),venue:'Teatro Nocturno',neighbourhood:'Centro',price:'28',category:'culture',subcategory:'Dance',tags:['Ballet','Theatre','Classic'],summary:'A short, sparkling programme of classic and modern ballet, perfect for a first time.',image:'/photos/events/ballet-evening.jpg',status:'Published',entry:'Book ahead',durationMinutes:120},
 {id:20,moods:['solo','easy-to-talk'],title:'Literary Evening',start:relativeStart(0,'20:00'),venue:'Páginas Abiertas',neighbourhood:'Malasaña',price:'5',category:'learning',subcategory:'Readings',tags:['Books','Readings','Chill'],summary:'Short readings, an open mic for brave first-timers and plenty of time to talk books.',image:'/photos/events/literary-evening.jpg',status:'Published',entry:'Ticket required',durationMinutes:120,language:'Spanish & English'}].map(e=>({...e,ownerId:'demo-host'}))
const timeFmt=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'})
const dayFmt=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short'})
const euro=new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:0})
const euroCents=new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR'})
const startOfDay=(d:Date)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()
/** "Tonight · 20:00", "Today · 12:00", "Tomorrow · 19:30", otherwise "Sat 29 Nov · 21:00" (en-GB, 24h). */
export function formatEventDate(date:Date,now=new Date()){const days=Math.round((startOfDay(date)-startOfDay(now))/86400000);const label=days===0?(date.getHours()>=17?'Tonight':'Today'):days===1?'Tomorrow':dayFmt.format(date).replace(',','');return `${label} · ${timeFmt.format(date)}`}
/** True when the event starts today from 17:00 — the same rule that labels it "Tonight". */
export function isTonight(event:EventRecord,now=new Date()){if(!event.start)return false;const d=new Date(event.start);return !Number.isNaN(d.getTime())&&startOfDay(d)===startOfDay(now)&&d.getHours()>=17}
/** An event without a duration counts as 2 hours long. Explore keeps a started event for 2 hours. */
export const DEFAULT_DURATION_MIN=120
export const STARTED_WINDOW_MIN=120
/** Where an event is in time: "upcoming", "started" (minutes ago) or "ended" (start + duration has passed). */
export function eventTiming(event:EventRecord,now=new Date()):{state:'upcoming'|'started'|'ended';minutes:number}{const s=event.start?new Date(event.start).getTime():NaN;if(Number.isNaN(s)||now.getTime()<s)return{state:'upcoming',minutes:0};const minutes=Math.floor((now.getTime()-s)/60000);return{state:minutes>=(event.durationMinutes||DEFAULT_DURATION_MIN)?'ended':'started',minutes}}
/** Gone from Explore: it has ended, or it started 2 hours ago or more. */
export function isPastForExplore(event:EventRecord,now=new Date()){const t=eventTiming(event,now);return t.state==='ended'||(t.state==='started'&&t.minutes>=STARTED_WINDOW_MIN)}
/** "Started 25 min ago" while an event is on and started less than 2 hours ago, otherwise "". */
/** Starts within 2 hours (not started yet): "Starting soon" and a lime chip. */
export const SOON_WINDOW_MIN=120
export function isStartingSoon(event:EventRecord,now=new Date()){if(eventTiming(event,now).state!=='upcoming'||!event.start)return false;const m=(new Date(event.start).getTime()-now.getTime())/60000;return m>=0&&m<SOON_WINDOW_MIN}
/** Lime chip text for live / soon events: "Starting now", "In 40 min", "In 1 h 15 min" (5-minute steps) or "Started 12 min ago"; "" for every other event. */
export function liveChipLabel(event:EventRecord,now=new Date()){const started=startedLabel(event,now);if(started)return started;if(!isStartingSoon(event,now))return '';const m=(new Date(event.start as string).getTime()-now.getTime())/60000;if(m<5)return 'Starting now';const r=Math.round(m/5)*5;return r<60?`In ${r} min`:`In ${Math.floor(r/60)} h${r%60?` ${r%60} min`:''}`}
export function startedLabel(event:EventRecord,now=new Date()){const t=eventTiming(event,now);return t.state==='started'&&t.minutes<STARTED_WINDOW_MIN?`Started ${Math.max(1,t.minutes)} min ago`:''}
/** Short English category names, shared by the category grid and event cards. */
export const CATEGORY_LABELS:Record<string,string>={music:'Music',culture:'Arts',sports:'Sports',nature:'Outdoors',workshops:'Workshops',learning:'Learning',social:'Social',food:'Food & Drink'}
export function eventCategory(event:EventRecord){return (event.category&&CATEGORY_LABELS[event.category])||event.category||'Event'}
export function eventDate(event: EventRecord) {if(event.start){const date=new Date(event.start);if(!Number.isNaN(date.getTime()))return formatEventDate(date)}return event.date || 'Date TBA'}
/** "Venue · Neighbourhood" — never a distance. */
export function eventLocation(event: EventRecord){if(event.online)return 'Online';const place=[event.venue||event.location,event.neighbourhood].filter(Boolean).join(' · ');return place||event.address||'Location TBA'}
/** €12 / Free. Accepts numbers or numeric strings; any other legacy text is shown as-is. */
export function formatPrice(value:number){return value===0?'Free':(Number.isInteger(value)?euro:euroCents).format(value)}
/** Ticket price in euros as a number (lowest ticket type), or null when it is unknown. */
export function eventPriceValue(event:EventRecord):number|null{if(event.tickets?.length)return Math.min(...event.tickets.map(t=>Number(t.price)||0));if(!event.price)return null;const n=Number(event.price);return Number.isFinite(n)?n:null}
/** Free events book a spot, paid ones sell tickets: one rule for every booking button. */
export const isFree=(event:EventRecord)=>eventPriceValue(event)===0;
export const bookingLabel=(event:EventRecord)=>isFree(event)?'Save your spot':'Get tickets';
export function eventPrice(event:EventRecord){if(event.tickets?.length){const min=Math.min(...event.tickets.map(t=>Number(t.price)||0));return min===0?'Free':`From ${formatPrice(min)}`}if(!event.price)return 'See details';const n=Number(event.price);return Number.isFinite(n)?formatPrice(n):event.price}
export function getEvents(){if(typeof window==='undefined')return demoEvents;let saved:EventRecord[]=[];try{const data=JSON.parse(localStorage.getItem('eventloop-events')||'[]');if(Array.isArray(data))saved=data}catch{}
// Demo events belong to the demo host and are always published: ignore older local copies of them.
const demoIds=new Set(demoEvents.map(d=>String(d.id)));saved=saved.filter(e=>!demoIds.has(String(e.id)))
return [...saved,...demoEvents.filter(d=>!saved.some(e=>String(e.id)===String(d.id)||e.title===d.title))].filter(e=>!e.deleted)}
/** Events the organizer created or edited (localStorage). */
export function readSavedEvents():EventRecord[]{try{const data=JSON.parse(localStorage.getItem('eventloop-events')||'[]');return Array.isArray(data)?data:[]}catch{return []}}
/** Adds or replaces an event (by id) in localStorage. Works for demo events too: the saved copy wins.
 *  Returns false when the browser refuses the write (storage full, private mode). */
export function saveEvent(event:EventRecord):boolean{const rest=readSavedEvents().filter(e=>String(e.id)!==String(event.id));try{localStorage.setItem('eventloop-events',JSON.stringify([event,...rest]));return true}catch{return false}}
/** The event with this id, or undefined (no fallback). */
export function findEvent(id:string|number){return getEvents().find(e=>String(e.id)===String(id))}
export function getEvent(id:string|number){return getEvents().find(e=>String(e.id)===String(id))||demoEvents[0]}
/** 90 -> "1 h 30 min", 120 -> "2 h", 45 -> "45 min" */
export function formatDuration(minutes:number){const h=Math.floor(minutes/60),m=minutes%60;return [h&&h+' h',m&&m+' min'].filter(Boolean).join(' ')}
/** What each demo photo shows, for its alt text. A photo that isn't listed stays decorative (alt=""). */
const PHOTO_ALT:Record<string,string>={
 '/photos/events/ballet-evening.jpg':'A ballet dancer spinning on a dark stage, her skirt blurred with motion',
 '/photos/events/basketball.jpg':'Players running across an outdoor basketball court, seen through a fence',
 '/photos/events/board-game-cafe.jpg':'Close-up of a board game with dice and a playing piece',
 '/photos/events/christmas-market.jpg':'Christmas market stalls with fairy lights next to a lit-up tree',
 '/photos/events/comedy.jpg':'A red neon sign reading LAUGH on a brick wall',
 '/photos/events/gallery-opening.jpg':'Visitors looking at paintings in a bright gallery',
 '/photos/events/indie.jpg':'A three-piece band playing guitars on a dark stage, in black and white',
 '/photos/events/jazz.jpg':'People at a dimly lit bar under a wall of colourful paintings',
 '/photos/events/language-swap.jpg':'Two women chatting across a café table outdoors',
 '/photos/events/literary-evening.jpg':'People reading and talking in a cosy room with framed pictures on the walls',
 '/photos/events/open-studio.jpg':'An artist painting at an easel in a busy studio',
 '/photos/events/pitch.jpg':'A speaker on stage in front of a seated audience and a big screen',
 '/photos/events/pottery.jpg':'Hands shaping a clay pot on a potter\'s wheel',
 '/photos/events/retiro-walk.jpg':'People with bikes on a waterfront path at sunset',
 '/photos/events/rooftop-cinema.jpg':'Rows of deck chairs facing a big outdoor screen at dusk',
 '/photos/events/rooftop-cocktail.jpg':'Four cocktails on a rooftop ledge with city towers behind',
 '/photos/events/rooftop-run-club.jpg':'Runners warming up together on a sunny wooden rooftop deck',
 '/photos/events/salsa-social.jpg':'Couples dancing salsa in a warmly lit room',
 '/photos/events/vermut.jpg':'A glass of vermouth with an orange slice and a small snack on a café table',
 '/photos/events/vinyl-disco-night.jpg':'A crowd dancing under pink and blue lights in a dark club',
 '/photos/events/wine-tapas-latina.jpg':'Tapas and glasses of red wine on a wooden table',
}
export function eventImageAlt(event:EventRecord){return PHOTO_ALT[eventImage(event)]||''}
export function eventImage(event:EventRecord){return event.image||'/photos/events/jazz.jpg'}
export function getSavedIds(){try{const a=JSON.parse(localStorage.getItem('eventloop-saved')||'[]');return Array.isArray(a)?a.map(String):[]}catch{return []}}
export function toggleSaved(id:string|number){const ids=getSavedIds();const next=ids.includes(String(id))?ids.filter(x=>x!==String(id)):[...ids,String(id)];try{localStorage.setItem('eventloop-saved',JSON.stringify(next))}catch{return ids}window.dispatchEvent(new Event('eventloop-saved-changed'));return next}
