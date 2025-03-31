"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { SwipeContainer } from "../swipe-container"

interface ExpandableCardProps {
  front: string
  back: string
  onComplete?: () => void
  onPrevious?: () => void
  hasPrevious?: boolean
  onDragUpdate?: (x: number, y: number, scale: number, opacity: number) => void
  cardKey?: string | number
}

export function ExpandableCard({
  front,
  back,
  onComplete,
  onPrevious,
  hasPrevious = false,
  onDragUpdate,
  cardKey,
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 当cardKey变化时，重置isExpanded状态
  useEffect(() => {
    setIsExpanded(false)
  }, [cardKey])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <SwipeContainer
      onSwipeComplete={() => onComplete && onComplete()}
      onSwipePrevious={() => onPrevious && onPrevious()}
      hasPrevious={hasPrevious}
      onDragUpdate={onDragUpdate}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
        animate={{
          height: isExpanded ? "auto" : "60%",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* 问题部分 */}
        <div className="p-8 flex-shrink-0">
          <div className="text-3xl font-medium text-center text-[#E0E7E3] mb-4">{front}</div>

          <div className="flex justify-center mt-4">
            <motion.button
              onClick={toggleExpand}
              className="flex items-center justify-center bg-[#2A3C33] px-4 py-2 rounded-lg"
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2 text-[#8BAF92]">{isExpanded ? "隐藏答案" : "显示答案"}</span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-[#8BAF92]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#8BAF92]" />
              )}
            </motion.button>
          </div>

          {/* 滑动提示 */}
          {!isExpanded && (
            <div className="flex justify-center mt-6">
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
          )}
        </div>

        {/* 分隔线 */}
        {isExpanded && <div className="w-full h-px bg-[#2A3C33] mx-auto" />}

        {/* 答案部分 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 bg-gradient-to-br from-[#2D4F3C] to-[#1A2E22] flex-1 overflow-auto"
            >
              <div className="text-xl text-[#E0E7E3]">{back}</div>

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
        </AnimatePresence>
      </motion.div>
    </SwipeContainer>
  )
}

