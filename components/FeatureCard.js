'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export function FeatureCard({ title, description, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="transition-all"
    >
      <Card className="bg-transparent border border-2 rounded-2xl shadow-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            {icon}
            <h3 className="text-xl font-semibold text-white">{title}</h3>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
