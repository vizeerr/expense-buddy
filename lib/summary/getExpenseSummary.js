// import { getWeek } from '@/lib/utils/date'

// export function getExpenseSummary(expenses, dateCache) {
//   const { thisMonth, thisYear, thisWeek } = dateCache;

//   const pastSixMonthTotals = Array(6).fill(0);
//   let totalMonthlyExpense = 0;
//   let totalWeeklyExpense = 0;

//   const thisMonthTxns = [];

//   for (const txn of expenses) {
//     const d = new Date(txn.datetime);
//     const m = d.getMonth();
//     const y = d.getFullYear();

//     if (m === thisMonth && y === thisYear) {
//       thisMonthTxns.push(txn);
//       totalMonthlyExpense += txn.amount;
//     }

//     if (getWeek(d) === thisWeek && y === thisYear) {
//       totalWeeklyExpense += txn.amount;
//     }

//     const monthDiff = (thisYear - y) * 12 + (thisMonth - m);
//     if (monthDiff >= 0 && monthDiff < 6) {
//       pastSixMonthTotals[5 - monthDiff] += txn.amount;
//     }
//   }

//   const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1;
//   const dailyAverage = thisMonthTxns.reduce((sum, e) => sum + e.amount, 0) / daysUsed;
//   const monthlyAverage = pastSixMonthTotals.reduce((a, b) => a + b, 0) / 6;
//   const weeklyAverage = totalMonthlyExpense / 4.3;

//   return {
//     totalMonthlyExpense,
//     totalWeeklyExpense,
//     dailyAverage: Number(dailyAverage.toFixed(2)),
//     weeklyAverage: Number(weeklyAverage.toFixed(2)),
//     monthlyAverage: Number(monthlyAverage.toFixed(2))
//   };
// }
