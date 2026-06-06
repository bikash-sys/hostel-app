import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import {
  getRoomServices, getLaundryRequests, getComplaints, getMessMenu,
} from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

export default function ManagerHomeScreen({ user, navigation }) {
  const [roomServices, setRoomServices] = useState([]);
  const [laundries, setLaundries] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [menu, setMenu] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [rs, l, c, m] = await Promise.all([
      getRoomServices(),
      getLaundryRequests(),
      getComplaints(),
      getMessMenu(),
    ]);
    setRoomServices(rs);
    setLaundries(l);
    setComplaints(c);
    setMenu(m);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const activeServices = roomServices.filter(r => r.status !== 'done').length;
  const pendingLaundry = laundries.filter(l => l.status === 'pending').length;

  const MANAGER_ACTIONS = [
    { label: 'Laundry', emoji: '🫧', screen: 'ManagerLaundry', color: Colors.blue, badge: pendingLaundry },
    { label: 'Housekeeping', emoji: '✨', screen: 'ManagerServices', color: Colors.purple, badge: activeServices },
    { label: 'Mess Menu', emoji: '🍽️', screen: 'ManagerMenu', color: Colors.amber, badge: 0 },
    { label: 'Complaints', emoji: '📋', screen: 'ManagerComplaints', color: Colors.red, badge: complaints.length },
    { label: 'WiFi Test', emoji: '📶', screen: 'WifiTest', color: Colors.indigo, badge: 0 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading manager dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerLeft}>
          <Text style={styles.greeting}>Manager Portal 📋</Text>
          <Text style={styles.managerName}>{user?.email?.split('@')[0] || 'Manager'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>🏢 Hostel Manager</Text>
          </View>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: Colors.purple }]}>
          <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'M'}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <Text style={styles.sectionTitle}>Live Overview</Text>
      <View style={styles.statsRow}>
        {[
          { label: 'Pending Laundry', value: pendingLaundry, color: Colors.blue, emoji: '🫧' },
          { label: 'Active Housekeeping', value: activeServices, color: Colors.purple, emoji: '✨' },
          { label: 'Complaints', value: complaints.length, color: Colors.red, emoji: '📋' },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { borderColor: stat.color + '30' }]}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Management Tools</Text>
      <View style={styles.actionsGrid}>
        {MANAGER_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.screen}
            style={[styles.actionCard, { borderColor: action.color + '30' }]}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.75}
          >
            {action.badge > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: action.color }]}>
                <Text style={styles.badgeDotText}>{action.badge}</Text>
              </View>
            )}
            <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Complaints */}
      {complaints.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Complaints</Text>
          {complaints.slice(0, 3).map((comp, i) => (
            <TouchableOpacity
              key={comp.id || i}
              style={styles.complaintItem}
              onPress={() => navigation.navigate('ManagerComplaints')}
            >
              <View style={[styles.catBadge, { backgroundColor: Colors.red + '18' }]}>
                <Text style={[styles.catText, { color: Colors.red }]}>{comp.category}</Text>
              </View>
              <Text style={styles.complaintContext} numberOfLines={1}>{comp.context}</Text>
              <Text style={styles.complaintMeta}>🏠 Room {comp.room_no || '—'} · {comp.date || ''}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  bannerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  managerName: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8, textTransform: 'capitalize' },
  roleBadge: {
    backgroundColor: Colors.purple + '18', borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.purple + '30',
  },
  roleBadgeText: { color: Colors.purple, fontSize: 12, fontWeight: '600' },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, alignItems: 'center',
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  actionCard: {
    flex: 1, minWidth: '28%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, alignItems: 'center', position: 'relative',
  },
  badgeDot: {
    position: 'absolute', top: 8, right: 8,
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeDotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionEmoji: { fontSize: 26 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  complaintItem: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.red + '20',
  },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginBottom: 6 },
  catText: { fontSize: 10, fontWeight: '700' },
  complaintContext: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 4 },
  complaintMeta: { fontSize: 12, color: Colors.textMuted },
});
