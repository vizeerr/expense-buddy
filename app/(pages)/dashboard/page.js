import React from 'react'
// import Highlights from '@/components/dashboard/Highlights'
import ExpensesShortcuts from '@/components/dashboard/ExpensesShortcuts'
import BalanceCard from '../../../components/dashboard/BalanceCard'
import Greeting from '../../../components/dashboard/Greetings'
import GroupLists from '../../../components/dashboard/GroupLists'

const page = () => {
  return (
    <div className='xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto md:space-y-5 space-y-7 pt-20 pb-16'>
      <Greeting/>
      <BalanceCard/>
      {/* <Highlights/> */}
      <GroupLists/>
      <ExpensesShortcuts/>
      
    </div>
  )
}

export default page
