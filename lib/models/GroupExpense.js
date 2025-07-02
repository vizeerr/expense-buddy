import mongoose from 'mongoose'

const GroupExpenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  datetime: { type: Date, required: true },
  split: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      share: { type: Number, required: true }, // absolute amount
      status: {
        type: String,
        enum: ['unpaid', 'settled'],
        default: 'unpaid',
      },
    }
  ],
  trashed: { type: Boolean, default: false },
  trashedAt: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.GroupExpense || mongoose.model('GroupExpense', GroupExpenseSchema)
