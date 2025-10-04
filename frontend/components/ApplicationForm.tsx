'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, X, Coins, Camera, Video, Link, Upload, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ApplicationFormData {
  title: string
  description: string
  photo_url?: string
  video_url?: string
}

interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => void
}

export default function ApplicationForm({ onSubmit }: ApplicationFormProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<ApplicationFormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{photo?: string, video?: string}>({})
  const applicationCost = 50.0

  // Watch form values
  const photo_url = watch('photo_url')
  const video_url = watch('video_url')

  const handleFileUpload = async (file: File, type: 'photo' | 'video') => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const token = localStorage.getItem('token')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${response.data.url}`
      
      if (type === 'photo') {
        setValue('photo_url', fileUrl)
        setUploadedFiles(prev => ({ ...prev, photo: fileUrl }))
      } else {
        setValue('video_url', fileUrl)
        setUploadedFiles(prev => ({ ...prev, video: fileUrl }))
      }
      
      toast.success('Файл загружен успешно!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка загрузки файла')
    } finally {
      setIsUploading(false)
    }
  }

  const removeUploadedFile = (type: 'photo' | 'video') => {
    if (type === 'photo') {
      setValue('photo_url', '')
      setUploadedFiles(prev => ({ ...prev, photo: undefined }))
    } else {
      setValue('video_url', '')
      setUploadedFiles(prev => ({ ...prev, video: undefined }))
    }
  }

  const handleFormSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      reset()
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canAfford = user && user.balance >= applicationCost
  
  if (!isOpen) {
    return (
      <div className="flex flex-col items-end space-y-2">
        <button
          onClick={() => setIsOpen(true)}
          disabled={!canAfford}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            canAfford 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="h-5 w-5" />
          <span>Новая заявка</span>
        </button>
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Coins className="h-4 w-4" />
          <span>Стоимость: {applicationCost} монет</span>
        </div>
        {!canAfford && (
          <div className="text-xs text-red-600">
            Недостаточно средств (у вас {user?.balance || 0} монет)
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Новая заявка</h3>
            <div className="flex items-center space-x-1 text-sm text-yellow-600 mt-1">
              <Coins className="h-4 w-4" />
              <span>Стоимость: {applicationCost} монет</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Заголовок
            </label>
            <input
              {...register('title', { required: 'Заголовок обязателен' })}
              type="text"
              className="input-field"
              placeholder="Введите заголовок заявки"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание
            </label>
            <textarea
              {...register('description', { required: 'Описание обязательно' })}
              rows={4}
              className="input-field resize-none"
              placeholder="Опишите вашу заявку"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Медиа поля */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Медиафайлы (необязательно)</span>
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Camera className="h-3 w-3" />
                <span>Фото</span>
              </label>
              
              {!photo_url ? (
                <div className="space-y-2">
                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'photo')
                      }}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`flex items-center justify-center space-x-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {isUploading ? 'Загружаем...' : 'Загрузить фото'}
                      </span>
                    </label>
                  </div>
                  
                  {/* URL input */}
                  <div className="text-center text-xs text-gray-500">или</div>
                  <input
                    {...register('photo_url', {
                      pattern: {
                        value: /^https?:\/\/.+/i,
                        message: 'Введите корректную ссылку'
                      }
                    })}
                    type="url"
                    className="input-field"
                    placeholder="Вставьте ссылку на фото"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={photo_url} 
                    alt="Загруженное фото"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedFile('photo')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {errors.photo_url && (
                <p className="mt-1 text-sm text-red-600">{errors.photo_url.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                <Video className="h-3 w-3" />
                <span>Видео</span>
              </label>
              
              {!video_url ? (
                <div className="space-y-2">
                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'video')
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className={`flex items-center justify-center space-x-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {isUploading ? 'Загружаем...' : 'Загрузить видео'}
                      </span>
                    </label>
                  </div>
                  
                  {/* URL input */}
                  <div className="text-center text-xs text-gray-500">или</div>
                  <input
                    {...register('video_url', {
                      pattern: {
                        value: /^https?:\/\/.+/i,
                        message: 'Введите корректную ссылку'
                      }
                    })}
                    type="url"
                    className="input-field"
                    placeholder="Вставьте ссылку на видео"
                  />
                </div>
              ) : (
                <div className="relative">
                  <video 
                    src={video_url} 
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedFile('video')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {errors.video_url && (
                <p className="mt-1 text-sm text-red-600">{errors.video_url.message}</p>
              )}
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">💡 Поддерживаемые форматы:</p>
              <p><strong>Фото:</strong> JPG, JPEG, PNG, GIF, WebP</p>
              <p><strong>Видео:</strong> MP4, AVI, MOV, WMV, FLV, WebM, M4V</p>
              <p className="mt-2">Вы можете загрузить файлы на любой файлообменник (Google Drive, Яндекс.Диск, Dropbox) и вставить прямую ссылку.</p>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
