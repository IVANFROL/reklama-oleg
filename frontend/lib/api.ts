import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Types
export interface User {
  id: number
  email: string
  username: string
  balance: number
  is_active: boolean
  created_at: string
}

export interface Ad {
  id: number
  title: string
  description: string
  reward_amount: number
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface Application {
  id: number
  user_id: number
  title: string
  description: string
  status: string
  cost: number
  photo_url?: string
  video_url?: string
  created_at: string
}

export interface AdView {
  id: number
  user_id: number
  ad_id: number
  viewed_at: string
  reward_earned: number
}

// Auth API
export const authAPI = {
  register: async (userData: { email: string; username: string; password: string }) => {
    const response = await api.post('/register', userData)
    return response.data
  },
  
  login: async (credentials: { username: string; password: string }) => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await api.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get('/me')
    return response.data
  },
  
  getBalance: async (): Promise<{ balance: number }> => {
    const response = await api.get('/balance')
    return response.data
  },
}

// Ads API
export const adsAPI = {
  getAds: async (): Promise<Ad[]> => {
    const response = await api.get('/ads')
    return response.data
  },
  
  viewAd: async (adId: number): Promise<AdView> => {
    const response = await api.post('/ads/view', { ad_id: adId })
    return response.data
  },
}

// Applications API
export const applicationsAPI = {
  createApplication: async (applicationData: { title: string; description: string }): Promise<Application> => {
    const response = await api.post('/applications', applicationData)
    return response.data
  },
  
  getUserApplications: async (): Promise<Application[]> => {
    const response = await api.get('/applications')
    return response.data
  },
  
  getAllApplications: async (): Promise<Application[]> => {
    const response = await api.get('/admin/applications')
    return response.data
  },
  
  updateApplicationStatus: async (applicationId: number, status: string): Promise<Application> => {
    const response = await api.put(`/admin/applications/${applicationId}`, { status })
    return response.data
  },
}

export default api
