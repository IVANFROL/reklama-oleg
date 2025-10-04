'use client'

import { useState, useEffect } from 'react'
import { X, Eye, Coins } from 'lucide-react'
import { adsAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function FloatingAdBanner() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentAd, setCurrentAd] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRandomAd()
  }, [])

  useEffect(() => {
    if (currentAd) {
      console.log('FloatingAdBanner currentAd:', currentAd)
      console.log('Image URL:', currentAd.image_url)
      console.log('Has image_url?', !!currentAd.image_url)
    } else {
      console.log('No currentAd loaded yet')
    }
  }, [currentAd])

  const loadRandomAd = async () => {
    try {
      const ads = await adsAPI.getAds()
      if (ads.length > 0) {
        // Приоритет для рекламы Сбербанка с вашей картинкой
        const sberbankAd = ads.find(ad => ad.title.includes('Сбербанк'))
        if (sberbankAd) {
          console.log('Показываем рекламу Сбербанка:', sberbankAd)
          setCurrentAd(sberbankAd)
        } else {
          const randomAd = ads[Math.floor(Math.random() * ads.length)]
          setCurrentAd(randomAd)
        }
      }
    } catch (error) {
      console.error('Error loading ads:', error)
    }
  }

  const handleViewAd = async () => {
    if (!currentAd || !user) return
    
    setIsLoading(true)
    try {
      const adView = await adsAPI.viewAd(currentAd.id)
      toast.success(`Получено ${adView.reward_earned} монет!`)
      // Загружаем новую рекламу
      loadRandomAd()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка просмотра рекламы')
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback ad if no currentAd loaded - показываем рекламу Сбербанка
  const displayAd = currentAd || {
    id: 6,
    title: "Сбербанк - Оплата улыбкой",
    description: "Как подключить оплату улыбкой? Вместо карты и телефона. Подключить можно в приложении банка",
    reward_amount: 25,
    image_url: "https://i.ytimg.com/vi/PET3rLiRPD8/mqdefault.jpg"
  }

  // Debug displayAd after it's defined
  useEffect(() => {
    console.log('DisplayAd image URL:', displayAd?.image_url)
    console.log('Component rendered, displayAd:', displayAd)
    console.log('Should show image:', displayAd.image_url)
  }, [displayAd])

  if (!isVisible || !user) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-xl safe-area-bottom">
      {!isMinimized ? (
        <div className="mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-7xl">
          {/* Мобильная версия */}
          <div className="flex flex-col sm:hidden space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Реклама
                </div>
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="h-3 w-3" />
                  <span className="text-xs font-medium">+{displayAd.reward_amount}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 hover:text-gray-600 p-1 touch-target"
                  title="Свернуть"
                >
                  <div className="w-4 h-1 bg-current rounded"></div>
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 touch-target"
                  title="Закрыть"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {displayAd.title}
                </div>
                <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {displayAd.description}
                </div>
              </div>
              
              {/* БОЛЬШАЯ КАРТИНКА СПРАВА */}
              <div className="flex-shrink-0 w-32 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl shadow-xl border-3 border-white flex items-center justify-center">
                <img 
                  src={displayAd.image_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"}
                  alt={displayAd.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  style={{ 
                    display: 'block',
                    visibility: 'visible',
                    opacity: '1'
                  }}
                  onLoad={() => console.log('✅ БОЛЬШОЕ изображение загружено:', displayAd.title)}
                  onError={(e) => {
                    console.log('❌ Ошибка загрузки БОЛЬШОГО изображения');
                    // Показываем большую иконку вместо изображения
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="text-white text-4xl">📱</div>';
                  }}
                />
              </div>
            </div>
            
            <button
              onClick={handleViewAd}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors touch-target"
            >
              <Eye className="h-4 w-4" />
              <span>{isLoading ? 'Загрузка...' : 'Смотреть рекламу'}</span>
            </button>
          </div>

          {/* Десктопная версия */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Имитация рекламного блока */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                <div className="text-sm font-medium">Реклама</div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {displayAd.title}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {displayAd.description}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">+{displayAd.reward_amount}</span>
                </div>
                
                <button
                  onClick={handleViewAd}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>{isLoading ? 'Загрузка...' : 'Смотреть'}</span>
                </button>
              </div>
              
              {/* БОЛЬШАЯ КАРТИНКА СПРАВА ДЕСКТОП */}
              <div className="flex-shrink-0 w-40 h-28 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl shadow-xl border-3 border-white flex items-center justify-center">
                <img 
                  src={displayAd.image_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"}
                  alt={displayAd.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                  style={{ 
                    display: 'block',
                    visibility: 'visible',
                    opacity: '1'
                  }}
                  onLoad={() => console.log('✅ БОЛЬШОЕ Desktop изображение загружено:', displayAd.title)}
                  onError={(e) => {
                    console.log('❌ Desktop ошибка загрузки БОЛЬШОГО изображения');
                    // Показываем большую иконку вместо изображения
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="text-white text-5xl">💻</div>';
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Свернуть"
              >
                <div className="w-4 h-1 bg-current rounded"></div>
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Реклама</span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-600 hover:text-gray-800 text-sm touch-target"
          >
            Развернуть
          </button>
        </div>
      )}
      
      {/* Placeholder для будущей интеграции с Яндекс.Директ */}
      <div className="hidden">
        {/* Здесь будет код Яндекс.Директ */}
        <div id="yandex-rtb-banner" className="yandex-ad"></div>
      </div>
    </div>
  )
}
