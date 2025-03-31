"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, Calendar, BookOpen, Star, Trophy, Target, Zap, Shield } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getCurrentUser } from "@/lib/auth"
import { getUserRewards, getUserLevel, getLevelProgress } from "@/lib/rewards"
import { BottomNav } from "@/components/bottom-nav"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [animateProgress, setAnimateProgress] = useState(false)

  // Mock user stats
  const stats = {
    totalCards: 153,
    completedCards: 87,
    streak: 12,
    sets: 4,
    joinDate: "2024年3月15日",
  }

  // Mock achievements
  const achievements = [
    {
      id: 1,
      name: "学习先锋",
      description: "完成第一组卡片",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      unlocked: true,
      date: "2024年3月16日",
    },
    {
      id: 2,
      name: "坚持不懈",
      description: "连续学习7天",
      icon: <Calendar className="w-5 h-5 text-yellow-400" />,
      unlocked: true,
      date: "2024年3月22日",
    },
    {
      id: 3,
      name: "知识渊博",
      description: "完成50张卡片",
      icon: <BookOpen className="w-5 h-5 text-yellow-400" />,
      unlocked: true,
      date: "2024年3月25日",
    },
    {
      id: 4,
      name: "精通大师",
      description: "完成100张卡片",
      icon: <Trophy className="w-5 h-5 text-[#8BAF92]" />,
      unlocked: false,
      progress: 87,
    },
    {
      id: 5,
      name: "完美记忆",
      description: "连续答对20张卡片",
      icon: <Target className="w-5 h-5 text-[#8BAF92]" />,
      unlocked: false,
      progress: 14,
    },
    {
      id: 6,
      name: "学习守护者",
      description: "连续学习30天",
      icon: <Shield className="w-5 h-5 text-[#8BAF92]" />,
      unlocked: false,
      progress: 12,
    },
  ]

  useEffect(() => {
    // Check if user is logged in
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)

    // Trigger progress animation after component mounts
    setTimeout(() => {
      setAnimateProgress(true)
    }, 300)
  }, [router])

  const rewards = getUserRewards()
  const userLevel = rewards ? getUserLevel(rewards.points) : { level: 1, title: "初学者" }
  const levelProgress = rewards ? getLevelProgress(rewards.points) : 0

  // If user is not loaded yet, show nothing
  if (!user) return null

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
        <h1 className="text-xl font-bold">个人资料</h1>
      </header>

      {/* 用户信息卡片 */}
      <motion.div
        className="mx-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-3xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[#2A3C33] flex items-center justify-center text-3xl font-bold text-[#4CAF50] border-4 border-[#4CAF50]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="flex items-center mt-1">
                <span className="text-xs bg-[#2D4F3C] text-yellow-400 px-2 py-0.5 rounded-full mr-2">
                  Lv.{userLevel.level}
                </span>
                <span className="text-sm text-[#8BAF92]">加入于 {stats.joinDate}</span>
              </div>
              {rewards && (
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                  <span className="text-sm">{rewards.points} 积分</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1A2E22] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalCards}</p>
              <p className="text-xs text-[#8BAF92] mt-1">总卡片</p>
            </div>
            <div className="bg-[#1A2E22] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.sets}</p>
              <p className="text-xs text-[#8BAF92] mt-1">卡片集</p>
            </div>
            <div className="bg-[#1A2E22] rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-xs text-[#8BAF92] mt-1">连续天数</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">学习进度</span>
                <span className="text-xs text-[#8BAF92]">
                  {stats.completedCards}/{stats.totalCards}
                </span>
              </div>
              <Progress
                value={animateProgress ? (stats.completedCards / stats.totalCards) * 100 : 0}
                className="h-2 bg-[#1A2E22] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 奖励卡片 */}
      <motion.div
        className="mx-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        onClick={() => router.push("/rewards")}
      >
        <div className="bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#2D4F3C] flex items-center justify-center mr-3">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">等级 {userLevel.level}</h3>
                  <p className="text-xs text-[#8BAF92]">{userLevel.title}</p>
                </div>
                <div className="flex items-center bg-[#2A3C33] px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                  <span className="text-sm">{rewards?.points || 0}</span>
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={animateProgress ? levelProgress : 0}
                  className="h-1.5 bg-[#1A2E22] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 成就部分 */}
      <section className="px-6 mb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">成就</h2>
          <div className="flex items-center text-[#8BAF92] text-sm">
            <Trophy className="w-4 h-4 mr-1" />
            <span>
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
              className={`bg-[#1A2E22] rounded-xl p-4 ${achievement.unlocked ? "border border-[#4CAF50]/30" : ""}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full ${achievement.unlocked ? "bg-[#2D4F3C]" : "bg-[#2A3C33]"} flex items-center justify-center mr-3`}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{achievement.name}</h3>
                      <p className="text-xs text-[#8BAF92]">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <div className="bg-[#2D4F3C] rounded-full p-1">
                        <Star className="w-4 h-4 text-yellow-400" fill="#FBBF24" />
                      </div>
                    )}
                  </div>

                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[#8BAF92]">进度</span>
                        <span className="text-xs text-[#8BAF92]">
                          {achievement.progress}/{achievement.description.match(/\d+/)?.[0] || 100}
                        </span>
                      </div>
                      <Progress
                        value={
                          animateProgress
                            ? (achievement.progress / (achievement.description.match(/\d+/)?.[0] || 100)) * 100
                            : 0
                        }
                        className="h-1.5 bg-[#1E2A23] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
                      />
                    </div>
                  )}

                  {achievement.unlocked && achievement.date && (
                    <p className="text-xs text-[#8BAF92] mt-1">获得于 {achievement.date}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}

