type OrganizerPlaceholderProps = { params: Promise<{ slug: string[] }> }

export default async function OrganizerPlaceholder({ params }: OrganizerPlaceholderProps) {
  const { slug } = await params
  const title = slug.map((part) => part.replaceAll('-', ' ')).join(' / ')
  return <main className="payment-placeholder"><a className="brand" href="/organizer"><span className="brand__mark">e</span><span>eventloop</span></a><section><p className="eyebrow">Organizer workspace</p><h1>{title}</h1><p>Ova organizer funkcija je pripremljena kao placeholder i biće dodana u sljedećoj fazi.</p><a className="checkout-secondary" href="/organizer">Back to dashboard</a></section></main>
}
