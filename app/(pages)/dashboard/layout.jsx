import React from 'react'
import AddExpenseModel from '../../../components/dashboard/AddExpenseModel'
import EditBudgetModel from '../../../components/dashboard/EditBudgetModel'
import ViewExpenseModel from '../../../components/dashboard/ViewExpenseModel'
import EditExpenseModel from '../../../components/dashboard/EditExpenseModel'
import AddGroupModal from '../../../components/dashboard/AddGroupModel'

const layout = ({children}) => {
  return (
    <div>
        {children}
        <AddExpenseModel/>
      <EditBudgetModel/>
      <ViewExpenseModel/>
      <EditExpenseModel/>
      <AddGroupModal/>
    
    </div>
  )
}

export default layout
