'use client'
import {useEffect,useState} from 'react'
import {Bookmark,Compass,Ticket,Search,ChevronDown,LogOut,UserRound} from 'lucide-react'
export default function SiteNav(){
 const [open,setOpen]=useState(false),[user,setUser]=useState(''),[query,setQuery]=useState('');
 useEffect(()=>{const role=localStorage.getItem('eventloop-demo-role');if(role==='organizer'){window.location.replace('/organizer');return}setUser(localStorage.getItem('eventloop-demo-user')||'');const q=new URLSearchParams(location.search).get('q')||'';setQuery(q)},[]);
 const logout=()=>{localStorage.removeItem('eventloop-demo-user');localStorage.removeItem('eventloop-demo-role');setUser('');window.location.assign('/auth')};
 const search=(value:string)=>{setQuery(value);if(location.pathname==='/'||location.pathname==='/saved'){window.dispatchEvent(new CustomEvent('eventloop-search',{detail:value}))}};
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(location.pathname!=='/'){window.location.assign('/?q='+encodeURIComponent(query))}else{window.dispatchEvent(new CustomEvent('eventloop-search',{detail:query}))}};
 return <header className="topbar el-site-nav"><a className="brand" href="/"><span className="brand__mark">e</span><span>eventloop</span></a><nav className="el-main-links"><a href="/"><Compass size={17}/> Explore</a><a href="/saved"><Bookmark size={17}/> Saved</a><a href="/my-tickets"><Ticket size={17}/> My Tickets</a></nav><form className="el-nav-search" role="search" onSubmit={submit}><Search size={17}/><input aria-label="Search events, places or organizers" placeholder="Search events, places or organizers..." value={query} onChange={e=>search(e.target.value)}/></form><div className="el-account"><button className="el-account-button" type="button" aria-expanded={open} onClick={()=>setOpen(!open)}><UserRound size={17}/>{user||'Account'}<ChevronDown size={15}/></button>{open&&<div className="el-account-menu"><a href="/my-tickets">My Tickets</a><a href="/onboarding">My interests</a>{user?<button onClick={logout} type="button"><LogOut size={15}/> Sign out</button>:<a href="/auth">Join</a>}</div>}</div></header>
}
