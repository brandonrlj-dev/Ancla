import { createClient } from '@/lib/supabase/server'
import PCLayoutClient from '@/components/policia/PCLayoutClient'

export default async function PoliciaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const agentName =
    (user?.user_metadata?.nombre as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Agente'

  return <PCLayoutClient agentName={agentName}>{children}</PCLayoutClient>
}
