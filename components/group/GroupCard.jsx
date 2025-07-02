'use client'

import {
  Users,
  Calendar,
  Eye,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'


const GroupCard = ({ group, currentUserId, onView }) => {
  const isAdmin = group.createdBy?._id === currentUserId
  const members = group.members || []
  const router = useRouter()


  const initials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Card className={cn(
      "relative border rounded-2xl overflow-hidden backdrop-blur-xl bg-[#000000] shadow-xl transition hover:scale-[1.03]"
    )}>
      <CardHeader className="">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-white">{group.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {group.description || 'No description'}
            </CardDescription>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Admin
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground space-y-3 ">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span>Created: {format(new Date(group.createdAt), 'dd MMM yyyy')}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Member Avatars */}
        <div className="flex items-center gap-2 pt-2">
          {members.slice(0, 3).map((m, idx) => (
            <Avatar
              key={m.user?._id || idx}
              className="h-7 w-7 border border-white/20 bg-neutral-800"
            >
              <AvatarFallback>
                {initials(m.user?.name || m.user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
          ))}
          {members.length > 3 && (
            <span className="text-xs text-muted-foreground">+{members.length - 3} more</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          className="text-white"
          onClick={() => router.push(`/dashboard/groups/${group._id}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Group
        </Button>
      </CardFooter>
    </Card>
  )
}

export default GroupCard
