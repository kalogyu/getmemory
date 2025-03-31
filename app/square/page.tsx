"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Heart, MessageCircle, Share2, Send, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { addPoints, addRewardHistory, saveUserRewards, getUserRewards } from "@/lib/rewards"
import { RewardNotification } from "@/components/reward-notification"
import { BottomNav } from "@/components/bottom-nav"

export default function SquarePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [newComment, setNewComment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [newPost, setNewPost] = useState("")
  const [rewardNotification, setRewardNotification] = useState<{
    show: boolean
    points: number
    message: string
    levelUp: boolean
    newLevel?: { level: number; title: string }
  } | null>(null)

  // Mock community posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "张明",
      avatar: "Z",
      content: "今天完成了科学知识卡片集，感觉记忆力提升了不少！推荐大家也试试这个卡片集。",
      time: "2小时前",
      likes: 24,
      comments: 5,
      shares: 3,
      liked: false,
      deck: { id: "science", name: "科学知识" },
    },
    {
      id: 2,
      author: "李华",
      avatar: "L",
      content: "连续学习15天了，感觉自己的记忆力有了明显提升，特别是在记忆英语单词方面。",
      time: "5小时前",
      likes: 42,
      comments: 8,
      shares: 6,
      liked: true,
      deck: { id: "language", name: "语言学习" },
    },
    {
      id: 3,
      author: "王芳",
      avatar: "W",
      content: "有没有同学在用这个APP学习历史知识的？我创建了一个关于中国古代历史的卡片集，欢迎一起学习交流！",
      time: "昨天",
      likes: 18,
      comments: 12,
      shares: 2,
      liked: false,
      deck: { id: "history", name: "历史事件" },
    },
    {
      id: 4,
      author: "刘伟",
      avatar: "L",
      content: "分享一个学习技巧：每天固定时间学习，比如晚上睡前半小时，坚持下来效果很好。",
      time: "2天前",
      likes: 56,
      comments: 15,
      shares: 10,
      liked: false,
    },
  ])

  useEffect(() => {
    // Check if user is logged in
    const userData = getCurrentUser()
    if (!userData) {
      router.push("/login")
      return
    }

    setUser(userData)
  }, [router])

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked,
          }
        }
        return post
      }),
    )
  }

  const handleComment = (postId: number) => {
    if (!newComment.trim()) return

    // In a real app, you would send this to an API
    alert(`评论已提交: ${newComment}`)
    setNewComment("")
  }

  const handlePostSubmit = () => {
    if (!newPost.trim()) return

    // 在实际应用中，这里应该有发布帖子的API调用
    // 为了演示，我们只是添加一个新帖子到本地状态
    const newPostObj = {
      id: Date.now(),
      author: user?.name || "用户",
      avatar: user?.name.charAt(0).toUpperCase() || "U",
      content: newPost,
      time: "刚刚",
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
    }

    setPosts([newPostObj, ...posts])
    setNewPost("")

    // 添加发布内容的奖励
    const userRewards = getUserRewards()
    if (userRewards) {
      const updatedRewards = addPoints(userRewards, "COMMUNITY_POST")
      const rewardsWithHistory = addRewardHistory(updatedRewards, "COMMUNITY_POST")
      saveUserRewards(rewardsWithHistory)

      // 显示奖励通知
      setRewardNotification({
        show: true,
        points: updatedRewards.pointsAdded,
        message: updatedRewards.action,
        levelUp: updatedRewards.leveledUp,
        newLevel: updatedRewards.leveledUp ? updatedRewards.newLevel : undefined,
      })
    }
  }

  // If user is not loaded yet, show nothing
  if (!user) return null

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex items-center">
        <button
          onClick={() => router.push("/home")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
        </button>
        <h1 className="text-xl font-bold">学习广场</h1>
      </header>

      {/* 搜索框 */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8BAF92] w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索话题或用户"
            className="bg-[#1A2E22] border-[#2A3C33] pl-10 focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
          />
        </div>
      </div>

      {/* 发布框 */}
      <motion.div
        className="px-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-[#1A2E22] rounded-xl p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#4CAF50]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <Input
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="分享你的学习心得..."
                className="bg-[#0F2318] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handlePostSubmit}
              disabled={!newPost.trim()}
              className="bg-[#4CAF50] hover:bg-[#3d9c40] text-white disabled:opacity-50"
            >
              发布
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 帖子列表 */}
      <div className="px-6 pb-24">
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
              className="bg-[#1A2E22] rounded-xl p-4 shadow-md"
            >
              <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center text-lg font-bold text-[#4CAF50] mr-3">
                  {post.avatar}
                </div>
                <div>
                  <h3 className="font-medium">{post.author}</h3>
                  <p className="text-xs text-[#8BAF92]">{post.time}</p>
                </div>
              </div>

              <p className="mb-4">{post.content}</p>

              {post.deck && (
                <div
                  className="mb-4 bg-[#2A3C33] rounded-lg p-2 inline-block cursor-pointer"
                  onClick={() => router.push(`/deck/${post.deck.id}`)}
                >
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-[#4CAF50]" />
                    <span className="text-sm">{post.deck.name}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between border-t border-[#2A3C33] pt-3">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center ${post.liked ? "text-red-400" : "text-[#8BAF92]"}`}
                >
                  <Heart className={`w-5 h-5 mr-1 ${post.liked ? "fill-red-400" : ""}`} />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center text-[#8BAF92]">
                  <MessageCircle className="w-5 h-5 mr-1" />
                  <span>{post.comments}</span>
                </button>
                <button className="flex items-center text-[#8BAF92]">
                  <Share2 className="w-5 h-5 mr-1" />
                  <span>{post.shares}</span>
                </button>
              </div>

              {/* 评论输入框 */}
              <div className="mt-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#2A3C33] flex items-center justify-center text-sm font-bold text-[#4CAF50] mr-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 relative">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="添加评论..."
                    className="bg-[#0F2318] border-[#2A3C33] pr-10 focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#4CAF50]"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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

      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}

