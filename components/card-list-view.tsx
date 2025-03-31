"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Shuffle, AlignJustify, Check, AlertCircle, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  type CardLearningRecord,
  getNextReviewText,
  isCardDueForReview,
  getReviewProgress,
} from "@/lib/spaced-repetition"

interface CardListViewProps {
  deckId: string
  deckTitle: string
  cards: Array<{ id: number | string; front: string; back: string }>
  learningRecords: CardLearningRecord[]
  onSelectCard: (index: number) => void
}

export function CardListView({ deckId, deckTitle, cards, learningRecords, onSelectCard }: CardListViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyDue, setShowOnlyDue] = useState(false)
  const [sortType, setSortType] = useState<"default" | "random" | "lastReviewed">("default")
  const [randomSeed, setRandomSeed] = useState(0)

  // 根据学习记录获取卡片状态
  const getCardStatus = (cardId: number | string) => {
    const record = learningRecords.find((r) => r.cardId === cardId && r.deckId === deckId)

    if (!record) {
      return { status: "new", nextReview: "未学习", progress: 0 }
    }

    const isDue = isCardDueForReview(record)
    const status = record.status === "completed" ? "completed" : isDue ? "due" : "pending"

    return {
      status,
      nextReview: getNextReviewText(record),
      progress: getReviewProgress(record),
    }
  }

  // 过滤卡片
  const filteredCards = cards.filter((card) => {
    // 搜索过滤
    if (searchQuery && !card.front.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // 只显示待复习卡片
    if (showOnlyDue) {
      const status = getCardStatus(card.id)
      return status.status === "due"
    }

    return true
  })

  // 排序卡片
  const sortedCards = [...filteredCards]

  // 根据排序类型应用不同的排序逻辑
  if (sortType === "random") {
    // Fisher-Yates 洗牌算法
    // randomSeed 不直接使用，但它的变化会导致这段代码重新执行
    console.log("Shuffling with seed:", randomSeed)
    for (let i = sortedCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[sortedCards[i], sortedCards[j]] = [sortedCards[j], sortedCards[i]]
    }
  } else if (sortType === "lastReviewed") {
    // 按最后复习时间排序，未复习的排在最前面
    sortedCards.sort((a, b) => {
      const recordA = learningRecords.find((r) => r.cardId === a.id && r.deckId === deckId)
      const recordB = learningRecords.find((r) => r.cardId === b.id && r.deckId === deckId)

      // 如果卡片从未被复习过，将其放在最前面
      if (!recordA && !recordB) return 0
      if (!recordA) return -1
      if (!recordB) return 1

      // 比较最后复习时间
      const timeA = new Date(recordA.lastReviewedAt).getTime()
      const timeB = new Date(recordB.lastReviewedAt).getTime()
      return timeA - timeB // 从最早到最近
    })
  } else {
    // 默认按ID排序
    sortedCards.sort((a, b) => {
      if (typeof a.id === "number" && typeof b.id === "number") {
        return a.id - b.id
      }
      return String(a.id).localeCompare(String(b.id))
    })
  }

  // 获取原始索引
  const getOriginalIndex = (card: { id: number | string }) => {
    return cards.findIndex((c) => c.id === card.id)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* 搜索和过滤 */}
      <div className="mb-6">
        <div className="mb-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92] w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索卡片问题..."
              className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] pl-9 h-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showOnlyDue}
                onCheckedChange={setShowOnlyDue}
                className="data-[state=checked]:bg-[#4CAF50]"
              />
              <span className="text-xs text-[#E0E7E3]">只显示待复习</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (sortType === "random") {
                    // 如果已经是随机排序，只更新随机种子触发重新排序
                    setRandomSeed((prev) => prev + 1)
                  } else {
                    // 如果不是随机排序，切换到随机排序
                    setSortType("random")
                  }
                }}
                className={`flex items-center space-x-1 ${sortType === "random" ? "text-[#4CAF50]" : "text-[#8BAF92]"} hover:text-[#4CAF50] hover:bg-[#1A2E22] text-xs px-2 py-1 h-7`}
              >
                <Shuffle className="w-3 h-3" />
                <span>随机排序</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortType("lastReviewed")}
                className={`flex items-center space-x-1 ${sortType === "lastReviewed" ? "text-[#4CAF50]" : "text-[#8BAF92]"} hover:text-[#4CAF50] hover:bg-[#1A2E22] text-xs px-2 py-1 h-7`}
              >
                <Clock className="w-3 h-3" />
                <span>久未复习</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 卡片统计信息 */}
        <div className="mb-4 bg-[#1A2E22] rounded-xl p-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-sm text-[#E0E7E3]">卡片统计</h3>
              <p className="text-xs text-[#8BAF92] mt-1">总计 {cards.length} 张卡片</p>
            </div>
            <div className="flex space-x-3">
              <div className="text-center">
                <p className="text-base font-bold text-[#4CAF50]">
                  {learningRecords.filter((r) => r.deckId === deckId && r.status === "completed").length}
                </p>
                <p className="text-[10px] text-[#8BAF92]">已完成</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-[#E05252]">
                  {
                    learningRecords.filter(
                      (r) => r.deckId === deckId && isCardDueForReview(r) && r.status !== "completed",
                    ).length
                  }
                </p>
                <p className="text-[10px] text-[#8BAF92]">待复习</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-[#8BAF92]">
                  {cards.length - learningRecords.filter((r) => r.deckId === deckId).length}
                </p>
                <p className="text-[10px] text-[#8BAF92]">未学习</p>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片列表 */}
        <div className="flex-1 overflow-auto pb-6">
          <h3 className="font-medium text-sm text-[#E0E7E3] mb-3">所有卡片 ({sortedCards.length})</h3>

          {sortedCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedCards.map((card) => {
                const cardStatus = getCardStatus(card.id)
                const originalIndex = getOriginalIndex(card)

                return (
                  <motion.div
                    key={card.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectCard(originalIndex)}
                    className="bg-gradient-to-br from-[#1E3A2B] to-[#0F2318] rounded-xl p-4 cursor-pointer shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 mr-3">
                        <h3 className="font-medium text-sm text-[#E0E7E3] line-clamp-2">{card.front}</h3>
                      </div>

                      {cardStatus.status === "completed" ? (
                        <Badge className="bg-[#2D4F3C] text-[#4CAF50] border-none text-[10px]">
                          <Check className="w-2.5 h-2.5 mr-1" />
                          已完成
                        </Badge>
                      ) : cardStatus.status === "due" ? (
                        <Badge className="bg-[#3C2A2A] text-[#E05252] border-none text-[10px]">
                          <AlertCircle className="w-2.5 h-2.5 mr-1" />
                          待复习
                        </Badge>
                      ) : cardStatus.status === "pending" ? (
                        <Badge className="bg-[#2A3C33] text-[#8BAF92] border-none text-[10px]">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          计划中
                        </Badge>
                      ) : (
                        <Badge className="bg-[#2A3C33] text-[#8BAF92] border-none text-[10px]">新卡片</Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-[10px] text-[#8BAF92]">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        <span>下次复习: {cardStatus.nextReview}</span>
                      </div>

                      <Button
                        size="sm"
                        className="text-[10px] bg-[#2A3C33] hover:bg-[#4CAF50] hover:text-white text-[#8BAF92] h-6 px-2"
                      >
                        开始学习 <ChevronRight className="w-2.5 h-2.5 ml-1" />
                      </Button>
                    </div>

                    {/* 进度条 */}
                    {cardStatus.status !== "new" && (
                      <div className="w-full h-1.5 bg-[#0F2318] rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-[#4CAF50] rounded-full transition-all duration-500"
                          style={{ width: `${cardStatus.progress}%` }}
                        />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#1A2E22] rounded-xl">
              <AlignJustify className="w-12 h-12 text-[#2A3C33] mb-4" />
              <h3 className="text-lg font-medium mb-2">未找到卡片</h3>
              <p className="text-sm text-[#8BAF92] max-w-xs">
                {searchQuery
                  ? "没有找到匹配的卡片，请尝试其他搜索词"
                  : showOnlyDue
                    ? "目前没有需要复习的卡片"
                    : "这个卡片集还没有卡片"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

