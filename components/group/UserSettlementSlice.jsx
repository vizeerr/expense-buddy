'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

import { useDispatch, useSelector } from 'react-redux'
import { closeSettlementSheet } from '@/store/slices/uiSlice'
import { useEffect } from 'react'
import { fetchGroupSettlements } from '@/store/slices/group/userSettlementSlice'

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

const UserSettlementSheet = ({groupId}) => {
  const dispatch = useDispatch()
  const open = useSelector((state) => state.ui.isSettlementSheetOpen)
//   const group = useSelector((state) => state.groupDetail.group)
  const { settlements, loading } = useSelector((state) => state.settlements)

  const handleClose = () => dispatch(closeSettlementSheet())

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupSettlements(groupId))
    }
  }, [dispatch, groupId])

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="w-[95vw] max-w-xl mx-auto p-4 rounded-3xl backdrop-blur-xl bg-transparent border-2 md:mb-10 mb-4"
      >
        <SheetHeader className="flex flex-row items-center gap-3 px-0 pt-0 pb-2 border-b">
          <SheetClose asChild>
            <Button variant="ghost" size="icon" type="button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </SheetClose>
          <SheetTitle className="text-sm text-neutral-500 font-bold">
            Group Settlements
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-4 max-h-[60vh] pr-2">
          <div className="flex flex-col gap-4">
            {loading ? (
              [...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                >
                  <Skeleton className="h-8 w-8 rounded-full bg-neutral-700" />
                  <Skeleton className="h-4 w-40 bg-neutral-700 rounded-md" />
                  <Skeleton className="h-4 w-12 bg-neutral-700 rounded-md" />
                </div>
              ))
            ) : settlements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">No settlements required</p>
            ) : (
              settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-neutral-800">
                      <AvatarFallback>{getInitials(s.from.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-white">
                        {s.from.name} <span className="text-muted-foreground text-xs">owes</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{s.from.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-green-300">₹{s.amount}</p>
                    <p className="text-xs text-muted-foreground">to {s.to.name}</p>
                  </div>
                </div>
              ))
            )}
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

export default UserSettlementSheet
