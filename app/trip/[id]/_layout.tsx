import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Trip } from '../../../lib/types';

export default function TripLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setTrip(data);
      } catch {
        // Not connected — use fallback
      }
    })();
  }, [id]);

  const headerTitle = trip ? `${trip.emoji} ${trip.title}` : 'Seyahat';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#1C1C1E',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ),
        headerTitle: () => (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
        ),
      }}
    >
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="moments"
        options={{
          title: 'Anılar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💭</Text>,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Bütçe',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💰</Text>,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FAFAF7',
  },
  headerTitle: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  backBtn: {
    paddingLeft: 12,
    paddingRight: 4,
  },
  backText: {
    fontSize: 28,
    color: '#1C1C1E',
    fontWeight: '300',
  },
  tabBar: {
    backgroundColor: '#FAFAF7',
    borderTopColor: '#E5E5E5',
  },
  tabLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
  },
});
