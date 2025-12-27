"use client"

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLeaves } from "@/hooks/useLeaves"
import { useState } from "react"

export default function LeavesScreen() {
  const { useMyLeaves, leaveBalance, applyLeave, isApplyingLeave, cancelLeave } = useLeaves()
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const { data: leavesData, isLoading } = useMyLeaves(1, selectedStatus)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: 1,
    start_date: "",
    end_date: "",
    days: "",
    reason: "",
  })

  const handleApplyLeave = () => {
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.days || !leaveForm.reason) {
      Alert.alert("Error", "Please fill all fields")
      return
    }

    applyLeave(
      {
        leave_type_id: leaveForm.leave_type_id,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        days: Number.parseFloat(leaveForm.days),
        reason: leaveForm.reason,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Leave application submitted successfully")
          setShowApplyModal(false)
          setLeaveForm({
            leave_type_id: 1,
            start_date: "",
            end_date: "",
            days: "",
            reason: "",
          })
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to apply leave")
        },
      },
    )
  }

  const handleCancelLeave = (leaveId: number) => {
    Alert.alert("Cancel Leave", "Are you sure you want to cancel this leave?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          cancelLeave(leaveId)
        },
      },
    ])
  }

  const statusColors: any = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    approved: { bg: "#dcfce7", text: "#166534" },
    rejected: { bg: "#fee2e2", text: "#991b1b" },
    cancelled: { bg: "#e5e7eb", text: "#1f2937" },
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaves</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowApplyModal(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave Balance</Text>
          <View style={styles.balanceGrid}>
            {leaveBalance?.map((balance) => (
              <View key={balance.id} style={styles.balanceCard}>
                <Text style={styles.balanceName}>{balance.leaveType.name}</Text>
                <View style={styles.balanceInfo}>
                  <Text style={styles.balanceRemaining}>{balance.remaining_days}</Text>
                  <Text style={styles.balanceTotal}>/ {balance.total_days} days</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.filterRow}>
            <Text style={styles.sectionTitle}>My Leaves</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, !selectedStatus && styles.filterButtonActive]}
                onPress={() => setSelectedStatus(undefined)}
              >
                <Text style={[styles.filterButtonText, !selectedStatus && styles.filterButtonTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, selectedStatus === "pending" && styles.filterButtonActive]}
                onPress={() => setSelectedStatus("pending")}
              >
                <Text style={[styles.filterButtonText, selectedStatus === "pending" && styles.filterButtonTextActive]}>
                  Pending
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View style={styles.leavesList}>
              {leavesData?.data.map((leave: any) => (
                <View key={leave.id} style={styles.leaveCard}>
                  <View style={styles.leaveHeader}>
                    <Text style={styles.leaveType}>{leave.leaveType.name}</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: statusColors[leave.status]?.bg || "#e5e7eb" }]}
                    >
                      <Text style={[styles.statusBadgeText, { color: statusColors[leave.status]?.text || "#1f2937" }]}>
                        {leave.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.leaveDetails}>
                    <View style={styles.leaveDetail}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.leaveDetailText}>
                        {new Date(leave.start_date).toLocaleDateString()} -{" "}
                        {new Date(leave.end_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.leaveDetail}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.leaveDetailText}>{leave.days} days</Text>
                    </View>
                  </View>
                  <Text style={styles.leaveReason}>{leave.reason}</Text>
                  {leave.status === "pending" && (
                    <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelLeave(leave.id)}>
                      <Text style={styles.cancelButtonText}>Cancel Leave</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Leave</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={leaveForm.start_date}
                  onChangeText={(text) => setLeaveForm({ ...leaveForm, start_date: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={leaveForm.end_date}
                  onChangeText={(text) => setLeaveForm({ ...leaveForm, end_date: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Days</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Number of days"
                  keyboardType="numeric"
                  value={leaveForm.days}
                  onChangeText={(text) => setLeaveForm({ ...leaveForm, days: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reason</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter reason for leave"
                  multiline
                  numberOfLines={4}
                  value={leaveForm.reason}
                  onChangeText={(text) => setLeaveForm({ ...leaveForm, reason: text })}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleApplyLeave} disabled={isApplyingLeave}>
                {isApplyingLeave ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#1e40af",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  balanceGrid: {
    gap: 12,
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  balanceRemaining: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  balanceTotal: {
    fontSize: 14,
    color: "#666",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  leavesList: {
    gap: 12,
  },
  leaveCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leaveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  leaveDetails: {
    gap: 8,
    marginBottom: 12,
  },
  leaveDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  leaveDetailText: {
    fontSize: 14,
    color: "#666",
  },
  leaveReason: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  cancelButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991b1b",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  modalForm: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
