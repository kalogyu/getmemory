"use client"

import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Search, Trophy, Upload, Users } from "lucide-react"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/") return true
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1A14] border-t border-[#2A3C33] px-2 py-2 flex justify-around">
      <button onClick={() => router.push("/home")} className="flex flex-col items-center">
        <BookOpen className={`w-5 h-5 ${isActive("/home") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-[10px] mt-1 text-[#8BAF92]">学习</span>
      </button>
      <button onClick={() => router.push("/explore")} className="flex flex-col items-center">
        <Search className={`w-5 h-5 ${isActive("/explore") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-[10px] mt-1 text-[#8BAF92]">探索</span>
      </button>
      <button onClick={() => router.push("/upload")} className="flex flex-col items-center">
        <Upload className={`w-5 h-5 ${isActive("/upload") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-[10px] mt-1 text-[#8BAF92]">上传</span>
      </button>
      <button onClick={() => router.push("/friends")} className="flex flex-col items-center">
        <Users className={`w-5 h-5 ${isActive("/friends") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-[10px] mt-1 text-[#8BAF92]">好友</span>
      </button>
      <button onClick={() => router.push("/profile")} className="flex flex-col items-center">
        <Trophy className={`w-5 h-5 ${isActive("/profile") ? "text-[#4CAF50]" : "text-[#8BAF92]"}`} />
        <span className="text-[10px] mt-1 text-[#8BAF92]">我的</span>
      </button>
    </nav>
  )
}

