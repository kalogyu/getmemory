"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { ArrowLeft, Share2, List } from "lucide-react"
import { addPoints, addRewardHistory, saveUserRewards, getUserRewards } from "@/lib/rewards"
import { RewardNotification } from "@/components/reward-notification"
import { SlideRevealCard } from "@/components/card-formats/slide-reveal-card"
import { CardListView } from "@/components/card-list-view"
import {
  addLearningRecord,
  completeCardReview,
  getDueReviews,
  getLearningRecords,
  type CardLearningRecord,
} from "@/lib/spaced-repetition"
import { ReviewReminder } from "@/components/review-reminder"
import { Button } from "@/components/ui/button"

// 模拟数据库
const decks = {
  science: {
    title: "科学知识",
    cards: [
      {
        id: 1,
        front: "什么是光合作用？",
        back: "光合作用是绿色植物利用光能，将二氧化碳和水转化为有机物和氧气的过程。\n\n这个过程主要发生在植物的叶绿体中，叶绿素能够捕获光能并将其转化为化学能。\n\n光合作用的基本方程式是：\n6CO₂ + 6H₂O + 光能 → C₆H₁₂O₆ + 6O₂\n\n光合作用对地球生态系统至关重要，因为它不仅为植物提供了能量，还为大气补充了氧气，同时也是食物链的基础。",
      },
      { id: 2, front: "水的化学式是什么？", back: "H₂O" },
      { id: 3, front: "地球上最高的山峰是什么？", back: "珠穆朗玛峰，海拔8,848.86米" },
      { id: 4, front: "人体最大的器官是什么？", back: "皮肤" },
      { id: 5, front: "谁发明了电话？", back: "亚历山大·格雷厄姆·贝尔" },
      { id: 6, front: "DNA的全称是什么？", back: "脱氧核糖核酸" },
      { id: 7, front: "太阳系中最大的行星是什么？", back: "木星" },
      { id: 8, front: "人体中的红血细胞寿命约为多久？", back: "约120天" },
      { id: 9, front: "声音在空气中的传播速度约为多少？", back: "约340米/秒" },
      { id: 10, front: "元素周期表中的第一个元素是什么？", back: "氢(H)" },
    ],
  },
  history: {
    title: "历史事件",
    cards: [
      { id: 1, front: "第一次世界大战的开始年份是？", back: "1914年" },
      { id: 2, front: "中国改革开放的年份是？", back: "1978年" },
      { id: 3, front: "美国独立宣言签署的年份是？", back: "1776年" },
      { id: 4, front: "法国大革命爆发的年份是？", back: "1789年" },
      { id: 5, front: "秦始皇统一中国的年份是？", back: "公元前221年" },
      { id: 6, front: "第二次世界大战结束的年份是？", back: "1945年" },
      { id: 7, front: "马克思和恩格斯发表《共产党宣言》的年份是？", back: "1848年" },
      { id: 8, front: "人类首次登月的年份是？", back: "1969年" },
      { id: 9, front: "柏林墙倒塌的年份是？", back: "1989年" },
      { id: 10, front: "中华人民共和国成立的年份是？", back: "1949年" },
      { id: 11, front: "拿破仑称帝的年份是？", back: "1804年" },
      { id: 12, front: "文艺复兴大致的时间段是？", back: "14世纪至17世纪" },
      { id: 13, front: "清朝灭亡的年份是？", back: "1912年" },
      { id: 14, front: "甲午战争爆发的年份是？", back: "1894年" },
      { id: 15, front: "第一次鸦片战争爆发的年份是？", back: "1840年" },
    ],
  },
  geography: {
    title: "地理常识",
    cards: [
      { id: 1, front: "世界上最大的大洲是？", back: "亚洲" },
      { id: 2, front: "世界上最大的海洋是？", back: "太平洋" },
      { id: 3, front: "中国的首都是？", back: "北京" },
      { id: 4, front: "世界上最长的河流是？", back: "尼罗河" },
      { id: 5, front: "世界上最大的沙漠是？", back: "撒哈拉沙漠" },
      { id: 6, front: "世界上最高的瀑布是？", back: "安赫尔瀑布" },
      { id: 7, front: "世界上最深的海沟是？", back: "马里亚纳海沟" },
      { id: 8, front: "中国最长的河流是？", back: "长江" },
    ],
  },
  language: {
    title: "语言学习",
    cards: [
      { id: 1, front: "英语单词'Apple'的中文意思是？", back: "苹果" },
      { id: 2, front: "英语单词'Book'的中文意思是？", back: "书" },
      { id: 3, front: "英语单词'Cat'的中文意思是？", back: "猫" },
      { id: 4, front: "英语单词'Dog'的中文意思是？", back: "狗" },
      { id: 5, front: "英语单词'Elephant'的中文意思是？", back: "大象" },
      { id: 6, front: "英语单词'Flower'的中文意思是？", back: "花" },
      { id: 7, front: "英语单词'Garden'的中文意思是？", back: "花园" },
      { id: 8, front: "英语单词'House'的中文意思是？", back: "房子" },
      { id: 9, front: "英语单词'Island'的中文意思是？", back: "岛屿" },
      { id: 10, front: "英语单词'Jacket'的中文意思是？", back: "夹克" },
      { id: 11, front: "英语单词'Kitchen'的中文意思是？", back: "厨房" },
      { id: 12, front: "英语单词'Lemon'的中文意思是？", back: "柠檬" },
      { id: 13, front: "英语单词'Mountain'的中文意思是？", back: "山" },
      { id: 14, front: "英语单词'Night'的中文意思是？", back: "夜晚" },
      { id: 15, front: "英语单词'Ocean'的中文意思是？", back: "海洋" },
      { id: 16, front: "英语单词'Pencil'的中文意思是？", back: "铅笔" },
      { id: 17, front: "英语单词'Queen'的中文意思是？", back: "女王" },
      { id: 18, front: "英语单词'River'的中文意思是？", back: "河流" },
      { id: 19, front: "英语单词'Sun'的中文意思是？", back: "太阳" },
      { id: 20, front: "英语单词'Tree'的中文意思是？", back: "树" },
    ],
  },
}

// 视图类型
type ViewMode = "card" | "list"

export default function DeckPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const deckId = params.id
  const deck = decks[deckId as keyof typeof decks]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [animateProgress, setAnimateProgress] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("card")
  const [rewardNotification, setRewardNotification] = useState<{
    show: boolean
    points: number
    message: string
    levelUp: boolean
    newLevel?: { level: number; title: string }
  } | null>(null)
  const [showReviewReminder, setShowReviewReminder] = useState(false)
  const [learningRecords, setLearningRecords] = useState<CardLearningRecord[]>([])

  // 添加状态来控制卡片堆叠效果
  const [dragState, setDragState] = useState({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
  })

  // 添加状态来跟踪卡片切换动画
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 获取当前用户
  const getUser = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        return JSON.parse(localStorage.getItem("user") || '{"name":"用户"}')
      }
      return { name: "用户" }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error)
      return { name: "用户" } // Provide a default value in case of parsing errors
    }
  }, [])

  const [user, setUser] = useState(getUser())

  useEffect(() => {
    setUser(getUser())
  }, [getUser])

  // 如果找不到卡片集，返回首页
  useEffect(() => {
    if (!deck) {
      router.push("/")
      return
    }

    // 获取学习记录
    const records = getLearningRecords()
    setLearningRecords(records)

    // Trigger progress animation after component mounts
    setTimeout(() => {
      setAnimateProgress(true)
    }, 300)

    // 清理超时
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [deck, router])

  // 检查是否有需要复习的卡片
  useEffect(() => {
    const dueReviews = getDueReviews()
    if (dueReviews.length > 0) {
      setShowReviewReminder(true)
    }
  }, [])

  if (!deck) return null

  // 处理完成卡片
  const handleCompleteCard = () => {
    if (isTransitioning) return

    setIsTransitioning(true)

    // 设置过渡动画
    transitionTimeoutRef.current = setTimeout(() => {
      // 添加学习记录
      if (currentIndex === 0 && deck.cards.length > 0) {
        // 第一次学习这张卡片
        const updatedRecords = addLearningRecord(deck.cards[currentIndex].id, deckId, deck.title)
        setLearningRecords(updatedRecords)
      } else {
        // 复习这张卡片
        const updatedRecords = completeCardReview(deck.cards[currentIndex].id, deckId)
        setLearningRecords(updatedRecords)
      }

      if (currentIndex < deck.cards.length - 1) {
        // 添加完成卡片的奖励
        const userRewards = getUserRewards()

        const updatedRewards = userRewards
          ? addPoints(userRewards, "COMPLETE_CARD")
          : { pointsAdded: 0, leveledUp: false, action: "COMPLETE_CARD" }
        const rewardsWithHistory = userRewards
          ? addRewardHistory(updatedRewards, "COMPLETE_CARD")
          : { ...updatedRewards, rewardHistory: [] }
        if (userRewards) {
          saveUserRewards(rewardsWithHistory)
        }

        // 显示奖励通知
        setRewardNotification({
          show: true,
          points: updatedRewards.pointsAdded,
          message: updatedRewards.action,
          levelUp: updatedRewards.leveledUp,
          newLevel: updatedRewards.newLevel ? updatedRewards.newLevel : undefined,
        })

        // 移动到下一张卡片
        setCurrentIndex(currentIndex + 1)
      } else {
        // 显示完成模态框
        setShowCompleteModal(true)

        // 添加完成卡片集的奖励
        const userRewards = getUserRewards()

        const updatedRewards = userRewards
          ? addPoints(userRewards, "COMPLETE_DECK")
          : { pointsAdded: 0, leveledUp: false, action: "COMPLETE_DECK" }
        const rewardsWithHistory = userRewards
          ? addRewardHistory(updatedRewards, "COMPLETE_DECK")
          : { ...updatedRewards, rewardHistory: [] }
        if (userRewards) {
          saveUserRewards(rewardsWithHistory)
        }

        // 完成卡片集的奖励通知会在模态框关闭后显示
        setTimeout(() => {
          setRewardNotification({
            show: true,
            points: updatedRewards.pointsAdded,
            message: updatedRewards.action,
            levelUp: updatedRewards.leveledUp,
            newLevel: updatedRewards.newLevel ? updatedRewards.newLevel : undefined,
          })
        }, 500)
      }

      // 重置过渡状态
      setIsTransitioning(false)
      setDragState({ x: 0, y: 0, scale: 1, opacity: 1 })
    }, 300)
  }

  // 处理返回上一张卡片
  const handlePreviousCard = () => {
    if (isTransitioning || currentIndex <= 0) return

    setIsTransitioning(true)

    // 设置过渡动画
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(currentIndex - 1)
      setIsTransitioning(false)
      setDragState({ x: 0, y: 0, scale: 1, opacity: 1 })
    }, 300)
  }

  // 处理拖动更新
  const handleDragUpdate = (x: number, y: number, scale: number, opacity: number) => {
    setDragState({ x, y, scale, opacity })
  }

  // 处理从列表中选择卡片
  const handleSelectCard = (index: number) => {
    setCurrentIndex(index)
    setViewMode("card")
  }

  // 计算进度百分比
  const progressPercentage = (currentIndex / (deck.cards.length - 1)) * 100

  // 根据选择的格式渲染不同的卡片组件
  const renderCard = (index: number, isNext = false) => {
    if (index >= deck.cards.length) return null

    const currentCard = deck.cards[index]
    const hasPrevious = index > 0

    // 为下一张卡片计算反向动画
    const nextCardStyle = isNext
      ? {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          zIndex: 0,
        }
      : {}

    // 当前卡片的样式
    const currentCardStyle = !isNext
      ? {
          zIndex: 1,
        }
      : {}

    const cardProps = {
      front: currentCard.front,
      back: currentCard.back,
      onComplete: isNext ? undefined : handleCompleteCard,
      onPrevious: isNext ? undefined : handlePreviousCard,
      hasPrevious: isNext ? false : hasPrevious,
      onDragUpdate: isNext ? undefined : handleDragUpdate,
      // 添加cardKey属性，确保卡片切换时重置状态
      cardKey: `${currentCard.id}-${index}`,
    }

    return (
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={false}
        animate={isNext ? nextCardStyle : currentCardStyle}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <SlideRevealCard {...cardProps} />
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 - 适配iPhone 15 */}
      <header className="px-5 pt-12 pb-3 flex justify-between items-center">
        <button
          onClick={() => router.push("/home")}
          className="w-9 h-9 rounded-full bg-[#1A2E22] flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-[#8BAF92]" />
        </button>
        <h1 className="text-lg font-bold">{deck.title}</h1>
        <div className="flex items-center">
          <button
            onClick={() => router.push("/profile")}
            className="w-9 h-9 rounded-full bg-[#2A3C33] flex items-center justify-center text-base font-bold text-[#4CAF50]"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* 顶部进度条 */}
      <div className="px-5">
        <Progress
          value={animateProgress ? progressPercentage : 0}
          className="h-1.5 bg-[#1E2A23] [&>div]:bg-[#4CAF50] [&>div]:transition-all [&>div]:duration-1000"
        />
        <div className="flex justify-between text-xs text-[#8BAF92] mt-1 px-1">
          <span>
            {currentIndex + 1}/{deck.cards.length}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {/* 视图切换和卡片格式选择器 - 更紧凑的布局 */}
      <div className="px-5 py-2 flex justify-between items-center">
        {/* 视图切换按钮 - 合并为一个按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
          className={`text-xs px-3 py-1 h-8 bg-[#1A2E22] hover:bg-[#2A3C33] text-[#8BAF92]`}
        >
          <List className="w-3.5 h-3.5 mr-1.5" />
          {viewMode === "card" ? "查看列表" : "查看卡片"}
        </Button>
      </div>

      {/* 滑动方向提示 - 仅在卡片视图中显示，更简洁的提示 */}
      {viewMode === "card" && (
        <div className="px-5 py-1">
          <div className="text-center text-[10px] text-[#8BAF92]">
            <span>左右滑动切换 • 上滑完成</span>
          </div>
        </div>
      )}

      {/* 主内容区域 - 根据视图模式显示不同内容，适配iPhone 15 */}
      {viewMode === "card" ? (
        <div className="flex-1 flex items-center justify-center px-5 py-2">
          <div className="relative w-full h-[65vh]">
            {/* 渲染下一张卡片（如果有） */}
            {currentIndex < deck.cards.length - 1 && renderCard(currentIndex + 1, true)}

            {/* 渲染当前卡片 */}
            {renderCard(currentIndex)}
          </div>
        </div>
      ) : (
        <div className="flex-1 px-5 py-2 overflow-hidden">
          <CardListView
            deckId={deckId}
            deckTitle={deck.title}
            cards={deck.cards}
            learningRecords={learningRecords}
            onSelectCard={handleSelectCard}
          />
        </div>
      )}

      {/* 底部指示器 - 仅在卡片视图中显示，更紧凑的设计 */}
      {viewMode === "card" && (
        <div className="pb-6 flex items-center justify-center space-x-1">
          {deck.cards.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#4CAF50] w-5"
                  : index < currentIndex
                    ? "bg-[#4CAF50]/30 w-1.5"
                    : "bg-[#2A3C33] w-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* 完成学习模态框 */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A2E22] rounded-3xl p-8 w-full max-w-sm shadow-xl"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-[#2D4F3C] flex items-center justify-center mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#4CAF50"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">恭喜！</h2>
              <p className="text-center text-[#8BAF92] mb-6">你已完成本组卡片的学习。继续保持，提升你的记忆力！</p>
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => {
                    setShowCompleteModal(false)
                    setCurrentIndex(0)
                  }}
                  className="w-full py-3 bg-[#4CAF50] rounded-xl font-medium"
                >
                  再学一次
                </button>
                <button
                  onClick={() => router.push("/home")}
                  className="w-full py-3 bg-[#2A3C33] rounded-xl font-medium text-[#8BAF92]"
                >
                  返回首页
                </button>
                <button
                  onClick={() => {
                    // 添加分享成果的奖励
                    const userRewards = getUserRewards()

                    const updatedRewards = userRewards
                      ? addPoints(userRewards, "SHARE_RESULT")
                      : { pointsAdded: 0, leveledUp: false, action: "SHARE_RESULT" }
                    const rewardsWithHistory = userRewards
                      ? addRewardHistory(updatedRewards, "SHARE_RESULT")
                      : { ...updatedRewards, rewardHistory: [] }
                    if (userRewards) {
                      saveUserRewards(rewardsWithHistory)
                    }

                    // 显示奖励通知
                    setRewardNotification({
                      show: true,
                      points: updatedRewards.pointsAdded,
                      message: updatedRewards.action,
                      levelUp: updatedRewards.leveledUp,
                      newLevel: updatedRewards.leveledUp ? updatedRewards.newLevel : undefined,
                    })

                    setShowCompleteModal(false)
                    router.push("/square")
                  }}
                  className="flex items-center justify-center mt-2 text-[#8BAF92]"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享成果
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
      {/* 复习提醒 */}
      {showReviewReminder && <ReviewReminder onClose={() => setShowReviewReminder(false)} />}
    </div>
  )
}

