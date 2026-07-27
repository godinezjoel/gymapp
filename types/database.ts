// Automatisch generiert aus dem Supabase-Schema. Nicht von Hand bearbeiten.
// Neu erzeugen mit: npm run gen:types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
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
      training_plan: {
        Row: {
          archived: boolean;
          category: Database["public"]["Enums"]["exercise_category"] | null;
          created_at: string;
          exercise_name: string;
          id: string;
          order_index: number;
          plan_name: string;
          rest_seconds: number | null;
          target_reps: number | null;
          target_sets: number | null;
          target_weight_kg: number | null;
          updated_at: string;
        };
        Insert: {
          archived?: boolean;
          category?: Database["public"]["Enums"]["exercise_category"] | null;
          created_at?: string;
          exercise_name: string;
          id?: string;
          order_index?: number;
          plan_name: string;
          rest_seconds?: number | null;
          target_reps?: number | null;
          target_sets?: number | null;
          target_weight_kg?: number | null;
          updated_at?: string;
        };
        Update: {
          archived?: boolean;
          category?: Database["public"]["Enums"]["exercise_category"] | null;
          created_at?: string;
          exercise_name?: string;
          id?: string;
          order_index?: number;
          plan_name?: string;
          rest_seconds?: number | null;
          target_reps?: number | null;
          target_sets?: number | null;
          target_weight_kg?: number | null;
          updated_at?: string;
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
          category: Database["public"]["Enums"]["exercise_category"] | null;
          created_at: string;
          exercise_name: string;
          id: string;
          notes: string | null;
          order_index: number;
          updated_at: string;
          workout_id: string;
        };
        Insert: {
          category?: Database["public"]["Enums"]["exercise_category"] | null;
          created_at?: string;
          exercise_name: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          updated_at?: string;
          workout_id: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"] | null;
          created_at?: string;
          exercise_name?: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          updated_at?: string;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_sets: {
        Row: {
          completed_at: string;
          created_at: string;
          id: string;
          is_warmup: boolean;
          notes: string | null;
          reps: number | null;
          rpe: number | null;
          set_number: number;
          updated_at: string;
          weight_kg: number | null;
          workout_exercise_id: string;
        };
        Insert: {
          completed_at?: string;
          created_at?: string;
          id?: string;
          is_warmup?: boolean;
          notes?: string | null;
          reps?: number | null;
          rpe?: number | null;
          set_number: number;
          updated_at?: string;
          weight_kg?: number | null;
          workout_exercise_id: string;
        };
        Update: {
          completed_at?: string;
          created_at?: string;
          id?: string;
          is_warmup?: boolean;
          notes?: string | null;
          reps?: number | null;
          rpe?: number | null;
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
          plan_name: string | null;
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
          plan_name?: string | null;
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
          plan_name?: string | null;
          started_at?: string;
          updated_at?: string;
          workout_date?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      personal_records: {
        Row: {
          completed_at: string | null;
          estimated_volume: number | null;
          exercise_name: string | null;
          reps: number | null;
          weight_kg: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      exercise_category: "push" | "pull" | "legs" | "core" | "cardio" | "fullbody" | "other";
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
      exercise_category: ["push", "pull", "legs", "core", "cardio", "fullbody", "other"],
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
