"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Filter, Star, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"
import { addPoints, addRewardHistory, saveUserRewards, getUserRewards } from "@/lib/rewards"
import { RewardNotification } from "@/components/reward-notification"
import { BottomNav } from "@/components/bottom-nav"

// 模拟卡片集数据
const DECK_CATEGORIES = [
  { id: "popular", name: "热门推荐" },
  { id: "language", name: "语言学习" },
  { id: "science", name: "科学知识" },
  { id: "history", name: "历史文化" },
  { id: "math", name: "数学" },
  { id: "geography", name: "地理" },
  { id: "art", name: "艺术" },
  { id: "tech", name: "科技" },
]

const DECKS = [
  {
    id: "english-basics",
    title: "英语基础词汇",
    description: "包含500个最常用的英语单词，适合英语初学者。",
    category: "language",
    cards: 500,
    downloads: 12500,
    rating: 4.8,
    author: "语言学习专家",
    difficulty: "初级",
    tags: ["英语", "词汇", "入门"],
    isFree: true,
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "science-physics",
    title: "物理学基础概念",
    description: "涵盖高中物理的核心概念和公式，帮助你掌握物理基础。",
    category: "science",
    cards: 120,
    downloads: 8300,
    rating: 4.7,
    author: "物理教师联盟",
    difficulty: "中级",
    tags: ["物理", "公式", "概念"],
    isFree: true,
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "world-history",
    title: "世界历史重要事件",
    description: "记忆世界历史上的关键事件和时间点，提升你的历史知识。",
    category: "history",
    cards: 200,
    downloads: 7200,
    rating: 4.6,
    author: "历史爱好者协会",
    difficulty: "中级",
    tags: ["历史", "事件", "年代"],
    isFree: true,
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "math-formulas",
    title: "数学公式大全",
    description: "包含从初中到大学的重要数学公式，是应对考试的必备工具。",
    category: "math",
    cards: 150,
    downloads: 9100,
    rating: 4.9,
    author: "数学教研组",
    difficulty: "高级",
    tags: ["数学", "公式", "考试"],
    isFree: false,
    price: 15,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "geography-capitals",
    title: "世界各国首都",
    description: "学习世界各国的首都城市，提升你的地理知识。",
    category: "geography",
    cards: 195,
    downloads: 6800,
    rating: 4.5,
    author: "地理爱好者",
    difficulty: "初级",
    tags: ["地理", "首都", "国家"],
    isFree: true,
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "art-movements",
    title: "艺术流派与代表作",
    description: "了解主要艺术流派及其代表作品和艺术家。",
    category: "art",
    cards: 80,
    downloads: 4200,
    rating: 4.7,
    author: "艺术学院",
    difficulty: "中级",
    tags: ["艺术", "流派", "名画"],
    isFree: true,
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "tech-terms",
    title: "科技术语解析",
    description: "解释现代科技中常见的术语和概念，跟上科技发展的步伐。",
    category: "tech",
    cards: 110,
    downloads: 5600,
    rating: 4.6,
    author: "科技爱好者",
    difficulty: "中级",
    tags: ["科技", "术语", "概念"],
    isFree: false,
    price: 12,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "chinese-idioms",
    title: "中国成语故事",
    description: "学习中国经典成语及其背后的故事，提升语言表达能力。",
    category: "language",
    cards: 300,
    downloads: 7800,
    rating: 4.8,
    author: "国学专家",
    difficulty: "中级",
    tags: ["成语", "中文", "故事"],
    isFree: true,
    price: 0,
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function ExplorePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("popular")
  const [showFilters, setShowFilters] = useState(false)
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [onlyFree, setOnlyFree] = useState(false)
  const [rewardNotification, setRewardNotification] = useState<{
    show: boolean
    points: number
    message: string
    levelUp: boolean
    newLevel?: { level: number; title: string }
  } | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  // 过滤卡片集
  const filteredDecks = DECKS.filter((deck) => {
    // 搜索过滤
    if (
      searchQuery &&
      !deck.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !deck.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !deck.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false
    }

    // 分类过滤
    if (selectedCategory !== "popular" && deck.category !== selectedCategory) {
      return false
    }

    // 难度过滤
    if (difficulty && deck.difficulty !== difficulty) {
      return false
    }

    // 免费过滤
    if (onlyFree && !deck.isFree) {
      return false
    }

    return true
  })

  // 添加卡片集到我的学习
  const addToMyLearning = (deckId: string) => {
    // 在实际应用中，这里应该有API调用来添加卡片集
    // 为了演示，我们只显示一个通知

    // 添加奖励
    const userRewards = getUserRewards()
    if (userRewards) {
      const updatedRewards = addPoints(userRewards, "CREATE_DECK")
      const rewardsWithHistory = addRewardHistory(updatedRewards, "CREATE_DECK")
      saveUserRewards(rewardsWithHistory)

      // 显示奖励通知
      setRewardNotification({
        show: true,
        points: updatedRewards.pointsAdded,
        message: "添加卡片集到学习列表",
        levelUp: updatedRewards.leveledUp,
        newLevel: updatedRewards.leveledUp ? updatedRewards.newLevel : undefined,
      })
    }

    // 跳转到卡片集详情页
    setTimeout(() => {
      router.push(`/deck/${deckId}`)
    }, 1500)
  }

  // If user is not loaded yet, show nothing
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">探索</h1>
        <button
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#4CAF50]"
        >
          {user.name.charAt(0).toUpperCase()}
        </button>
      </header>

      {/* 搜索框 */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92] w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索卡片集"
            className="bg-[#1A2E22] border-[#2A3C33] pl-10 focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92]"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 筛选选项 */}
      {showFilters && (
        <motion.div
          className="px-6 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#1A2E22] rounded-xl p-4">
            <h3 className="font-medium mb-3">筛选</h3>

            <div className="mb-4">
              <p className="text-sm text-[#8BAF92] mb-2">难度</p>
              <div className="flex flex-wrap gap-2">
                {["初级", "中级", "高级"].map((level) => (
                  <Badge
                    key={level}
                    variant="outline"
                    className={`cursor-pointer ${difficulty === level ? "bg-[#2D4F3C] border-[#4CAF50]" : "bg-[#2A3C33] border-[#2A3C33]"}`}
                    onClick={() => setDifficulty(difficulty === level ? null : level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onlyFree"
                  checked={onlyFree}
                  onChange={() => setOnlyFree(!onlyFree)}
                  className="mr-2 h-4 w-4 rounded border-[#2A3C33] text-[#4CAF50] focus:ring-[#4CAF50]"
                />
                <label htmlFor="onlyFree" className="text-sm">
                  只显示免费卡片集
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDifficulty(null)
                  setOnlyFree(false)
                  setSearchQuery("")
                }}
                className="text-xs bg-transparent border-[#2A3C33] hover:bg-[#2A3C33] text-[#8BAF92]"
              >
                重置筛选
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 分类选项卡 */}
      <div className="mb-6 px-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 pb-2">
            {DECK_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                  selectedCategory === category.id ? "bg-[#4CAF50] text-white" : "bg-[#1A2E22] text-[#8BAF92]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 卡片集列表 */}
      <div className="px-6 pb-24">
        {filteredDecks.length > 0 ? (
          <div className="space-y-4">
            {filteredDecks.map((deck, index) => (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.5 }}
                className="bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-xl p-4 shadow-lg"
              >
                <div className="flex">
                  <div className="w-20 h-20 rounded-lg bg-[#2A3C33] flex items-center justify-center mr-4 overflow-hidden">
                    {deck.image ? (
                      <img
                        src={deck.image || "/placeholder.svg"}
                        alt={deck.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-[#4CAF50]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{deck.title}</h3>
                        <p className="text-xs text-[#8BAF92] mt-1">
                          {deck.category === "language"
                            ? "语言学习"
                            : deck.category === "science"
                              ? "科学知识"
                              : deck.category === "history"
                                ? "历史文化"
                                : deck.category === "math"
                                  ? "数学"
                                  : deck.category === "geography"
                                    ? "地理"
                                    : deck.category === "art"
                                      ? "艺术"
                                      : deck.category === "tech"
                                        ? "科技"
                                        : "其他"}{" "}
                          • {deck.cards} 张卡片
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                        <span className="text-sm">{deck.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-[#A0AFA3] mt-2 line-clamp-2">{deck.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {deck.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-[#2A3C33] border-[#2A3C33] text-xs">
                          {tag}
                        </Badge>
                      ))}

                      {deck.isFree ? (
                        <Badge className="bg-[#2D4F3C] text-[#4CAF50] border-none text-xs">免费</Badge>
                      ) : (
                        <Badge className="bg-[#3C2A2A] text-[#E05252] border-none text-xs">付费</Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-xs text-[#8BAF92]">
                        <Download className="w-3 h-3 mr-1" />
                        {deck.downloads.toLocaleString()} 次下载
                      </div>
                      <Button
                        onClick={() => addToMyLearning(deck.id)}
                        className={`${deck.isFree ? "bg-[#4CAF50] hover:bg-[#3d9c40]" : "bg-[#E05252] hover:bg-[#c04545]"} text-white text-xs py-1 px-3 h-8`}
                      >
                        {deck.isFree ? "免费学习" : `¥${deck.price}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-[#2A3C33] mb-4" />
            <h3 className="text-lg font-medium mb-2">未找到匹配的卡片集</h3>
            <p className="text-sm text-[#8BAF92] max-w-xs">尝试使用不同的搜索词或筛选条件，或者创建自己的卡片集</p>
            <Button onClick={() => router.push("/create")} className="mt-6 bg-[#4CAF50] hover:bg-[#3d9c40]">
              创建卡片集
            </Button>
          </div>
        )}
      </div>

      {/* 奖励通知 */}
      {rewardNotification && (
        <RewardNotification
          show={rewardNotification.show}
          points={rewardNotification.points}
          message={rewardNotification.message}
          levelUp={rewardNotification.levelUp}
          newLevel={rewardNotification.newLevel}
          onClose={() => setRewardNotification(null)}
        />
      )}

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}

