import React from 'react'
// import Highlights from '@/components/dashboard/Highlights'
import ExpensesShortcuts from '@/components/dashboard/ExpensesShortcuts'
import BalanceCard from '../../../components/dashboard/BalanceCard'

const page = () => {
  return (
    <div className='xl:w-[80vw] md:w-[90vw] w-[95vw] mx-auto md:space-y-8 space-y-7 pt-20 pb-16'>
      <BalanceCard/>
      {/* <Highlights/> */}
      <ExpensesShortcuts/>
      
      {/* <DeleteExpenseModel/> */}
    </div>
  )
}

export default page
