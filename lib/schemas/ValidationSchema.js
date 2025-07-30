import { z } from "zod"

export const expenseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(25, "Max 25 characters"),

  description: z.string().max(200, "Max 200 characters").optional(),

  amount: z
    .string({ required_error: 'Amount is required' })
     .refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num <= 9999999.99
  }, {
    message: 'Amount must be a valid between 0 and 9999999.99',
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required'),

  type: z
    .string({ required_error: 'Type is required' })
    .min(1, 'Type is required') // 🚫 catches empty string
    .refine((val) => ['credit', 'debit'].includes(val), {
      message: 'Invalid type',
    }),

  paymentMethod: z
    .string({ required_error: 'Payment method is required' })
    .min(1, 'Payment method  is required') // 🚫 catches empty string
    .refine((val) => ['upi', 'cash', 'card', 'netbanking', 'other'].includes(val), {
      message: 'Invalid payment method',
    }),

   date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z
    .string({ required_error: 'Time is required' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Invalid time format (HH:mm)',
    }),
})


export const expenseSchemaAPI = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(25, "Max 25 characters"),

  description: z.string().max(200, "Max 200 characters").optional(),

  amount: z
    .string({ required_error: 'Amount is required' })
     .refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num <= 9999999.99
  }, {
    message: 'Amount must be a valid between 0 and 9999999.99',
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required'),

  type: z
    .string({ required_error: 'Type is required' })
    .min(1, 'Type is required') // 🚫 catches empty string
    .refine((val) => ['credit', 'debit'].includes(val), {
      message: 'Invalid type',
    }),

  paymentMethod: z
    .string({ required_error: 'Payment method is required' })
    .min(1, 'Payment method  is required') // 🚫 catches empty string
    .refine((val) => ['upi', 'cash', 'card', 'netbanking', 'other'].includes(val), {
      message: 'Invalid payment method',
    }),

  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z
    .string({ required_error: 'Time is required' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Invalid time format (HH:mm)',
    }),
})

export const groupExpenseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(25, "Max 25 characters"),

  description: z.string().max(200, "Max 200 characters").optional(),

  amount: z
    .string({ required_error: 'Amount is required' })
     .refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num <= 9999999.99
  }, {
    message: 'Amount must be a valid between 0 and 9999999.99',
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required'),

  type: z
    .string({ required_error: 'Type is required' })
    .min(1, 'Type is required') // 🚫 catches empty string
    .refine((val) => ['credit', 'debit'].includes(val), {
      message: 'Invalid type',
    }),

  paymentMethod: z
    .string({ required_error: 'Payment method is required' })
    .min(1, 'Payment method  is required') // 🚫 catches empty string
    .refine((val) => ['upi', 'cash', 'card', 'netbanking', 'other'].includes(val), {
      message: 'Invalid payment method',
    }),

   date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z
    .string({ required_error: 'Time is required' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Invalid time format (HH:mm)',
    }),
  paidBy: z.string().min(1, 'PaidBy is required'),
  groupId: z.string().min(1, 'PaidBy is required'),
})