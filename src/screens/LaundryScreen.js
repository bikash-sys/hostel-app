import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { getLaundryRequests, addLaundryRequest, getBookings } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const LAUNDRY_TYPES = [
  { label: 'Regular Wash', price: '₹40', time: '24 hrs', emoji: '👕' },
  { label: 'Express Wash', price: '₹80', time: '6 hrs', emoji: '⚡' },
  { label: 'Dry Cleaning', price: '₹120', time: '48 hrs', emoji: '🧥' },
  { label: 'Ironing', price: '₹20', time: '4 hrs', emoji: '🔆' },
];

export default function LaundryScreen({ user }) {
  const [laundries, setLaundries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [l, b] = await Promise.all([
      getLaundryRequests(),
      getBookings(user.email),
    ]);
    setLaundries(l.filter(r => r.user_email === user.email));
    setBookings(b);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const roomName = bookings[0]?.roomName || bookings[0]?.room_name || 'Unknown Room';

  const handleRequest = async (type) => {
    if (submitting) return;
    setSubmitting(type.label);
    const result = await addLaundryRequest({
      user_email: user.email,
      room_name: roomName,
      type: type.label,
    });
    if (result) {
      await fetchData();
      Alert.alert('Requested! 🫧', `${type.label} pickup requested for ${roomName}`);
    } else {
      Alert.alert('Error', 'Could not submit request. Please try again.');
    }
    setSubmitting(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.blue} />
        <Text style={styles.loadingText}>Loading laundry...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Colors.blue + '18' }]}>
          <Text style={{ fontSize: 28 }}>🫧</Text>
        </View>
        <Text style={styles.headerTitle}>Laundry Service</Text>
        <Text style={styles.headerSub}>Request pickup for your room · {roomName}</Text>
      </View>

      {/* Service Cards */}
      <Text style={styles.sectionTitle}>Choose a Service</Text>
      <View style={styles.grid}>
        {LAUNDRY_TYPES.map((item) => (
          <View key={item.label} style={styles.serviceCard}>
            <View style={styles.serviceCardTop}>
              <Text style={styles.serviceEmoji}>{item.emoji}</Text>
              <Text style={styles.servicePrice}>{item.price}</Text>
            </View>
            <Text style={styles.serviceLabel}>{item.label}</Text>
            <Text style={styles.serviceTime}>⏱ {item.time}</Text>
            <TouchableOpacity
              style={[styles.requestBtn, submitting === item.label && styles.requestBtnDisabled]}
              onPress={() => handleRequest(item)}
              disabled={!!submitting}
              activeOpacity={0.8}
            >
              {submitting === item.label ? (
                <ActivityIndicator size="small" color={Colors.blue} />
              ) : (
                <Text style={styles.requestBtnText}>Request Pickup</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* History */}
      {laundries.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>My Laundry History</Text>
          {laundries.map((req) => (
            <View key={req.id} style={styles.historyItem}>
              <Text style={styles.historyEmoji}>🫧</Text>
              <View style={styles.historyInfo}>
                <Text style={styles.historyType}>{req.type}</Text>
                <Text style={styles.historyDate}>
                  {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Today'}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: req.status === 'booked' ? Colors.blue + '20' : Colors.amber + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: req.status === 'booked' ? Colors.blue : Colors.amber }
                ]}>
                  {req.status}
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
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  header: { alignItems: 'center', marginBottom: Spacing.xl, paddingVertical: Spacing.md },
  headerIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.blue + '30' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  serviceCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.blue + '20',
  },
  serviceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  serviceEmoji: { fontSize: 28 },
  servicePrice: { fontSize: 16, fontWeight: '800', color: Colors.blue },
  serviceLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  serviceTime: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  requestBtn: {
    backgroundColor: Colors.blue + '18', borderRadius: BorderRadius.md,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.blue + '30',
  },
  requestBtnDisabled: { opacity: 0.5 },
  requestBtnText: { color: Colors.blue, fontSize: 13, fontWeight: '700' },
  historyItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  historyEmoji: { fontSize: 22, marginRight: 12 },
  historyInfo: { flex: 1 },
  historyType: { fontSize: 14, fontWeight: '600', color: Colors.text },
  historyDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});
