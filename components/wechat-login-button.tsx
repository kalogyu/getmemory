"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { addPoints, addRewardHistory, saveUserRewards, getUserRewards } from "@/lib/rewards"

interface WechatLoginButtonProps {
  onSuccess?: () => void
  className?: string
}

export function WechatLoginButton({ onSuccess, className = "" }: WechatLoginButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleWechatLogin = () => {
    setIsLoading(true)

    // 模拟微信登录流程
    // 在实际应用中，这里应该调用微信OAuth API
    setTimeout(() => {
      // 模拟登录成功
      localStorage.setItem("user", JSON.stringify({ phone: "13800138000", name: "微信用户" }))

      // 添加每日登录奖励
      let userRewards = getUserRewards()
      if (!userRewards) {
        userRewards = {
          points: 0,
          level: { level: 1, title: "初学者" },
          rewardHistory: [],
        }
      }

      const updatedRewards = addPoints(userRewards, "DAILY_LOGIN")
      const rewardsWithHistory = addRewardHistory(updatedRewards, "DAILY_LOGIN")
      saveUserRewards(rewardsWithHistory)

      setIsLoading(false)

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/home")
      }
    }, 1500)
  }

  return (
    <button
      type="button"
      onClick={handleWechatLogin}
      disabled={isLoading}
      className={`flex items-center justify-center gap-3 bg-[#1A2E22] hover:bg-[#2A3C33] text-[#E0E7E3] py-3 rounded-xl ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin mr-2"></div>
          登录中...
        </div>
      ) : (
        <>
          <div className="w-6 h-6 bg-[#4CAF50] rounded-md flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          微信登录
        </>
      )}
    </button>
  )
}

