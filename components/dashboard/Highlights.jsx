import React from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowDown } from 'lucide-react'

const Highlights = () => {
  return (
    <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  grid-cols-1 gap-7'>

        {/* <Card className="gap-1 bg-transparent ">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-neutral-200">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-2xl font-semibold text-amber-500'>Rs 24,240.00</p>
            </CardContent>
            <CardFooter>
                <p className='text-xs text-neutral-400 flex gap-1 items-center'>
                    <span className='flex gap-0.5 items-center text-green-400'>
                        <ArrowDown className='w-3 '/>
                        0%
                    </span>
                     from last month
                </p>
            </CardFooter>
        </Card> */}

        <Card className="gap-1 bg-transparent ">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-neutral-200">Monthly Budget</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-2xl font-semibold text-red-500'>Rs 24,240.00</p>
                <p className='text-xs mt-2'>Total Budget : Rs 2345688</p>
            </CardContent>
            <CardFooter>

                <p className='text-xs text-neutral-400 flex gap-1 items-center'>
                    <span className='flex gap-0.5 items-center text-green-400'>
                        <ArrowDown className='w-3 '/>
                        0%
                    </span>
                     from last month
                </p>
            </CardFooter>
        </Card>

        <Card className="gap-1 bg-transparent ">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-neutral-200">Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-2xl font-semibold'>Rs 24,240.00</p>
            </CardContent>
            <CardFooter>
                <p className='text-xs text-neutral-400 flex gap-1 items-center'>
                    <span className='flex gap-0.5 items-center text-green-400'>
                        <ArrowDown className='w-3 '/>
                        0%
                    </span>
                     from last month
                </p>
            </CardFooter>
        </Card>
         <Card className="gap-1 bg-transparent ">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-neutral-200">Highest Category</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-2xl font-semibold'>Rs 24,240.00</p>
            </CardContent>
            <CardFooter>
                <p className='text-xs text-neutral-400 flex gap-1 items-center'>
                    <span className='flex gap-0.5 items-center text-green-400'>
                        <ArrowDown className='w-3 '/>
                        0%
                    </span>
                     from last month
                </p>
            </CardFooter>
        </Card>
         <Card className="gap-1 bg-transparent ">
            <CardHeader>
                <CardTitle className="text-sm font-semibold text-neutral-200">Highest Spending</CardTitle>
            </CardHeader>
            <CardContent>
                <p className='text-2xl font-semibold'>Rs 24,240.00</p>
            </CardContent>
            <CardFooter>
                <p className='text-xs text-neutral-400 flex gap-1 items-center'>
                    <span className='flex gap-0.5 items-center text-green-400'>
                        <ArrowDown className='w-3 '/>
                        0%
                    </span>
                     from last month
                </p>
            </CardFooter>
        </Card>


      
    </div>
  )
}

export default Highlights
