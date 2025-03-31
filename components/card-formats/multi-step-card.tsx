"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { SwipeContainer } from "../swipe-container"

interface MultiStepCardProps {
  front: string
  back: string
  onComplete?: () => void
  onPrevious?: () => void
  hasPrevious?: boolean
  onDragUpdate?: (x: number, y: number, scale: number, opacity: number) => void
  cardKey?: string | number
}

export function MultiStepCard({
  front,
  back,
  onComplete,
  onPrevious,
  hasPrevious = false,
  onDragUpdate,
  cardKey,
}: MultiStepCardProps) {
  const [step, setStep] = useState<"question" | "thinking" | "answer">("question")

  // 当cardKey变化时，重置step状态
  useEffect(() => {
    setStep("question")
  }, [cardKey])

  // 将答案分成多个段落
  const backParagraphs = back.split("\n\n").filter((p) => p.trim() !== "")

  const nextStep = () => {
    if (step === "question") setStep("thinking")
    else if (step === "thinking") setStep("answer")
  }

  const prevStep = () => {
    if (step === "answer") setStep("thinking")
    else if (step === "thinking") setStep("question")
  }

  return (
    <SwipeContainer
      onSwipeComplete={() => onComplete && onComplete()}
      onSwipePrevious={() => onPrevious && onPrevious()}
      hasPrevious={hasPrevious}
      onDragUpdate={onDragUpdate}
    >
      <div className="w-full h-full bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        {/* 进度指示器 */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "question" ? "bg-[#4CAF50] text-white" : "bg-[#2A3C33] text-[#8BAF92]"
                }`}
              >
                1
              </div>
              <div className="w-8 h-1 bg-[#2A3C33]"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "thinking" ? "bg-[#4CAF50] text-white" : "bg-[#2A3C33] text-[#8BAF92]"
                }`}
              >
                2
              </div>
              <div className="w-8 h-1 bg-[#2A3C33]"></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === "answer" ? "bg-[#4CAF50] text-white" : "bg-[#2A3C33] text-[#8BAF92]"
                }`}
              >
                3
              </div>
            </div>
            <div className="text-sm text-[#8BAF92]">
              {step === "question" ? "问题" : step === "thinking" ? "思考" : "答案"}
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {step === "question" && (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="text-3xl font-medium text-center text-[#E0E7E3] mb-8">{front}</div>
                <div className="text-center text-[#8BAF92] text-sm">阅读问题后，点击下一步开始思考答案</div>

                {/* 滑动提示 */}
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
              </motion.div>
            )}

            {step === "thinking" && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-center items-center"
              >
                <div className="text-xl font-medium text-center text-[#E0E7E3] mb-6">尝试回忆答案</div>
                <div className="w-16 h-16 rounded-full border-4 border-[#4CAF50] border-t-transparent animate-spin mb-6"></div>
                <div className="text-center text-[#8BAF92] text-sm">思考完毕后，点击下一步查看答案</div>

                {/* 滑动提示 */}
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
              </motion.div>
            )}

            {step === "answer" && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="text-xl font-medium text-[#E0E7E3] mb-4">答案:</div>
                <div className="flex-1 overflow-auto">
                  {backParagraphs.map((paragraph, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-4 text-lg text-[#E0E7E3]"
                    >
                      {paragraph}
                    </motion.div>
                  ))}
                </div>

                {onComplete && (
                  <div className="flex justify-end mt-6">
                    <motion.button
                      onClick={onComplete}
                      className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      完成并继续
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部导航 */}
        <div className="p-4 border-t border-[#2A3C33] flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === "question"}
            className={`flex items-center px-4 py-2 rounded-lg ${
              step === "question" ? "text-[#8BAF92]/50 cursor-not-allowed" : "text-[#8BAF92] hover:bg-[#2A3C33]"
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            上一步
          </button>

          {step !== "answer" ? (
            <button onClick={nextStep} className="flex items-center px-4 py-2 rounded-lg bg-[#2A3C33] text-[#E0E7E3]">
              下一步
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <div></div> // 占位，保持布局平衡
          )}
        </div>
      </div>
    </SwipeContainer>
  )
}

