export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          year_of_study: string;
          specialty_preferences: string[];
          elo_rating: number;
          current_streak: number;
          longest_streak: number;
          last_played_date: string | null;
          total_cases_played: number;
          total_correct_first: number;
          badges: string[];
          weekly_score: number;
          week_start: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          year_of_study: string;
          specialty_preferences: string[];
          elo_rating?: number;
          current_streak?: number;
          longest_streak?: number;
          last_played_date?: string | null;
          total_cases_played?: number;
          total_correct_first?: number;
          badges?: string[];
          weekly_score?: number;
          week_start?: string | null;
        };
        Update: Partial<{
          name: string;
          year_of_study: string;
          specialty_preferences: string[];
          elo_rating: number;
          current_streak: number;
          longest_streak: number;
          last_played_date: string | null;
          total_cases_played: number;
          total_correct_first: number;
          badges: string[];
          weekly_score: number;
          week_start: string | null;
        }>;
      };
      case_results: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          case_title: string;
          specialty: string;
          difficulty: string;
          correct_diagnosis: string;
          student_diagnosis: string;
          was_correct: boolean;
          attempts_used: number;
          final_score: number;
          grade: string;
          elo_change: number;
          investigations_used: {
            history: string[];
            exam: string[];
            labs: string[];
            imaging: string[];
          };
          played_at: string;
        };
        Insert: {
          user_id: string;
          case_id: string;
          case_title: string;
          specialty: string;
          difficulty: string;
          correct_diagnosis: string;
          student_diagnosis: string;
          was_correct: boolean;
          attempts_used: number;
          final_score: number;
          grade: string;
          elo_change: number;
          investigations_used: {
            history: string[];
            exam: string[];
            labs: string[];
            imaging: string[];
          };
        };
        Update: Partial<{
          case_id: string;
          case_title: string;
          specialty: string;
          difficulty: string;
          correct_diagnosis: string;
          student_diagnosis: string;
          was_correct: boolean;
          attempts_used: number;
          final_score: number;
          grade: string;
          elo_change: number;
          investigations_used: {
            history: string[];
            exam: string[];
            labs: string[];
            imaging: string[];
          };
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
