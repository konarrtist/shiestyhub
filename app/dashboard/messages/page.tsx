import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Fetch messages where the user is either sender or receiver
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, username, avatar_url, display_name),
      receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url, display_name)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  const seen = new Set()
  
  // Logic fix: Handle counterpart as a single object, not an array
  const threads = (messages || []).reduce((acc: any[], message: any) => {
    const isSender = message.sender_id === user.id
    const rawCounterpart = isSender ? message.receiver : message.sender
    
    // Safety: Grab the first element if it's an array, otherwise use the object
    const counterpart = Array.isArray(rawCounterpart) ? rawCounterpart[0] : rawCounterpart

    if (!counterpart?.id || seen.has(counterpart.id)) return acc

    seen.add(counterpart.id)
    return [
      ...acc,
      {
        id: counterpart.id,
        username: counterpart.display_name || counterpart.username || "Unknown Raider",
        avatar_url: counterpart.avatar_url,
        lastMessage: message.content,
        time: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: !message.is_read && !isSender
      }
    ]
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-950 min-h-screen text-white">
      <h2 className="text-3xl font-bold tracking-tight text-cyan-500 mb-6">Messages</h2>
      
      <div className="grid gap-4">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <Link key={thread.id} href={`/dashboard/messages/${thread.id}`}>
              <Card className="bg-slate-900 border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-slate-700">
                    <AvatarImage src={thread.avatar_url} />
                    <AvatarFallback className="bg-slate-800">{thread.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-white">{thread.username}</p>
                      <span className="text-xs text-slate-500">{thread.time}</span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">{thread.lastMessage}</p>
                  </div>
                  {thread.unread && (
                    <Badge className="bg-cyan-500 h-2 w-2 rounded-full p-0 border-0" />
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p>No active conversations yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
