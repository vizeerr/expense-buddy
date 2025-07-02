export function filterExpenses(expenses, filters) {
  const {
    email,
    category,
    title,
    type,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    _id,
  } = filters

  return expenses.filter(expense => {
    return (
      (!email || expense.userEmail.includes(email)) &&
      (!category || expense.category === category) &&
      (!title || expense.title.toLowerCase().includes(title.toLowerCase())) &&
      (!type || expense.type === type) &&
      (!minAmount || expense.amount >= minAmount) &&
      (!maxAmount || expense.amount <= maxAmount) &&
      (!startDate || new Date(expense.datetime) >= new Date(startDate)) &&
      (!endDate || new Date(expense.datetime) <= new Date(endDate)) &&
      (!_id || expense._id === _id)
    )
  })
}


  // Categories for each type
 export const debitCategories = [
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'bills', label: 'Bills' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'others', label: 'Others' },
]

export const creditCategories = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'refunds', label: 'Refunds' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'others', label: 'Others' },
]