"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, BookOpen, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getDueReviews, type CardLearningRecord } from "@/lib/spaced-repetition"

interface ReviewReminderProps {
  onClose: () => void
}

export function ReviewReminder({ onClose }: ReviewReminderProps) {
  const router = useRouter()
  const [dueReviews, setDueReviews] = useState<CardLearningRecord[]>([])

  useEffect(() => {
    // 获取需要复习的卡片
    const reviews = getDueReviews()
    setDueReviews(reviews)

    // 每小时检查一次是否有新的复习
    const interval = setInterval(
      () => {
        const updatedReviews = getDueReviews()
        setDueReviews(updatedReviews)
      },
      60 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [])

  // 如果没有需要复习的卡片，不显示提醒
  if (dueReviews.length === 0) return null

  // 按卡片集分组
  const reviewsByDeck: Record<string, CardLearningRecord[]> = {}
  dueReviews.forEach((review) => {
    if (!reviewsByDeck[review.deckId]) {
      reviewsByDeck[review.deckId] = []
    }
    reviewsByDeck[review.deckId].push(review)
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 inset-x-0 flex justify-center items-center z-50 px-4 pointer-events-auto"
      >
        <motion.div
          className="bg-[#1A2E22] border border-[#4CAF50]/30 rounded-xl p-4 shadow-lg max-w-sm w-full"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#2D4F3C] flex items-center justify-center mr-3">
                <Bell className="w-5 h-5 text-[#4CAF50]" />
              </div>
              <div>
                <h3 className="font-medium text-[#E0E7E3]">复习提醒</h3>
                <p className="text-xs text-[#8BAF92]">根据艾宾浩斯遗忘曲线，现在是复习的最佳时机</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#8BAF92] hover:text-[#E0E7E3]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-auto pr-1">
            {Object.entries(reviewsByDeck).map(([deckId, reviews]) => (
              <div key={deckId} className="bg-[#0F2318] rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 text-[#4CAF50] mr-2" />
                    <h4 className="font-medium text-sm">{reviews[0].deckTitle}</h4>
                  </div>
                  <span className="text-xs text-[#8BAF92]">{reviews.length} 张卡片</span>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center text-xs text-[#8BAF92]">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>最佳复习时间: 现在</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/deck/${deckId}`)}
                    className="bg-[#4CAF50] hover:bg-[#3d9c40] text-white text-xs py-1 px-3 h-7"
                  >
                    开始复习
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

