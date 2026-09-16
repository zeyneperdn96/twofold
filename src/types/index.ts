// === Enums ===

export type TripStatus = 'planning' | 'active' | 'reflecting' | 'closed'

export type GroupType = 'solo' | 'couple' | 'multi'

export type Verdict = 'less' | 'same' | 'more'

export type ActivityState = 'plan-only' | 'experienced' | 'unplanned' | 'ghost'

// === Database Models ===

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface Group {
  id: string
  name: string
  type: GroupType
  created_by: string
  created_at: string
}

export interface GroupMember {
  group_id: string
  user_id: string
  joined_at: string
}

export interface Trip {
  id: string
  group_id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  budget: number | null
  status: TripStatus
  phase_updated_at: string
  created_by: string
  created_at: string
}

export interface Activity {
  id: string
  trip_id: string
  day_index: number
  title: string
  planned_time: string | null
  planned_cost: number | null
  planned_note: string | null
  created_by: string
  created_at: string
}

export interface Experience {
  id: string
  activity_id: string
  note: string // mandatory — min 1 sentence
  actual_cost: number | null
  verdict: Verdict | null
  logged_by: string
  logged_at: string
}

export interface Expense {
  id: string
  trip_id: string
  activity_id: string | null
  amount: number
  description: string
  paid_by: string
  created_at: string
}

export interface ExpenseSplit {
  expense_id: string
  user_id: string
  amount_owed: number
  settled: boolean
}

// === Composite Types (for UI) ===

export interface ExperienceWithUser extends Experience {
  user?: User
}

export interface ActivityWithExperiences extends Activity {
  experiences: ExperienceWithUser[]
  state: ActivityState
  created_by_user?: User
}

export interface TripWithGroup extends Trip {
  group: Group
  members: User[]
}

export interface ExpenseWithSplits extends Expense {
  splits: (ExpenseSplit & { user?: User })[]
  paid_by_user?: User
}

// === Trip Summary (auto-generated, no AI) ===

export interface TripSummary {
  total_planned: number
  total_experienced: number
  total_unplanned: number
  total_ghost: number
  average_verdict: { less: number; same: number; more: number }
  biggest_surprise: ActivityWithExperiences | null
  divergences: ActivityWithExperiences[]
}
