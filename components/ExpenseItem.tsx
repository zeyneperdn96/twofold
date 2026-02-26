import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Expense } from '../lib/types';
import { Monogram } from './Monogram';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: () => void;
}

const categoryEmoji: Record<string, string> = {
  food: '🍽',
  transport: '🚕',
  stay: '🏨',
  ticket: '🎟',
  shopping: '🛍',
  other: '📦',
};

export function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const emoji = categoryEmoji[expense.category || ''] || '📦';

  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert('Harcamayı sil?', undefined, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Pressable style={styles.row} onLongPress={handleLongPress}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{expense.title}</Text>
        <View style={styles.meta}>
          <Monogram name={expense.paid_by} size={18} />
          <Text style={styles.metaText}>
            {expense.paid_by} ödedi · {expense.split === 'equal' ? 'Yarı yarıya' : 'Tek kişi'}
          </Text>
        </View>
      </View>
      <Text style={styles.amount}>
        {expense.amount.toFixed(2)} {expense.currency}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8E8E93',
  },
  amount: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
});
