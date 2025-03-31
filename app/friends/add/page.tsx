"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, QrCode, Copy, Check, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"

// 模拟搜索结果
const MOCK_SEARCH_RESULTS = [
  {
    id: "user1",
    name: "李明",
    avatar: "L",
    mutualFriends: 2,
  },
  {
    id: "user2",
    name: "张华",
    avatar: "Z",
    mutualFriends: 0,
  },
  {
    id: "user3",
    name: "王芳",
    avatar: "W",
    mutualFriends: 1,
  },
]

export default function AddFriendPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof MOCK_SEARCH_RESULTS>([])
  const [friendCode, setFriendCode] = useState("MEMORY123456")
  const [copied, setCopied] = useState(false)
  const [sentRequests, setSentRequests] = useState<string[]>([])

  useEffect(() => {
    // 检查用户是否登录
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  // 处理搜索
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    // 在实际应用中，这里应该有API调用
    // 为了演示，我们使用模拟数据
    const results = MOCK_SEARCH_RESULTS.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setSearchResults(results)
  }

  // 处理复制好友码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(friendCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 处理发送好友请求
  const handleSendRequest = (userId: string) => {
    // 在实际应用中，这里应该有API调用
    // 为了演示，我们只更新本地状态
    setSentRequests([...sentRequests, userId])
  }

  // 如果用户未登录，不显示内容
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-5 pt-14 pb-3 flex items-center">
        <button
          onClick={() => router.push("/friends")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
        </button>
        <h1 className="text-xl font-bold">添加好友</h1>
      </header>

      {/* 标签页 */}
      <div className="px-5 mt-4">
        <Tabs defaultValue="search">
          <TabsList className="grid grid-cols-2 bg-[#1A2E22]">
            <TabsTrigger value="search" className="data-[state=active]:bg-[#2A3C33]">
              搜索
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-[#2A3C33]">
              好友码
            </TabsTrigger>
          </TabsList>

          {/* 搜索标签内容 */}
          <TabsContent value="search" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92] w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="搜索用户名"
                  className="bg-[#1A2E22] border-[#2A3C33] pl-10 focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
                />
              </div>

              <Button onClick={handleSearch} className="w-full bg-[#4CAF50] hover:bg-[#3d9c40]">
                搜索
              </Button>

              {/* 搜索结果 */}
              {searchResults.length > 0 ? (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-medium">搜索结果</h3>
                  {searchResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.3 }}
                      className="bg-[#1A2E22] rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#8BAF92] mr-3">
                            {result.avatar}
                          </div>
                          <div>
                            <h3 className="font-medium">{result.name}</h3>
                            <p className="text-xs text-[#8BAF92]">
                              {result.mutualFriends > 0 ? `${result.mutualFriends} 个共同好友` : "没有共同好友"}
                            </p>
                          </div>
                        </div>
                        {sentRequests.includes(result.id) ? (
                          <Button size="sm" disabled className="bg-[#2A3C33] text-[#8BAF92]">
                            <Check className="w-4 h-4 mr-1" />
                            已发送
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(result.id)}
                            className="bg-[#4CAF50] hover:bg-[#3d9c40]"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            添加
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="mt-6 text-center py-8">
                  <Search className="w-12 h-12 text-[#2A3C33] mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">未找到用户</h3>
                  <p className="text-sm text-[#8BAF92] max-w-xs mx-auto">没有找到匹配的用户，请尝试其他搜索词</p>
                </div>
              ) : null}
            </div>
          </TabsContent>

          {/* 好友码标签内容 */}
          <TabsContent value="code" className="mt-4">
            <div className="space-y-6">
              <div className="bg-[#1A2E22] rounded-xl p-6 flex flex-col items-center">
                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="w-32 h-32 text-[#121212]" />
                </div>
                <p className="text-sm text-[#8BAF92] mb-2">你的好友码</p>
                <div className="flex items-center bg-[#2A3C33] px-3 py-2 rounded-lg w-full">
                  <span className="flex-1 text-center font-mono text-lg">{friendCode}</span>
                  <button onClick={handleCopyCode} className="ml-2 text-[#8BAF92] hover:text-[#4CAF50]">
                    {copied ? <Check className="w-5 h-5 text-[#4CAF50]" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">添加好友</h3>
                <div className="relative">
                  <Input
                    placeholder="输入好友码"
                    className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
                  />
                </div>
                <Button className="w-full bg-[#4CAF50] hover:bg-[#3d9c40]">添加好友</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

