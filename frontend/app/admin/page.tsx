'use client'

import { useState, useEffect } from 'react'
import { Application } from '@/lib/api'
import { applicationsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, RefreshCw, FileText, User, Calendar, Coins, Camera, Video } from 'lucide-react'

export default function AdminPanel() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const data = await applicationsAPI.getAllApplications()
      setApplications(data)
    } catch (error) {
      toast.error('Ошибка загрузки заявок')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, status)
      toast.success('Статус заявки обновлен')
      loadApplications()
    } catch (error) {
      toast.error('Ошибка обновления статуса')
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Одобрена'
      case 'rejected':
        return 'Отклонена'
      default:
        return 'На рассмотрении'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 space-y-3 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">📊 Админ панель</h1>
            <button
              onClick={loadApplications}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition-colors touch-target"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Обновить</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="overflow-x-auto">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit min-w-full sm:min-w-0">
            {[
              { key: 'all', label: 'Все' },
              { key: 'pending', label: 'На рассмотрении' },
              { key: 'approved', label: 'Одобренные' },
              { key: 'rejected', label: 'Отклоненные' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base whitespace-nowrap touch-target ${
                  filter === key
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Заявки ({filteredApplications.length})</span>
          </h2>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">Нет заявок для отображения</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span>{getStatusText(application.status)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-600 text-xs">
                      <Coins className="h-3 w-3" />
                      <span>{application.cost || 50} голды</span>
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {application.title}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">{application.description}</p>
                  
                  {/* Медиафайлы */}
                  {(application.photo_url || application.video_url) && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">Файлы:</p>
                      <div className="flex space-x-2">
                        {application.photo_url && (
                          <a href={application.photo_url} target="_blank" rel="noopener noreferrer" 
                             className="text-xs text-blue-600 bg-white px-2 py-1 rounded border">📸 Фото</a>
                        )}
                        {application.video_url && (
                          <a href={application.video_url} target="_blank" rel="noopener noreferrer" 
                             className="text-xs text-purple-600 bg-white px-2 py-1 rounded border">🎥 Видео</a>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>ID: #{application.id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(application.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  
                  {application.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'approved')}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors touch-target"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Одобрить</span>
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors touch-target"
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm">Отклонить</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{application.description}</p>
                      
                      {/* Медиафайлы */}
                      {(application.photo_url || application.video_url) && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Прикрепленные файлы:</h4>
                          <div className="flex space-x-2">
                            {application.photo_url && (
                              <a href={application.photo_url} target="_blank" rel="noopener noreferrer" 
                                 className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm bg-white px-2 py-1 rounded border">
                                <Camera className="h-3 w-3" />
                                <span>Фото</span>
                              </a>
                            )}
                            {application.video_url && (
                              <a href={application.video_url} target="_blank" rel="noopener noreferrer" 
                                 className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm bg-white px-2 py-1 rounded border">
                                <Video className="h-3 w-3" />
                                <span>Видео</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>ID: #{application.id}</span>
                        </div>
                        <span>Пользователь: #{application.user_id}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(application.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Coins className="h-3 w-3" />
                          <span>{application.cost || 50} голды</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span>{getStatusText(application.status)}</span>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Одобрить</span>
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Отклонить</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
