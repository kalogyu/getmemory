"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Brain, Calendar, Clock, Trophy } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function StatsPage() {
  const router = useRouter()
  const [animateProgress, setAnimateProgress] = useState(false)

  // 模拟数据
  const stats = {
    totalCards: 153,
    totalTime: "32小时",
    streak: 12,
    accuracy: 85,
    cardsPerDay: [30, 45, 20, 60, 75, 50, 90],
    timePerDay: [25, 40, 15, 50, 65, 45, 80],
    categories: [
      { name: "科学", percentage: 40 },
      { name: "历史", percentage: 25 },
      { name: "地理", percentage: 20 },
      { name: "语言", percentage: 15 },
    ],
  }

  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    // Trigger progress animation after component mounts
    setTimeout(() => {
      setAnimateProgress(true)
    }, 300)
  }, [])

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
        <h1 className="text-xl font-bold">学习统计</h1>
      </header>

      {/* 主内容区 */}
      <main className="px-6 pb-24">
        {/* 总体统计 */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1A2E22] rounded-2xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-[#4CAF50]" />
              </div>
              <p className="text-xs text-[#8BAF92]">总卡片数</p>
              <p className="text-2xl font-bold mt-1">{stats.totalCards}</p>
            </div>

            <div className="bg-[#1A2E22] rounded-2xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mb-3">
                <Clock className="w-5 h-5 text-[#4CAF50]" />
              </div>
              <p className="text-xs text-[#8BAF92]">总学习时间</p>
              <p className="text-2xl font-bold mt-1">{stats.totalTime}</p>
            </div>

            <div className="bg-[#1A2E22] rounded-2xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-[#4CAF50]" />
              </div>
              <p className="text-xs text-[#8BAF92]">连续学习</p>
              <p className="text-2xl font-bold mt-1">{stats.streak} 天</p>
            </div>

            <div className="bg-[#1A2E22] rounded-2xl p-4 shadow-md">
              <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mb-3">
                <Brain className="w-5 h-5 text-[#4CAF50]" />
              </div>
              <p className="text-xs text-[#8BAF92]">正确率</p>
              <p className="text-2xl font-bold mt-1">{stats.accuracy}%</p>
            </div>
          </div>
        </section>

        {/* 每日学习卡片数 */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">每日学习</h2>
            <div className="flex text-xs">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-2 py-1 rounded-l-md ${timeRange === "week" ? "bg-[#2A3C33] text-[#4CAF50]" : "bg-[#1A2E22] text-[#8BAF92]"}`}
              >
                周
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-2 py-1 rounded-r-md ${timeRange === "month" ? "bg-[#2A3C33] text-[#4CAF50]" : "bg-[#1A2E22] text-[#8BAF92]"}`}
              >
                月
              </button>
            </div>
          </div>

          <div className="bg-[#1A2E22] rounded-2xl p-5 shadow-md">
            <div className="flex items-end h-32 gap-1">
              {stats.cardsPerDay.map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-[#4CAF50]/30 rounded-sm"
                    style={{ height: animateProgress ? `${height}%` : "0%" }}
                  >
                    <div
                      className="w-full bg-[#4CAF50] rounded-sm transition-all duration-1000"
                      style={{ height: animateProgress ? `${height * 0.7}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-[#8BAF92] mt-1">
                    {["一", "二", "三", "四", "五", "六", "日"][index]}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 text-xs text-[#8BAF92]">
              <span>平均: 53 张/天</span>
              <span>总计: 370 张</span>
            </div>
          </div>
        </section>

        {/* 分类统计 */}
        <section>
          <h2 className="text-lg font-medium mb-4">分类统计</h2>
          <div className="bg-[#1A2E22] rounded-2xl p-5 shadow-md">
            <div className="space-y-4">
              {stats.categories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs text-[#8BAF92]">{category.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#2A3C33] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4CAF50] transition-all duration-1000"
                      style={{ width: animateProgress ? `${category.percentage}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}

