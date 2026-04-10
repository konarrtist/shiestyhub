import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FindUserClient } from "@/components/find-user/find-user-client"

export const revalidate = 0

export default async function FindUserPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Find Traders</h1>
        <p className="text-slate-400 text-sm">Search for traders by username, display name, or Embark ID</p>
      </div>

      <FindUserClient currentUserId={user.id} />
    </div>
  )
}
