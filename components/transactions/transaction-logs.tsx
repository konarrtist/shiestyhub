import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface TransactionLogsProps {
  transactionId: string
}

export async function TransactionLogs({ transactionId }: TransactionLogsProps) {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("transaction_logs")
    .select(`
      *,
      user:profiles(display_name, discord_avatar)
    `)
    .eq("transaction_id", transactionId)
    .order("created_at", { ascending: false })

  if (!logs || logs.length === 0) {
    return null
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-white">{log.action}</p>
                  <span className="text-xs text-slate-500">•</span>
                  <p className="text-sm text-slate-400">{log.user?.display_name}</p>
                </div>
                <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="text-xs text-slate-400 mt-2 p-2 rounded bg-slate-900/50 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
