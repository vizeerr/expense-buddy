// import Expense from '@/lib/models/Expense'

// export async function getBalanceSummary(userEmail, { expenses }) {
//   // Use pre-fetched expenses if available
//   if (!expenses) {
//     expenses = await Expense.find({ userEmail, trashed: { $ne: true } })
//   }

//   const credit = expenses.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0)
//   const debit = expenses.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0)

//   const balance = credit - debit

//   return {
//     credit,
//     debit,
//     balance,
//   }
// }
