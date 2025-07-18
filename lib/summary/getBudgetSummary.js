// export function getBudgetSummary(user, expenses, dateCache) {
//   const { thisMonth, thisYear, lastMonthDate, daysInMonth } = dateCache;

//   const monthlyBudget = user?.monthlyBudget || 0;

//   const creditTxns = [];
//   const debitTxns = [];
//   const thisMonthTxns = [];
//   const lastMonthTxns = [];

//   for (const e of expenses) {
//     if (e.type === 'credit') creditTxns.push(e);
//     if (e.type === 'debit') debitTxns.push(e);

//     const d = new Date(e.datetime);
//     const m = d.getMonth();
//     const y = d.getFullYear();

//     if (m === thisMonth && y === thisYear) thisMonthTxns.push(e);
//     if (m === lastMonthDate.getMonth() && y === lastMonthDate.getFullYear()) lastMonthTxns.push(e);
//   }

//   const totalCredit = creditTxns.reduce((sum, e) => sum + e.amount, 0);
//   const totalDebit = debitTxns.reduce((sum, e) => sum + e.amount, 0);
//   const totalBalance = totalCredit - totalDebit;

//   const daysUsed = new Set(thisMonthTxns.map(e => new Date(e.datetime).toDateString())).size || 1;
//   const usedBudget = thisMonthTxns.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
//   const remainingBudget = Math.max(monthlyBudget - usedBudget, 0);
//   const dailyAverage = usedBudget / daysUsed;

//   const lastCredit = lastMonthTxns.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
//   const lastDebit = lastMonthTxns.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
//   const lastMonthBalance = lastCredit - lastDebit;

//   const categoryMap = {};
//   for (const e of thisMonthTxns) {
//     if (e.type === 'debit') {
//       categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
//     }
//   }

//   const mostExpendedCategory = Object.entries(categoryMap)
//     .sort((a, b) => b[1] - a[1])
//     .map(([name, amount]) => ({ name, amount }))[0] || null;

//   const daysLeft = Math.max(daysInMonth - daysUsed, 0);
//   const goalProgress = monthlyBudget > 0
//     ? Math.min(100, ((monthlyBudget - remainingBudget) / monthlyBudget) * 100).toFixed(1)
//     : '0.0';

//   return {
//     monthlyBudget,
//     usedBudget,
//     remainingBudget,
//     goalProgress: Number(goalProgress),
//     daysLeft,
//     mostExpendedCategory,
//     totalCredit,
//     totalDebit,
//     totalBalance,
//     lastMonthBalance,
//     dailyAverage: Number(dailyAverage.toFixed(2))
//   };
// }
