import React from 'react'
// import Highlights from '@/components/dashboard/Highlights'
import ExpensesShortcuts from '@/components/dashboard/ExpensesShortcuts'
import BalanceCard from '../../../components/dashboard/BalanceCard'
import Greeting from '../../../components/dashboard/Greetings'
import GroupLists from '../../../components/dashboard/GroupLists'

const page = () => {
  return (
    <div className='xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto  space-y-5 pt-16 pb-20'>
      <Greeting/>
      <BalanceCard/>
      {/* <Highlights/> */}
      <GroupLists/>
      <ExpensesShortcuts/>
      
    </div>
  )
}

export default page
