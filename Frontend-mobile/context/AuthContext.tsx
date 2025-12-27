"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SecureStore from "expo-secure-store"
import { useRouter, useSegments } from "expo-router"
import api from "@/lib/api"
import { API_ENDPOINTS } from "@/constants/api"

type User = {
  id: number
  email: string
  role: string
  employee: {
    id: number
    employee_code: string
    first_name: string
    last_name: string
    department: string
    designation: string
  }
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)"

    if (isLoading) return

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login")
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [user, segments, isLoading])

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken")
      if (token) {
        const response = await api.get(API_ENDPOINTS.PROFILE)
        setUser(response.data.data.user)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
      await SecureStore.deleteItemAsync("accessToken")
      await SecureStore.deleteItemAsync("refreshToken")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password })
      const { user: userData, accessToken, refreshToken } = response.data.data

      await SecureStore.setItemAsync("accessToken", accessToken)
      await SecureStore.setItemAsync("refreshToken", refreshToken)

      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")
      if (refreshToken) {
        await api.post(API_ENDPOINTS.LOGOUT, { refreshToken })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      await SecureStore.deleteItemAsync("accessToken")
      await SecureStore.deleteItemAsync("refreshToken")
      setUser(null)
      router.replace("/(auth)/login")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
