"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp } from "lucide-react"
import { SwipeContainer } from "../swipe-container"

interface ScrollableCardProps {
  front: string
  back: string
  onComplete?: () => void
  onPrevious?: () => void
  hasPrevious?: boolean
  onDragUpdate?: (x: number, y: number, scale: number, opacity: number) => void
  cardKey?: string | number
}

export function ScrollableCard({
  front,
  back,
  onComplete,
  onPrevious,
  hasPrevious = false,
  onDragUpdate,
  cardKey,
}: ScrollableCardProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)

  // 当cardKey变化时，重置showAnswer状态
  useEffect(() => {
    setShowAnswer(false)
  }, [cardKey])

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)

    // 如果显示答案，滚动到答案部分
    if (!showAnswer && answerRef.current) {
      setTimeout(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  return (
    <SwipeContainer
      onSwipeComplete={() => onComplete && onComplete()}
      onSwipePrevious={() => onPrevious && onPrevious()}
      hasPrevious={hasPrevious}
      onDragUpdate={onDragUpdate}
    >
      <div className="w-full h-full bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-6">
          {/* 问题部分 */}
          <div className="mb-6">
            <h3 className="text-[#8BAF92] text-sm font-medium mb-2">问题</h3>
            <div className="text-2xl font-medium text-[#E0E7E3] p-4 bg-[#1A2E22] rounded-xl">{front}</div>
          </div>

          {/* 显示/隐藏答案按钮 */}
          <div className="flex justify-center my-4">
            <motion.button
              onClick={toggleAnswer}
              className="flex items-center justify-center bg-[#2A3C33] px-4 py-2 rounded-lg"
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2 text-[#8BAF92]">{showAnswer ? "隐藏答案" : "显示答案"}</span>
              {showAnswer ? (
                <ArrowUp className="w-5 h-5 text-[#8BAF92]" />
              ) : (
                <ArrowDown className="w-5 h-5 text-[#8BAF92]" />
              )}
            </motion.button>
          </div>

          {/* 滑动提示 */}
          {!showAnswer && (
            <div className="flex justify-center mt-4">
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

          {/* 答案部分 */}
          {showAnswer && (
            <motion.div ref={answerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <h3 className="text-[#8BAF92] text-sm font-medium mb-2">答案</h3>
              <div className="text-lg text-[#E0E7E3] p-6 bg-[#2D4F3C] rounded-xl whitespace-pre-wrap">{back}</div>

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

