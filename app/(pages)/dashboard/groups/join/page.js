// app/dashboard/groups/join/page.tsx
import { Suspense } from 'react'
import GroupJoinPage from './GroupJoinPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <GroupJoinPage />
    </Suspense>
  )
}
