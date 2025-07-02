import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  datetime: { type: Date, required: true }, // ⬅️ One single datetime field
  trashed: { type: Boolean, default: false },
  trashedAt:{ type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)
