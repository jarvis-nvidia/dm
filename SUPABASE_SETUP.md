# Supabase Setup Instructions for DevMind

## 1. Create Supabase Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: devmind-production
   - Database Password: [Generate a strong password]
   - Region: Select nearest to your users
   - Pricing Plan: Free tier

## 2. Environment Variables
Create a `.env.local` file in web-dashboard root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Database Setup
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL script

## 4. Authentication Setup
1. Go to Authentication > Settings
2. Enable GitHub Auth:
   - Enable "GitHub" provider
   - Create a GitHub OAuth app:
     * Go to GitHub > Settings > Developer settings > OAuth Apps
     * Homepage URL: Your app URL
     * Callback URL: https://[PROJECT_REF].supabase.co/auth/v1/callback
   - Add GitHub client ID and secret

## 5. Storage Setup
1. Go to Storage
2. Create new buckets:
   ```bash
   avatars    # For user avatars
   documents  # For project documents
   ```
3. Set up bucket policies:
   - avatars: authenticated read, create
   - documents: authenticated read, create, update, delete

## 6. Database Backups
1. Go to Database > Backups
2. Enable Point in Time Recovery
3. Schedule daily backups

## 7. Security Settings
1. Go to Settings > API
2. Review and note down:
   - Project URL
   - anon/public key
   - service_role key (keep secure!)

## 8. Monitoring Setup
1. Go to Database > Monitoring
2. Set up alert rules for:
   - High CPU usage
   - Low disk space
   - Connection count

## 9. Performance
1. Go to Database > Performance
2. Enable connection pooling
3. Set up read replicas if needed

## 10. Production Checklist
- [ ] SSL enforced
- [ ] Database backups enabled
- [ ] Row Level Security enabled
- [ ] API rate limiting configured
- [ ] Monitoring alerts set up
- [ ] CORS origins configured
```

5. Create a type definition file for Supabase:

```typescript name=packages/web-dashboard/src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          github_id: string | null
          email: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          github_id?: string | null
          email: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          github_id?: string | null
          email?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          github_repo: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          github_repo?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          github_repo?: string | null
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table definitions...
    }
  }
}
```
