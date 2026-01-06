export interface Day {
  id: string
  day_number: number
  date: string
  title: string
  highlights?: string[]
  created_at: string
}

export interface SubItem {
  id: string
  day_id: string
  title: string
  text: string
  audio_url?: string
  action_field_text?: string
  action_field_owner?: string
  created_at: string
  created_by: string
}

export interface Media {
  id: string
  sub_item_id: string
  type: 'image' | 'video' | 'audio'
  url: string
  filename: string
  order: number
}

export interface Theme {
  id: string
  name: string
  color: string
  is_custom: boolean
}

export interface Reaction {
  id: string
  sub_item_id: string
  name: string
  role: string
  text: string
  created_at: string
}

export interface Poll {
  id: string
  sub_item_id: string
  question: string
  type: 'multiple_choice' | 'open' | 'rating'
  options?: string[]
  created_at: string
}

export interface PollResponse {
  id: string
  poll_id: string
  name: string
  role: string
  answer: string | number
  created_at: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'viewer'
  name?: string
}

