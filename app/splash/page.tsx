"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Brain } from "lucide-react"

export default function SplashScreen() {
  const router = useRouter()
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("user") !== null

    // After animation completes, redirect to appropriate page
    if (animationComplete) {
      const timer = setTimeout(() => {
        if (isLoggedIn) {
          router.push("/home")
        } else {
          router.push("/login")
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [animationComplete, router])

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={() => {
          // Trigger the next animation after the initial animation completes
          setTimeout(() => setAnimationComplete(true), 1000)
        }}
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-[#1A2E22] flex items-center justify-center mb-6"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0px 0px 0px rgba(76, 175, 80, 0)",
              "0px 0px 30px rgba(76, 175, 80, 0.5)",
              "0px 0px 0px rgba(76, 175, 80, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        >
          <Brain className="w-12 h-12 text-[#4CAF50]" />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-[#E0E7E3] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          记忆卡片
        </motion.h1>

        <motion.p
          className="text-[#8BAF92]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          提升你的记忆力
        </motion.p>
      </motion.div>
    </div>
  )
}

