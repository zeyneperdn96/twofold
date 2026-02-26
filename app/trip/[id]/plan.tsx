import { useEffect, useState, useCallback } from 'react';
import { View, Text, SectionList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase, CURRENT_USER } from '../../../lib/supabase';
import { Item } from '../../../lib/types';
import { TimelineItem } from '../../../components/TimelineItem';
import { BottomSheet } from '../../../components/BottomSheet';
import { EmptyState } from '../../../components/EmptyState';

const CATEGORIES = [
  { key: 'restaurant', label: '🍽 Restoran' },
  { key: 'cafe', label: '☕ Kafe' },
  { key: 'museum', label: '🏛 Müze' },
  { key: 'landmark', label: '📍 Gezi' },
  { key: 'shop', label: '🛍 Alışveriş' },
];

function groupByDate(items: Item[]): { title: string; data: Item[] }[] {
  const dated = new Map<string, Item[]>();
  const undated: Item[] = [];

  items.forEach((item) => {
    if (item.date) {
      const key = item.date;
      if (!dated.has(key)) dated.set(key, []);
      dated.get(key)!.push(item);
    } else {
      undated.push(item);
    }
  });

  const sections: { title: string; data: Item[] }[] = [];

  // Sort dates ascending
  const sortedKeys = [...dated.keys()].sort();
  sortedKeys.forEach((key) => {
    const d = new Date(key);
    const label = `${d.getDate()} ${d.toLocaleString('tr-TR', { month: 'long' })}`;
    sections.push({ title: label, data: dated.get(key)! });
  });

  if (undated.length > 0) {
    sections.push({ title: 'Tarihsiz', data: undated });
  }

  return sections;
}

function getCountdown(startDate: string | null): string | null {
  if (!startDate) return null;
  const now = new Date();
  const start = new Date(startDate);
  const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return 'Bugün! 🎉';
  return `${diff} gün kaldı`;
}

export default function PlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Form state
  const [itemType, setItemType] = useState<'place' | 'ticket'>('place');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('landmark');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('trip_id', id)
        .order('date', { ascending: true, nullsFirst: false })
        .order('time', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setItems(data || []);

      // Fetch trip for countdown
      const { data: trip } = await supabase
        .from('trips')
        .select('start_date')
        .eq('id', id)
        .single();
      if (trip?.start_date) {
        setCountdown(getCountdown(trip.start_date));
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const resetForm = () => {
    setName('');
    setCategory('landmark');
    setDate('');
    setTime('');
    setItemType('place');
  };

  const handleAdd = async () => {
    if (!name.trim()) return;

    const newItem = {
      trip_id: id,
      type: itemType,
      title: name.trim(),
      category: itemType === 'place' ? category : null,
      date: date || null,
      time: time || null,
      status: 'planned' as const,
      file_url: null,
      added_by: CURRENT_USER,
    };

    try {
      const { error } = await supabase.from('items').insert(newItem);
      if (error) throw error;
      fetchItems();
    } catch {
      // Offline fallback
      const localItem: Item = {
        ...newItem,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setItems((prev) => [...prev, localItem]);
    }

    setSheetOpen(false);
    resetForm();
  };

  const handleDelete = async (itemId: string) => {
    try {
      await supabase.from('items').delete().eq('id', itemId);
    } catch {}
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleMarkVisited = async (itemId: string) => {
    try {
      await supabase.from('items').update({ status: 'visited' }).eq('id', itemId);
    } catch {}
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'visited' } : i))
    );
  };

  const sections = groupByDate(items);

  return (
    <View style={styles.container}>
      {/* Countdown */}
      {countdown && (
        <View style={styles.countdown}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {!loading && items.length === 0 ? (
        <EmptyState
          emoji="📋"
          message="Henüz plan yok. İlk noktayı ekleyin!"
          actionLabel="Ekle"
          onAction={() => setSheetOpen(true)}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TimelineItem
              item={item}
              onDelete={() => handleDelete(item.id)}
              onMarkVisited={() => handleMarkVisited(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Add Item Sheet */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Yeni Ekle</Text>

        {/* Type toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggle, itemType === 'place' && styles.toggleActive]}
            onPress={() => setItemType('place')}
          >
            <Text style={[styles.toggleText, itemType === 'place' && styles.toggleTextActive]}>
              📍 Mekan
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, itemType === 'ticket' && styles.toggleActive]}
            onPress={() => setItemType('ticket')}
          >
            <Text style={[styles.toggleText, itemType === 'ticket' && styles.toggleTextActive]}>
              ✈️ Bilet
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder={itemType === 'place' ? 'Mekan adı' : 'Bilet adı'}
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={setName}
        />

        {/* Category chips (place only) */}
        {itemType === 'place' && (
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.key}
                style={[styles.chip, category === c.key && styles.chipActive]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={styles.chipText}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Tarih (YYYY-MM-DD)"
            placeholderTextColor="#8E8E93"
            value={date}
            onChangeText={setDate}
          />
          {itemType === 'ticket' && (
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Saat (HH:MM)"
              placeholderTextColor="#8E8E93"
              value={time}
              onChangeText={setTime}
            />
          )}
        </View>

        <Pressable
          style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
          onPress={handleAdd}
          disabled={!name.trim()}
        >
          <Text style={styles.createBtnText}>Ekle</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  countdown: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  countdownText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#A08B6A',
  },
  list: {
    paddingBottom: 100,
  },
  sectionHeader: {
    backgroundColor: '#FAFAF7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '400',
    marginTop: -1,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F0EB',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#1C1C1E',
  },
  toggleText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#F5F0EB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F0EB',
  },
  chipActive: {
    backgroundColor: '#E8DFD0',
    borderWidth: 1.5,
    borderColor: '#A08B6A',
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 13,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  createBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
