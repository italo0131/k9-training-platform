export type User = {
  id: string
  name: string
  email: string
  role: string
  status?: string
  emailVerifiedAt?: string | null
  phone?: string | null
  phoneVerifiedAt?: string | null
}
