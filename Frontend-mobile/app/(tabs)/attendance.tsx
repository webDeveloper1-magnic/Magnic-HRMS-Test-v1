"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAttendance } from "@/hooks/useAttendance"
import { useState } from "react"

export default function AttendanceScreen() {
  const { todayAttendance, clockIn, clockOut, isClockingIn, isClockingOut, useAttendanceHistory } = useAttendance()
  const [selectedPage, setSelectedPage] = useState(1)
  const { data: historyData, isLoading: isLoadingHistory } = useAttendanceHistory(selectedPage)

  const handleClockIn = () => {
    Alert.alert("Clock In", "Confirm clock in for today?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          clockIn({ location: "Mobile App" })
        },
      },
    ])
  }

  const handleClockOut = () => {
    Alert.alert("Clock Out", "Confirm clock out for today?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          clockOut({ location: "Mobile App" })
        },
      },
    ])
  }

  const canClockIn = !todayAttendance
  const canClockOut = todayAttendance && !todayAttendance.clock_out

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Status</Text>
          <View style={styles.card}>
            {todayAttendance ? (
              <View style={styles.statusInfo}>
                <View style={styles.statusRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <View style={styles.statusDetail}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <Text style={styles.statusValue}>Checked In</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.timeRow}>
                  <View style={styles.timeItem}>
                    <Text style={styles.timeLabel}>Clock In</Text>
                    <Text style={styles.timeValue}>
                      {new Date(todayAttendance.clock_in).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  {todayAttendance.clock_out && (
                    <View style={styles.timeItem}>
                      <Text style={styles.timeLabel}>Clock Out</Text>
                      <Text style={styles.timeValue}>
                        {new Date(todayAttendance.clock_out).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  )}
                </View>
                {todayAttendance.clock_out && (
                  <View style={styles.hoursContainer}>
                    <Text style={styles.hoursLabel}>Total Working Hours</Text>
                    <Text style={styles.hoursValue}>{todayAttendance.working_hours} hours</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Not checked in yet</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clockInButton, !canClockIn && styles.disabledButton]}
              onPress={handleClockIn}
              disabled={!canClockIn || isClockingIn}
            >
              {isClockingIn ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Clock In</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.clockOutButton, !canClockOut && styles.disabledButton]}
              onPress={handleClockOut}
              disabled={!canClockOut || isClockingOut}
            >
              {isClockingOut ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-out" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Clock Out</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <View style={styles.historyList}>
              {historyData?.data.map((record: any) => (
                <View key={record.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>{new Date(record.date).toLocaleDateString()}</Text>
                    <View style={[styles.statusBadge, styles[`status${record.status}`]]}>
                      <Text style={styles.statusBadgeText}>{record.status}</Text>
                    </View>
                  </View>
                  <View style={styles.historyDetails}>
                    <View style={styles.historyDetail}>
                      <Ionicons name="log-in" size={16} color="#666" />
                      <Text style={styles.historyDetailText}>
                        {new Date(record.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </View>
                    {record.clock_out && (
                      <View style={styles.historyDetail}>
                        <Ionicons name="log-out" size={16} color="#666" />
                        <Text style={styles.historyDetailText}>
                          {new Date(record.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </View>
                    )}
                    <View style={styles.historyDetail}>
                      <Ionicons name="time" size={16} color="#666" />
                      <Text style={styles.historyDetailText}>{record.working_hours} hrs</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusInfo: {
    gap: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDetail: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  timeItem: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 4,
  },
  hoursContainer: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  hoursLabel: {
    fontSize: 12,
    color: "#666",
  },
  hoursValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clockInButton: {
    backgroundColor: "#10b981",
  },
  clockOutButton: {
    backgroundColor: "#ef4444",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
    opacity: 0.6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statuspresent: {
    backgroundColor: "#dcfce7",
  },
  statuslate: {
    backgroundColor: "#fed7aa",
  },
  statusabsent: {
    backgroundColor: "#fee2e2",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    textTransform: "capitalize",
  },
  historyDetails: {
    flexDirection: "row",
    gap: 16,
  },
  historyDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyDetailText: {
    fontSize: 14,
    color: "#666",
  },
})
