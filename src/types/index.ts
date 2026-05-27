
export type DataState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export interface NetworkEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: string[]; // user ids
  created_at: string;
}

export type UserRole = 'visitor' | 'user' | 'mentor' | 'admin';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  due_date: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  type: 'pre-program' | 'weekly' | 'post-session' | 'exit';
  rating: number;
  comments: string;
  date: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  mentorship_status?: 'applied' | 'approved' | 'active' | 'completed';
  joined_date?: string;
  tags?: string[];
  notes?: string[];
  tasks?: Task[];
  milestones?: Milestone[];
  phone?: string;
  created_at?: string;
  password?: string;
}

export interface Application {
  id: string;
  user_id?: string; 
  user_name: string;
  user_email: string;
  user_phone: string;
  mentor_type: string;
  meeting_preference: 'Virtual' | 'In-Person' | 'Hybrid';
  frequency: string;
  goals: string;
  seriousness: number;
  attribution?: string;
  source?: string;
  tags?: string[];
  notes?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  created_at: string;
  ai_score?: number;
  pillar?: string;
  experience?: string;
}

export type ApplicationInput = Omit<Application, 'status' | 'created_at'> & {
  status?: string;
  created_at?: string;
  id?: string;
};

export interface Product {
  id: string;
  full_name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  salesCount?: number;
  status?: 'active' | 'draft';
}

export interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Transaction {
  id: string;
  user_name: string;
  amount: number;
  date: string;
  product: string;
  status: 'successful' | 'pending' | 'failed';
}

export interface AIChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  program_type?: string; 
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  category: string;
  is_pinned: boolean;
}

export interface TaskActivity {
  id: string;
  user_id: string;
  user_name: string;
  status: 'pending' | 'reviewed';
  admin_response?: string;
  created_at: string;
  
  // Personal Branding
  pb_card_details?: string;
  pb_linkedin_url?: string;
  pb_resume_link?: string;
  pb_cover_letter_link?: string;
  pb_dress_code_notes?: string;
  pb_greeting_intro_notes?: string;
  
  // Networking
  net_attended_event: string;
  net_people_met: string;
  net_contact_info: string;
  net_panel_summary: string;
  
  // Partner Work
  pw_introduction: string;
  pw_volunteer_hours: string;
  
  // Certification & Roadmap
  cert_topic: string;
  roadmap_topic: string;
  
  // Interview Prep
  interview_recommendation: string;
}

export type RuleOperator = 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'custom';

export interface ValidationRule {
  id: string;
  field: string;
  entity: 'Application' | 'User' | 'TaskActivity' | 'Product' | 'Booking';
  operator: RuleOperator;
  value: any;
  errorMessage: string;
  isActive: boolean;
  created_at?: string;
}
