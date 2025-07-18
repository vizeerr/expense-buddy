'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ShieldCheck, UserMinus, ArrowUp, ArrowDown } from 'lucide-react'

import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useState } from 'react'
import { closeManageMembers } from '@/store/slices/uiSlice'
import { fetchGroupDetails } from '@/store/slices/group/groupDetailSlice'
import { cn } from '@/lib/utils'

const ManageMembersModel = () => {
  const dispatch = useDispatch()
  const open = useSelector(state => state.ui.isManageMembersOpen)
  const { group } = useSelector(state => state.groupDetail)

  const currentUserId = useSelector(state => state.auth.user?._id)

  const [loadingUserId, setLoadingUserId] = useState(null)

  const handleClose = () => dispatch(closeManageMembers())
   if (!group) return null

  const isOwner = group?.owner?._id === currentUserId || ""
  const currentMember = group?.members?.find(m => m.user._id === currentUserId)
  const isAdmin = currentMember?.role === 'admin'

  const canManage = isOwner || isAdmin

  const handleAction = async (userId, action) => {
    setLoadingUserId(userId)
    try {
      const res = await axios.post(`/api/groups/${group._id}/member`, {
        userId,
        action
      })
      if (res.data.success) {
        toast.success(res.data.message)
        dispatch(fetchGroupDetails(group._id))
      } else {
        toast.error(res.data.message || 'Failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    } finally {
      setLoadingUserId(null)
    }
  }

  const getRoleLabel = (role) => {
    if (role === 'owner') return 'Owner'
    if (role === 'admin') return 'Admin'
    return 'Member'
  }

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
        <SheetHeader className="px-0 py-2">
          <SheetTitle className="text-sm text-neutral-500">Group Members</SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-4 max-h-[60vh] pr-2">
          <div className="flex flex-col gap-4">
            {(group.members || []).map((m, idx) => {
              const user = m.user || m // owner is direct
              const role = m.role || (user._id === group.owner._id ? 'owner' : 'member')
              const isCurrent = user._id === currentUserId

              const canModify = canManage && !isCurrent && role !== 'owner'

              return (
                <div
                  key={user._id || idx}
                  className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-neutral-800">
                      <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        role === 'owner'
                          ? 'bg-yellow-800/30 text-yellow-300'
                          : role === 'admin'
                          ? 'bg-green-800/30 text-green-300'
                          : 'bg-neutral-800 text-white'
                      )}
                    >
                      {getRoleLabel(role)}
                    </span>

                    {canModify && (
                      <>
                        {role === 'admin' ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500"
                            disabled={loadingUserId === user._id}
                            onClick={() => handleAction(user._id, 'demote')}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-400"
                            disabled={loadingUserId === user._id}
                            onClick={() => handleAction(user._id, 'promote')}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500"
                          disabled={loadingUserId === user._id}
                          onClick={() => handleAction(user._id, 'kick')}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <SheetClose asChild>
          <Button type="button" variant="outline" className="mt-6 w-full">
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}

export default ManageMembersModel
