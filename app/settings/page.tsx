"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Moon, Sun, Volume2, Bell, HelpCircle, LogOut } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (err) {
      // If there's an error parsing the user data, redirect to login
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user")

    // Redirect to login page
    router.push("/login")
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
        <h1 className="text-xl font-bold">设置</h1>
      </header>

      {/* 用户信息 */}
      <div className="px-6 py-4 mb-4">
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-[#1A2E22] flex items-center justify-center mr-4 text-xl font-bold text-[#4CAF50]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-medium">{user.name}</h2>
            <p className="text-sm text-[#8BAF92]">{user.email}</p>
          </div>
        </div>
      </div>

      {/* 设置选项 */}
      <main className="px-6 py-2">
        <div className="space-y-6">
          {/* 外观设置 */}
          <section>
            <h2 className="text-lg font-medium mb-4">外观</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#1A2E22] p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mr-3">
                    {darkMode ? (
                      <Moon className="w-5 h-5 text-[#8BAF92]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#8BAF92]" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">深色模式</p>
                    <p className="text-xs text-[#8BAF92]">减少眼睛疲劳</p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-[#4CAF50]"
                />
              </div>
            </div>
          </section>

          {/* 通知设置 */}
          <section>
            <h2 className="text-lg font-medium mb-4">通知</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#1A2E22] p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mr-3">
                    <Bell className="w-5 h-5 text-[#8BAF92]" />
                  </div>
                  <div>
                    <p className="font-medium">学习提醒</p>
                    <p className="text-xs text-[#8BAF92]">每日学习提醒</p>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-[#4CAF50]"
                />
              </div>

              <div className="flex items-center justify-between bg-[#1A2E22] p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mr-3">
                    <Volume2 className="w-5 h-5 text-[#8BAF92]" />
                  </div>
                  <div>
                    <p className="font-medium">声音效果</p>
                    <p className="text-xs text-[#8BAF92]">操作反馈音效</p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                  className="data-[state=checked]:bg-[#4CAF50]"
                />
              </div>
            </div>
          </section>

          {/* 其他选项 */}
          <section>
            <h2 className="text-lg font-medium mb-4">其他</h2>
            <div className="space-y-4">
              <button
                onClick={() => {}}
                className="w-full flex items-center justify-between bg-[#1A2E22] p-4 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#2A3C33] flex items-center justify-center mr-3">
                    <HelpCircle className="w-5 h-5 text-[#8BAF92]" />
                  </div>
                  <p className="font-medium">帮助与反馈</p>
                </div>
                <div className="text-[#8BAF92]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center bg-[#1A2E22] p-4 rounded-xl text-[#E05252]"
              >
                <div className="w-10 h-10 rounded-full bg-[#3C2A2A] flex items-center justify-center mr-3">
                  <LogOut className="w-5 h-5 text-[#E05252]" />
                </div>
                <p className="font-medium">退出登录</p>
              </button>
            </div>
          </section>

          <div className="pt-6 text-center text-xs text-[#8BAF92]">
            <p>记忆卡片 v1.0.0</p>
            <p className="mt-1">© 2025 记忆卡片团队</p>
          </div>
        </div>
      </main>
    </div>
  )
}

