import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { getMessMenu } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const MEAL_COLORS = {
  Breakfast: { color: Colors.amber, bg: Colors.amber + '18', emoji: '🌅' },
  Lunch: { color: Colors.green, bg: Colors.green + '18', emoji: '☀️' },
  Snacks: { color: Colors.purple, bg: Colors.purple + '18', emoji: '🍪' },
  Dinner: { color: Colors.indigo, bg: Colors.indigo + '18', emoji: '🌙' },
};

export default function MenuScreen() {
  const [menu, setMenu] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hour = now.getHours();
  const getCurrentMeal = () => {
    if (hour >= 7 && hour < 9) return 'Breakfast';
    if (hour >= 12 && hour < 14) return 'Lunch';
    if (hour >= 16 && hour < 17) return 'Snacks';
    if (hour >= 19 && hour < 21) return 'Dinner';
    return null;
  };
  const currentMeal = getCurrentMeal();

  const fetchMenu = async () => {
    const m = await getMessMenu();
    setMenu(m);
    setLoading(false);
  };

  useEffect(() => { fetchMenu(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMenu();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.amber} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.amber} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: Colors.amber + '18' }]}>
          <Text style={{ fontSize: 28 }}>🍽️</Text>
        </View>
        <Text style={styles.headerTitle}>Today's Mess Menu</Text>
        <Text style={styles.headerSub}>Fresh meals prepared daily in the hostel mess</Text>
      </View>

      {/* Meal Cards */}
      {menu.map((meal) => {
        const theme = MEAL_COLORS[meal.meal] || { color: Colors.primary, bg: Colors.primary + '18', emoji: '🍴' };
        const isActive = meal.meal === currentMeal;
        return (
          <View key={meal.meal} style={[styles.mealCard, { borderColor: isActive ? theme.color : Colors.border }]}>
            {isActive && (
              <View style={[styles.activeBadge, { backgroundColor: theme.color }]}>
                <Text style={styles.activeBadgeText}>🔴 Now Serving</Text>
              </View>
            )}
            <View style={styles.mealHeader}>
              <View style={[styles.mealIcon, { backgroundColor: theme.bg }]}>
                <Text style={{ fontSize: 24 }}>{theme.emoji}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={[styles.mealName, isActive && { color: theme.color }]}>{meal.meal}</Text>
                <View style={[styles.timeBadge, { backgroundColor: theme.bg }]}>
                  <Text style={[styles.timeText, { color: theme.color }]}>⏰ {meal.time}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.itemsText}>{meal.items}</Text>
            <View style={styles.itemChips}>
              {meal.items.split(',').map((item, i) => (
                <View key={i} style={[styles.itemChip, { backgroundColor: theme.bg, borderColor: theme.color + '30' }]}>
                  <Text style={[styles.itemChipText, { color: theme.color }]}>{item.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Text style={styles.infoNoteText}>
          ℹ️ Menu is updated daily by the hostel manager. Pull to refresh for the latest changes.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  header: { alignItems: 'center', marginBottom: Spacing.xl, paddingVertical: Spacing.md },
  headerIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.amber + '30' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  mealCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1.5, overflow: 'hidden',
  },
  activeBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  activeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  mealIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  timeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
  itemsText: { fontSize: 14, color: Colors.textMuted, marginBottom: 12, lineHeight: 20 },
  itemChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  itemChipText: { fontSize: 11, fontWeight: '600' },
  infoNote: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm,
  },
  infoNoteText: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, textAlign: 'center' },
});
