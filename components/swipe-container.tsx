"use client"

import type { ReactNode } from "react"
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion"

interface SwipeContainerProps {
  children: ReactNode
  onSwipeComplete: () => void
  onSwipePrevious?: () => void
  hasPrevious?: boolean
  // 添加新的属性来传递滑动状态
  onDragUpdate?: (x: number, y: number, scale: number, opacity: number) => void
}

export function SwipeContainer({
  children,
  onSwipeComplete,
  onSwipePrevious,
  hasPrevious = false,
  onDragUpdate,
}: SwipeContainerProps) {
  // 用于控制卡片的位置
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // 根据位置计算透明度和缩放
  const opacity = useTransform([x, y], ([latestX, latestY]) => {
    const distance = Math.sqrt(latestX * latestX + latestY * latestY)
    return 1 - Math.min(distance / 150, 0.6)
  })

  const scale = useTransform([x, y], ([latestX, latestY]) => {
    const distance = Math.sqrt(latestX * latestX + latestY * latestY)
    return 1 - Math.min(distance / 500, 0.1)
  })

  const handleDrag = (_: any, info: PanInfo) => {
    // 允许水平和垂直方向的拖动
    x.set(info.offset.x)
    y.set(info.offset.y)

    // 将滑动状态传递给父组件
    if (onDragUpdate) {
      onDragUpdate(info.offset.x, info.offset.y, scale.get(), opacity.get())
    }
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    // 滑动距离
    const distance = Math.sqrt(info.offset.x * info.offset.x + info.offset.y * info.offset.y)

    // 滑动阈值
    const THRESHOLD = 60

    if (distance > THRESHOLD) {
      // 向右滑动 (x > 0)
      if (info.offset.x > THRESHOLD && hasPrevious && onSwipePrevious) {
        // 不重置位置，让卡片消失
        onSwipePrevious()
        return
      }

      // 向上滑动或其他方向
      else if (Math.abs(info.offset.y) > Math.abs(info.offset.x) || info.offset.x < 0) {
        // 不重置位置，让卡片消失
        onSwipeComplete()
        return
      }
    }

    // 如果没有达到滑动阈值，重置位置
    x.set(0)
    y.set(0)

    // 通知父组件滑动结束
    if (onDragUpdate) {
      onDragUpdate(0, 0, 1, 1)
    }
  }

  return (
    <motion.div
      style={{ x, y, opacity, scale }}
      drag={true}
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.7}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      className="w-full h-full cursor-grab active:cursor-grabbing touch-manipulation"
    >
      {children}
    </motion.div>
  )
}

