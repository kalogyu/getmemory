"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { HelpCircle, CheckCircle } from "lucide-react"
import { SwipeContainer } from "../swipe-container"

interface TabCardProps {
  front: string
  back: string
  onComplete?: () => void
  onPrevious?: () => void
  hasPrevious?: boolean
  onDragUpdate?: (x: number, y: number, scale: number, opacity: number) => void
  cardKey?: string | number
}

export function TabCard({
  front,
  back,
  onComplete,
  onPrevious,
  hasPrevious = false,
  onDragUpdate,
  cardKey,
}: TabCardProps) {
  const [activeTab, setActiveTab] = useState<"question" | "answer">("question")

  // 当cardKey变化时，重置activeTab状态
  useEffect(() => {
    setActiveTab("question")
  }, [cardKey])

  return (
    <SwipeContainer
      onSwipeComplete={() => onComplete && onComplete()}
      onSwipePrevious={() => onPrevious && onPrevious()}
      hasPrevious={hasPrevious}
      onDragUpdate={onDragUpdate}
    >
      <div className="w-full h-full bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        {/* 选项卡 */}
        <div className="flex p-4 border-b border-[#2A3C33]">
          <button
            onClick={() => setActiveTab("question")}
            className={`flex-1 flex items-center justify-center py-3 rounded-lg ${
              activeTab === "question" ? "bg-[#2A3C33] text-[#E0E7E3]" : "text-[#8BAF92]"
            }`}
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            <span>问题</span>
          </button>
          <button
            onClick={() => setActiveTab("answer")}
            className={`flex-1 flex items-center justify-center py-3 rounded-lg ml-2 ${
              activeTab === "answer" ? "bg-[#2A3C33] text-[#E0E7E3]" : "text-[#8BAF92]"
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>答案</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-8 relative">
          {activeTab === "question" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col justify-center"
            >
              <div className="text-3xl font-medium text-center text-[#E0E7E3]">{front}</div>

              {/* 滑动提示 */}
              <div className="absolute bottom-6 inset-x-0 flex justify-center">
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                  className="w-8 h-8 rounded-full bg-[#2A3C33]/40 flex items-center justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col justify-between"
            >
              <div className="text-xl text-[#E0E7E3] overflow-auto flex-1">{back}</div>

              {onComplete && (
                <div className="flex justify-end mt-6">
                  <motion.button
                    onClick={onComplete}
                    className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg text-sm font-medium"
                    whileTap={{ scale: 0.95 }}
                  >
                    下一张
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </SwipeContainer>
  )
}

