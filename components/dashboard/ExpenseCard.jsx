'use client'

import { useSelector,useDispatch } from "react-redux";
import {
  Card,
  
  CardContent,
  
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect } from "react";
import { fetchBalanceSummary } from '@/store/slices/dashboard/balanceSlice'
import { fetchExpensesSummary } from '@/store/slices/dashboard/expensesSummarySlice'

const ExpenseCard = () => {

  const { summary, loading: balanceLoading } = useSelector(state => state.balance)
  const dispatch = useDispatch()
    useEffect(() => {
      dispatch(fetchBalanceSummary())
      dispatch(fetchExpensesSummary())
    }, [dispatch])
  

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
      <Card className="gap-1 bg-neutral-900 ">
                  <CardHeader>
                      <CardTitle className="text-base font-semibold text-neutral-200">Credit Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-xs text-neutral-400 space-y-2">
                      <div className="space-y-1">
                        <div className="flex  text-sm justify-between">
                          <span>Overall Today Total</span>
                        </div>
                        <p className='text-2xl font-semibold text-green-400'>₹ {summary?.todayCredit?.toLocaleString?.() || '0'}</p>
                      </div>
                        
                        <div className="flex  text-sm justify-between">
                          <span>This Week</span>
                          <span className="text-green-400 font-medium">₹ {summary?.weeklyCredit?.toLocaleString?.() || '0'}</span>
                        </div>
                        <div className="flex text-sm  justify-between">
                          <span>This Month</span>
                          <span className="text-green-400 font-medium">₹ {summary?.monthlyCredit?.toLocaleString?.() || '0'}</span>
                        </div>
                        <div className="flex  text-sm justify-between">
                          <span>Last Month</span>
                          <span className="text-green-400 font-medium">₹ {summary?.lastMonthCredit?.toLocaleString?.() || '0'}</span>
                        </div>
                        <div className="flex  text-sm justify-between">
                          <span>Overall Total</span>
                          <span className="text-green-400 font-medium">₹ {summary?.totalCredit?.toLocaleString?.() || '0'}</span>
                        </div>
                      </div>
                  </CardContent>
                  
              </Card>

         <Card className="gap-1 bg-neutral-900 ">
                  <CardHeader>
                      <CardTitle className="text-base font-semibold text-neutral-200">Debit Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-xs text-neutral-400 space-y-2">
                      <div className="space-y-1">
                        <div className="flex  text-sm justify-between">
                          <span>Overall Today Total</span>
                        </div>
                        <p className='text-2xl font-semibold text-red-500'>₹ {summary?.todayDebit?.toLocaleString?.() || '0'}</p>
                      </div>
                        
                        <div className="flex  text-sm justify-between">
                          <span>This Week</span>
                          <span className="text-red-500 font-medium">₹ {summary?.weeklyDebit?.toLocaleString?.() || '0'}</span>
                        </div>
                        <div className="flex text-sm  justify-between">
                          <span>This Month</span>
                          <span className="text-red-500 font-medium">₹ {summary?.monthlyDebit?.toLocaleString?.() || '0'}</span>
                        </div>
                        <div className="flex  text-sm justify-between">
                          <span>Last Month</span>
                          <span className="text-red-500 font-medium">₹ {summary?.lastMonthDebit?.toLocaleString?.() || '0'}</span>
                        </div>
                        <div className="flex  text-sm justify-between">
                          <span>Overall Total</span>
                          <span className="text-red-500 font-medium">₹ {summary?.totalDebit?.toLocaleString?.() || '0'}</span>
                        </div>
                      </div>
                  </CardContent>
                  
              </Card>
    
        
    </div>
  )
}

export default ExpenseCard
