"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, FileText, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { getCurrentUser } from "@/lib/auth"
import { addPoints, addRewardHistory, saveUserRewards, getUserRewards } from "@/lib/rewards"
import { RewardNotification } from "@/components/reward-notification"

export default function UploadDatasetPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [rewardNotification, setRewardNotification] = useState<{
    show: boolean
    points: number
    message: string
    levelUp: boolean
    newLevel?: { level: number; title: string }
  } | null>(null)

  useEffect(() => {
    // 检查用户是否登录
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 检查文件类型
    if (
      selectedFile.type !== "text/csv" &&
      selectedFile.type !== "application/vnd.ms-excel" &&
      selectedFile.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      setFileError("请上传CSV或Excel文件")
      setFile(null)
      return
    }

    // 检查文件大小 (限制为10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("文件大小不能超过10MB")
      setFile(null)
      return
    }

    setFileError("")
    setFile(selectedFile)
  }

  // 处理文件移除
  const handleRemoveFile = () => {
    setFile(null)
    setFileError("")
  }

  // 处理上传
  const handleUpload = async () => {
    if (!title.trim()) {
      setFileError("请输入数据集标题")
      return
    }

    if (!file) {
      setFileError("请选择要上传的文件")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 200)

    // 模拟上传完成
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
      setIsUploading(false)
      setUploadComplete(true)

      // 添加创建卡片集的奖励
      const userRewards = getUserRewards()
      if (userRewards) {
        const updatedRewards = addPoints(userRewards, "CREATE_DECK")
        const rewardsWithHistory = addRewardHistory(updatedRewards, "CREATE_DECK")
        saveUserRewards(rewardsWithHistory)

        // 显示奖励通知
        setRewardNotification({
          show: true,
          points: updatedRewards.pointsAdded,
          message: "创建新卡片集",
          levelUp: updatedRewards.leveledUp,
          newLevel: updatedRewards.leveledUp ? updatedRewards.newLevel : undefined,
        })
      }

      // 3秒后跳转到首页
      setTimeout(() => {
        router.push("/home")
      }, 3000)
    }, 3000)
  }

  // 如果用户未登录，不显示内容
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/home")}
            className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
          </button>
          <h1 className="text-xl font-bold">上传数据集</h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="px-5 py-4">
        {!uploadComplete ? (
          <div className="space-y-6">
            {/* 数据集信息 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#8BAF92]">数据集标题</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入数据集标题"
                  className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#8BAF92]">描述（可选）</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述这个数据集的内容和用途"
                  className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-[#8BAF92]">公开数据集</label>
                  <p className="text-xs text-[#8BAF92] mt-1">允许其他用户查看和使用</p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-[#4CAF50]"
                />
              </div>
            </div>

            {/* 文件上传 */}
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2 text-[#8BAF92]">上传文件</label>

              {!file ? (
                <div className="border-2 border-dashed border-[#2A3C33] rounded-xl p-6 text-center">
                  <Upload className="w-12 h-12 text-[#8BAF92] mx-auto mb-4" />
                  <p className="text-[#8BAF92] mb-4">拖放文件到这里或点击上传</p>
                  <p className="text-xs text-[#8BAF92] mb-4">支持CSV和Excel文件，最大10MB</p>
                  <Button
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="bg-[#2A3C33] hover:bg-[#4CAF50] text-[#8BAF92] hover:text-white"
                  >
                    选择文件
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-[#1A2E22] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-[#8BAF92]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-[#8BAF92]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="w-8 h-8 rounded-full bg-[#2A3C33] flex items-center justify-center text-[#8BAF92]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="flex items-center text-[#E05252] text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {fileError}
                </div>
              )}
            </div>

            {/* 上传按钮 */}
            <div className="pt-4">
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full bg-[#4CAF50] hover:bg-[#3d9c40] text-white py-6 relative"
              >
                {isUploading ? (
                  <>
                    <div
                      className="absolute inset-0 bg-[#4CAF50] rounded-md"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span className="relative">上传中... {uploadProgress}%</span>
                  </>
                ) : (
                  "上传数据集"
                )}
              </Button>
              <p className="text-xs text-center text-[#8BAF92] mt-4">
                上传即表示您同意我们的
                <a href="#" className="text-[#4CAF50]">
                  服务条款
                </a>
                和
                <a href="#" className="text-[#4CAF50]">
                  隐私政策
                </a>
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#2D4F3C] flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-[#4CAF50]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">上传成功！</h2>
            <p className="text-[#8BAF92] mb-6">您的数据集"{title}"已成功上传，正在处理中...</p>
            <p className="text-sm text-[#8BAF92]">处理完成后，您将收到通知</p>
          </motion.div>
        )}
      </main>

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
    </div>
  )
}

