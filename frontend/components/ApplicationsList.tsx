'use client'

import { Application } from '@/lib/api'
import { FileText, Clock, CheckCircle, XCircle, Camera, Video, Coins } from 'lucide-react'

interface ApplicationsListProps {
  applications: Application[]
}

export default function ApplicationsList({ applications }: ApplicationsListProps) {
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

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">У вас пока нет заявок</p>
        <p className="text-sm text-gray-400 mt-1">Создайте первую заявку, нажав кнопку "Новая заявка"</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application.id} className="card">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{application.title}</h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              <span>{getStatusText(application.status)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">{application.description}</p>
          
          {/* Медиафайлы */}
          {(application.photo_url || application.video_url) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Прикрепленные файлы:</h4>
              <div className="flex flex-wrap gap-2">
                {application.photo_url && (
                  <a
                    href={application.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm bg-white px-2 py-1 rounded border"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Фото</span>
                  </a>
                )}
                {application.video_url && (
                  <a
                    href={application.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm bg-white px-2 py-1 rounded border"
                  >
                    <Video className="h-3 w-3" />
                    <span>Видео</span>
                  </a>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>ID: #{application.id}</span>
              {application.cost && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Coins className="h-3 w-3" />
                  <span>{application.cost} голды</span>
                </div>
              )}
            </div>
            <span>{new Date(application.created_at).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
