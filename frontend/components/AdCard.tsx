'use client'

import { useState } from 'react'
import { Ad } from '@/lib/api'
import { Eye, Coins, Clock } from 'lucide-react'

interface AdCardProps {
  ad: Ad
  onView: (adId: number) => void
}

export default function AdCard({ ad, onView }: AdCardProps) {
  const [isViewing, setIsViewing] = useState(false)

  const handleView = async () => {
    setIsViewing(true)
    try {
      await onView(ad.id)
    } finally {
      setIsViewing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Картинка */}
      {ad.image_url && (
        <div className="h-32 sm:h-40 overflow-hidden">
          <img 
            src={ad.image_url} 
            alt={ad.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Если картинка не загрузилась, скрываем её
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 pr-2">{ad.title}</h3>
          <div className="flex items-center space-x-1 text-yellow-600 flex-shrink-0">
            <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium text-sm sm:text-base">{ad.reward_amount}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm sm:text-base">{ad.description}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Доступно сегодня</span>
          </div>
          
          <button
            onClick={handleView}
            disabled={isViewing}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 sm:py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 touch-target"
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm sm:text-base">{isViewing ? 'Просмотр...' : 'Смотреть'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
