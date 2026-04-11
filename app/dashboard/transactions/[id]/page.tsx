import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import TransactionDetailClient from '@/components/dashboard/transaction-detail-client'

export default async function TransactionPage({
  params,
}: {
  params: { id: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch transaction with related data
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select(`
      *,
      buyer:profiles!buyer_id(*),
      seller:profiles!seller_id(*),
      item:items(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !transaction) {
    notFound()
  }

  // Fetch stats for both parties
  const { data: buyerStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', transaction.buyer_id)
    .single()

  const { data: sellerStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', transaction.seller_id)
    .single()

  return (
    <TransactionDetailClient
      userId={user.id}
      transaction={transaction}
      buyerStats={buyerStats}
      sellerStats={sellerStats}
      existingReview={null}
      existingEmbarkReport={null}
      canReportToEmbark={false}
      isDisputed={false}
      dispute={null}
      logs={[]}
    />
  )
}
