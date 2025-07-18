import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  monthlyBudget: { type: Number, default: 0 },
  verifyOtp: String,
  verifyOtpExpiry: Date,
  forgetOtp: String,
  forgetOtpExpiry: Date,
  passwordResetVerified: Boolean,
  passwordResetVerifiedAt: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },

}, { timestamps: true })


export default mongoose.models.User || mongoose.model('User', UserSchema)
