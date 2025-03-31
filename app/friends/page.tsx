"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, UserPlus, Check, X, Users, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BottomNav } from "@/components/bottom-nav"
import { getCurrentUser } from "@/lib/auth"

// 模拟好友数据
const MOCK_FRIENDS = [
  {
    id: "user1",
    name: "李明",
    avatar: "L",
    online: true,
    lastActive: "刚刚",
    mutualDecks: 2,
  },
  {
    id: "user2",
    name: "张华",
    avatar: "Z",
    online: false,
    lastActive: "2小时前",
    mutualDecks: 1,
  },
  {
    id: "user3",
    name: "王芳",
    avatar: "W",
    online: true,
    lastActive: "刚刚",
    mutualDecks: 3,
  },
]

// 模拟好友请求数据
const MOCK_FRIEND_REQUESTS = [
  {
    id: "req1",
    user: {
      id: "user4",
      name: "刘伟",
      avatar: "刘",
    },
    time: "1天前",
    message: "我们一起学习吧！",
  },
  {
    id: "req2",
    user: {
      id: "user5",
      name: "赵敏",
      avatar: "赵",
    },
    time: "3天前",
    message: "我看到你在学习历史，我也对历史很感兴趣。",
  },
]

// 模拟推荐好友数据
const MOCK_RECOMMENDED_FRIENDS = [
  {
    id: "rec1",
    name: "陈明",
    avatar: "陈",
    mutualFriends: 2,
    interests: ["历史", "科学"],
  },
  {
    id: "rec2",
    name: "林小",
    avatar: "林",
    mutualFriends: 1,
    interests: ["语言", "地理"],
  },
  {
    id: "rec3",
    name: "黄强",
    avatar: "黄",
    mutualFriends: 3,
    interests: ["科学", "数学"],
  },
]

export default function FriendsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("friends")
  const [friends, setFriends] = useState(MOCK_FRIENDS)
  const [friendRequests, setFriendRequests] = useState(MOCK_FRIEND_REQUESTS)
  const [recommendedFriends, setRecommendedFriends] = useState(MOCK_RECOMMENDED_FRIENDS)

  useEffect(() => {
    // 检查用户是否登录
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  // 过滤好友
  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // 处理接受好友请求
  const handleAcceptRequest = (requestId: string) => {
    // 在实际应用中，这里应该有API调用
    // 为了演示，我们只更新本地状态

    // 找到请求
    const request = friendRequests.find((req) => req.id === requestId)
    if (!request) return

    // 添加到好友列表
    const newFriend = {
      id: request.user.id,
      name: request.user.name,
      avatar: request.user.avatar,
      online: false,
      lastActive: "刚刚",
      mutualDecks: 0,
    }

    setFriends([...friends, newFriend])

    // 从请求列表中移除
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId))
  }

  // 处理拒绝好友请求
  const handleRejectRequest = (requestId: string) => {
    // 在实际应用中，这里应该有API调用
    // 为了演示，我们只更新本地状态
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId))
  }

  // 处理添加推荐好友
  const handleAddRecommended = (friendId: string) => {
    // 在实际应用中，这里应该有API调用
    // 为了演示，我们只更新本地状态

    // 找到推荐好友
    const recommended = recommendedFriends.find((rec) => rec.id === friendId)
    if (!recommended) return

    // 添加到好友列表
    const newFriend = {
      id: recommended.id,
      name: recommended.name,
      avatar: recommended.avatar,
      online: false,
      lastActive: "刚刚",
      mutualDecks: 0,
    }

    setFriends([...friends, newFriend])

    // 从推荐列表中移除
    setRecommendedFriends(recommendedFriends.filter((rec) => rec.id !== friendId))
  }

  // 如果用户未登录，不显示内容
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-5 pt-14 pb-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
          </button>
          <h1 className="text-xl font-bold">好友</h1>
        </div>
        <button
          onClick={() => router.push("/friends/add")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center"
        >
          <UserPlus className="w-5 h-5 text-[#8BAF92]" />
        </button>
      </header>

      {/* 搜索框 */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92] w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索好友"
            className="bg-[#1A2E22] border-[#2A3C33] pl-10 focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
          />
        </div>
      </div>

      {/* 标签页 */}
      <div className="px-5">
        <Tabs defaultValue="friends" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid grid-cols-3 bg-[#1A2E22]">
            <TabsTrigger value="friends" className="data-[state=active]:bg-[#2A3C33]">
              好友
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-[#2A3C33] relative">
              请求
              {friendRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4CAF50] rounded-full flex items-center justify-center text-xs">
                  {friendRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="discover" className="data-[state=active]:bg-[#2A3C33]">
              发现
            </TabsTrigger>
          </TabsList>

          {/* 好友列表 */}
          <TabsContent value="friends" className="mt-4 pb-24">
            {filteredFriends.length > 0 ? (
              <div className="space-y-3">
                {filteredFriends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                    className="bg-[#1A2E22] rounded-xl p-4 flex items-center"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#8BAF92]">
                        {friend.avatar}
                      </div>
                      {friend.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4CAF50] rounded-full border-2 border-[#1A2E22]"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{friend.name}</h3>
                        <span className="text-xs text-[#8BAF92]">{friend.online ? "在线" : friend.lastActive}</span>
                      </div>
                      <p className="text-xs text-[#8BAF92] mt-1">共同学习 {friend.mutualDecks} 个卡片集</p>
                    </div>
                    <button
                      onClick={() => router.push(`/messages/${friend.id}`)}
                      className="ml-2 w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center"
                    >
                      <MessageSquare className="w-5 h-5 text-[#8BAF92]" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-[#2A3C33] mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无好友</h3>
                <p className="text-sm text-[#8BAF92] max-w-xs">
                  {searchQuery ? "没有找到匹配的好友" : "添加好友一起学习吧"}
                </p>
                <Button onClick={() => router.push("/friends/add")} className="mt-6 bg-[#4CAF50] hover:bg-[#3d9c40]">
                  添加好友
                </Button>
              </div>
            )}
          </TabsContent>

          {/* 好友请求 */}
          <TabsContent value="requests" className="mt-4 pb-24">
            {friendRequests.length > 0 ? (
              <div className="space-y-3">
                {friendRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                    className="bg-[#1A2E22] rounded-xl p-4"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#8BAF92] mr-3">
                        {request.user.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium">{request.user.name}</h3>
                        <p className="text-xs text-[#8BAF92]">{request.time}</p>
                      </div>
                    </div>

                    {request.message && (
                      <p className="text-sm text-[#E0E7E3] bg-[#0F2318] p-3 rounded-lg mb-4">{request.message}</p>
                    )}

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-[#2A3C33] hover:bg-[#3C2A2A] border-none text-[#8BAF92] hover:text-[#E05252]"
                      >
                        <X className="w-4 h-4 mr-1" />
                        拒绝
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-[#4CAF50] hover:bg-[#3d9c40]"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        接受
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-[#2A3C33] mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无好友请求</h3>
                <p className="text-sm text-[#8BAF92] max-w-xs">当有人向你发送好友请求时，会显示在这里</p>
              </div>
            )}
          </TabsContent>

          {/* 发现好友 */}
          <TabsContent value="discover" className="mt-4 pb-24">
            <h3 className="text-lg font-medium mb-4">推荐好友</h3>
            {recommendedFriends.length > 0 ? (
              <div className="space-y-3">
                {recommendedFriends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                    className="bg-[#1A2E22] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#8BAF92] mr-3">
                          {friend.avatar}
                        </div>
                        <div>
                          <h3 className="font-medium">{friend.name}</h3>
                          <p className="text-xs text-[#8BAF92]">{friend.mutualFriends} 个共同好友</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddRecommended(friend.id)}
                        className="bg-[#4CAF50] hover:bg-[#3d9c40]"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        添加
                      </Button>
                    </div>

                    {friend.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {friend.interests.map((interest, i) => (
                          <span key={i} className="text-xs bg-[#2A3C33] px-2 py-1 rounded-full text-[#8BAF92]">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-[#2A3C33] mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无推荐好友</h3>
                <p className="text-sm text-[#8BAF92] max-w-xs">我们会根据你的学习兴趣推荐好友</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}

