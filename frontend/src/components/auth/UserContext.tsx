import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

interface Document {
  id: string
  filename: string
}

export interface Chatbot {
  id: string
  title: string
  description: string
  icon: string
  access: string
  user_role: string
  suggested_prompts: string[]
  documents: Document[]
  accesses: Array<{
    user_id: string
    role: string
  }>
}

interface User {
  email: string
  first_name: string
  last_name: string
  friendly_name: string
  period_dollar_amount: number
  chatbots: Chatbot[]
  terms_of_use_displayed: boolean
}

interface UserContextType {
  user: User | null
  remainingCredits: number | null
  isLoading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  updateCredits: (consumedPrice: number) => void
}

const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!token) {
        setUser(null)
        setRemainingCredits(null)
        setIsLoading(false)
        return
      }

      const [userResponse, creditsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(error => {
          if (error.response?.status === 401) {
            // Token is invalid or expired
            setUser(null)
            setRemainingCredits(null)
            return { data: null }
          }
          throw error
        }),
        axios.post(`${import.meta.env.VITE_API_URL}/api/auth/get_remaining_credits`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(error => {
          if (error.response?.status === 401) {
            // Token is invalid or expired
            setUser(null)
            setRemainingCredits(null)
            return { data: { consumed_price: null } }
          }
          throw error
        })
      ])

      if (userResponse.data) {
        setUser(userResponse.data)
      }
      if (creditsResponse.data?.consumed_price !== undefined) {
        // Calculate remaining credits based on consumed price
        const totalCredits = userResponse.data?.period_dollar_amount ? Math.floor(1000 * userResponse.data.period_dollar_amount) : 0;
        const consumedCredits = Math.floor(creditsResponse.data.consumed_price * 1000);
        const remaining = totalCredits - consumedCredits;
        setRemainingCredits(remaining)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.')
        } else {
          setError(error.response?.data?.detail || 'Failed to fetch user data')
        }
      } else {
        setError('Failed to fetch user data')
      }
      setUser(null)
      setRemainingCredits(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch user data immediately when token changes
    fetchUserData()
  }, [token])

  const refreshUserData = async () => {
    await fetchUserData()
  }

  const updateCredits = async (consumedPrice: number) => {
    try {
      if (!user) return;

      const totalCredits = user.period_dollar_amount ? Math.floor(1000 * user.period_dollar_amount) : 0;
      const consumedCredits = Math.floor(consumedPrice * 1000);
      const remaining = totalCredits - consumedCredits;
      
      // Only update the remaining credits state
      setRemainingCredits(remaining);
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        remainingCredits,
        isLoading,
        error,
        refreshUserData,
        updateCredits
      }}
    >
      {children}
    </UserContext.Provider>
  )
} 