'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroupMemberSummary } from '@/store/slices/group/memberSummarySlice'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem,CarouselNext,CarouselPrevious } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { getColorConfigFromString } from '@/utils/colorPalette'
import { UserRound } from 'lucide-react'

function getInitials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function GroupMemberCard({ groupId }) {
  const dispatch = useDispatch()
  const { members, loading, error } = useSelector((state) => state.groupMember)
  const [api, setApi] = useState()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  useEffect(() => {
    if (groupId) dispatch(fetchGroupMemberSummary(groupId))
  }, [groupId, dispatch])

  if (loading) {
    return (
      <div className="border p-4 xl:rounded-2xl rounded-xl bg-transparent">
      <div className="flex gap-2 items-center mb-5">
        <UserRound size={18} />
        <p className="text-xl font-bold">Users Expenses</p>
      </div>
      <div className="flex gap-4 ">
        {[...Array(1)].map((_, i) => (
          <Skeleton key={i} className="h-44 w-80 rounded-xl" />
        ))}
      </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div className="border p-4 xl:rounded-2xl rounded-xl bg-transparent">
      <div className="flex gap-2 items-center mb-5">
        <UserRound size={18} />
        <p className="text-xl font-bold">Users Expenses</p>
      </div>

      {/* Carousel */}
      <Carousel 
      setApi={setApi}
        opts={{ align: 'start', loop: false }}
        className="w-[100%] mx-auto"
      >
        <CarouselContent className="">
          {members.map((member, index) => {
            const color = getColorConfigFromString(member.email)

            return (
              <CarouselItem
                key={index}
                className="  sm:basis-1/2 md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
              >
                <Card
                  className={cn(
                    'w-full p-4 rounded-xl text-white border bg-accent-foreground',
                    color.bg,
                    color.border
                  )}
                >
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-transparent border-2 border-neutral-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">
                        {getInitials(member.name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{member.name}</p>
                        <p className="text-xs text-gray-300">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold">
                        ₹{member.totalAmount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-300">
                      <p>{member.expenseCount} expenses</p>
                      <p>{member.percentage.toFixed(1)}% of total</p>
                    </div>

                    <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', color.bar)}
                        style={{ width: `${member.percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        
        {count>1 && (

        
         <div className="mt-4 flex justify-center flex-wrap gap-1">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index+1}
              className={cn(
                'w-3 h-1 rounded-full transition-all',
                current === index+1
                  ? 'bg-primary'
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'
              )}
               onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              
            />
          ))}
          
        </div>
        )}

      </Carousel>
    </div>
  )
}
