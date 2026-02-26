export interface Trip {
  id: string;
  title: string;
  emoji: string;
  start_date: string | null;
  end_date: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface Item {
  id: string;
  trip_id: string;
  type: 'place' | 'ticket';
  title: string;
  category: string | null;
  date: string | null;
  time: string | null;
  status: 'planned' | 'visited';
  file_url: string | null;
  added_by: string;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string | null;
  paid_by: string;
  split: 'equal' | 'solo';
  added_by: string;
  created_at: string;
}

export interface Moment {
  id: string;
  trip_id: string;
  mood: string;
  note: string;
  added_by: string;
  created_at: string;
}
