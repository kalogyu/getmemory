"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Star, TrendingUp } from "lucide-react"

interface RewardNotificationProps {
  show: boolean
  points: number
  message: string
  levelUp?: boolean
  newLevel?: { level: number; title: string }
  onClose: () => void
}

export function RewardNotification({
  show,
  points,
  message,
  levelUp = false,
  newLevel,
  onClose,
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // 等待退出动画完成后调用onClose
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-20 inset-x-0 flex justify-center items-center z-50 px-4 pointer-events-none"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <motion.div
            className="bg-[#1A2E22] border border-[#4CAF50]/30 rounded-xl p-4 shadow-lg max-w-xs w-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[#2D4F3C] flex items-center justify-center mr-3">
                {levelUp ? (
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Award className="w-6 h-6 text-[#4CAF50]" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#E0E7E3]">{levelUp ? "升级啦！" : "获得奖励"}</h3>
                <p className="text-xs text-[#8BAF92]">{message}</p>
                {levelUp && newLevel && (
                  <p className="text-sm text-yellow-400 font-medium mt-1">
                    达到 {newLevel.level} 级: {newLevel.title}
                  </p>
                )}
              </div>
              <div className="flex items-center bg-[#2A3C33] px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                <span className="text-sm font-medium text-[#E0E7E3]">+{points}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

