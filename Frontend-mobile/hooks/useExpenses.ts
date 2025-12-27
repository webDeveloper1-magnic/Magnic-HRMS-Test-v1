import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api, { getErrorMessage } from "@/lib/api"
import { API_ENDPOINTS } from "@/constants/api"

type ExpenseData = {
  category_id: number
  amount: number
  date: string
  description: string
  receipt_url?: string
}

type Expense = {
  id: number
  amount: number
  date: string
  description: string
  status: "pending" | "approved" | "rejected" | "paid"
  category: {
    id: number
    name: string
  }
}

export const useExpenses = () => {
  const queryClient = useQueryClient()

  // Get my expenses
  const useMyExpenses = (page = 1, status?: string) => {
    return useQuery({
      queryKey: ["expenses", "my-expenses", page, status],
      queryFn: async () => {
        const params = new URLSearchParams({ page: page.toString(), limit: "10" })
        if (status) params.append("status", status)
        const response = await api.get(`${API_ENDPOINTS.MY_EXPENSES}?${params}`)
        return response.data
      },
    })
  }

  // Submit expense
  const submitExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseData) => {
      const response = await api.post(API_ENDPOINTS.EXPENSES, data)
      return response.data.data.expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", "my-expenses"] })
    },
  })

  return {
    useMyExpenses,
    submitExpense: submitExpenseMutation.mutate,
    isSubmittingExpense: submitExpenseMutation.isPending,
    submitExpenseError: submitExpenseMutation.error ? getErrorMessage(submitExpenseMutation.error) : null,
  }
}

// Admin hooks
export const useAdminExpenses = () => {
  const queryClient = useQueryClient()

  const useAllExpenses = (page = 1, status?: string) => {
    return useQuery({
      queryKey: ["expenses", "all", page, status],
      queryFn: async () => {
        const params = new URLSearchParams({ page: page.toString(), limit: "10" })
        if (status) params.append("status", status)
        const response = await api.get(`${API_ENDPOINTS.EXPENSES}?${params}`)
        return response.data
      },
    })
  }

  const approveExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await api.put(API_ENDPOINTS.APPROVE_EXPENSE(expenseId))
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })

  const rejectExpenseMutation = useMutation({
    mutationFn: async ({ expenseId, reason }: { expenseId: number; reason?: string }) => {
      const response = await api.put(API_ENDPOINTS.REJECT_EXPENSE(expenseId), {
        rejection_reason: reason,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })

  return {
    useAllExpenses,
    approveExpense: approveExpenseMutation.mutate,
    rejectExpense: rejectExpenseMutation.mutate,
    isApprovingExpense: approveExpenseMutation.isPending,
    isRejectingExpense: rejectExpenseMutation.isPending,
  }
}
