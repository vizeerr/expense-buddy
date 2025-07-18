'use client'

import { useState } from 'react'
import {
  Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import axios from 'axios'
import { closeGroupInvite } from '@/store/slices/uiSlice'
import { fetchGroupDetails } from '@/store/slices/group/groupDetailSlice'

const InviteMemberSheet = () => {
  const dispatch = useDispatch()
  const open = useSelector(state => state.ui.isInviteGroupOpen)
  const group = useSelector(state => state.groupDetail.group)
  const groupId = group?._id
  console.log(group);
  
  const currentUserId = useSelector(state => state.auth.user?._id)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const handleClose = () => {
    dispatch(closeGroupInvite())
    setEmail('')
    setRole('member')
    setInviteLink('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!groupId) {
      toast.error('Group ID not found')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`/api/groups/${groupId}/invite`, {
        email: email.trim(),
        role,
      })

      if (res.data.success) {
        toast.success('Member invited successfully!')
        dispatch(fetchGroupDetails(groupId))
        handleClose()
      } else {
        toast.error(res.data.message || 'Invite failed')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLink = async () => {
    try {
      setLinkLoading(true)
      const res = await axios.post(`/api/groups/${groupId}/invite/generate-link`)
      if (res.data.success) {
        setInviteLink(res.data.link)
        toast.success('Link generated!')
      } else {
        toast.error(res.data.message || 'Failed to generate link')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    } finally {
      setLinkLoading(false)
    }
  }

  const handleRequestAction = async (userId, action) => {
    try {
      const res = await axios.post(`/api/groups/${groupId}/invite/handle-request`, {
        userId,
        action
      })
      if (res.data.success) {
        toast.success(res.data.message)
        dispatch(fetchGroupDetails(groupId))
      } else {
        toast.error(res.data.message || 'Failed to update request')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  const isOwner = group?.owner?._id === currentUserId
  const currentMember = group?.members?.find(m => m.user._id === currentUserId)
  const isAdmin = currentMember?.role === 'admin'
  const canApprove = isOwner || isAdmin

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-xl mx-auto p-6 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
        <form onSubmit={handleSubmit}>
          <SheetHeader className="px-0 py-2">
            <SheetTitle className="text-sm text-neutral-500">Invite Member to Group</SheetTitle>
          </SheetHeader>

          <div className="mt-5 grid gap-4">
            <div>
              <Label htmlFor="email" className="text-base">User Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="someone@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-base">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="mt-8 p-0">
            <div className="flex flex-wrap gap-4 w-full">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-green-900 text-green-300"
              >
                {loading ? 'Inviting...' : 'Invite Member'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateLink}
                disabled={linkLoading}
              >
                {linkLoading ? 'Generating...' : 'Generate Invite Link'}
              </Button>
              <SheetClose asChild>
                <Button type="button" variant="outline" className="text-red-500">
                  Cancel
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>

          {inviteLink && (
            <div className="mt-4 text-xs text-muted-foreground break-all">
              Invite Link (valid 7 days): <br />
              <span className="text-white">{inviteLink}</span>
            </div>
          )}
        </form>

        {/* ✅ Pending Requests – only for owner or admin */}
        {canApprove && group?.joinRequests?.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm text-neutral-400 mb-2">Pending Join Requests</h3>
            <ScrollArea className="max-h-[40vh] pr-2">
              <div className="flex flex-col gap-3">
                {group.joinRequests.map(req => (
                  <div
                    key={req.user._id}
                    className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2"
                  >
                    <div>
                      <p className="text-sm text-white">{req.user.name}</p>
                      <p className="text-xs text-muted-foreground">{req.user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(req.user._id, 'approve')}
                        className="bg-green-900 text-green-300"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequestAction(req.user._id, 'reject')}
                        className="bg-red-900 text-red-300"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default InviteMemberSheet
