import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { getRoomServices, addRoomService, getBookings } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const HOUSEKEEPING_TYPES = [
  { type: 'Room Cleaning', icon: '🧹', eta: '30-45 mins' },
  { type: 'Bed Sheet Change', icon: '🛏️', eta: '20-30 mins' },
  { type: 'Bathroom Clean', icon: '🚿', eta: '20-30 mins' },
  { type: 'Trash Removal', icon: '🗑️', eta: '10-15 mins' },
  { type: 'Sanitization', icon: '🧴', eta: '45-60 mins' },
  { type: 'Vacuum Cleaning', icon: '🌬️', eta: '30-40 mins' },
];

export default function HousekeepingScreen({ user }) {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [submitting, setSubmitting] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [s, b] = await Promise.all([
      getRoomServices(),
      getBookings(user.email),
    ]);
    setServices(s.filter(r => r.user_email === user.email));
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
    setSubmitting(type.type);
    const result = await addRoomService({
      user_email: user.email,
      room_name: roomName,
      type: type.type,
    });
    if (result) {
      await fetchData();
      Alert.alert('Requested! ✨', `${type.type} requested for ${roomName}`);
    } else {
      Alert.alert('Error', 'Could not submit request. Please try again.');
    }
    setSubmitting(null);
  };

  const getStatusColor = (status) => {
    if (status === 'done') return Colors.green;
    if (status === 'under process') return Colors.amber;
    return Colors.red;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.purple} />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.purple} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Colors.purple + '18' }]}>
          <Text style={{ fontSize: 28 }}>✨</Text>
        </View>
        <Text style={styles.headerTitle}>Housekeeping</Text>
        <Text style={styles.headerSub}>Request cleaning services for {roomName}</Text>
      </View>

      {/* Services Grid */}
      <Text style={styles.sectionTitle}>Available Services</Text>
      <View style={styles.grid}>
        {HOUSEKEEPING_TYPES.map((item) => (
          <View key={item.type} style={styles.serviceCard}>
            <Text style={styles.serviceEmoji}>{item.icon}</Text>
            <Text style={styles.serviceLabel}>{item.type}</Text>
            <Text style={styles.serviceEta}>⏱ ETA: {item.eta}</Text>
            <TouchableOpacity
              style={[styles.requestBtn, submitting === item.type && styles.requestBtnDisabled]}
              onPress={() => handleRequest(item)}
              disabled={!!submitting}
              activeOpacity={0.8}
            >
              {submitting === item.type ? (
                <ActivityIndicator size="small" color={Colors.purple} />
              ) : (
                <Text style={styles.requestBtnText}>Request Now</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* History */}
      {services.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>My Service History</Text>
          {services.map((req) => (
            <View key={req.id} style={styles.historyItem}>
              <Text style={styles.historyEmoji}>✨</Text>
              <View style={styles.historyInfo}>
                <Text style={styles.historyType}>{req.type}</Text>
                <Text style={styles.historyDate}>
                  {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Today'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>
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
  headerIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.purple + '30' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: Spacing.md },
  serviceCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.purple + '20',
    alignItems: 'flex-start',
  },
  serviceEmoji: { fontSize: 32, marginBottom: 8 },
  serviceLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  serviceEta: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  requestBtn: {
    width: '100%', backgroundColor: Colors.purple + '18', borderRadius: BorderRadius.md,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.purple + '30',
  },
  requestBtnDisabled: { opacity: 0.5 },
  requestBtnText: { color: Colors.purple, fontSize: 13, fontWeight: '700' },
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
