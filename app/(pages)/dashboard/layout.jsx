import React from 'react'
import AddExpenseModel from '../../../components/dashboard/AddExpenseModel'
import EditBudgetModel from '../../../components/dashboard/EditBudgetModel'
import ViewExpenseModel from '../../../components/dashboard/ViewExpenseModel'
import EditExpenseModel from '../../../components/dashboard/EditExpenseModel'
import AddGroupModal from '../../../components/group/AddGroupModel'
import AddGroupExpenseModal from '../../../components/group/AddGroupExpenseModel'
import ViewGroupExpenseModel from '../../../components/group/ViewGroupExpenseModel'
import EditGroupExpenseModal from '../../../components/group/EditGroupExpenseModel'

const layout = ({children}) => {
  return (
    <div>
        {children}
        <AddExpenseModel/>
        <EditBudgetModel/>
        <ViewExpenseModel/>
        <EditExpenseModel/>

        <AddGroupModal/>
        <AddGroupExpenseModal/>
        <ViewGroupExpenseModel/>
        <EditGroupExpenseModal/>
    </div>
  )
}

export default layout
