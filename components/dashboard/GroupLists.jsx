'use client'

import React, { useEffect, useState } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import{openAddGroup} from '@/store/slices/uiSlice'

import { useDispatch, useSelector } from 'react-redux'
import { fetchGroups } from '@/store/slices/group/groupSlice'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
const GroupLists = () => {
  const dispatch = useDispatch()
    const router = useRouter()
  const { list: groups, loading } = useSelector((state) => state.groups)

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
  
  // useEffect(() => {
  //   dispatch(fetchGroups())
  // }, [dispatch])

 
 
  return (
    <div className="border p-4 xl:rounded-2xl rounded-2xl bg-transparent  w-full">
      <div className='flex items-center justify-between'>
        <div className="flex gap-2 items-center">
          <Users size={17} />
          <p className="text-xl font-bold">All Groups</p>
        </div>
        <Button size="sm"  className ="bg-transparent border border-green-500 text-green-500 drop-shadow-xl drop-shadow-green-600" onClick={()=>dispatch(openAddGroup())}>
            <Plus/>
            Create Group
          </Button>
      </div>
        <hr className='mt-5'/>
        {(!groups || groups.length === 0) && <div className="text-muted-foreground text-center py-8">
        You are not part of any groups yet or create a new group.
      </div>}
        {groups && loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {[...Array(1)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>}
        <Carousel setApi={setApi} className="w-full mx-auto mt-4">
        <CarouselContent>
          {groups.map((group, index) => (
            <CarouselItem
              key={index}
              className="drop-shadow-2xl drop-shadow-orange-900 md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
              onClick={() => router.push(`/dashboard/groups/${group._id}`)}
            >
              <Card className="hover:border-primary hover:shadow-md transition-all duration-200 h-full bg-transparent">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className='bg-amber-950 h-10 w-10 rounded-full border p-2.5'>
                    <Users className="h-full w-full" />
                  </div>
                    
                  <div className="space-y-1">
                    <CardTitle className="truncate">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {group.description || "No description available."}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
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

export default GroupLists
