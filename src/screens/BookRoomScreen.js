import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { addBooking, sendBookingEmail } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const ROOM_TYPES = [
  {
    key: 'single',
    label: 'Single Room',
    emoji: '🛏️',
    price: '₹10,000',
    priceNum: 10000,
    perMonth: '/month',
    amenities: ['Private bathroom', 'AC', 'Study table', 'WiFi'],
    color: Colors.primary,
  },
  {
    key: 'double',
    label: 'Double Sharing',
    emoji: '🛏️🛏️',
    price: '₹6,000',
    priceNum: 6000,
    perMonth: '/month',
    amenities: ['Shared bathroom', 'Fan/AC', 'Study table', 'WiFi'],
    color: Colors.blue,
  },
  {
    key: 'triple',
    label: 'Triple Sharing',
    emoji: '🏠',
    price: '₹4,000',
    priceNum: 4000,
    perMonth: '/month',
    amenities: ['Common bathroom', 'Fan', 'Study table', 'WiFi'],
    color: Colors.green,
  },
];

function generateBookingId() {
  return 'BK' + Math.floor(100000 + Math.random() * 900000);
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default function BookRoomScreen({ user, navigation }) {
  const defaultName = user?.email?.split('@')[0] || '';
  const [guestName, setGuestName] = useState(defaultName);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(formatDate(new Date()));
  const [submitting, setSubmitting] = useState(false);

  const handleBook = async () => {
    if (!guestName.trim()) {
      Alert.alert('Missing Info', 'Please enter your full name.');
      return;
    }
    if (!selectedRoom) {
      Alert.alert('Missing Info', 'Please select a room type.');
      return;
    }
    if (!checkIn) {
      Alert.alert('Missing Info', 'Please select a check-in date.');
      return;
    }

    setSubmitting(true);
    try {
      const bookingId = generateBookingId();
      const booking = {
        id: bookingId,
        guest_name: guestName.trim(),
        room_name: selectedRoom.key,
        check_in: checkIn,
        status: 'booked',
        user_email: user.email,
      };

      const result = await addBooking(booking);
      if (!result) {
        Alert.alert('Error', 'Could not create booking. Please try again.');
        setSubmitting(false);
        return;
      }

      // Send confirmation email
      await sendBookingEmail({
        to_email: user.email,
        guest_name: guestName.trim(),
        room_name: selectedRoom.label,
        check_in: checkIn,
        booking_id: bookingId,
      });

      Alert.alert(
        '🎉 Booking Confirmed!',
        `Your ${selectedRoom.label} has been booked.\n\nBooking ID: ${bookingId}\nCheck-in: ${checkIn}\n\nA confirmation email has been sent to ${user.email}.`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => navigation.navigate('StudentHome'),
          },
        ]
      );
    } catch (e) {
      console.error('Booking error:', e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 32 }}>🏠</Text>
        </View>
        <Text style={styles.headerTitle}>Book Your Room</Text>
        <Text style={styles.headerSub}>
          Choose your room type and confirm your hostel accommodation
        </Text>
      </View>

      {/* Guest Name */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FULL NAME</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.input}
            value={guestName}
            onChangeText={setGuestName}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Check-in Date */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CHECK-IN DATE</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>📅</Text>
          <TextInput
            style={styles.input}
            value={checkIn}
            onChangeText={setCheckIn}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
            keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
          />
        </View>
        <Text style={styles.fieldHint}>Format: YYYY-MM-DD (e.g. 2026-06-15)</Text>
      </View>

      {/* Room Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SELECT ROOM TYPE</Text>
        {ROOM_TYPES.map((room) => {
          const isSelected = selectedRoom?.key === room.key;
          return (
            <TouchableOpacity
              key={room.key}
              style={[
                styles.roomCard,
                { borderColor: isSelected ? room.color : Colors.border },
                isSelected && { backgroundColor: room.color + '10' },
              ]}
              onPress={() => setSelectedRoom(room)}
              activeOpacity={0.8}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: room.color }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}

              <View style={styles.roomCardTop}>
                <View style={[styles.roomEmoji, { backgroundColor: room.color + '18' }]}>
                  <Text style={{ fontSize: 24 }}>{room.emoji}</Text>
                </View>
                <View style={styles.roomInfo}>
                  <Text style={[styles.roomLabel, isSelected && { color: room.color }]}>
                    {room.label}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.roomPrice, { color: room.color }]}>{room.price}</Text>
                    <Text style={styles.roomPer}>{room.perMonth}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.amenitiesRow}>
                {room.amenities.map((a) => (
                  <View
                    key={a}
                    style={[styles.amenityChip, { backgroundColor: room.color + '14', borderColor: room.color + '30' }]}
                  >
                    <Text style={[styles.amenityText, { color: room.color }]}>✓ {a}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary */}
      {selectedRoom && (
        <View style={[styles.summaryCard, { borderColor: selectedRoom.color + '40' }]}>
          <Text style={styles.summaryTitle}>📋 Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Name</Text>
            <Text style={styles.summaryVal}>{guestName || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Room</Text>
            <Text style={styles.summaryVal}>{selectedRoom.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Check-in</Text>
            <Text style={styles.summaryVal}>{checkIn}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryKey}>Monthly Rent</Text>
            <Text style={[styles.summaryVal, { color: selectedRoom.color, fontWeight: '800' }]}>
              {selectedRoom.price}
            </Text>
          </View>
        </View>
      )}

      {/* Book Button */}
      <TouchableOpacity
        style={[
          styles.bookBtn,
          (!selectedRoom || submitting) && styles.bookBtnDisabled,
        ]}
        onPress={handleBook}
        disabled={!selectedRoom || submitting}
        activeOpacity={0.85}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.bookBtnText}>🏠 Confirm Booking</Text>
        )}
      </TouchableOpacity>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Text style={styles.infoNoteText}>
          ℹ️ A confirmation email will be sent to {user?.email}. Your booking is subject to availability and hostel management approval.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 48 },

  header: { alignItems: 'center', marginBottom: Spacing.xl, paddingVertical: Spacing.md },
  headerIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: Colors.primary + '30',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 19 },

  section: { marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: {
    flex: 1, fontSize: 15, color: Colors.text,
    paddingVertical: 12,
  },
  fieldHint: { fontSize: 11, color: Colors.textMuted, marginTop: 6, marginLeft: 4 },

  roomCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1.5, padding: Spacing.lg,
    marginBottom: 12, position: 'relative',
  },
  checkmark: {
    position: 'absolute', top: 14, right: 14,
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmarkText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  roomCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  roomEmoji: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  roomInfo: { flex: 1 },
  roomLabel: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  roomPrice: { fontSize: 22, fontWeight: '800' },
  roomPer: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  amenityText: { fontSize: 11, fontWeight: '600' },

  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1.5, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  summaryKey: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  summaryVal: { fontSize: 13, color: Colors.text, fontWeight: '600' },

  bookBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg,
    paddingVertical: 18, alignItems: 'center', marginBottom: Spacing.md,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  bookBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  bookBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  infoNote: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  infoNoteText: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, textAlign: 'center' },
});
