import { redirect } from "next/navigation"

type Props = { params: { clientId: string } }

export default function AdminClientRedirectPage({ params }: Props) {
  redirect(`/admin/users/${params.clientId}`)
}
