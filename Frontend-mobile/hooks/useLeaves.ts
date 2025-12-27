import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api, { getErrorMessage } from "@/lib/api"
import { API_ENDPOINTS } from "@/constants/api"

type LeaveData = {
  leave_type_id: number
  start_date: string
  end_date: string
  days: number
  reason: string
}

type Leave = {
  id: number
  leave_type_id: number
  start_date: string
  end_date: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  leaveType: {
    id: number
    name: string
    is_paid: boolean
  }
}

type LeaveBalance = {
  id: number
  total_days: number
  used_days: number
  remaining_days: number
  leaveType: {
    id: number
    name: string
    is_paid: boolean
  }
}

export const useLeaves = () => {
  const queryClient = useQueryClient()

  // Get my leaves
  const useMyLeaves = (page = 1, status?: string) => {
    return useQuery({
      queryKey: ["leaves", "my-leaves", page, status],
      queryFn: async () => {
        const params = new URLSearchParams({ page: page.toString(), limit: "10" })
        if (status) params.append("status", status)
        const response = await api.get(`${API_ENDPOINTS.MY_LEAVES}?${params}`)
        return response.data
      },
    })
  }

  // Get leave balance
  const {
    data: leaveBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useQuery({
    queryKey: ["leaves", "balance"],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.LEAVE_BALANCE)
      return response.data.data.balances as LeaveBalance[]
    },
  })

  // Apply for leave
  const applyLeaveMutation = useMutation({
    mutationFn: async (data: LeaveData) => {
      const response = await api.post(API_ENDPOINTS.LEAVES, data)
      return response.data.data.leave
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves", "my-leaves"] })
      queryClient.invalidateQueries({ queryKey: ["leaves", "balance"] })
    },
  })

  // Cancel leave
  const cancelLeaveMutation = useMutation({
    mutationFn: async (leaveId: number) => {
      const response = await api.delete(`${API_ENDPOINTS.LEAVES}/${leaveId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves", "my-leaves"] })
      queryClient.invalidateQueries({ queryKey: ["leaves", "balance"] })
    },
  })

  return {
    useMyLeaves,
    leaveBalance,
    isLoadingBalance,
    balanceError: balanceError ? getErrorMessage(balanceError) : null,
    applyLeave: applyLeaveMutation.mutate,
    isApplyingLeave: applyLeaveMutation.isPending,
    applyLeaveError: applyLeaveMutation.error ? getErrorMessage(applyLeaveMutation.error) : null,
    cancelLeave: cancelLeaveMutation.mutate,
    isCancellingLeave: cancelLeaveMutation.isPending,
  }
}

// Admin hooks
export const useAdminLeaves = () => {
  const queryClient = useQueryClient()

  const useAllLeaves = (page = 1, status?: string) => {
    return useQuery({
      queryKey: ["leaves", "all", page, status],
      queryFn: async () => {
        const params = new URLSearchParams({ page: page.toString(), limit: "10" })
        if (status) params.append("status", status)
        const response = await api.get(`${API_ENDPOINTS.LEAVES}?${params}`)
        return response.data
      },
    })
  }

  const approveLeaveMutation = useMutation({
    mutationFn: async (leaveId: number) => {
      const response = await api.put(API_ENDPOINTS.APPROVE_LEAVE(leaveId))
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] })
    },
  })

  const rejectLeaveMutation = useMutation({
    mutationFn: async ({ leaveId, reason }: { leaveId: number; reason?: string }) => {
      const response = await api.put(API_ENDPOINTS.REJECT_LEAVE(leaveId), {
        rejection_reason: reason,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] })
    },
  })

  return {
    useAllLeaves,
    approveLeave: approveLeaveMutation.mutate,
    rejectLeave: rejectLeaveMutation.mutate,
    isApprovingLeave: approveLeaveMutation.isPending,
    isRejectingLeave: rejectLeaveMutation.isPending,
  }
}
