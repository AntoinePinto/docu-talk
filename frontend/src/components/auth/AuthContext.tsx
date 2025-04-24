import { createContext, useContext, useState, ReactNode } from 'react'
import axios from 'axios'

interface AuthContextType {
  token: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithToken: (token: string, email: string) => void
  logout: () => void
  isAuthenticated: boolean
  setToken: (token: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/token`, formData)
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Set default authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || 'Login failed')
      }
      throw new Error('An unexpected error occurred during login')
    }
  }

  const loginWithToken = (token: string) => {
    localStorage.setItem('token', token)
    setToken(token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        loginWithToken,
        logout,
        isAuthenticated: !!token,
        setToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 