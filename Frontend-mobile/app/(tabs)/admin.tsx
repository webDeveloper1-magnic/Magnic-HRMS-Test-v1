"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAdminLeaves } from "@/hooks/useLeaves"
import { useAdminExpenses } from "@/hooks/useExpenses"
import { useState } from "react"

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"leaves" | "expenses">("leaves")
  const { useAllLeaves, approveLeave, rejectLeave, isApprovingLeave, isRejectingLeave } = useAdminLeaves()
  const { useAllExpenses, approveExpense, rejectExpense, isApprovingExpense, isRejectingExpense } = useAdminExpenses()

  const { data: leavesData, isLoading: isLoadingLeaves } = useAllLeaves(1, "pending")
  const { data: expensesData, isLoading: isLoadingExpenses } = useAllExpenses(1, "pending")

  const handleApproveLeave = (leaveId: number) => {
    approveLeave(leaveId)
  }

  const handleRejectLeave = (leaveId: number) => {
    rejectLeave({ leaveId })
  }

  const handleApproveExpense = (expenseId: number) => {
    approveExpense(expenseId)
  }

  const handleRejectExpense = (expenseId: number) => {
    rejectExpense({ expenseId })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "leaves" && styles.tabActive]}
          onPress={() => setActiveTab("leaves")}
        >
          <Text style={[styles.tabText, activeTab === "leaves" && styles.tabTextActive]}>Leave Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "expenses" && styles.tabActive]}
          onPress={() => setActiveTab("expenses")}
        >
          <Text style={[styles.tabText, activeTab === "expenses" && styles.tabTextActive]}>Expense Claims</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "leaves" && (
          <View style={styles.section}>
            {isLoadingLeaves ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            ) : (
              <View style={styles.requestsList}>
                {leavesData?.data.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No pending leave requests</Text>
                  </View>
                ) : (
                  leavesData?.data.map((leave: any) => (
                    <View key={leave.id} style={styles.requestCard}>
                      <View style={styles.requestHeader}>
                        <Text style={styles.employeeName}>
                          {leave.employee.first_name} {leave.employee.last_name}
                        </Text>
                        <Text style={styles.leaveType}>{leave.leaveType.name}</Text>
                      </View>
                      <View style={styles.requestDetails}>
                        <View style={styles.requestDetail}>
                          <Ionicons name="calendar-outline" size={16} color="#666" />
                          <Text style={styles.requestDetailText}>
                            {new Date(leave.start_date).toLocaleDateString()} -{" "}
                            {new Date(leave.end_date).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.requestDetail}>
                          <Ionicons name="time-outline" size={16} color="#666" />
                          <Text style={styles.requestDetailText}>{leave.days} days</Text>
                        </View>
                      </View>
                      <Text style={styles.requestReason}>{leave.reason}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectLeave(leave.id)}
                          disabled={isRejectingLeave}
                        >
                          <Ionicons name="close" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleApproveLeave(leave.id)}
                          disabled={isApprovingLeave}
                        >
                          <Ionicons name="checkmark" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === "expenses" && (
          <View style={styles.section}>
            {isLoadingExpenses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            ) : (
              <View style={styles.requestsList}>
                {expensesData?.data.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No pending expense claims</Text>
                  </View>
                ) : (
                  expensesData?.data.map((expense: any) => (
                    <View key={expense.id} style={styles.requestCard}>
                      <View style={styles.requestHeader}>
                        <Text style={styles.employeeName}>
                          {expense.employee.first_name} {expense.employee.last_name}
                        </Text>
                        <Text style={styles.amount}>${expense.amount}</Text>
                      </View>
                      <View style={styles.requestDetails}>
                        <View style={styles.requestDetail}>
                          <Ionicons name="pricetag-outline" size={16} color="#666" />
                          <Text style={styles.requestDetailText}>{expense.category.name}</Text>
                        </View>
                        <View style={styles.requestDetail}>
                          <Ionicons name="calendar-outline" size={16} color="#666" />
                          <Text style={styles.requestDetailText}>{new Date(expense.date).toLocaleDateString()}</Text>
                        </View>
                      </View>
                      <Text style={styles.requestReason}>{expense.description}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => handleRejectExpense(expense.id)}
                          disabled={isRejectingExpense}
                        >
                          <Ionicons name="close" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleApproveExpense(expense.id)}
                          disabled={isApprovingExpense}
                        >
                          <Ionicons name="checkmark" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#2563eb",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  leaveType: {
    fontSize: 14,
    color: "#666",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  requestDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestDetailText: {
    fontSize: 14,
    color: "#666",
  },
  requestReason: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
})
