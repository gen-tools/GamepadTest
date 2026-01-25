import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          author_id: string;
          created_at: string;
          updated_at: string;
          published: boolean;
          featured_image?: string;
          excerpt?: string;
        };
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>;
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };
    };
  };
};
