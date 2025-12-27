"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/context/AuthContext"
import { useAttendance } from "@/hooks/useAttendance"
import { useLeaves } from "@/hooks/useLeaves"
import { useState } from "react"

export default function DashboardScreen() {
  const { user } = useAuth()
  const { todayAttendance, isLoadingToday } = useAttendance()
  const { leaveBalance, isLoadingBalance } = useLeaves()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000)
  }

  const totalLeaves = leaveBalance?.reduce((sum, lb) => sum + lb.total_days, 0) || 0
  const usedLeaves = leaveBalance?.reduce((sum, lb) => sum + lb.used_days, 0) || 0
  const remainingLeaves = leaveBalance?.reduce((sum, lb) => sum + lb.remaining_days, 0) || 0

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.employee.first_name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Attendance</Text>
        <View style={styles.card}>
          {isLoadingToday ? (
            <Text style={styles.cardText}>Loading...</Text>
          ) : todayAttendance ? (
            <View style={styles.attendanceInfo}>
              <View style={styles.attendanceRow}>
                <Ionicons name="log-in" size={20} color="#10b981" />
                <View style={styles.attendanceDetail}>
                  <Text style={styles.attendanceLabel}>Clock In</Text>
                  <Text style={styles.attendanceValue}>
                    {new Date(todayAttendance.clock_in).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
              {todayAttendance.clock_out && (
                <View style={styles.attendanceRow}>
                  <Ionicons name="log-out" size={20} color="#ef4444" />
                  <View style={styles.attendanceDetail}>
                    <Text style={styles.attendanceLabel}>Clock Out</Text>
                    <Text style={styles.attendanceValue}>
                      {new Date(todayAttendance.clock_out).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.attendanceRow}>
                <Ionicons name="time" size={20} color="#3b82f6" />
                <View style={styles.attendanceDetail}>
                  <Text style={styles.attendanceLabel}>Working Hours</Text>
                  <Text style={styles.attendanceValue}>{todayAttendance.working_hours || 0} hrs</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No attendance recorded today</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leave Balance</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Text style={styles.statValue}>{totalLeaves}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.statDanger]}>
            <Text style={styles.statValue}>{usedLeaves}</Text>
            <Text style={styles.statLabel}>Used</Text>
          </View>
          <View style={[styles.statCard, styles.statSuccess]}>
            <Text style={styles.statValue}>{remainingLeaves}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="time" size={32} color="#2563eb" />
            <Text style={styles.actionText}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="calendar" size={32} color="#2563eb" />
            <Text style={styles.actionText}>Apply Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="cash" size={32} color="#2563eb" />
            <Text style={styles.actionText}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="document" size={32} color="#2563eb" />
            <Text style={styles.actionText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  greeting: {
    fontSize: 16,
    color: "#e0e7ff",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  badge: {
    backgroundColor: "#1e40af",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  attendanceInfo: {
    gap: 16,
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attendanceDetail: {
    flex: 1,
  },
  attendanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  attendanceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
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
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statPrimary: {
    backgroundColor: "#dbeafe",
  },
  statDanger: {
    backgroundColor: "#fee2e2",
  },
  statSuccess: {
    backgroundColor: "#dcfce7",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
})
