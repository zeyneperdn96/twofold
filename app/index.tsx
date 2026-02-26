import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, CURRENT_USER } from '../lib/supabase';
import { Trip } from '../lib/types';
import { TripCard } from '../components/TripCard';
import { BottomSheet } from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';

const TRIP_EMOJIS = ['✈️', '🏖', '🗺', '🚗', '🏔', '🌍', '🛫', '🧳'];

export default function HomeScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('✈️');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTrips = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTrips(data || []);
    } catch {
      // Supabase not connected yet — show empty state
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const resetForm = () => {
    setTitle('');
    setEmoji('✈️');
    setStartDate('');
    setEndDate('');
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    const newTrip = {
      title: title.trim(),
      emoji,
      start_date: startDate || null,
      end_date: endDate || null,
      invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      created_by: CURRENT_USER,
    };

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert(newTrip)
        .select()
        .single();
      if (error) throw error;

      setSheetOpen(false);
      resetForm();
      fetchTrips();
      router.push(`/trip/${data.id}/plan`);
    } catch {
      // Offline or not connected — add locally for demo
      const localTrip: Trip = {
        ...newTrip,
        id: Date.now().toString(),
        start_date: startDate || null,
        end_date: endDate || null,
        created_at: new Date().toISOString(),
      };
      setTrips((prev) => [localTrip, ...prev]);
      setSheetOpen(false);
      resetForm();
      router.push(`/trip/${localTrip.id}/plan`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Us & Where</Text>
        <Pressable style={styles.addBtn} onPress={() => setSheetOpen(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </Pressable>
      </View>

      {/* Trip list */}
      {!loading && trips.length === 0 ? (
        <EmptyState
          emoji="🗺"
          message="Henüz bir seyahat yok. İlk seyahatinizi oluşturun!"
          actionLabel="Yeni Seyahat"
          onAction={() => setSheetOpen(true)}
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => router.push(`/trip/${item.id}/plan`)}
            />
          )}
        />
      )}

      {/* New Trip Sheet */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Yeni Seyahat</Text>

        {/* Emoji picker */}
        <View style={styles.emojiRow}>
          {TRIP_EMOJIS.map((e) => (
            <Pressable
              key={e}
              style={[styles.emojiOption, emoji === e && styles.emojiSelected]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiText}>{e}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Seyahat adı"
          placeholderTextColor="#8E8E93"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="Başlangıç (YYYY-MM-DD)"
            placeholderTextColor="#8E8E93"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="Bitiş (YYYY-MM-DD)"
            placeholderTextColor="#8E8E93"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>

        <Pressable
          style={[styles.createBtn, !title.trim() && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!title.trim()}
        >
          <Text style={styles.createBtnText}>Oluştur</Text>
        </Pressable>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '400',
    marginTop: -1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0EB',
  },
  emojiSelected: {
    backgroundColor: '#E8DFD0',
    borderWidth: 2,
    borderColor: '#A08B6A',
  },
  emojiText: {
    fontSize: 20,
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
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 1,
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
