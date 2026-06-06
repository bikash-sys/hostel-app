import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { getBookings, getMessMenu, getLaundryRequests, getRoomServices } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const STAT_CARDS = [
  { key: 'room', emoji: '🏠', label: 'My Room', color: Colors.primary, bg: Colors.primary + '18' },
  { key: 'laundry', emoji: '🫧', label: 'Active Laundry', color: Colors.blue, bg: Colors.blue + '18' },
  { key: 'services', emoji: '✨', label: 'Room Services', color: Colors.purple, bg: Colors.purple + '18' },
  { key: 'meals', emoji: '🍽️', label: 'Meals Today', color: Colors.amber, bg: Colors.amber + '18' },
];

export default function StudentHomeScreen({ user, navigation }) {
  const [bookings, setBookings] = useState([]);
  const [laundries, setLaundries] = useState([]);
  const [roomServices, setRoomServices] = useState([]);
  const [menu, setMenu] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [b, l, s, m] = await Promise.all([
      getBookings(user.email),
      getLaundryRequests(),
      getRoomServices(),
      getMessMenu(),
    ]);
    setBookings(b);
    setLaundries(l.filter(r => r.user_email === user.email));
    setRoomServices(s.filter(r => r.user_email === user.email));
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

  const activeBooking = bookings[0];
  const roomName = activeBooking?.roomName || activeBooking?.room_name || 'Not Booked';
  const studentName = activeBooking?.guest_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';
  const activeLaundry = laundries.filter(l => l.status === 'pending').length;
  const activeServices = roomServices.filter(s => s.status !== 'done').length;
  const now = new Date();
  const hour = now.getHours();
  let currentMeal = null;
  if (hour >= 7 && hour < 9) currentMeal = menu.find(m => m.meal === 'Breakfast');
  else if (hour >= 12 && hour < 14) currentMeal = menu.find(m => m.meal === 'Lunch');
  else if (hour >= 16 && hour < 17) currentMeal = menu.find(m => m.meal === 'Snacks');
  else if (hour >= 19 && hour < 21) currentMeal = menu.find(m => m.meal === 'Dinner');

  const statValues = {
    room: roomName,
    laundry: activeLaundry > 0 ? `${activeLaundry} pending` : 'None',
    services: activeServices > 0 ? `${activeServices} active` : 'None',
    meals: currentMeal ? currentMeal.meal : 'Check Menu',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
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
          <Text style={styles.greeting}>Good {hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'} 👋</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          <View style={styles.roomBadge}>
            <Text style={styles.roomBadgeText}>🏠 {roomName}</Text>
          </View>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'S'}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Quick Overview</Text>
      <View style={styles.statsGrid}>
        {STAT_CARDS.map((card) => (
          <View key={card.key} style={[styles.statCard, { borderColor: card.color + '40' }]}>
            <View style={[styles.statIcon, { backgroundColor: card.bg }]}>
              <Text style={styles.statEmoji}>{card.emoji}</Text>
            </View>
            <Text style={styles.statValue}>{statValues[card.key]}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* Current Meal */}
      {currentMeal && (
        <View style={styles.currentMealCard}>
          <Text style={styles.currentMealLabel}>🍴 Now Serving</Text>
          <Text style={styles.currentMealName}>{currentMeal.meal}</Text>
          <Text style={styles.currentMealTime}>{currentMeal.time}</Text>
          <Text style={styles.currentMealItems}>{currentMeal.items}</Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: 'Laundry', emoji: '🫧', screen: 'Laundry', color: Colors.blue },
          { label: 'Housekeeping', emoji: '✨', screen: 'Housekeeping', color: Colors.purple },
          { label: 'Mess Menu', emoji: '🍽️', screen: 'Menu', color: Colors.amber },
          { label: 'Complaints', emoji: '📋', screen: 'Complaints', color: Colors.red },
          { label: 'Wifi Test', emoji: '📶', screen: 'WifiTest', color: Colors.indigo },
          { label: 'Payments', emoji: '💳', screen: 'Payments', color: Colors.green },
        ].map((action) => (
          <TouchableOpacity
            key={action.screen}
            style={[styles.actionCard, { borderColor: action.color + '30' }]}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Laundry */}
      {laundries.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Laundry</Text>
          {laundries.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.listItem}>
              <Text style={styles.listItemIcon}>🫧</Text>
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{item.type}</Text>
                <Text style={styles.listItemSub}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.status === 'booked' ? Colors.blue + '20' : Colors.amber + '20' }]}>
                <Text style={[styles.badgeText, { color: item.status === 'booked' ? Colors.blue : Colors.amber }]}>
                  {item.status}
                </Text>
              </View>
            </View>
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
  loadingText: { color: Colors.textMuted, marginTop: 12, fontSize: 15 },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  bannerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: Colors.textMuted, marginBottom: 2 },
  studentName: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 8, textTransform: 'capitalize' },
  roomBadge: {
    backgroundColor: Colors.primary + '18', borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  roomBadgeText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, alignItems: 'flex-start',
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  currentMealCard: {
    backgroundColor: Colors.amber + '12', borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.amber + '30',
    marginBottom: Spacing.md,
  },
  currentMealLabel: { fontSize: 11, color: Colors.amber, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  currentMealName: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  currentMealTime: { fontSize: 12, color: Colors.amber, marginBottom: 4 },
  currentMealItems: { fontSize: 13, color: Colors.textMuted },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  actionCard: {
    flex: 1, minWidth: '30%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, alignItems: 'center',
  },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionEmoji: { fontSize: 24 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  listItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  listItemIcon: { fontSize: 22, marginRight: 12 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  listItemSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});
