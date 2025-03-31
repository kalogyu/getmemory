"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, MoreVertical, Image, Paperclip, Mic, Smile } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"

// 模拟用户数据
const MOCK_USERS = {
  user1: {
    id: "user1",
    name: "李明",
    avatar: "L",
    online: true,
  },
  user2: {
    id: "user2",
    name: "张华",
    avatar: "Z",
    online: false,
  },
  user3: {
    id: "user3",
    name: "王芳",
    avatar: "W",
    online: true,
  },
  user4: {
    id: "user4",
    name: "学习小助手",
    avatar: "助",
    online: true,
    isBot: true,
  },
  user5: {
    id: "user5",
    name: "刘伟",
    avatar: "刘",
    online: false,
  },
}

// 模拟对话数据
const MOCK_CONVERSATIONS = {
  1: [
    {
      id: 1,
      senderId: "user1",
      text: "你好，我看到你最近在学习科学知识卡片，有什么心得吗？",
      time: "10:25",
      status: "read",
    },
    {
      id: 2,
      senderId: "currentUser",
      text: "你好！是的，我发现用间隔重复法学习效果很好，每天复习一点，记忆更持久。",
      time: "10:28",
      status: "read",
    },
    {
      id: 3,
      senderId: "user1",
      text: "间隔重复法确实很有效。你用这个应用多久了？",
      time: "10:30",
      status: "read",
    },
  ],
  2: [
    {
      id: 1,
      senderId: "user2",
      text: "嗨，最近在学什么？",
      time: "昨天 14:20",
      status: "read",
    },
    {
      id: 2,
      senderId: "currentUser",
      text: "我在学习一些历史知识，主要是中国古代史。",
      time: "昨天 14:35",
      status: "read",
    },
    {
      id: 3,
      senderId: "user2",
      text: "太巧了，我刚创建了一个历史卡片集，要不要一起学习？",
      time: "昨天 14:40",
      status: "read",
    },
  ],
  3: [
    {
      id: 1,
      senderId: "currentUser",
      text: "你好，我想请教一下你是怎么安排每天的学习计划的？",
      time: "周一 09:15",
      status: "read",
    },
    {
      id: 2,
      senderId: "user3",
      text: "我一般会在早上花30分钟复习前一天的内容，晚上学习新内容。周末做一次全面复习。",
      time: "周一 09:30",
      status: "read",
    },
    {
      id: 3,
      senderId: "currentUser",
      text: "这个方法听起来不错，我会试试看。谢谢分享！",
      time: "周一 09:45",
      status: "read",
    },
    {
      id: 4,
      senderId: "user3",
      text: "不客气！希望对你有帮助。记得保持规律性，这很重要。",
      time: "周一 10:00",
      status: "read",
    },
    {
      id: 5,
      senderId: "currentUser",
      text: "我试了你的方法，效果真的很好！",
      time: "周三 20:15",
      status: "read",
    },
    {
      id: 6,
      senderId: "user3",
      text: "谢谢分享的学习方法，我试了一下效果很好！",
      time: "周三 20:30",
      status: "read",
    },
  ],
  4: [
    {
      id: 1,
      senderId: "user4",
      text: "欢迎使用记忆卡片！我是你的学习小助手，有任何问题都可以问我。",
      time: "3天前 08:00",
      status: "read",
    },
    {
      id: 2,
      senderId: "user4",
      text: "我注意到你已经连续学习6天了，再坚持一天就是一周啦！",
      time: "昨天 08:00",
      status: "read",
    },
    {
      id: 3,
      senderId: "user4",
      text: "恭喜你！您已经连续学习7天了，真棒！继续保持！",
      time: "今天 08:00",
      status: "unread",
    },
  ],
  5: [
    {
      id: 1,
      senderId: "user5",
      text: "嗨，我在广场上看到你分享的学习成果，很厉害！",
      time: "上周五 16:20",
      status: "read",
    },
    {
      id: 2,
      senderId: "currentUser",
      text: "谢谢夸奖！我只是坚持每天学习一点点。",
      time: "上周五 16:30",
      status: "read",
    },
    {
      id: 3,
      senderId: "user5",
      text: "坚持很重要！我们可以互相监督学习。",
      time: "上周五 16:35",
      status: "read",
    },
    {
      id: 4,
      senderId: "currentUser",
      text: "好主意！我们可以每周分享一下学习进度。",
      time: "上周五 16:40",
      status: "read",
    },
  ],
}

export default function MessageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const conversationId = Number.parseInt(params.id)
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [conversation, setConversation] = useState<any[]>([])
  const [otherUser, setOtherUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 检查用户是否登录
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setCurrentUser(userData)

    // 获取对话数据
    if (MOCK_CONVERSATIONS[conversationId as keyof typeof MOCK_CONVERSATIONS]) {
      const messages = MOCK_CONVERSATIONS[conversationId as keyof typeof MOCK_CONVERSATIONS]
      setConversation(messages)

      // 找到对话中的另一个用户
      const otherUserId = messages[0].senderId === "currentUser" ? messages[1].senderId : messages[0].senderId
      setOtherUser(MOCK_USERS[otherUserId as keyof typeof MOCK_USERS])
    } else {
      router.push("/messages")
    }
  }, [router, conversationId])

  useEffect(() => {
    // 滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const newMsg = {
      id: conversation.length + 1,
      senderId: "currentUser",
      text: newMessage,
      time: "刚刚",
      status: "sent",
    }

    setConversation([...conversation, newMsg])
    setNewMessage("")

    // 模拟回复
    if (otherUser?.isBot) {
      setTimeout(() => {
        const botReply = {
          id: conversation.length + 2,
          senderId: otherUser.id,
          text: "谢谢您的消息！我会继续为您提供学习支持。有任何问题随时问我！",
          time: "刚刚",
          status: "sent",
        }
        setConversation((prev) => [...prev, botReply])
      }, 1000)
    }
  }

  // 如果用户未登录或数据未加载，不显示内容
  if (!currentUser || !otherUser) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3] flex flex-col">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between border-b border-[#2A3C33]">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/messages")}
            className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
          </button>
          <div className="flex items-center">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                  otherUser.isBot ? "bg-[#2D4F3C] text-[#4CAF50]" : "bg-[#2A3C33] text-[#8BAF92]"
                } mr-3`}
              >
                {otherUser.avatar}
              </div>
              {otherUser.online && (
                <div className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-[#4CAF50] rounded-full border-2 border-[#121212]"></div>
              )}
            </div>
            <div>
              <h2 className="font-medium">{otherUser.name}</h2>
              <p className="text-xs text-[#8BAF92]">{otherUser.online ? "在线" : "离线"}</p>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-[#8BAF92]" />
        </button>
      </header>

      {/* 消息区域 */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {conversation.map((message) => {
          const isCurrentUser = message.senderId === "currentUser"
          const sender = isCurrentUser ? currentUser : MOCK_USERS[message.senderId as keyof typeof MOCK_USERS]

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              {!isCurrentUser && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                    sender.isBot ? "bg-[#2D4F3C] text-[#4CAF50]" : "bg-[#2A3C33] text-[#8BAF92]"
                  }`}
                >
                  {sender.avatar}
                </div>
              )}
              <div className="max-w-[70%]">
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isCurrentUser
                      ? "bg-[#4CAF50] text-white rounded-tr-none"
                      : "bg-[#1A2E22] text-[#E0E7E3] rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <div className={`text-xs text-[#8BAF92] mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                  {message.time}
                </div>
              </div>
              {isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-[#2A3C33] flex items-center justify-center text-sm font-bold ml-2 text-[#8BAF92]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-[#2A3C33] bg-[#0F1A14]">
        <div className="flex items-center">
          <div className="flex space-x-2 mr-2">
            <button className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-[#8BAF92]" />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center">
              <Image className="w-5 h-5 text-[#8BAF92]" />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center">
              <Mic className="w-5 h-5 text-[#8BAF92]" />
            </button>
          </div>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Smile className="w-5 h-5 text-[#8BAF92]" />
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center ml-2 ${
              newMessage.trim() ? "bg-[#4CAF50]" : "bg-[#1A2E22]"
            }`}
          >
            <Send className={`w-5 h-5 ${newMessage.trim() ? "text-white" : "text-[#8BAF92]"}`} />
          </button>
        </div>
      </div>
    </div>
  )
}

