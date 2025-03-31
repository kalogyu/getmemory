"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import {
  getLearningRecords,
  type CardLearningRecord,
  getReviewProgress,
  getNextReviewText,
  isCardDueForReview,
} from "@/lib/spaced-repetition"

export default function ReviewPlanPage() {
  const router = useRouter()
  const [learningRecords, setLearningRecords] = useState<CardLearningRecord[]>([])
  const [animateProgress, setAnimateProgress] = useState(false)

  useEffect(() => {
    // 获取所有学习记录
    const records = getLearningRecords()
    setLearningRecords(records)

    // 触发进度条动画
    setTimeout(() => {
      setAnimateProgress(true)
    }, 300)
  }, [])

  // 按卡片集分组
  const recordsByDeck: Record<string, CardLearningRecord[]> = {}
  learningRecords.forEach((record) => {
    if (!recordsByDeck[record.deckId]) {
      recordsByDeck[record.deckId] = []
    }
    recordsByDeck[record.deckId].push(record)
  })

  // 计算每个卡片集的复习进度
  const deckProgress: Record<string, { total: number; completed: number; due: number }> = {}
  Object.entries(recordsByDeck).forEach(([deckId, records]) => {
    deckProgress[deckId] = {
      total: records.length,
      completed: records.filter((r) => r.status === "completed").length,
      due: records.filter((r) => isCardDueForReview(r) && r.status !== "completed").length,
    }
  })

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex items-center">
        <button
          onClick={() => router.push("/home")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
        </button>
        <h1 className="text-xl font-bold">复习计划</h1>
      </header>

      {/* 主内容区 */}
      <main className="px-6 pb-24">
        {Object.keys(recordsByDeck).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(recordsByDeck).map(([deckId, records], index) => (
              <motion.div
                key={deckId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-xl p-5 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-medium">{records[0].deckTitle}</h2>
                    <p className="text-xs text-[#8BAF92] mt-1">
                      {records.length} 张卡片 • {deckProgress[deckId].completed} 张已完成
                    </p>
                  </div>

                  {deckProgress[deckId].due > 0 && (
                    <div className="bg-[#2D4F3C] px-2 py-1 rounded-lg flex items-center">
                      <AlertCircle className="w-4 h-4 text-[#4CAF50] mr-1" />
                      <span className="text-xs">{deckProgress[deckId].due} 张待复习</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-[#8BAF92]">
                    <span>总体进度</span>
                    <span>
                      {deckProgress[deckId].completed}/{records.length}
                    </span>
                  </div>
                  <Progress
                    value={animateProgress ? (deckProgress[deckId].completed / records.length) * 100 : 0}
                    className="h-2 bg-[#1A2E22] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
                  />
                </div>

                <div className="space-y-3 mt-4">
                  {records
                    .filter((record) => record.status !== "completed" || index === 0)
                    .slice(0, 3)
                    .map((record) => (
                      <div key={record.cardId} className="bg-[#1A2E22] rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {record.status === "completed" ? (
                              <CheckCircle className="w-4 h-4 text-[#4CAF50] mr-2" />
                            ) : isCardDueForReview(record) ? (
                              <AlertCircle className="w-4 h-4 text-[#E05252] mr-2" />
                            ) : (
                              <Clock className="w-4 h-4 text-[#8BAF92] mr-2" />
                            )}
                            <span className="text-sm">
                              卡片 #{typeof record.cardId === "number" ? record.cardId : record.cardId.slice(0, 4)}
                            </span>
                          </div>
                          <div className="text-xs text-[#8BAF92]">
                            {record.status === "completed" ? (
                              <span className="text-[#4CAF50]">已完成</span>
                            ) : isCardDueForReview(record) ? (
                              <span className="text-[#E05252]">待复习</span>
                            ) : (
                              <span>下次复习: {getNextReviewText(record)}</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <Progress
                            value={animateProgress ? getReviewProgress(record) : 0}
                            className="h-1.5 bg-[#0F2318] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
                          />
                        </div>
                      </div>
                    ))}

                  {records.length > 3 && (
                    <div className="text-center text-xs text-[#8BAF92] mt-2">+{records.length - 3} 张卡片</div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => router.push(`/deck/${deckId}`)}
                    className={`${deckProgress[deckId].due > 0 ? "bg-[#4CAF50]" : "bg-[#2A3C33]"} hover:bg-[#3d9c40] text-white text-sm`}
                  >
                    {deckProgress[deckId].due > 0 ? "开始复习" : "查看卡片"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-[#2A3C33] mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无复习计划</h3>
            <p className="text-sm text-[#8BAF92] max-w-xs">
              开始学习卡片后，系统会根据艾宾浩斯遗忘曲线为您安排最佳复习时间
            </p>
            <Button onClick={() => router.push("/explore")} className="mt-6 bg-[#4CAF50] hover:bg-[#3d9c40]">
              浏览卡片集
            </Button>
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}

