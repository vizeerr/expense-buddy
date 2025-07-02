"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, TrendingUp, Wallet, Shield, Smartphone } from "lucide-react"

export function HomePage({ setCurrentPage, isAuthenticated }) {
  const features = [
    {
      icon: <Wallet className="h-8 w-8 text-blue-600" />,
      title: "Track Expenses",
      description: "Easily categorize and monitor your daily expenses with our intuitive interface.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "Visual Analytics",
      description: "Get insights with beautiful charts and graphs to understand your spending patterns.",
    },
    {
      icon: <PieChart className="h-8 w-8 text-purple-600" />,
      title: "Budget Planning",
      description: "Set budgets for different categories and track your progress throughout the month.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Financial Goals",
      description: "Set and achieve your financial goals with our smart tracking system.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and secure with bank-level security.",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-indigo-600" />,
      title: "Mobile Friendly",
      description: "Access your expenses anywhere, anytime with our responsive design.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Take Control of Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Finances
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Track expenses, set budgets, and achieve your financial goals with our powerful expense management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Button size="lg" className="text-lg px-8 py-3" onClick={() => setCurrentPage("signup")}>
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                  onClick={() => setCurrentPage("login")}
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button size="lg" className="text-lg px-8 py-3" onClick={() => setCurrentPage("dashboard")}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-gray-600 dark:text-gray-300">Money Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who have taken control of their finances.
          </p>
          {!isAuthenticated && (
            <Button size="lg" className="text-lg px-8 py-3" onClick={() => setCurrentPage("signup")}>
              Start Tracking Today
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
