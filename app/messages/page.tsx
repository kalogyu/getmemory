"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BookOpen, Award, Search, Trophy, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"

// 模拟消息数据
const MOCK_MESSAGES = [
  {
    id: 1,
    user: {
      id: "user1",
      name: "李明",
      avatar: "L",
    },
    lastMessage: "你好，我看到你最近在学习科学知识卡片，有什么心得吗？",
    time: "10:30",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    user: {
      id: "user2",
      name: "张华",
      avatar: "Z",
    },
    lastMessage: "我创建了一个新的历史卡片集，要不要一起学习？",
    time: "昨天",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    user: {
      id: "user3",
      name: "王芳",
      avatar: "W",
    },
    lastMessage: "谢谢分享的学习方法，我试了一下效果很好！",
    time: "周一",
    unread: 0,
    online: true,
  },
  {
    id: 4,
    user: {
      id: "user4",
      name: "学习小助手",
      avatar: "助",
    },
    lastMessage: "您已经连续学习7天了，真棒！继续保持！",
    time: "3天前",
    unread: 1,
    online: true,
    isBot: true,
  },
  {
    id: 5,
    user: {
      id: "user5",
      name: "刘伟",
      avatar: "刘",
    },
    lastMessage: "我看到你在广场上分享的学习成果，很厉害！",
    time: "上周",
    unread: 0,
    online: false,
  },
]

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messages, setMessages] = useState(MOCK_MESSAGES)

  useEffect(() => {
    // 检查用户是否登录
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  // 过滤消息
  const filteredMessages = messages.filter(
    (message) =>
      message.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // 如果用户未登录，不显示内容
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">消息</h1>
        <div className="flex items-center">
          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#4CAF50]"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* 搜索框 */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92] w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索消息"
            className="bg-[#1A2E22] border-[#2A3C33] pl-10 focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
          />
        </div>
      </div>

      {/* 消息列表 */}
      <div className="px-6 pb-24">
        {filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="bg-[#1A2E22] rounded-xl p-4 flex items-center cursor-pointer"
                onClick={() => router.push(`/messages/${message.id}`)}
              >
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      message.isBot ? "bg-[#2D4F3C] text-[#4CAF50]" : "bg-[#2A3C33] text-[#8BAF92]"
                    }`}
                  >
                    {message.user.avatar}
                  </div>
                  {message.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF50] rounded-full border-2 border-[#1A2E22]"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{message.user.name}</h3>
                    <span className="text-xs text-[#8BAF92]">{message.time}</span>
                  </div>
                  <p className="text-sm text-[#8BAF92] truncate">{message.lastMessage}</p>
                </div>
                {message.unread > 0 && (
                  <div className="ml-2 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center text-xs text-white">
                    {message.unread}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-12 h-12 text-[#2A3C33] mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无消息</h3>
            <p className="text-sm text-[#8BAF92] max-w-xs">
              {searchQuery ? "没有找到匹配的消息" : "开始与其他学习者交流吧"}
            </p>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1A14] border-t border-[#2A3C33] px-6 py-3 flex justify-around">
        <button onClick={() => router.push("/home")} className="flex flex-col items-center">
          <BookOpen className="w-6 h-6 text-[#8BAF92]" />
          <span className="text-xs mt-1 text-[#8BAF92]">学习</span>
        </button>
        <button onClick={() => router.push("/square")} className="flex flex-col items-center">
          <Award className="w-6 h-6 text-[#8BAF92]" />
          <span className="text-xs mt-1 text-[#8BAF92]">广场</span>
        </button>
        <button onClick={() => router.push("/explore")} className="flex flex-col items-center">
          <Search className="w-6 h-6 text-[#8BAF92]" />
          <span className="text-xs mt-1 text-[#8BAF92]">探索</span>
        </button>
        <button className="flex flex-col items-center">
          <MessageSquare className="w-6 h-6 text-[#4CAF50]" />
          <span className="text-xs mt-1 text-[#8BAF92]">消息</span>
        </button>
        <button onClick={() => router.push("/stats")} className="flex flex-col items-center">
          <Trophy className="w-6 h-6 text-[#8BAF92]" />
          <span className="text-xs mt-1 text-[#8BAF92]">统计</span>
        </button>
      </nav>
    </div>
  )
}

