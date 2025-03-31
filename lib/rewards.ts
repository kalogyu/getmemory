// 奖励系统工具函数

// 用户等级配置
export const LEVEL_CONFIG = [
  { level: 1, requiredPoints: 0, title: "初学者" },
  { level: 2, requiredPoints: 100, title: "勤奋学习者" },
  { level: 3, requiredPoints: 300, title: "知识探索者" },
  { level: 4, requiredPoints: 600, title: "记忆达人" },
  { level: 5, requiredPoints: 1000, title: "知识大师" },
  { level: 6, requiredPoints: 1500, title: "记忆王者" },
  { level: 7, requiredPoints: 2200, title: "智慧导师" },
  { level: 8, requiredPoints: 3000, title: "学习传奇" },
  { level: 9, requiredPoints: 4000, title: "知识守护者" },
  { level: 10, requiredPoints: 5000, title: "记忆之神" },
]

// 奖励行为和对应的积分
export const REWARD_ACTIONS = {
  COMPLETE_CARD: { points: 5, description: "完成一张卡片" },
  COMPLETE_DECK: { points: 20, description: "完成一个卡片集" },
  DAILY_LOGIN: { points: 10, description: "每日登录" },
  STREAK_MILESTONE: { points: 50, description: "连续学习里程碑" },
  CREATE_DECK: { points: 30, description: "创建卡片集" },
  SHARE_RESULT: { points: 15, description: "分享学习成果" },
  COMMUNITY_POST: { points: 10, description: "发布社区内容" },
  PERFECT_SCORE: { points: 25, description: "完美掌握卡片集" },
}

// 获取用户当前等级
export function getUserLevel(points: number) {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (points >= LEVEL_CONFIG[i].requiredPoints) {
      return LEVEL_CONFIG[i]
    }
  }
  return LEVEL_CONFIG[0] // 默认返回第一级
}

// 获取下一级所需积分
export function getNextLevelPoints(points: number) {
  const currentLevel = getUserLevel(points)
  const currentLevelIndex = LEVEL_CONFIG.findIndex((level) => level.level === currentLevel.level)

  if (currentLevelIndex < LEVEL_CONFIG.length - 1) {
    return LEVEL_CONFIG[currentLevelIndex + 1].requiredPoints
  }

  return currentLevel.requiredPoints // 已经是最高级
}

// 计算等级进度百分比
export function getLevelProgress(points: number) {
  const currentLevel = getUserLevel(points)
  const nextLevelPoints = getNextLevelPoints(points)

  if (currentLevel.requiredPoints === nextLevelPoints) {
    return 100 // 已经是最高级
  }

  const progressPoints = points - currentLevel.requiredPoints
  const totalPointsNeeded = nextLevelPoints - currentLevel.requiredPoints

  return Math.min(Math.floor((progressPoints / totalPointsNeeded) * 100), 100)
}

// 添加积分并返回新的用户数据
export function addPoints(userData: any, action: keyof typeof REWARD_ACTIONS) {
  if (!userData) return null

  const pointsToAdd = REWARD_ACTIONS[action].points
  const newPoints = (userData.points || 0) + pointsToAdd

  const oldLevel = getUserLevel(userData.points || 0)
  const newLevel = getUserLevel(newPoints)

  const leveledUp = newLevel.level > oldLevel.level

  return {
    ...userData,
    points: newPoints,
    leveledUp,
    newLevel,
    pointsAdded: pointsToAdd,
    action: REWARD_ACTIONS[action].description,
  }
}

// 保存用户奖励数据到本地存储
export function saveUserRewards(userData: any) {
  if (typeof window === "undefined" || !userData) return

  try {
    localStorage.setItem(
      "userRewards",
      JSON.stringify({
        points: userData.points || 0,
        level: getUserLevel(userData.points || 0),
        rewardHistory: userData.rewardHistory || [],
      }),
    )
  } catch (error) {
    console.error("Failed to save user rewards:", error)
  }
}

// 从本地存储获取用户奖励数据
export function getUserRewards() {
  if (typeof window === "undefined") return null

  try {
    const data = localStorage.getItem("userRewards")
    if (!data) {
      // 初始化默认奖励数据
      const defaultRewards = {
        points: 0,
        level: LEVEL_CONFIG[0],
        rewardHistory: [],
      }
      localStorage.setItem("userRewards", JSON.stringify(defaultRewards))
      return defaultRewards
    }

    return JSON.parse(data)
  } catch (error) {
    console.error("Failed to get user rewards:", error)
    return null
  }
}

// 记录奖励历史
export function addRewardHistory(userData: any, action: keyof typeof REWARD_ACTIONS) {
  if (!userData) return null

  const rewardHistory = userData.rewardHistory || []
  const newHistory = [
    {
      action: REWARD_ACTIONS[action].description,
      points: REWARD_ACTIONS[action].points,
      timestamp: new Date().toISOString(),
    },
    ...rewardHistory,
  ].slice(0, 50) // 只保留最近50条记录

  return {
    ...userData,
    rewardHistory: newHistory,
  }
}

