"use client"

import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Award, Search, Trophy, MessageSquare } from "lucide-react"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/") return true
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1A14] border-t border-[#2A3C33] px-6 py-3 flex justify-around">
      <button onClick={() => router.push("/home")} className="flex flex-col items-center">
        <BookOpen className={`w-6 h-6 ${isActive("/home") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-xs mt-1 text-[#8BAF92]">学习</span>
      </button>
      <button onClick={() => router.push("/square")} className="flex flex-col items-center">
        <Award className={`w-6 h-6 ${isActive("/square") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-xs mt-1 text-[#8BAF92]">广场</span>
      </button>
      <button onClick={() => router.push("/explore")} className="flex flex-col items-center">
        <Search className={`w-6 h-6 ${isActive("/explore") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-xs mt-1 text-[#8BAF92]">探索</span>
      </button>
      <button onClick={() => router.push("/messages")} className="flex flex-col items-center">
        <MessageSquare className={`w-6 h-6 ${isActive("/messages") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-xs mt-1 text-[#8BAF92]">消息</span>
      </button>
      <button onClick={() => router.push("/stats")} className="flex flex-col items-center">
        <Trophy className={`w-6 h-6 ${isActive("/stats") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-xs mt-1 text-[#8BAF92]">统计</span>
      </button>
    </nav>
  )
}

