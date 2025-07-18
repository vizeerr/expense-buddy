'use client'

import { format } from 'date-fns'
import { Users, Calendar, ShieldCheck, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useSelector } from 'react-redux'
import { openManageMembers,openGroupInvite,openGroupEdit } from '@/store/slices/uiSlice'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useDispatch } from 'react-redux'

const GroupHeader = () => {
  const dispatch = useDispatch()

  const { group, loading, error } = useSelector(state => state.groupDetail)
  const currentUserId = useSelector(state => state.auth.user?._id)

  if (loading) {
    return (
      <div className="border rounded-2xl p-5 md:p-6 bg-black text-white shadow-md space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2 mt-2" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2 mt-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border rounded-2xl p-5 md:p-6 bg-black text-red-400 text-center shadow-md">
        {error}
      </div>
    )
  }

  if (!group) return null

  const members = group.members || []
  const currentMember = members.find(m => m.user?._id === currentUserId)
  const isOwner = group.owner?._id === currentUserId
  const isAdmin = currentMember?.role === 'admin'
  const roleBadge = isOwner ? 'Owner' : isAdmin ? 'Admin' : null

  const initials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <div className="border rounded-2xl p-5 md:p-6 bg-black text-white shadow-md space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{group.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {group.description || 'No description provided'}
          </p>
        </div>

        {roleBadge && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs rounded-full",
            roleBadge === 'Owner'
              ? 'bg-yellow-800/30 text-yellow-300'
              : 'bg-green-900/30 text-green-300'
          )}>
            <ShieldCheck className="w-3 h-3" />
            {roleBadge}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Created: {format(new Date(group.createdAt), 'dd MMM yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex items-center gap-2">
          
           <DropdownMenu>
        <DropdownMenuTrigger className="outline-none ml-4">
          <MoreHorizontal className="w-8 h-8  bg-neutral-800 p-1.5 rounded-sm text-muted-foreground hover:text-white cursor-pointer" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-40 bg-neutral-900 border border-neutral-800"
        >
          <DropdownMenuItem onClick={() => dispatch(openGroupInvite())} className="cursor-pointer">
            {/* <Eye className="w-4 h-4 mr-2" /> View */}
            Invite Member
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(openManageMembers())} className="cursor-pointer">
            {/* <Pencil className="w-4 h-4 mr-2" /> Edit */}
            All Members
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(openGroupEdit())} className="cursor-pointer">
            {/* <Pencil className="w-4 h-4 mr-2" /> Edit */}
            Edit Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
        </div>
      </div>

      {/* Member Avatars */}
      <div className="flex items-center gap-2 pt-2">
        {members.slice(0, 5).map((m, idx) => (
          <Avatar
            key={m.user?._id || idx}
            className="h-8 w-8 border border-white/10 bg-neutral-800"
          >
            <AvatarFallback>
              {initials(m.user?.name || m.user?.email || 'U')}
            </AvatarFallback>
          </Avatar>
        ))}
        {members.length > 5 && (
          <span className="text-xs text-muted-foreground">
            +{members.length - 5} more
          </span>
        )}
      </div>
    </div>
  )
}

export default GroupHeader
