// src/authGuard.ts
import { supabase } from './supabase'
import { useAuthStore } from './stores/authStore'

export function initAuthGuard(callback: () => void) {
    let initialized = false

    supabase.auth.onAuthStateChange(async (_event, session) => {
        const authStore = useAuthStore()
        authStore.user = session?.user || null
        
        if (!initialized) {
            initialized = true
            callback()
        }
    })
}
