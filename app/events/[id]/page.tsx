import EventDetails from '@/components/event-details'
type Props={params:Promise<{id:string}>}
export default async function Page({params}:Props){const {id}=await params;return <EventDetails id={id}/> }
