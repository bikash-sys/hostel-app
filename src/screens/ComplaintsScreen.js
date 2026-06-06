import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { addComplaint, getComplaints } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const CATEGORIES = ['Maintenance', 'Noise', 'Cleanliness', 'Food', 'Security', 'Other'];

export default function ComplaintsScreen({ user, booking }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [category, setCategory] = useState('Maintenance');
  const [context, setContext] = useState('');
  const [usn, setUsn] = useState('');

  const roomNo = booking?.roomName || booking?.room_name || 'Unknown';

  const fetchComplaints = async () => {
    const data = await getComplaints();
    // Students only see their own complaints
    setComplaints(data.filter(c => c.email === user.email));
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!context.trim()) {
      Alert.alert('Required', 'Please describe your complaint.');
      return;
    }
    setSubmitting(true);
    const result = await addComplaint({
      date: new Date().toLocaleDateString(),
      type: 'Student',
      room_no: roomNo,
      usn: usn || user.email,
      category,
      context: context.trim(),
      email: user.email,
    });
    if (result) {
      Alert.alert('Submitted ✅', 'Your complaint has been logged for the manager to review.');
      setContext('');
      setUsn('');
      setCategory('Maintenance');
      setShowForm(false);
      await fetchComplaints();
    } else {
      Alert.alert('Error', 'Could not submit complaint. Please try again.');
    }
    setSubmitting(false);
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
          <Text style={{ fontSize: 28 }}>📋</Text>
        </View>
        <Text style={styles.headerTitle}>Complaints</Text>
        <Text style={styles.headerSub}>Log issues for the hostel management to review</Text>
      </View>

      {/* File Complaint Button */}
      <TouchableOpacity
        style={styles.fileBtn}
        onPress={() => setShowForm(!showForm)}
        activeOpacity={0.85}
      >
        <Text style={styles.fileBtnText}>{showForm ? '✕ Cancel' : '+ File a Complaint'}</Text>
      </TouchableOpacity>

      {/* Complaint Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New Complaint</Text>

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>USN / ID (optional)</Text>
          <TextInput
            style={styles.input}
            value={usn}
            onChangeText={setUsn}
            placeholder="e.g. 1NT21CS001"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Describe the Issue *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={context}
            onChangeText={setContext}
            placeholder="Describe your complaint in detail..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Complaint</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Complaints History */}
      <Text style={styles.sectionTitle}>
        {complaints.length === 0 ? 'No complaints filed' : `My Complaints (${complaints.length})`}
      </Text>

      {complaints.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyText}>No complaints yet! Great hostel experience.</Text>
        </View>
      ) : (
        complaints.map((comp, i) => (
          <View key={comp.id || i} style={styles.complaintCard}>
            <View style={styles.complaintHeader}>
              <View style={[styles.catBadge, { backgroundColor: Colors.red + '18' }]}>
                <Text style={[styles.catBadgeText, { color: Colors.red }]}>{comp.category}</Text>
              </View>
              <Text style={styles.complaintDate}>{comp.date}</Text>
            </View>
            <Text style={styles.complaintContext}>{comp.context}</Text>
            <Text style={styles.complaintRoom}>🏠 Room {comp.room_no} · {comp.usn}</Text>
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
  header: { alignItems: 'center', marginBottom: Spacing.lg, paddingVertical: Spacing.md },
  headerIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.red + '30' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  fileBtn: {
    backgroundColor: Colors.red, borderRadius: BorderRadius.lg,
    paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.md,
    shadowColor: Colors.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 5,
  },
  fileBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  formCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1,
    borderColor: Colors.red + '30', marginBottom: Spacing.lg,
  },
  formTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: Spacing.sm },
  categoryScroll: { marginBottom: 4 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    marginRight: 8, backgroundColor: Colors.surfaceLight,
  },
  categoryChipActive: { borderColor: Colors.red, backgroundColor: Colors.red + '18' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  categoryChipTextActive: { color: Colors.red },
  input: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.text, fontSize: 15, marginBottom: 4,
  },
  textarea: { minHeight: 100 },
  submitBtn: {
    backgroundColor: Colors.red, borderRadius: BorderRadius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  complaintCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  complaintHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  complaintDate: { fontSize: 12, color: Colors.textMuted },
  complaintContext: { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 8 },
  complaintRoom: { fontSize: 12, color: Colors.textMuted },
});
