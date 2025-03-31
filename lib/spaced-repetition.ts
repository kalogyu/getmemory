// 艾宾浩斯遗忘曲线复习时间点（单位：小时）
export const EBBINGHAUS_INTERVALS = [
  24, // 第一次复习：1天后
  48, // 第二次复习：2天后
  168, // 第三次复习：7天后
  336, // 第四次复习：14天后
  720, // 第五次复习：30天后
]

// 复习状态
export type ReviewStatus = "pending" | "due" | "completed"

// 卡片学习记录
export interface CardLearningRecord {
  cardId: number | string
  deckId: string
  deckTitle: string
  firstLearnedAt: string // ISO日期字符串
  lastReviewedAt: string // ISO日期字符串
  reviewCount: number // 已复习次数
  nextReviewDue: string // ISO日期字符串
  status: ReviewStatus
}

// 获取下一次复习时间
export function getNextReviewTime(reviewCount: number): Date {
  const now = new Date()

  // 如果已经完成所有复习，返回一个很远的未来日期
  if (reviewCount >= EBBINGHAUS_INTERVALS.length) {
    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 1)
    return farFuture
  }

  // 获取下一个复习间隔（小时）
  const nextIntervalHours = EBBINGHAUS_INTERVALS[reviewCount]

  // 计算下一次复习时间
  const nextReviewTime = new Date(now.getTime() + nextIntervalHours * 60 * 60 * 1000)

  return nextReviewTime
}

// 检查卡片是否需要复习
export function isCardDueForReview(record: CardLearningRecord): boolean {
  const now = new Date()
  const nextReviewDue = new Date(record.nextReviewDue)

  return now >= nextReviewDue
}

// 获取卡片复习状态
export function getCardReviewStatus(record: CardLearningRecord): ReviewStatus {
  if (record.reviewCount >= EBBINGHAUS_INTERVALS.length) {
    return "completed"
  }

  return isCardDueForReview(record) ? "due" : "pending"
}

// 更新卡片学习记录
export function updateCardLearningRecord(record: CardLearningRecord): CardLearningRecord {
  const now = new Date()
  const nextReviewTime = getNextReviewTime(record.reviewCount)

  return {
    ...record,
    lastReviewedAt: now.toISOString(),
    reviewCount: record.reviewCount + 1,
    nextReviewDue: nextReviewTime.toISOString(),
    status: record.reviewCount + 1 >= EBBINGHAUS_INTERVALS.length ? "completed" : "pending",
  }
}

// 从本地存储获取所有学习记录
export function getLearningRecords(): CardLearningRecord[] {
  if (typeof window === "undefined") return []

  try {
    const records = localStorage.getItem("learningRecords")
    return records ? JSON.parse(records) : []
  } catch (error) {
    console.error("Failed to get learning records:", error)
    return []
  }
}

// 保存学习记录到本地存储
export function saveLearningRecords(records: CardLearningRecord[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("learningRecords", JSON.stringify(records))
  } catch (error) {
    console.error("Failed to save learning records:", error)
  }
}

// 添加新的学习记录
export function addLearningRecord(cardId: number | string, deckId: string, deckTitle: string): CardLearningRecord[] {
  const now = new Date()
  const nextReviewTime = getNextReviewTime(0)

  const newRecord: CardLearningRecord = {
    cardId,
    deckId,
    deckTitle,
    firstLearnedAt: now.toISOString(),
    lastReviewedAt: now.toISOString(),
    reviewCount: 0,
    nextReviewDue: nextReviewTime.toISOString(),
    status: "pending",
  }

  const records = getLearningRecords()

  // 检查是否已存在该卡片的记录
  const existingIndex = records.findIndex((record) => record.cardId === cardId && record.deckId === deckId)

  if (existingIndex >= 0) {
    // 更新现有记录
    records[existingIndex] = newRecord
  } else {
    // 添加新记录
    records.push(newRecord)
  }

  saveLearningRecords(records)
  return records
}

// 获取所有需要复习的卡片
export function getDueReviews(): CardLearningRecord[] {
  const records = getLearningRecords()
  return records.filter((record) => record.status !== "completed" && isCardDueForReview(record))
}

// 完成卡片复习
export function completeCardReview(cardId: number | string, deckId: string): CardLearningRecord[] {
  const records = getLearningRecords()

  const recordIndex = records.findIndex((record) => record.cardId === cardId && record.deckId === deckId)

  if (recordIndex >= 0) {
    records[recordIndex] = updateCardLearningRecord(records[recordIndex])
    saveLearningRecords(records)
  }

  return records
}

// 获取复习进度百分比
export function getReviewProgress(record: CardLearningRecord): number {
  if (record.reviewCount >= EBBINGHAUS_INTERVALS.length) {
    return 100
  }

  return Math.round((record.reviewCount / EBBINGHAUS_INTERVALS.length) * 100)
}

// 获取友好的下次复习时间文本
export function getNextReviewText(record: CardLearningRecord): string {
  if (record.status === "completed") {
    return "已完成所有复习"
  }

  const now = new Date()
  const nextReview = new Date(record.nextReviewDue)
  const diffMs = nextReview.getTime() - now.getTime()

  // 如果已经过期
  if (diffMs <= 0) {
    return "现在"
  }

  const diffMins = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}分钟后`
  } else if (diffHours < 24) {
    return `${diffHours}小时后`
  } else {
    return `${diffDays}天后`
  }
}

