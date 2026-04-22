import { SetupUser } from '@/actions/billing/SetupUser'
export const dynamic = 'force-dynamic'

async function SetupPage() {
 
  return await SetupUser()
}

export default SetupPage
