"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare } from "lucide-react"

export function MessageBadge() {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // 模拟获取未读消息数量
    // 在实际应用中，这应该是从API获取的
    setUnreadCount(3)
  }, [])

  return (
    <div className="relative">
      <button onClick={() => router.push("/messages")} className="flex flex-col items-center">
        <MessageSquare className="w-6 h-6 text-[#8BAF92]" />
        <span className="text-xs mt-1 text-[#8BAF92]">消息</span>
      </button>
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E05252] rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">{unreadCount}</span>
        </div>
      )}
    </div>
  )
}

