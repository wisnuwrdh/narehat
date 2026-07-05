export interface User {
  id: string;
  email: string;
  name: string;
  skin_type: SkinType;
  acne_severity: AcneSeverity;
  goal: Goal;
  plan: PlanType;
  created_at: string;
}

export type SkinType = "oily" | "dry" | "combination" | "normal" | "sensitive";
export type AcneSeverity = "mild" | "moderate" | "severe";
export type Goal = "clear_acne" | "fade_scars" | "brighter_skin" | "all";
export type PlanType = "free" | "premium_monthly" | "premium_yearly";

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  sleep_hours: number;
  water_ml: number;
  exercise_minutes: number;
  stress_level: number;
  skincare_morning: boolean;
  skincare_evening: boolean;
  touched_face: boolean;
  junk_food: boolean;
  notes: string;
  created_at: string;
}

export interface SkinPhoto {
  id: string;
  user_id: string;
  url: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface SkincareProduct {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  category?: string;
  active?: boolean;
  notes?: string;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  date: string;
  type: "correlation" | "trend" | "recommendation";
  title: string;
  description: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  affiliate_link: string;
  image_url: string;
  category: string;
}

export interface OnboardingData {
  skin_type: SkinType;
  acne_severity: AcneSeverity;
  habits: string[];
  products: string[];
  goal: Goal;
  photo_url?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at">;
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, "id" | "created_at">;
        Update: Partial<Omit<DailyLog, "id" | "created_at">>;
      };
      skin_photos: {
        Row: SkinPhoto;
        Insert: Omit<SkinPhoto, "id" | "created_at">;
        Update: Partial<Omit<SkinPhoto, "id" | "created_at">>;
      };
      skincare_products: {
        Row: SkincareProduct;
        Insert: Omit<SkincareProduct, "id" | "created_at">;
        Update: Partial<Omit<SkincareProduct, "id" | "created_at">>;
      };
      insights: {
        Row: Insight;
        Insert: Omit<Insight, "id" | "created_at">;
        Update: Partial<Omit<Insight, "id" | "created_at">>;
      };
    };
  };
}
