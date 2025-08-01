

// lib/models/Expense.js
import mongoose from 'mongoose'
const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // new
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  paymentMethod: {
    type: String,
    enum: ['upi', 'cash', 'card', 'netbanking', 'other'],
    required: true,
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // new
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // new
  splitBetween: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  datetime: { type: Date, required: true },
  trashed: { type: Boolean, default: false },
  trashedAt: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.GroupExpense || mongoose.model('GroupExpense', expenseSchema)


