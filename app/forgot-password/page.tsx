"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const router = useRouter()
  // Replace the email state with phone number and verification code states
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Add a countdown state
  const [countdown, setCountdown] = useState(0)

  // Add a function to send verification code
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
      setIsSendingCode(false)
    }
  }

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phone) {
      setError("请输入您的手机号码")
      return
    }

    if (showVerificationInput && !verificationCode) {
      setError("请输入验证码")
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

      // Show success message
      setIsSubmitted(true)
    } catch (err) {
      setError("重置密码失败，请稍后再试")
    } finally {
      setIsLoading(false)
    }
  }

  // Replace the form JSX with the updated version
  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3] flex flex-col">
      {/* Header */}
      <motion.header
        className="px-6 pt-12 pb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => router.push("/login")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mb-6"
        >
          <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
        </button>

        <h1 className="text-2xl font-bold">忘记密码</h1>
        <p className="text-sm text-[#8BAF92] mt-1">
          {!isSubmitted ? "输入您的手机号码，我们将发送验证码帮助您重置密码" : "重置链接已发送，请查看您的手机短信"}
        </p>
      </motion.header>

      {/* Form */}
      <motion.div
        className="flex-1 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {showVerificationInput && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-[#8BAF92]" htmlFor="verificationCode">
                    验证码
                  </label>
                  <button
                    type="button"
                    onClick={sendVerificationCode}
                    className="text-xs text-[#4CAF50]"
                    disabled={isSendingCode || countdown > 0}
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
            )}

            {!showVerificationInput ? (
              <Button
                type="button"
                onClick={sendVerificationCode}
                disabled={isSendingCode}
                className="w-full bg-[#4CAF50] hover:bg-[#3d9c40] text-white h-12 rounded-xl"
              >
                {isSendingCode ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    发送中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    发送验证码 <Send className="ml-2 w-4 h-4" />
                  </div>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4CAF50] hover:bg-[#3d9c40] text-white h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    提交中...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    重置密码 <Send className="ml-2 w-4 h-4" />
                  </div>
                )}
              </Button>
            )}
          </form>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-[#1A2E22] flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 12.5V15C22 18.3137 22 20 20 20H4C2 20 2 18.3137 2 15V9C2 5.68629 2 4 4 4H20C22 4 22 5.68629 22 9V10.5"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 12.5L17.5 9.5L13 12.5"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 9L12 15L17.5 11.5"
                  stroke="#4CAF50"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold mb-2">验证码已发送</h2>
            <p className="text-[#8BAF92] mb-6">我们已向 {phone} 发送了重置密码的验证码，请查看您的手机短信</p>

            <Button
              onClick={() => router.push("/login")}
              className="bg-[#1A2E22] hover:bg-[#2A3C33] text-[#E0E7E3] h-12 rounded-xl px-6"
            >
              返回登录
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

