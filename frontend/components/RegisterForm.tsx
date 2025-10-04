'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

interface RegisterFormData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth()
  const { register: registerField, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>()
  const [isLoading, setIsLoading] = useState(false)

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }

    setIsLoading(true)
    try {
      await register(data.email, data.username, data.password)
      toast.success('Регистрация успешна!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...registerField('email', { 
              required: 'Email обязателен',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Неверный формат email'
              }
            })}
            type="email"
            className="input-field mt-1"
            placeholder="Введите email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Имя пользователя
          </label>
          <input
            {...registerField('username', { 
              required: 'Имя пользователя обязательно',
              minLength: {
                value: 3,
                message: 'Минимум 3 символа'
              }
            })}
            type="text"
            className="input-field mt-1"
            placeholder="Введите имя пользователя"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            {...registerField('password', { 
              required: 'Пароль обязателен',
              minLength: {
                value: 6,
                message: 'Минимум 6 символов'
              }
            })}
            type="password"
            className="input-field mt-1"
            placeholder="Введите пароль"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Подтвердите пароль
          </label>
          <input
            {...registerField('confirmPassword', { 
              required: 'Подтверждение пароля обязательно',
              validate: value => value === password || 'Пароли не совпадают'
            })}
            type="password"
            className="input-field mt-1"
            placeholder="Подтвердите пароль"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </form>
  )
}
