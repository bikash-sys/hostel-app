import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { getComplaints } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const CATEGORY_COLORS = {
  Maintenance: Colors.blue,
  Noise: Colors.amber,
  Cleanliness: Colors.green,
  Food: Colors.orange,
  Security: Colors.red,
  Other: Colors.purple,
};

export default function ManagerComplaintsScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const data = await getComplaints();
    setComplaints(data);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.red} />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Colors.red + '18' }]}>
          <Text style={{ fontSize: 26 }}>📋</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Student Complaints</Text>
          <Text style={styles.headerSub}>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} logged</Text>
        </View>
      </View>

      {/* Stats Row */}
      {complaints.length > 0 && (
        <View style={styles.statsRow}>
          {Object.entries(
            complaints.reduce((acc, c) => {
              acc[c.category] = (acc[c.category] || 0) + 1;
              return acc;
            }, {})
          ).slice(0, 3).map(([cat, count]) => (
            <View key={cat} style={[styles.statCard, { borderColor: (CATEGORY_COLORS[cat] || Colors.primary) + '30' }]}>
              <Text style={[styles.statValue, { color: CATEGORY_COLORS[cat] || Colors.primary }]}>{count}</Text>
              <Text style={styles.statLabel}>{cat}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>No Complaints!</Text>
          <Text style={styles.emptyText}>Students are satisfied. Keep up the great work!</Text>
        </View>
      ) : (
        complaints.map((comp, i) => {
          const catColor = CATEGORY_COLORS[comp.category] || Colors.primary;
          return (
            <View key={comp.id || i} style={styles.complaintCard}>
              <View style={styles.cardTop}>
                <View style={[styles.catBadge, { backgroundColor: catColor + '18' }]}>
                  <Text style={[styles.catText, { color: catColor }]}>{comp.category}</Text>
                </View>
                <Text style={styles.dateText}>{comp.date || '—'}</Text>
              </View>
              <Text style={styles.contextText}>{comp.context}</Text>
              <View style={styles.cardBottom}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>🏠 Room</Text>
                  <Text style={styles.metaValue}>{comp.room_no || '—'}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>🎓 USN</Text>
                  <Text style={styles.metaValue}>{comp.usn || '—'}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>📧 Email</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{comp.email || '—'}</Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.red + '20' },
  headerIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.red + '30' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textMuted },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  complaintCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  catText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: Colors.textMuted },
  contextText: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 12 },
  cardBottom: {
    flexDirection: 'row', backgroundColor: Colors.background,
    borderRadius: BorderRadius.md, padding: Spacing.sm,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500', marginBottom: 2 },
  metaValue: { fontSize: 12, fontWeight: '700', color: Colors.text },
  metaDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },
});
