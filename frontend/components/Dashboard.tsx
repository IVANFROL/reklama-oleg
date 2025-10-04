'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Ad, Application } from '@/lib/api'
import { adsAPI, applicationsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { LogOut, Coins, Eye, FileText, Plus } from 'lucide-react'
import AdCard from './AdCard'
import ApplicationForm from './ApplicationForm'
import ApplicationsList from './ApplicationsList'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'ads' | 'applications'>('ads')
  const [ads, setAds] = useState<Ad[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [balance, setBalance] = useState(user?.balance || 0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [adsData, applicationsData] = await Promise.all([
        adsAPI.getAds(),
        applicationsAPI.getUserApplications()
      ])
      setAds(adsData)
      setApplications(applicationsData)
    } catch (error) {
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleAdView = async (adId: number) => {
    try {
      const adView = await adsAPI.viewAd(adId)
      setBalance(prev => prev + adView.reward_earned)
      toast.success(`Получено ${adView.reward_earned} монет!`)
      loadData() // Reload ads to update availability
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка просмотра рекламы')
    }
  }

  const handleApplicationSubmit = async (applicationData: { title: string; description: string }) => {
    try {
      await applicationsAPI.createApplication(applicationData)
      // Обновляем баланс (списываем 50 монет)
      setBalance(prev => prev - 50)
      toast.success('Заявка отправлена! Списано 50 монет.')
      loadData() // Reload applications
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка отправки заявки')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 sm:pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Мобильная версия заголовка */}
          <div className="sm:hidden py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-gray-900">Личный кабинет</h1>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 touch-target"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Выйти</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-full">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 text-sm">{balance} монет</span>
              </div>
              <span className="text-sm text-gray-700">Привет, {user?.username}!</span>
            </div>
          </div>

          {/* Десктопная версия заголовка */}
          <div className="hidden sm:flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">{balance} монет</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Привет, {user?.username}!</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-md transition-colors flex-1 sm:flex-none touch-target ${
              activeTab === 'ads'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Реклама</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-md transition-colors flex-1 sm:flex-none touch-target ${
              activeTab === 'applications'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Заявки</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'ads' ? (
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Доступная реклама</h2>
              <p className="text-sm sm:text-base text-gray-600">Смотрите рекламу и получайте голду</p>
            </div>
            
            {ads.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Eye className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Нет доступной рекламы</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} onView={handleAdView} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Мои заявки</h2>
                <p className="text-gray-600">Отправляйте заявки и отслеживайте их статус</p>
              </div>
              <ApplicationForm onSubmit={handleApplicationSubmit} />
            </div>
            
            <ApplicationsList applications={applications} />
          </div>
        )}
      </div>
    </div>
  )
}
