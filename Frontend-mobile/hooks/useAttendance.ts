import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api, { getErrorMessage } from "@/lib/api"
import { API_ENDPOINTS } from "@/constants/api"

type ClockInData = {
  location?: string
  notes?: string
}

type ClockOutData = {
  location?: string
}

type Attendance = {
  id: number
  date: string
  clock_in: string
  clock_out: string | null
  working_hours: number
  status: string
}

export const useAttendance = () => {
  const queryClient = useQueryClient()

  // Get today's attendance
  const {
    data: todayAttendance,
    isLoading: isLoadingToday,
    error: todayError,
  } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.TODAY_ATTENDANCE)
      return response.data.data.attendance as Attendance | null
    },
  })

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async (data: ClockInData) => {
      const response = await api.post(API_ENDPOINTS.CLOCK_IN, data)
      return response.data.data.attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] })
      queryClient.invalidateQueries({ queryKey: ["attendance", "history"] })
    },
  })

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async (data: ClockOutData) => {
      const response = await api.post(API_ENDPOINTS.CLOCK_OUT, data)
      return response.data.data.attendance
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] })
      queryClient.invalidateQueries({ queryKey: ["attendance", "history"] })
    },
  })

  // Attendance history
  const useAttendanceHistory = (page = 1) => {
    return useQuery({
      queryKey: ["attendance", "history", page],
      queryFn: async () => {
        const response = await api.get(`${API_ENDPOINTS.ATTENDANCE_HISTORY}?page=${page}&limit=10`)
        return response.data
      },
    })
  }

  return {
    todayAttendance,
    isLoadingToday,
    todayError: todayError ? getErrorMessage(todayError) : null,
    clockIn: clockInMutation.mutate,
    clockOut: clockOutMutation.mutate,
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
    clockInError: clockInMutation.error ? getErrorMessage(clockInMutation.error) : null,
    clockOutError: clockOutMutation.error ? getErrorMessage(clockOutMutation.error) : null,
    useAttendanceHistory,
  }
}
