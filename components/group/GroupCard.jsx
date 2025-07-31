'use client'

import {
  Users,
  Calendar,
  Eye,
  ShieldCheck,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'

const GroupCard = ({ group }) => {
  const router = useRouter()
  const currentUser = useSelector((state) => state.auth.user)
  console.log(group);
  

  const members = group.members || []

  const isOwner = group.owner?._id === currentUser?._id
  const isAdmin = members.some(
    (m) => m.user?._id === currentUser?._id && m.role === 'admin'
  )

  const roleBadge = isOwner ? 'Owner' : isAdmin ? 'Admin' : null

  const initials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Card onClick={() => router.push(`/dashboard/groups/${group._id}`)} className={cn(
      "relative border gap-2 py-3  rounded-2xl overflow-hidden bg-transparent drop-shadow-2xl drop-shadow-amber-800 md:hover:border-white shadow-xl transition duration-100 md:hover:scale-[1.05]"
    )}>
      <CardHeader className="px-3">
        <div className="flex justify-between items-start">
          <div className='flex items-center gap-3'>
            <div className='bg-amber-950 h-10 w-10 rounded-full border p-2.5'>
                                <Users className="h-full w-full" />
                              </div>
            <div>
            <CardTitle className="text-lg text-white">{group?.name
  ? group.name.length > 12
    ? `${group.name.slice(0, 12)}...`
    : group.name
  : 'Unknown'}
</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2 ">
             {group?.description
              ? group.description.length > 20
                ? `${group.description.slice(0, 20)}...`
                : group.description
              : 'No Description'}

            </CardDescription>
            </div>
          </div>
          {roleBadge && (
            <div className={cn(
              "flex absolute right-2 items-center gap-1 px-2 py-1 text-xs rounded-full",
              roleBadge === 'Owner'
                ? 'bg-yellow-800/30 text-yellow-300'
                : 'bg-green-900/30 text-green-300'
            )}>
              <ShieldCheck className="w-3 h-3" />
              {roleBadge}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className=" flex items-center justify-between w-full gap-2 text-sm text-muted-foreground ">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span>Created: {format(new Date(group.createdAt), 'dd MMM yyyy')}</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-400" />
          <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>

        {/* <div className="flex items-center gap-2 ">
          {members.slice(0, 3).map((m, idx) => (
            <Avatar
              key={m.user?._id || idx}
              className="h-7 w-7 border border-neutral-700"
            >
              <AvatarFallback className="bg-transparent text-neutral-400">
                {initials(m.user?.name || m.user?.email || 'U')}
              </AvatarFallback>
            </Avatar>
          ))}
          {members.length > 3 && (
            <span className="text-xs text-muted-foreground">+{members.length - 3} more</span>
          )}
        </div> */}
      </CardContent>
    </Card>
  )
}

export default GroupCard
