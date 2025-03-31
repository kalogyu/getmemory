"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
// 在import部分添加微信登录组件
import { WechatLoginButton } from "@/components/wechat-login-button"

export default function RegisterPage() {
  const router = useRouter()
  // Replace the email state with phone number and verification code states
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [error, setError] = useState("")
  // Add a countdown state
  const [countdown, setCountdown] = useState(0)

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

    setIsSendingCode(true)

    try {
      // Simulate API call to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message
      setError("")
      alert("验证码已发送，请查看手机短信")

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
      setIsSendingCode(false)
    }
  }

  // Update the handleRegister function
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !phone || !password || !verificationCode) {
      setError("请填写所有字段")
      return
    }

    // Validate phone number format
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      setError("请输入有效的手机号码")
      return
    }

    if (!agreeTerms) {
      setError("请同意服务条款和隐私政策")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll just store a simple user object in localStorage
      localStorage.setItem("user", JSON.stringify({ phone, name }))

      // Redirect to home page
      router.push("/home")
    } catch (err) {
      setError("注册失败，请稍后再试")
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
              d="M22 9.25C22 12.5302 19.3923 15.25 16 15.25C12.6077 15.25 10 12.5302 10 9.25C10 5.96979 12.6077 3.25 16 3.25C19.3923 3.25 22 5.96979 22 9.25Z"
              stroke="#4CAF50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 20.25C14 20.25 7.5 18.25 7.5 12.25V4.75L14 2.25"
              stroke="#4CAF50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 7.25L2 9.25V16.75L7.5 18.75"
              stroke="#4CAF50"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">创建账户</h1>
        <p className="text-sm text-[#8BAF92] mt-1">开始您的记忆提升之旅</p>
      </motion.header>

      {/* Registration form */}
      <motion.div
        className="flex-1 px-6 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <form onSubmit={handleRegister} className="space-y-5">
          {error && <div className="bg-[#3C2A2A] text-[#E05252] p-3 rounded-lg text-sm">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm text-[#8BAF92]" htmlFor="name">
              姓名
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的姓名"
              className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
            />
          </div>

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

          <div className="space-y-2">
            <label className="text-sm text-[#8BAF92]" htmlFor="verificationCode">
              验证码
            </label>
            <div className="flex gap-2">
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="请输入验证码"
                className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] flex-1"
              />
              <Button
                type="button"
                onClick={sendVerificationCode}
                disabled={isSendingCode || countdown > 0}
                className="bg-[#2A3C33] hover:bg-[#1A2E22] text-[#8BAF92] whitespace-nowrap"
              >
                {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "获取验证码"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[#8BAF92]" htmlFor="password">
              密码
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少8个字符"
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

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="data-[state=checked]:bg-[#4CAF50] data-[state=checked]:border-[#4CAF50]"
            />
            <label htmlFor="terms" className="text-sm text-[#8BAF92] leading-tight">
              我同意{" "}
              <a href="#" className="text-[#4CAF50]">
                服务条款
              </a>{" "}
              和{" "}
              <a href="#" className="text-[#4CAF50]">
                隐私政策
              </a>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4CAF50] hover:bg-[#3d9c40] text-white h-12 rounded-xl mt-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                注册中...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                创建账户 <ArrowRight className="ml-2 w-4 h-4" />
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
              <span className="px-2 bg-[#121212] text-[#8BAF92]">或使用社交账号注册</span>
            </div>
          </div>

          <div className="mt-6">
            <WechatLoginButton className="w-full" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8BAF92]">
            已有账户?{" "}
            <button onClick={() => router.push("/login")} className="text-[#4CAF50] font-medium">
              登录
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

