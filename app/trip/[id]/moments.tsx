import { useEffect, useState, useCallback } from 'react';
import { View, Text, SectionList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase, CURRENT_USER } from '../../../lib/supabase';
import { Moment } from '../../../lib/types';
import { MomentCard } from '../../../components/MomentCard';
import { BottomSheet } from '../../../components/BottomSheet';

const MOODS = ['😊', '🥰', '😎', '🤩', '😌'];

function groupByDate(moments: Moment[]): { title: string; data: Moment[] }[] {
  const grouped = new Map<string, Moment[]>();

  moments.forEach((m) => {
    const d = new Date(m.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(m);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, data]) => {
      const d = new Date(key);
      const label = `${d.getDate()} ${d.toLocaleString('tr-TR', { month: 'long' })}`;
      return { title: label, data };
    });
}

export default function MomentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form state
  const [mood, setMood] = useState('😊');
  const [note, setNote] = useState('');

  const fetchMoments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('trip_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMoments(data || []);
    } catch {
      setMoments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  const handleAdd = async () => {
    if (!note.trim()) return;

    const newMoment = {
      trip_id: id,
      mood,
      note: note.trim(),
      added_by: CURRENT_USER,
    };

    try {
      const { error } = await supabase.from('moments').insert(newMoment);
      if (error) throw error;
      fetchMoments();
    } catch {
      const localMoment: Moment = {
        ...newMoment,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setMoments((prev) => [localMoment, ...prev]);
    }

    setSheetOpen(false);
    setNote('');
    setMood('😊');
  };

  const handleDelete = async (momentId: string) => {
    try {
      await supabase.from('moments').delete().eq('id', momentId);
    } catch {}
    setMoments((prev) => prev.filter((m) => m.id !== momentId));
  };

  const openWithMood = (m: string) => {
    setMood(m);
    setSheetOpen(true);
  };

  const sections = groupByDate(moments);

  return (
    <View style={styles.container}>
      {!loading && moments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nasıl hissediyorsun?</Text>
          <View style={styles.emptyMoods}>
            {MOODS.map((m) => (
              <Pressable key={m} style={styles.emptyMoodBtn} onPress={() => openWithMood(m)}>
                <Text style={styles.emptyMoodEmoji}>{m}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.emptyHint}>Bir emoji seç ve anını yaz</Text>
        </View>
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
            <View style={styles.cardWrapper}>
              <MomentCard moment={item} onDelete={() => handleDelete(item.id)} />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* FAB */}
      {moments.length > 0 && (
        <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      {/* Add Moment Sheet */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Yeni Anı</Text>

        {/* Mood picker */}
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <Pressable
              key={m}
              style={[styles.moodOption, mood === m && styles.moodSelected]}
              onPress={() => setMood(m)}
            >
              <Text style={styles.moodEmoji}>{m}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.textarea}
          placeholder="Bu anı anlat..."
          placeholderTextColor="#8E8E93"
          value={note}
          onChangeText={(text) => setNote(text.slice(0, 280))}
          multiline
          maxLength={280}
        />
        <Text style={styles.charCount}>{note.length}/280</Text>

        <Pressable
          style={[styles.createBtn, !note.trim() && styles.createBtnDisabled]}
          onPress={handleAdd}
          disabled={!note.trim()}
        >
          <Text style={styles.createBtnText}>Kaydet</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 24,
  },
  emptyMoods: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  emptyMoodBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMoodEmoji: {
    fontSize: 26,
  },
  emptyHint: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#8E8E93',
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
  cardWrapper: {
    paddingHorizontal: 20,
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
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    justifyContent: 'center',
  },
  moodOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodSelected: {
    backgroundColor: '#E8DFD0',
    borderWidth: 2,
    borderColor: '#A08B6A',
  },
  moodEmoji: {
    fontSize: 24,
  },
  textarea: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#F5F0EB',
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginBottom: 12,
  },
  createBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
