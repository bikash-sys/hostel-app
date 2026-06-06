import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';

const TRANSACTIONS = [
  { label: 'Room Rent – June 2026', date: 'Jun 1, 2026', amount: '₹8,500', status: 'paid' },
  { label: 'Laundry Services – May', date: 'May 28, 2026', amount: '₹240', status: 'paid' },
  { label: 'Mess Subscription – June', date: 'Jun 1, 2026', amount: '₹3,200', status: 'pending' },
  { label: 'Electricity Charges – May', date: 'May 31, 2026', amount: '₹650', status: 'pending' },
  { label: 'Room Rent – May 2026', date: 'May 1, 2026', amount: '₹8,500', status: 'paid' },
];

export default function PaymentsScreen() {
  const paid = TRANSACTIONS.filter(t => t.status === 'paid');
  const pending = TRANSACTIONS.filter(t => t.status === 'pending');
  const totalPending = pending.reduce((sum, t) => {
    const num = parseFloat(t.amount.replace('₹', '').replace(',', ''));
    return sum + num;
  }, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Colors.green + '18' }]}>
          <Text style={{ fontSize: 28 }}>💳</Text>
        </View>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSub}>Track your hostel dues and transaction history</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{paid.length}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
          <View style={[styles.summaryDivider]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.amber }]}>{pending.length}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.red, fontSize: 18 }]}>₹{totalPending.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Due Amount</Text>
          </View>
        </View>
      </View>

      {/* Pay Now Button */}
      {pending.length > 0 && (
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => Alert.alert('Payment Gateway', 'Payment gateway integration coming soon!')}
          activeOpacity={0.85}
        >
          <Text style={styles.payBtnText}>💳 Pay ₹{totalPending.toLocaleString()} Now</Text>
        </TouchableOpacity>
      )}

      {/* Pending Transactions */}
      {pending.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⚠️ Pending Payments</Text>
          {pending.map((txn, i) => (
            <View key={i} style={[styles.txnCard, styles.txnCardPending]}>
              <View style={styles.txnLeft}>
                <View style={[styles.txnIcon, { backgroundColor: Colors.amber + '18' }]}>
                  <Text style={{ fontSize: 20 }}>🕐</Text>
                </View>
                <View>
                  <Text style={styles.txnLabel}>{txn.label}</Text>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                </View>
              </View>
              <View style={styles.txnRight}>
                <Text style={styles.txnAmount}>{txn.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: Colors.amber + '20' }]}>
                  <Text style={[styles.statusText, { color: Colors.amber }]}>Pending</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Paid Transactions */}
      <Text style={styles.sectionTitle}>✅ Payment History</Text>
      {paid.map((txn, i) => (
        <View key={i} style={styles.txnCard}>
          <View style={styles.txnLeft}>
            <View style={[styles.txnIcon, { backgroundColor: Colors.green + '18' }]}>
              <Text style={{ fontSize: 20 }}>✅</Text>
            </View>
            <View>
              <Text style={styles.txnLabel}>{txn.label}</Text>
              <Text style={styles.txnDate}>{txn.date}</Text>
            </View>
          </View>
          <View style={styles.txnRight}>
            <Text style={[styles.txnAmount, { color: Colors.green }]}>{txn.amount}</Text>
            <View style={[styles.statusBadge, { backgroundColor: Colors.green + '20' }]}>
              <Text style={[styles.statusText, { color: Colors.green }]}>Paid</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: Spacing.lg, paddingVertical: Spacing.md },
  headerIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.green + '30' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.green, marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  payBtn: {
    backgroundColor: Colors.green, borderRadius: BorderRadius.lg,
    paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.lg,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  txnCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  txnCardPending: { borderColor: Colors.amber + '30' },
  txnLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  txnIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txnLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1, flexWrap: 'wrap' },
  txnDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  txnRight: { alignItems: 'flex-end', gap: 6 },
  txnAmount: { fontSize: 15, fontWeight: '800', color: Colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusText: { fontSize: 10, fontWeight: '700' },
});
