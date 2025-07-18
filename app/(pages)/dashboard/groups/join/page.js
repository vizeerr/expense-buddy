// app/dashboard/groups/join/page.tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function GroupJoinPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [groupInfo, setGroupInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('Invalid link')
        setLoading(false)
        return
      }

      try {
        const res = await axios.post('/api/groups/validate-token', { token })
        if (res.data.success) {
          setGroupInfo(res.data)
        } else {
          toast.error(res.data.message || 'Invalid or expired link')
        }
      } catch (err) {
        console.log(err);
        
        toast.error('Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleJoinRequest = async () => {
    if (!groupInfo?.groupId) return

    try {
      setRequesting(true)
      const res = await axios.post(`/api/groups/${groupInfo.groupId}/invite/join-request`)
      if (res.data.success) {
        toast.success('Request sent successfully!')
        router.push('/dashboard') // or go to group listing
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
        console.log(err);
      toast.error('Error sending join request')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-white">
        <Loader2 className="animate-spin mr-2" />
        Validating invite...
      </div>
    )
  }

  if (!groupInfo) {
    return (
      <div className="text-center text-red-400 mt-10">
        Invalid or expired invite link.
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-black rounded-xl text-white shadow-lg border border-white/10">
      <h1 className="text-2xl font-bold mb-2">Join Group</h1>
      <p className="text-lg mb-6">You{'&pos'}re invited to join: <span className="font-semibold">{groupInfo.groupName}</span></p>

      <Button
        disabled={requesting}
        onClick={handleJoinRequest}
        className="bg-green-900 text-green-300"
      >
        {requesting ? 'Sending Request...' : 'Request to Join'}
      </Button>
    </div>
  )
}
