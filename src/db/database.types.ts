
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "activity": {
                  Row: {
                    "avg_hr": number | null,"avg_speed_mps": number | null,"created_at": string,"device_feel": number | null,"device_rpe": number | null,"distance_m": number | null,"elapsed_time_s": number | null,"elevation_gain_m": number | null,"id": string,"local_date": string,"max_hr": number | null,"moving_time_s": number | null,"raw": Json | null,"source": string,"source_id": string,"sport": string,"start_time": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avg_hr"?: number | null,"avg_speed_mps"?: number | null,"created_at"?: string,"device_feel"?: number | null,"device_rpe"?: number | null,"distance_m"?: number | null,"elapsed_time_s"?: number | null,"elevation_gain_m"?: number | null,"id"?: string,"local_date": string,"max_hr"?: number | null,"moving_time_s"?: number | null,"raw"?: Json | null,"source": string,"source_id": string,"sport": string,"start_time": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "avg_hr"?: number | null,"avg_speed_mps"?: number | null,"created_at"?: string,"device_feel"?: number | null,"device_rpe"?: number | null,"distance_m"?: number | null,"elapsed_time_s"?: number | null,"elevation_gain_m"?: number | null,"id"?: string,"local_date"?: string,"max_hr"?: number | null,"moving_time_s"?: number | null,"raw"?: Json | null,"source"?: string,"source_id"?: string,"sport"?: string,"start_time"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"activity_stream": {
                  Row: {
                    "activity_id": string,"altitude_m": (number)[] | null,"cadence": (number)[] | null,"distance_m": (number)[] | null,"hr": (number)[] | null,"lat": (number)[] | null,"lng": (number)[] | null,"speed_mps": (number)[] | null,"time_s": (number)[],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activity_id": string,"altitude_m"?: (number)[] | null,"cadence"?: (number)[] | null,"distance_m"?: (number)[] | null,"hr"?: (number)[] | null,"lat"?: (number)[] | null,"lng"?: (number)[] | null,"speed_mps"?: (number)[] | null,"time_s": (number)[],"user_id"?: string
                  }
                  Update: {
                    "activity_id"?: string,"altitude_m"?: (number)[] | null,"cadence"?: (number)[] | null,"distance_m"?: (number)[] | null,"hr"?: (number)[] | null,"lat"?: (number)[] | null,"lng"?: (number)[] | null,"speed_mps"?: (number)[] | null,"time_s"?: (number)[],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "activity_stream_activity_id_fkey"
      columns: ["activity_id"]
isOneToOne: true
      referencedRelation: "activity"
      referencedColumns: ["id"]
    }
                  ]
                },"athlete_profile": {
                  Row: {
                    "goal_event_id": string | null,"hr_max": number,"hr_rest": number | null,"user_id": string,"zones": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "goal_event_id"?: string | null,"hr_max": number,"hr_rest"?: number | null,"user_id"?: string,"zones": NonNullable<Json>
                  }
                  Update: {
                    "goal_event_id"?: string | null,"hr_max"?: number,"hr_rest"?: number | null,"user_id"?: string,"zones"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "athlete_profile_goal_event_id_fkey"
      columns: ["goal_event_id"]
isOneToOne: false
      referencedRelation: "event"
      referencedColumns: ["id"]
    }
                  ]
                },"daily_checkin": {
                  Row: {
                    "created_at": string,"date": string,"fatigue": number | null,"motivation": number | null,"note": string | null,"pain": number | null,"sleep_quality": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"date": string,"fatigue"?: number | null,"motivation"?: number | null,"note"?: string | null,"pain"?: number | null,"sleep_quality"?: number | null,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"date"?: string,"fatigue"?: number | null,"motivation"?: number | null,"note"?: string | null,"pain"?: number | null,"sleep_quality"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"event": {
                  Row: {
                    "activity_id": string | null,"date": string,"distance_m": number,"id": string,"kind": string,"name": string,"priority": string,"target_time_s": number | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activity_id"?: string | null,"date": string,"distance_m": number,"id"?: string,"kind"?: string,"name": string,"priority"?: string,"target_time_s"?: number | null,"user_id"?: string
                  }
                  Update: {
                    "activity_id"?: string | null,"date"?: string,"distance_m"?: number,"id"?: string,"kind"?: string,"name"?: string,"priority"?: string,"target_time_s"?: number | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "event_activity_id_fkey"
      columns: ["activity_id"]
isOneToOne: false
      referencedRelation: "activity"
      referencedColumns: ["id"]
    }
                  ]
                },"journal_entry": {
                  Row: {
                    "activity_id": string | null,"comment": string | null,"created_at": string,"feeling": number | null,"id": string,"pain": number | null,"pain_note": string | null,"planned_session_id": string | null,"rpe": number | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activity_id"?: string | null,"comment"?: string | null,"created_at"?: string,"feeling"?: number | null,"id"?: string,"pain"?: number | null,"pain_note"?: string | null,"planned_session_id"?: string | null,"rpe"?: number | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "activity_id"?: string | null,"comment"?: string | null,"created_at"?: string,"feeling"?: number | null,"id"?: string,"pain"?: number | null,"pain_note"?: string | null,"planned_session_id"?: string | null,"rpe"?: number | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "journal_entry_activity_id_fkey"
      columns: ["activity_id"]
isOneToOne: true
      referencedRelation: "activity"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "journal_entry_planned_session_id_fkey"
      columns: ["planned_session_id"]
isOneToOne: true
      referencedRelation: "planned_session"
      referencedColumns: ["id"]
    }
                  ]
                },"plan": {
                  Row: {
                    "created_at": string,"generator_version": string | null,"id": string,"is_active": boolean,"name": string,"start_date": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"generator_version"?: string | null,"id"?: string,"is_active"?: boolean,"name": string,"start_date": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"generator_version"?: string | null,"id"?: string,"is_active"?: boolean,"name"?: string,"start_date"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"plan_phase": {
                  Row: {
                    "code": string,"goal": string,"id": string,"name": string,"plan_id": string,"user_id": string,"week_from": number,"week_to": number
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"goal": string,"id"?: string,"name": string,"plan_id": string,"user_id"?: string,"week_from": number,"week_to": number
                  }
                  Update: {
                    "code"?: string,"goal"?: string,"id"?: string,"name"?: string,"plan_id"?: string,"user_id"?: string,"week_from"?: number,"week_to"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "plan_phase_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plan"
      referencedColumns: ["id"]
    }
                  ]
                },"planned_session": {
                  Row: {
                    "date": string,"details": string,"distance_m": number,"hr_max": number | null,"hr_min": number | null,"id": string,"origin": string,"pace_max_s_km": number | null,"pace_min_s_km": number | null,"phase_id": string,"plan_id": string,"title": string,"type": string,"updated_at": string,"user_id": string,"week": number
                  }
                  ComputedFields: never
                  Insert: {
                    "date": string,"details"?: string,"distance_m": number,"hr_max"?: number | null,"hr_min"?: number | null,"id"?: string,"origin"?: string,"pace_max_s_km"?: number | null,"pace_min_s_km"?: number | null,"phase_id": string,"plan_id": string,"title": string,"type": string,"updated_at"?: string,"user_id"?: string,"week": number
                  }
                  Update: {
                    "date"?: string,"details"?: string,"distance_m"?: number,"hr_max"?: number | null,"hr_min"?: number | null,"id"?: string,"origin"?: string,"pace_max_s_km"?: number | null,"pace_min_s_km"?: number | null,"phase_id"?: string,"plan_id"?: string,"title"?: string,"type"?: string,"updated_at"?: string,"user_id"?: string,"week"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "planned_session_phase_id_fkey"
      columns: ["phase_id"]
isOneToOne: false
      referencedRelation: "plan_phase"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "planned_session_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plan"
      referencedColumns: ["id"]
    }
                  ]
                },"session_link": {
                  Row: {
                    "activity_id": string,"created_at": string,"id": string,"method": string,"planned_session_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activity_id": string,"created_at"?: string,"id"?: string,"method": string,"planned_session_id": string,"user_id"?: string
                  }
                  Update: {
                    "activity_id"?: string,"created_at"?: string,"id"?: string,"method"?: string,"planned_session_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "session_link_activity_id_fkey"
      columns: ["activity_id"]
isOneToOne: true
      referencedRelation: "activity"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "session_link_planned_session_id_fkey"
      columns: ["planned_session_id"]
isOneToOne: false
      referencedRelation: "planned_session"
      referencedColumns: ["id"]
    }
                  ]
                },"sync_run": {
                  Row: {
                    "error": string | null,"finished_at": string | null,"id": string,"range_from": string | null,"range_to": string | null,"source": string,"started_at": string,"status": string,"upserted": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "error"?: string | null,"finished_at"?: string | null,"id"?: string,"range_from"?: string | null,"range_to"?: string | null,"source": string,"started_at"?: string,"status"?: string,"upserted"?: number,"user_id"?: string
                  }
                  Update: {
                    "error"?: string | null,"finished_at"?: string | null,"id"?: string,"range_from"?: string | null,"range_to"?: string | null,"source"?: string,"started_at"?: string,"status"?: string,"upserted"?: number,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"wellness": {
                  Row: {
                    "date": string,"hrv_ms": number | null,"raw": Json | null,"resting_hr": number | null,"sleep_s": number | null,"sleep_score": number | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "date": string,"hrv_ms"?: number | null,"raw"?: Json | null,"resting_hr"?: number | null,"sleep_s"?: number | null,"sleep_score"?: number | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "date"?: string,"hrv_ms"?: number | null,"raw"?: Json | null,"resting_hr"?: number | null,"sleep_s"?: number | null,"sleep_score"?: number | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
