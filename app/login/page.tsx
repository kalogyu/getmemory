"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addPoints, addRewardHistory, saveUserRewards, getUserRewards } from "@/lib/rewards"
// 在import部分添加微信登录组件
import { WechatLoginButton } from "@/components/wechat-login-button"

export default function LoginPage() {
  const router = useRouter()
  // Replace the email state with phone number and verification code states
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  // Add a countdown state
  const [countdown, setCountdown] = useState(0)

  // Update the handleLogin function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (showVerificationInput && !verificationCode) {
      setError("请输入验证码")
      return
    }

    if (!phone || (!showVerificationInput && !password)) {
      setError("请填写所有字段")
      return
    }

    // Validate phone number format
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError("请输入有效的手机号码")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll just store a simple user object in localStorage
      localStorage.setItem("user", JSON.stringify({ phone, name: `用户${phone.substring(7)}` }))

      // 添加每日登录奖励
      // 检查是否已经有奖励数据
      let userRewards = getUserRewards()
      if (!userRewards) {
        // 如果没有奖励数据，初始化一个
        userRewards = {
          points: 0,
          level: { level: 1, title: "初学者" },
          rewardHistory: [],
        }
      }

      // 添加每日登录奖励
      const updatedRewards = addPoints(userRewards, "DAILY_LOGIN")
      const rewardsWithHistory = addRewardHistory(updatedRewards, "DAILY_LOGIN")
      saveUserRewards(rewardsWithHistory)

      // Redirect to home page
      router.push("/home")
    } catch (err) {
      setError("登录失败，请检查您的手机号和验证码/密码")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the sendVerificationCode function to include countdown logic
  const sendVerificationCode = async () => {
    if (!phone) {
      setError("请输入手机号码")
      return
    }

    // Validate phone number format
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError("请输入有效的手机号码")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show verification code input
      setShowVerificationInput(true)
      setError("")

      // Start countdown (60 seconds)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer)
            return 0
          }
          return prevCount - 1
        })
      }, 1000)
    } catch (err) {
      setError("发送验证码失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  // Replace the form JSX with the updated version
  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3] flex flex-col">
      {/* Header with logo */}
      <motion.header
        className="pt-16 pb-8 flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-full bg-[#1A2E22] flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 3C7.58172 3 4 6.58172 4 11C4 15.4183 7.58172 19 12 19C16.4183 19 20 15.4183 20 11C20 6.58172 16.4183 3 12 3Z"
              stroke="#4CAF50"
              strokeWidth="2"
            />
            <path
              d="M9 10C9 8.89543 9.89543 8 11 8H13C14.1046 8 15 8.89543 15 10V15C15 16.1046 14.1046 17 13 17H11C9.89543 17 9 16.1046 9 15V10Z"
              stroke="#4CAF50"
              strokeWidth="2"
            />
            <path d="M12 8V3" stroke="#4CAF50" strokeWidth="2" />
            <circle cx="12" cy="21" r="1" fill="#4CAF50" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">欢迎回来</h1>
        <p className="text-sm text-[#8BAF92] mt-1">登录您的记忆卡片账户</p>
      </motion.header>

      {/* Login form */}
      <motion.div
        className="flex-1 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-[#3C2A2A] text-[#E05252] p-3 rounded-lg text-sm">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm text-[#8BAF92]" htmlFor="phone">
              手机号码
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号码"
              className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
            />
          </div>

          {showVerificationInput ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-[#8BAF92]" htmlFor="verificationCode">
                  验证码
                </label>
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  className="text-xs text-[#4CAF50]"
                  disabled={countdown > 0 || isLoading}
                >
                  {countdown > 0 ? `重新发送(${countdown}s)` : "重新发送"}
                </button>
              </div>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="请输入验证码"
                className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm text-[#8BAF92]" htmlFor="password">
                  密码
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-[#4CAF50]"
                >
                  忘记密码?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {!showVerificationInput && (
            <div className="flex justify-end">
              <button type="button" onClick={sendVerificationCode} className="text-sm text-[#4CAF50]">
                使用验证码登录
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4CAF50] hover:bg-[#3d9c40] text-white h-12 rounded-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                登录中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                登录 <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A3C33]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#121212] text-[#8BAF92]">或使用社交账号登录</span>
            </div>
          </div>

          {/* 替换之前添加的微信登录按钮代码
          找到刚才添加的微信登录按钮代码，替换为： */}
          <div className="mt-6">
            <WechatLoginButton className="w-full" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8BAF92]">
            还没有账户?{" "}
            <button onClick={() => router.push("/register")} className="text-[#4CAF50] font-medium">
              注册
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

