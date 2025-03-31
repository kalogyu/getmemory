"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SwipeContainer } from "../swipe-container"

interface SlideRevealCardProps {
  front: string
  back: string
  onComplete?: () => void
  onPrevious?: () => void
  hasPrevious?: boolean
  onDragUpdate?: (x: number, y: number, scale: number, opacity: number) => void
  // 添加一个key属性，用于在卡片切换时重置状态
  cardKey?: string | number
}

export function SlideRevealCard({
  front,
  back,
  onComplete,
  onPrevious,
  hasPrevious = false,
  onDragUpdate,
  cardKey,
}: SlideRevealCardProps) {
  const [isRevealed, setIsRevealed] = useState(false)

  // 当cardKey变化时，重置isRevealed状态
  useEffect(() => {
    setIsRevealed(false)
  }, [cardKey])

  const toggleReveal = () => {
    setIsRevealed(!isRevealed)
  }

  return (
    <SwipeContainer
      onSwipeComplete={() => onComplete && onComplete()}
      onSwipePrevious={() => onPrevious && onPrevious()}
      hasPrevious={hasPrevious}
      onDragUpdate={onDragUpdate}
    >
      <div className="relative w-full h-full rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] overflow-hidden">
        {/* 问题部分 - 点击切换到答案 */}
        <div
          className={`w-full h-full p-6 flex flex-col justify-center items-center ${!isRevealed ? "cursor-pointer" : "hidden"}`}
          onClick={toggleReveal}
        >
          <div className="text-2xl font-medium text-center text-[#E0E7E3] mb-6">{front}</div>

          <div className="text-xs text-[#8BAF92] mt-4">点击查看答案</div>

          {/* 滑动提示 */}
          <div className="absolute bottom-6 inset-x-0 flex justify-center">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              className="w-7 h-7 rounded-full bg-[#2A3C33]/40 flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 5L12 19M12 5L6 11M12 5L18 11"
                  stroke="#8BAF92"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* 答案部分 - 点击切换回问题 */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-0 bg-gradient-to-br from-[#2D4F3C] to-[#1A2E22] rounded-3xl p-6 flex flex-col justify-between cursor-pointer"
              onClick={toggleReveal}
            >
              <div className="flex-1 overflow-auto text-[#E0E7E3] text-base">
                <div className="text-center">{back}</div>
              </div>

              <div className="text-xs text-[#8BAF92] text-center mt-4">点击返回问题</div>

              {onComplete && (
                <div className="absolute bottom-6 right-6">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation() // 防止触发卡片点击事件
                      onComplete()
                    }}
                    className="bg-[#4CAF50] text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                    whileTap={{ scale: 0.95 }}
                  >
                    下一张
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SwipeContainer>
  )
}

