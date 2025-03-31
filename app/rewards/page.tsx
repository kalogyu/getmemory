"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, Star, TrendingUp, Gift, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getUserRewards, getUserLevel, getLevelProgress, getNextLevelPoints, LEVEL_CONFIG } from "@/lib/rewards"

export default function RewardsPage() {
  const router = useRouter()
  const [rewards, setRewards] = useState<any>(null)
  const [animateProgress, setAnimateProgress] = useState(false)
  const [activeTab, setActiveTab] = useState<"history" | "levels">("history")

  useEffect(() => {
    const userRewards = getUserRewards()
    setRewards(userRewards)

    // Trigger progress animation after component mounts
    setTimeout(() => {
      setAnimateProgress(true)
    }, 300)
  }, [])

  if (!rewards) return null

  const levelProgress = getLevelProgress(rewards.points)
  const nextLevelPoints = getNextLevelPoints(rewards.points)
  const currentLevel = getUserLevel(rewards.points)
  const pointsToNextLevel = nextLevelPoints - rewards.points

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex items-center">
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
        </button>
        <h1 className="text-xl font-bold">我的奖励</h1>
      </header>

      {/* 等级卡片 */}
      <motion.div
        className="mx-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-xl p-5 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#2D4F3C] flex items-center justify-center mr-4">
              <Award className="w-7 h-7 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center">
                <h2 className="text-xl font-bold">等级 {currentLevel.level}</h2>
                <span className="ml-2 text-sm text-[#8BAF92]">{currentLevel.title}</span>
              </div>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                <span className="text-sm">{rewards.points} 积分</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#8BAF92]">
              <span>等级进度</span>
              <span>
                {rewards.points}/{nextLevelPoints}
              </span>
            </div>
            <Progress
              value={animateProgress ? levelProgress : 0}
              className="h-2 bg-[#1A2E22] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
            />
            {currentLevel.level < LEVEL_CONFIG[LEVEL_CONFIG.length - 1].level && (
              <p className="text-xs text-center text-[#8BAF92] mt-2">
                还需 {pointsToNextLevel} 积分升至 {currentLevel.level + 1} 级
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* 标签切换 */}
      <div className="px-6 mb-4">
        <div className="flex bg-[#1A2E22] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              activeTab === "history" ? "bg-[#2D4F3C] text-[#E0E7E3]" : "text-[#8BAF92]"
            }`}
          >
            奖励记录
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              activeTab === "levels" ? "bg-[#2D4F3C] text-[#E0E7E3]" : "text-[#8BAF92]"
            }`}
          >
            等级特权
          </button>
        </div>
      </div>

      {/* 奖励记录 */}
      {activeTab === "history" && (
        <div className="px-6 pb-24">
          <div className="space-y-3">
            {rewards.rewardHistory && rewards.rewardHistory.length > 0 ? (
              rewards.rewardHistory.map((record: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                  className="bg-[#1A2E22] rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mr-3">
                      <Gift className="w-5 h-5 text-[#4CAF50]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{record.action}</h3>
                          <p className="text-xs text-[#8BAF92] flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(record.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center bg-[#2A3C33] px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                          <span className="text-sm font-medium">+{record.points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-[#8BAF92]">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无奖励记录</p>
                <p className="text-sm mt-2">完成学习任务获取奖励</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 等级特权 */}
      {activeTab === "levels" && (
        <div className="px-6 pb-24">
          <div className="space-y-4">
            {LEVEL_CONFIG.map((level, index) => {
              const isCurrentLevel = level.level === currentLevel.level
              const isUnlocked = level.level <= currentLevel.level
              const isNextLevel = level.level === currentLevel.level + 1

              return (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                  className={`bg-[#1A2E22] rounded-xl p-4 shadow-md ${isCurrentLevel ? "border border-[#4CAF50]" : ""}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full ${isUnlocked ? "bg-[#2D4F3C]" : "bg-[#2A3C33]"} flex items-center justify-center mr-3`}
                    >
                      <TrendingUp className={`w-6 h-6 ${isUnlocked ? "text-yellow-400" : "text-[#8BAF92]"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center">
                            等级 {level.level}: {level.title}
                            {isCurrentLevel && (
                              <span className="ml-2 text-xs bg-[#4CAF50] text-black px-2 py-0.5 rounded-full">
                                当前
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-[#8BAF92] mt-1">需要 {level.requiredPoints} 积分</p>
                        </div>
                        {isUnlocked ? (
                          <div className="bg-[#2D4F3C] rounded-full p-1">
                            <Star className="w-4 h-4 text-yellow-400" fill="#FBBF24" />
                          </div>
                        ) : (
                          <div className="bg-[#2A3C33] rounded-full p-1">
                            <Star className="w-4 h-4 text-[#8BAF92]" />
                          </div>
                        )}
                      </div>

                      {/* 等级特权 */}
                      <div className="mt-3 space-y-2">
                        {level.level >= 2 && (
                          <div className={`text-sm ${isUnlocked ? "text-[#E0E7E3]" : "text-[#8BAF92]"}`}>
                            • 解锁自定义卡片背景
                          </div>
                        )}
                        {level.level >= 3 && (
                          <div className={`text-sm ${isUnlocked ? "text-[#E0E7E3]" : "text-[#8BAF92]"}`}>
                            • 解锁高级统计分析
                          </div>
                        )}
                        {level.level >= 4 && (
                          <div className={`text-sm ${isUnlocked ? "text-[#E0E7E3]" : "text-[#8BAF92]"}`}>
                            • 解锁社区特殊徽章
                          </div>
                        )}
                        {level.level >= 5 && (
                          <div className={`text-sm ${isUnlocked ? "text-[#E0E7E3]" : "text-[#8BAF92]"}`}>
                            • 解锁高级卡片模板
                          </div>
                        )}
                        {level.level >= 7 && (
                          <div className={`text-sm ${isUnlocked ? "text-[#E0E7E3]" : "text-[#8BAF92]"}`}>
                            • 解锁AI学习助手
                          </div>
                        )}
                        {level.level >= 10 && (
                          <div className={`text-sm ${isUnlocked ? "text-[#E0E7E3]" : "text-[#8BAF92]"}`}>
                            • 解锁终极记忆模式
                          </div>
                        )}
                      </div>

                      {isNextLevel && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-[#8BAF92] mb-1">
                            <span>距离解锁</span>
                            <span>
                              {rewards.points}/{level.requiredPoints}
                            </span>
                          </div>
                          <Progress
                            value={animateProgress ? (rewards.points / level.requiredPoints) * 100 : 0}
                            className="h-1.5 bg-[#1E2A23] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

