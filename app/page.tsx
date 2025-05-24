import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Droplets, Gauge, Smartphone, Wifi } from "lucide-react"
import { SmartDryLogo } from "@/components/logo"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-950">
      <header className="border-b dark:border-gray-800">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <SmartDryLogo className="h-6 w-6" color="#3b82f6" />
            <span className="text-xl font-bold dark:text-white">SmartDry</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              href="#features"
              className="text-sm font-medium dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              How It Works
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 dark:bg-gray-950 dark:text-white">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl dark:text-white">
                  Smart Clothes Dryer System
                </h1>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  An AI-based integrated system with Internet of Things and cloud computing capabilities for modern
                  households.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button className="w-full min-[400px]:w-auto">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button
                      variant="outline"
                      className="w-full min-[400px]:w-auto dark:border-gray-700 dark:text-gray-300"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/smart-dryer-hero.png"
                  alt="Smart Clothes Dryer"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover dark:border dark:border-gray-800"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl dark:text-white">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our smart dryer system combines IoT, AI, and cloud computing to revolutionize your laundry experience.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Real-time Monitoring</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Track humidity, temperature, moisture, and weight in real-time through our mobile app.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Gauge className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">AI Predictions</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Smart drying cycle recommendations based on machine learning models.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Remote Control</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Control your dryer from anywhere using our intuitive mobile application.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                  <Wifi className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold dark:text-white">Offline Functionality</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Works even in low-connectivity environments with local processing capabilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl dark:text-white">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our system uses advanced technology to make clothes drying efficient and convenient.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 mt-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold dark:text-white">1. Sensor Data Collection</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  IoT sensors continuously monitor humidity, temperature, moisture levels, and weight of your clothes.
                </p>
                <h3 className="text-2xl font-bold dark:text-white">2. AI Processing</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our machine learning models analyze the data to predict optimal drying cycles and energy usage.
                </p>
                <h3 className="text-2xl font-bold dark:text-white">3. User Control</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Control and monitor the drying process through our mobile app, with real-time notifications.
                </p>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/how-it-works.png"
                  alt="How It Works"
                  width={400}
                  height={400}
                  className="rounded-lg object-cover dark:border dark:border-gray-800"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8 dark:border-gray-800 dark:bg-gray-950">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center">
          <div className="flex items-center gap-2">
            <SmartDryLogo className="h-6 w-6" color="#3b82f6" />
            <span className="text-xl font-bold dark:text-white">SmartDry</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Smart Clothes Dryer Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
