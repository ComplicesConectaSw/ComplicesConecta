export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: { [key: string]: Json }
        Insert: { [key: string]: Json }
        Update: { [key: string]: Json }
      }
    }
    Views: {
      [key: string]: {
        Row: { [key: string]: Json }
      }
    }
    Functions: {
      [key: string]: {
        Args: { [key: string]: Json }
        Returns: Json
      }
    }
    Enums: {
      [key: string]: string
    }
  }
}