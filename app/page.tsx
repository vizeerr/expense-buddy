'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Wallet } from 'lucide-react'
import { FeatureCard } from '@/components/FeatureCard'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16 md:px-20">
      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold"
        >
          Welcome to <span className="text-amber-400 drop-shadow-2xl drop-shadow-accent">Expense Buddy</span>
          <br />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
          Manage <span className="text-white">personal</span> and{' '}
          <span className="text-white">group</span> expenses effortlessly. Track, split, and stay on budget.<br/>
          <span className='font-medium'>Invented by Weinvent ❣️</span>
        </motion.p>

        <motion.div
          className="flex justify-center gap-4 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-black"
            onClick={() => router.push('/login')}
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-black"
            onClick={() => router.push('/login')}
          >
            Login or Signup
          </Button>
          

        </motion.div>
      </section>

      {/* Features */}
      <section className="drop-shadow-2xl drop-shadow-accent-foreground max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        <FeatureCard
          title="Personal Expense Tracking"
          description="Track daily spending, set smart budgets, and visualize trends with ease."
          icon={<Wallet className="h-10 w-10 text-green-400" />}
        />
        <FeatureCard
          title="Group Expense Splitting"
          description="Split bills with friends or roommates, settle balances, and keep things fair."
          icon={<Users className="h-10 w-10 text-blue-400" />}
        />
      </section>
    </main>
  )
}
