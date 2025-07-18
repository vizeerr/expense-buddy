import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['member', 'admin', 'owner'], default: 'member' },
    }
  ],

  monthlyBudget: { type: Number, default: 0 },

  // 🔗 Public join request support
  joinRequests: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
      },
      requestedAt: { type: Date, default: Date.now }
    }
  ],

}, { timestamps: true })

export default mongoose.models.Group || mongoose.model('Group', groupSchema)
