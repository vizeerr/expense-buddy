'use client'

import React, { useEffect } from 'react'
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
import { Users } from 'lucide-react'

import { useDispatch, useSelector } from 'react-redux'
import { fetchGroups } from '@/store/slices/group/groupSlice'
import { useRouter } from 'next/navigation'

const GroupLists = () => {
  const dispatch = useDispatch()
    const router = useRouter()
  const { list: groups, loading } = useSelector((state) => state.groups)

  useEffect(() => {
    dispatch(fetchGroups())
  }, [dispatch])

 
 
  return (
    <div className="border p-6 xl:rounded-2xl rounded-2xl bg-transparent drop-shadow-2xl drop-shadow-orange-900 w-full">
        <div className="flex gap-2 items-center">
          <Users className="w-5" />
          <p className="text-xl font-bold">All Groups</p>
        </div>
        <hr className='mt-5'/>
        {loading && (!groups || groups.length === 0) && <div className="text-muted-foreground text-center py-8">
        You are not part of any groups yet.
      </div>}
        {loading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>}
        <Carousel className="mt-5 sm:w-[90%] w-[80%] mx-auto">
        <CarouselContent>
          {groups.map((group, index) => (
            <CarouselItem
              key={index}
              className=" md:basis-1/2 lg:basis-1/3 2xl:basis-1/4"
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
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

export default GroupLists
