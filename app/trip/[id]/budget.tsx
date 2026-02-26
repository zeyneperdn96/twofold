import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase, CURRENT_USER } from '../../../lib/supabase';
import { Expense } from '../../../lib/types';
import { ExpenseItem } from '../../../components/ExpenseItem';
import { BottomSheet } from '../../../components/BottomSheet';
import { EmptyState } from '../../../components/EmptyState';

const EXPENSE_CATEGORIES = [
  { key: 'food', label: '🍽 Yemek' },
  { key: 'transport', label: '🚕 Ulaşım' },
  { key: 'stay', label: '🏨 Konaklama' },
  { key: 'ticket', label: '🎟 Bilet' },
  { key: 'shopping', label: '🛍 Alışveriş' },
  { key: 'other', label: '📦 Diğer' },
];

const CURRENCIES = ['TRY', 'EUR', 'USD', 'GBP'];
const PEOPLE = ['zeynep', 'bartu'];

export default function BudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(CURRENT_USER);
  const [split, setSplit] = useState<'equal' | 'solo'>('equal');

  const fetchExpenses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExpenses(data || []);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Budget calculations
  const summary = useMemo(() => {
    const totals: Record<string, number> = {};
    const perPerson: Record<string, Record<string, number>> = {};

    expenses.forEach((e) => {
      // Total by currency
      totals[e.currency] = (totals[e.currency] || 0) + e.amount;

      // Per person spend
      if (!perPerson[e.paid_by]) perPerson[e.paid_by] = {};
      perPerson[e.paid_by][e.currency] = (perPerson[e.paid_by][e.currency] || 0) + e.amount;
    });

    // Debt calculation (only for equal splits)
    const debts: { from: string; to: string; amount: number; currency: string }[] = [];

    // Group by currency for debt calc
    const byCurrency = new Map<string, Expense[]>();
    expenses.forEach((e) => {
      if (e.split !== 'equal') return;
      if (!byCurrency.has(e.currency)) byCurrency.set(e.currency, []);
      byCurrency.get(e.currency)!.push(e);
    });

    byCurrency.forEach((items, cur) => {
      const paid: Record<string, number> = {};
      PEOPLE.forEach((p) => (paid[p] = 0));
      items.forEach((e) => {
        paid[e.paid_by] = (paid[e.paid_by] || 0) + e.amount;
      });

      const totalShared = items.reduce((s, e) => s + e.amount, 0);
      const perHead = totalShared / PEOPLE.length;

      PEOPLE.forEach((person) => {
        const diff = (paid[person] || 0) - perHead;
        if (diff < -0.01) {
          // This person owes money
          const creditor = PEOPLE.find((p) => p !== person && (paid[p] || 0) > perHead);
          if (creditor) {
            debts.push({ from: person, to: creditor, amount: Math.abs(diff), currency: cur });
          }
        }
      });
    });

    return { totals, perPerson, debts };
  }, [expenses]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCurrency('TRY');
    setCategory('food');
    setPaidBy(CURRENT_USER);
    setSplit('equal');
  };

  const handleAdd = async () => {
    if (!title.trim() || !amount) return;

    const newExpense = {
      trip_id: id,
      title: title.trim(),
      amount: parseFloat(amount),
      currency,
      category,
      paid_by: paidBy,
      split,
      added_by: CURRENT_USER,
    };

    try {
      const { error } = await supabase.from('expenses').insert(newExpense);
      if (error) throw error;
      fetchExpenses();
    } catch {
      const localExpense: Expense = {
        ...newExpense,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      setExpenses((prev) => [localExpense, ...prev]);
    }

    setSheetOpen(false);
    resetForm();
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', expenseId);
    } catch {}
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  return (
    <View style={styles.container}>
      {!loading && expenses.length === 0 ? (
        <EmptyState
          emoji="💰"
          message="Henüz harcama yok. İlk harcamayı ekleyin!"
          actionLabel="Ekle"
          onAction={() => setSheetOpen(true)}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Toplam Harcama</Text>
            {Object.entries(summary.totals).map(([cur, total]) => (
              <Text key={cur} style={styles.summaryAmount}>
                {total.toFixed(2)} {cur}
              </Text>
            ))}
            {Object.keys(summary.totals).length === 0 && (
              <Text style={styles.summaryAmount}>0.00 TRY</Text>
            )}

            {/* Per person */}
            <View style={styles.perPersonRow}>
              {PEOPLE.map((person) => (
                <View key={person} style={styles.perPerson}>
                  <Text style={styles.perPersonName}>
                    {person.charAt(0).toUpperCase() + person.slice(1)}
                  </Text>
                  {summary.perPerson[person] ? (
                    Object.entries(summary.perPerson[person]).map(([cur, amt]) => (
                      <Text key={cur} style={styles.perPersonAmount}>
                        {amt.toFixed(2)} {cur}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.perPersonAmount}>0.00</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Expense list */}
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onDelete={() => handleDelete(expense.id)}
            />
          ))}

          {/* Debt section */}
          {summary.debts.length > 0 && (
            <View style={styles.debtSection}>
              <Text style={styles.debtTitle}>Borç Durumu</Text>
              {summary.debts.map((d, i) => (
                <View key={i} style={styles.debtRow}>
                  <Text style={styles.debtText}>
                    {d.from.charAt(0).toUpperCase() + d.from.slice(1)} →{' '}
                    {d.to.charAt(0).toUpperCase() + d.to.slice(1)}
                  </Text>
                  <Text style={styles.debtAmount}>
                    {d.amount.toFixed(2)} {d.currency}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setSheetOpen(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Add Expense Sheet */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text style={styles.sheetTitle}>Yeni Harcama</Text>

        <TextInput
          style={styles.input}
          placeholder="Harcama adı"
          placeholderTextColor="#8E8E93"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.amountRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Tutar"
            placeholderTextColor="#8E8E93"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <View style={styles.currencyPicker}>
            {CURRENCIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.currencyBtn, currency === c && styles.currencyBtnActive]}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Category */}
        <View style={styles.chipRow}>
          {EXPENSE_CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              style={[styles.chip, category === c.key && styles.chipActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={styles.chipText}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Paid by */}
        <Text style={styles.label}>Ödeyen</Text>
        <View style={styles.toggleRow}>
          {PEOPLE.map((p) => (
            <Pressable
              key={p}
              style={[styles.toggle, paidBy === p && styles.toggleActive]}
              onPress={() => setPaidBy(p)}
            >
              <Text style={[styles.toggleText, paidBy === p && styles.toggleTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Split type */}
        <Text style={styles.label}>Bölüşüm</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggle, split === 'equal' && styles.toggleActive]}
            onPress={() => setSplit('equal')}
          >
            <Text style={[styles.toggleText, split === 'equal' && styles.toggleTextActive]}>
              Yarı yarıya
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, split === 'solo' && styles.toggleActive]}
            onPress={() => setSplit('solo')}
          >
            <Text style={[styles.toggleText, split === 'solo' && styles.toggleTextActive]}>
              Tek kişi
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.createBtn, (!title.trim() || !amount) && styles.createBtnDisabled]}
          onPress={handleAdd}
          disabled={!title.trim() || !amount}
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
  scrollContent: {
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#F5F0EB',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  summaryTitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryAmount: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  perPersonRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  perPerson: {
    flex: 1,
  },
  perPersonName: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  perPersonAmount: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  debtSection: {
    margin: 20,
    marginTop: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
  },
  debtTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  debtText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#1C1C1E',
  },
  debtAmount: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
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
  input: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#1C1C1E',
    backgroundColor: '#F5F0EB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  currencyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    width: 120,
  },
  currencyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F0EB',
  },
  currencyBtnActive: {
    backgroundColor: '#1C1C1E',
  },
  currencyText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  currencyTextActive: {
    color: '#FFFFFF',
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
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
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
