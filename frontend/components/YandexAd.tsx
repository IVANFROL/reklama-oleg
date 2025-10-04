'use client'

import { useEffect, useRef } from 'react'

interface YandexAdProps {
  blockId?: string
  renderTo?: string
  async?: boolean
}

export default function YandexAd({ 
  blockId = "R-A-123456-1", 
  renderTo = "yandex_rtb_banner",
  async = true 
}: YandexAdProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Загрузка скрипта Яндекс.Директ (только в продакшене)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = async
      script.src = 'https://an.yandex.ru/system/context.js'
      document.head.appendChild(script)

      script.onload = () => {
        // Инициализация рекламного блока
        if ((window as any).Ya && (window as any).Ya.Context && (window as any).Ya.Context.AdvManager) {
          (window as any).Ya.Context.AdvManager.render({
            blockId: blockId,
            renderTo: renderTo,
            async: async
          })
        }
      }

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [blockId, renderTo, async])

  return (
    <div className="yandex-ad-container">
      <div id={renderTo} ref={adRef} className="yandex-ad-block">
        {/* В разработке показываем заглушку */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 border border-gray-300 p-4 text-center text-gray-600 rounded">
            <div className="text-sm font-medium mb-2">Яндекс.Директ</div>
            <div className="text-xs">
              Здесь будет показываться реклама от Яндекса
              <br />
              Block ID: {blockId}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Типы для Яндекс.Директ API
declare global {
  interface Window {
    Ya?: {
      Context?: {
        AdvManager?: {
          render: (config: {
            blockId: string
            renderTo: string
            async?: boolean
          }) => void
        }
      }
    }
  }
}


