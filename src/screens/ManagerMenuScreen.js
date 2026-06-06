import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { getMessMenu, saveMessMenu } from '../supabase';
import { Colors, Spacing, BorderRadius } from '../theme';

const MEAL_EMOJIS = { Breakfast: '🌅', Lunch: '☀️', Snacks: '🍪', Dinner: '🌙' };

export default function ManagerMenuScreen() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editedItems, setEditedItems] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setEditedItems(meal.items);
  };

  const handleSave = async () => {
    if (!editedItems.trim()) {
      Alert.alert('Required', 'Please enter at least one dish.');
      return;
    }
    setSaving(true);
    const updatedMenu = menu.map(m =>
      m.meal === editingMeal.meal ? { ...m, items: editedItems.trim() } : m
    );
    const result = await saveMessMenu(updatedMenu);
    if (result) {
      setMenu(updatedMenu);
      setEditingMeal(null);
      Alert.alert('Saved! ✅', `${editingMeal.meal} menu updated.`);
    } else {
      Alert.alert('Error', 'Could not save menu changes.');
    }
    setSaving(false);
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
          <Text style={{ fontSize: 26 }}>🍽️</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Mess Menu Editor</Text>
          <Text style={styles.headerSub}>Edit daily dishes for all meals</Text>
        </View>
      </View>

      {/* Edit Form */}
      {editingMeal && (
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>
            {MEAL_EMOJIS[editingMeal.meal] || '🍴'} Editing {editingMeal.meal}
          </Text>
          <Text style={styles.editNote}>Enter dishes separated by commas</Text>
          <TextInput
            style={styles.editInput}
            value={editedItems}
            onChangeText={setEditedItems}
            placeholder="e.g. Rice, Dal, Roti, Sabzi..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.editBtns}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditingMeal(null)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Meal Cards */}
      {menu.map((meal) => (
        <View key={meal.meal} style={[styles.mealCard, editingMeal?.meal === meal.meal && styles.mealCardActive]}>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: Colors.amber + '18' }]}>
              <Text style={{ fontSize: 24 }}>{MEAL_EMOJIS[meal.meal] || '🍴'}</Text>
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.meal}</Text>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>⏰ {meal.time}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.mealItems}>{meal.items}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEdit(meal)}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>✏️ Edit {meal.meal} Dishes</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.amber + '20' },
  headerIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.amber + '30' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textMuted },
  editCard: {
    backgroundColor: Colors.amber + '08', borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.amber + '40',
  },
  editTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  editNote: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.md },
  editInput: {
    backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.amber + '40',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    color: Colors.text, fontSize: 14, marginBottom: Spacing.md, minHeight: 80,
  },
  editBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '700' },
  saveBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.amber, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  mealCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  mealCardActive: { borderColor: Colors.amber + '60' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  mealIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  timeBadge: { backgroundColor: Colors.amber + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  timeText: { fontSize: 12, color: Colors.amber, fontWeight: '600' },
  mealItems: { fontSize: 13, color: Colors.textMuted, lineHeight: 20, marginBottom: 12 },
  editBtn: {
    backgroundColor: Colors.amber + '18', borderRadius: BorderRadius.md,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.amber + '30',
  },
  editBtnText: { color: Colors.amber, fontSize: 14, fontWeight: '700' },
});
