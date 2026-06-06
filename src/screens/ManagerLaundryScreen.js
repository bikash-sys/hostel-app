import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { getLaundryRequests, updateLaundryRequestStatus } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

export default function ManagerLaundryScreen() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    const data = await getLaundryRequests();
    setLaundries(data);
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

  const handleUpdate = async (id, status) => {
    setUpdatingId(id);
    const result = await updateLaundryRequestStatus(id, status);
    if (result) {
      setLaundries(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } else {
      Alert.alert('Error', 'Could not update status.');
    }
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? laundries : laundries.filter(l => l.status === filter);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.blue} />
        <Text style={styles.loadingText}>Loading laundry requests...</Text>
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
          <Text style={{ fontSize: 26 }}>🫧</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Laundry Manager</Text>
          <Text style={styles.headerSub}>{laundries.length} total requests</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Pending', count: laundries.filter(l => l.status === 'pending').length, color: Colors.amber },
          { label: 'Booked', count: laundries.filter(l => l.status === 'booked').length, color: Colors.blue },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { borderColor: s.color + '30' }]}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.count}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'booked'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🫧</Text>
          <Text style={styles.emptyText}>No {filter === 'all' ? '' : filter} laundry requests</Text>
        </View>
      ) : (
        filtered.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View>
                <Text style={styles.requestRoom}>🏠 {req.room_name}</Text>
                <Text style={styles.requestType}>{req.type}</Text>
                <Text style={styles.requestEmail}>{req.user_email}</Text>
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
            <Text style={styles.requestDate}>
              {req.created_at ? new Date(req.created_at).toLocaleString() : 'Unknown time'}
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.amber + '18', borderColor: Colors.amber + '30' }]}
                onPress={() => handleUpdate(req.id, 'pending')}
                disabled={updatingId === req.id}
              >
                {updatingId === req.id ? <ActivityIndicator size="small" color={Colors.amber} /> : <Text style={[styles.actionBtnText, { color: Colors.amber }]}>Set Pending</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.blue + '18', borderColor: Colors.blue + '30' }]}
                onPress={() => handleUpdate(req.id, 'booked')}
                disabled={updatingId === req.id}
              >
                {updatingId === req.id ? <ActivityIndicator size="small" color={Colors.blue} /> : <Text style={[styles.actionBtnText, { color: Colors.blue }]}>Set Booked</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.blue + '20' },
  headerIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.blue + '30' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surfaceLight },
  filterChipActive: { borderColor: Colors.blue, backgroundColor: Colors.blue + '18' },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  filterTextActive: { color: Colors.blue },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: Colors.textMuted },
  requestCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  requestRoom: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  requestType: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  requestEmail: { fontSize: 12, color: Colors.textMuted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  requestDate: { fontSize: 11, color: Colors.textMuted, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});
