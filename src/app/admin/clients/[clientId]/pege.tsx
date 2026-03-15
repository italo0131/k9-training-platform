export default function AdminClientDetailPage({ params }: { params: { clientId: string } }) {
  return (
    <div className="min-h-[100svh] bg-slate-950 text-white px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-semibold">Admin - Cliente</h1>
      <p className="text-gray-300 mt-2">Cliente: {params.clientId}</p>
    </div>
  )
}


