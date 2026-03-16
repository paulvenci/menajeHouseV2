import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const initialized = ref(false)

    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession()
        user.value = session?.user || null
        initialized.value = true
        return user.value
    }

    async function signOut() {
        await supabase.auth.signOut()
        user.value = null
    }

    return { user, initialized, checkSession, signOut }
})
