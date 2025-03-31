"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function CreateDeckPage() {
  const router = useRouter()
  const [deckTitle, setDeckTitle] = useState("")
  const [cards, setCards] = useState([
    { id: 1, front: "", back: "" },
    { id: 2, front: "", back: "" },
  ])

  const addCard = () => {
    const newId = cards.length > 0 ? Math.max(...cards.map((card) => card.id)) + 1 : 1
    setCards([...cards, { id: newId, front: "", back: "" }])
  }

  const removeCard = (id: number) => {
    if (cards.length <= 1) return // 至少保留一张卡片
    setCards(cards.filter((card) => card.id !== id))
  }

  const updateCard = (id: number, field: "front" | "back", value: string) => {
    setCards(cards.map((card) => (card.id === id ? { ...card, [field]: value } : card)))
  }

  const handleSave = () => {
    // 这里应该有保存逻辑，例如API调用
    // 简单起见，我们直接返回首页
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E7E3]">
      {/* 顶部导航栏 */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-[#8BAF92]" />
        </button>
        <h1 className="text-xl font-bold">创建卡片集</h1>
        <button onClick={handleSave} className="w-10 h-10 rounded-full bg-[#1A2E22] flex items-center justify-center">
          <Save className="w-5 h-5 text-[#8BAF92]" />
        </button>
      </header>

      {/* 主内容区 */}
      <main className="px-6 pb-24">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#8BAF92]">卡片集名称</label>
          <Input
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="输入卡片集名称"
            className="bg-[#1A2E22] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3]"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-[#8BAF92]">卡片 ({cards.length})</label>
            <button onClick={addCard} className="flex items-center text-xs text-[#4CAF50]">
              <Plus className="w-4 h-4 mr-1" /> 添加卡片
            </button>
          </div>

          <div className="space-y-6">
            {cards.map((card, index) => (
              <div key={card.id} className="bg-[#1A2E22] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">卡片 {index + 1}</h3>
                  <button onClick={() => removeCard(card.id)} className="text-[#E05252]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#8BAF92] mb-1">问题（正面）</label>
                    <Textarea
                      value={card.front}
                      onChange={(e) => updateCard(card.id, "front", e.target.value)}
                      placeholder="输入问题"
                      className="bg-[#0F2318] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#8BAF92] mb-1">答案（背面）</label>
                    <Textarea
                      value={card.back}
                      onChange={(e) => updateCard(card.id, "back", e.target.value)}
                      placeholder="输入答案"
                      className="bg-[#0F2318] border-[#2A3C33] focus-visible:ring-[#4CAF50] text-[#E0E7E3] min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full bg-[#4CAF50] hover:bg-[#3d9c40] text-white py-6">
          保存卡片集
        </Button>
      </main>
    </div>
  )
}

