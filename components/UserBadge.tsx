import { getUser } from '@/components/hooks/auth'
import Link from 'next/link'
import { UserIcon } from 'lucide-react'

export default async function UserBadge() {
  const user = await getUser()
  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <UserIcon size={18} />
        Sign in
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <UserIcon size={16} className="text-muted-foreground" />
        )}
      </div>
      <span className="text-sm font-medium truncate max-w-[120px]">{user.name}</span>
    </div>
  )
}
