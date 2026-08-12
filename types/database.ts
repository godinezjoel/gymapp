export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      exercises: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          is_calisthenics: boolean;
          name: string;
          primary_muscle_group: string;
          secondary_muscle_groups: string[];
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          is_calisthenics?: boolean;
          name: string;
          primary_muscle_group: string;
          secondary_muscle_groups?: string[];
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          is_calisthenics?: boolean;
          name?: string;
          primary_muscle_group?: string;
          secondary_muscle_groups?: string[];
        };
        Relationships: [];
      };
      measurements: {
        Row: {
          created_at: string;
          id: string;
          logged_date: string;
          metric_type: Database["public"]["Enums"]["measurement_type"];
          notes: string | null;
          unit: string;
          value: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          logged_date?: string;
          metric_type: Database["public"]["Enums"]["measurement_type"];
          notes?: string | null;
          unit?: string;
          value: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          logged_date?: string;
          metric_type?: Database["public"]["Enums"]["measurement_type"];
          notes?: string | null;
          unit?: string;
          value?: number;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          last_used_at: string | null;
          p256dh: string;
          user_agent: string | null;
        };
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          last_used_at?: string | null;
          p256dh: string;
          user_agent?: string | null;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          last_used_at?: string | null;
          p256dh?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          created_at: string;
          id: string;
          logged_date: string;
          notes: string | null;
          weight_kg: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          logged_date?: string;
          notes?: string | null;
          weight_kg: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          logged_date?: string;
          notes?: string | null;
          weight_kg?: number;
        };
        Relationships: [];
      };
      workout_exercises: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          order_index: number;
          updated_at: string;
          workout_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id?: string;
          order_index?: number;
          updated_at?: string;
          workout_id: string;
        };
        Update: {
          created_at?: string;
          exercise_id?: string;
          id?: string;
          order_index?: number;
          updated_at?: string;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_plan_day_exercises: {
        Row: {
          created_at: string;
          day_id: string;
          default_reps: number | null;
          default_weight_kg: number | null;
          exercise_id: string;
          id: string;
          order_index: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          day_id: string;
          default_reps?: number | null;
          default_weight_kg?: number | null;
          exercise_id: string;
          id?: string;
          order_index: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          day_id?: string;
          default_reps?: number | null;
          default_weight_kg?: number | null;
          exercise_id?: string;
          id?: string;
          order_index?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_plan_day_exercises_day_id_fkey";
            columns: ["day_id"];
            isOneToOne: false;
            referencedRelation: "workout_plan_days";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_plan_day_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_plan_days: {
        Row: {
          created_at: string;
          cycle_index: number;
          id: string;
          is_rest: boolean;
          label: string;
          plan_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          cycle_index: number;
          id?: string;
          is_rest?: boolean;
          label: string;
          plan_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          cycle_index?: number;
          id?: string;
          is_rest?: boolean;
          label?: string;
          plan_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_plan_days_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_plans: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          start_date: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          start_date?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          start_date?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_sets: {
        Row: {
          completed_at: string;
          created_at: string;
          id: string;
          is_completed: boolean;
          reps: number | null;
          set_number: number;
          updated_at: string;
          weight_kg: number | null;
          workout_exercise_id: string;
        };
        Insert: {
          completed_at?: string;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          reps?: number | null;
          set_number: number;
          updated_at?: string;
          weight_kg?: number | null;
          workout_exercise_id: string;
        };
        Update: {
          completed_at?: string;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          reps?: number | null;
          set_number?: number;
          updated_at?: string;
          weight_kg?: number | null;
          workout_exercise_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey";
            columns: ["workout_exercise_id"];
            isOneToOne: false;
            referencedRelation: "workout_exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts: {
        Row: {
          created_at: string;
          finished_at: string | null;
          id: string;
          name: string | null;
          notes: string | null;
          plan_id: string | null;
          started_at: string;
          updated_at: string;
          workout_date: string;
        };
        Insert: {
          created_at?: string;
          finished_at?: string | null;
          id?: string;
          name?: string | null;
          notes?: string | null;
          plan_id?: string | null;
          started_at?: string;
          updated_at?: string;
          workout_date?: string;
        };
        Update: {
          created_at?: string;
          finished_at?: string | null;
          id?: string;
          name?: string | null;
          notes?: string | null;
          plan_id?: string | null;
          started_at?: string;
          updated_at?: string;
          workout_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      personal_records: {
        Row: {
          bodyweight_kg: number | null;
          completed_at: string | null;
          exercise_id: string | null;
          exercise_name: string | null;
          is_calisthenics: boolean | null;
          reps: number | null;
          weight_kg: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      create_workout_from_plan_day: {
        Args: { p_day_id?: string; p_plan_id?: string; p_workout_date: string };
        Returns: string;
      };
      delete_workout_plan: { Args: { p_plan_id: string }; Returns: undefined };
      save_workout_plan: {
        Args: {
          p_days: Json;
          p_name: string;
          p_plan_id?: string;
          p_start_date: string;
        };
        Returns: string;
      };
      set_active_workout_plan: {
        Args: { p_plan_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      measurement_type:
        | "neck"
        | "shoulders"
        | "chest"
        | "waist"
        | "hips"
        | "biceps_left"
        | "biceps_right"
        | "forearm_left"
        | "forearm_right"
        | "thigh_left"
        | "thigh_right"
        | "calf_left"
        | "calf_right"
        | "body_fat_pct"
        | "height";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      measurement_type: [
        "neck",
        "shoulders",
        "chest",
        "waist",
        "hips",
        "biceps_left",
        "biceps_right",
        "forearm_left",
        "forearm_right",
        "thigh_left",
        "thigh_right",
        "calf_left",
        "calf_right",
        "body_fat_pct",
        "height",
      ],
    },
  },
} as const;
