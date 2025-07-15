import { supabase } from '@/config/supabase'

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.user
}

export const setupAuthListener = (callback: (event: 'SIGNED_IN' | 'SIGNED_OUT') => void) => {
  return supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') callback('SIGNED_IN')
    if (event === 'SIGNED_OUT') callback('SIGNED_OUT')
  })
}
