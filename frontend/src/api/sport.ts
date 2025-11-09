// API client per comunicare con il backend Shappa

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get JWT token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Generic fetch wrapper with auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Sport API functions

export interface SportProfile {
  birthdate: string;
  height: number;
  weight: number;
  frequency: number;
  sports: string[];
}

export interface ScheduledWorkout {
  id?: string;
  dayIndex: number;
  workoutId: number;
  workoutTitle: string;
  workoutType: string;
  duration: number;
}

export interface WorkoutTemplate {
  id: number;
  name: string;
  type: string;
  difficulty: string;
  duration: number;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    rest: number;
  }[];
  description: string;
  imageUrl?: string;
}

// Profile endpoints
export const sportApi = {
  // Get user profile
  getProfile: () =>
    apiRequest<SportProfile>('/sport/profile'),

  // Create/update profile
  saveProfile: (profile: SportProfile) =>
    apiRequest<{ success: boolean; profile: SportProfile }>('/sport/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    }),

  // Get scheduled workouts
  getScheduled: () =>
    apiRequest<ScheduledWorkout[]>('/sport/scheduled'),

  // Add workout to schedule
  addScheduled: (workout: Omit<ScheduledWorkout, 'id'>) =>
    apiRequest<{ success: boolean; scheduled: ScheduledWorkout }>('/sport/scheduled', {
      method: 'POST',
      body: JSON.stringify(workout),
    }),

  // Remove workout from schedule
  removeScheduled: (id: string) =>
    apiRequest<{ success: boolean }>(`/sport/scheduled/${id}`, {
      method: 'DELETE',
    }),

  // Get workout templates
  getTemplates: () =>
    apiRequest<WorkoutTemplate[]>('/sport/templates'),
};

// Auth helpers (da usare nei componenti)
export const auth = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, username: string) =>
    apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username }),
    }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => !!getAuthToken(),
};

export default sportApi;
