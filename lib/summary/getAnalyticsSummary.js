// import Expense from '@/lib/models/Expense'

// export async function getAnalyticsSummary(userEmail, { expenses }) {
//   if (!expenses) {
//     expenses = await Expense.find({ userEmail, trashed: { $ne: true } })
//   }

//   const categoryStats = {}
//   for (const e of expenses) {
//     if (e.type === 'debit') {
//       categoryStats[e.category] = (categoryStats[e.category] || 0) + e.amount
//     }
//   }

//   const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])
//   const topCategories = sortedCategories.slice(0, 5).map(([name, amount]) => ({ name, amount }))

//   const total = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0)
//   const categoryPercentages = sortedCategories.map(([name, amount]) => ({
//     name,
//     percentage: ((amount / total) * 100).toFixed(2)
//   }))

//   return {
//     topCategories,
//     categoryPercentages
//   }
// }
