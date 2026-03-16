// biome-ignore assist/source/organizeImports: <explanation>
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Clientes from '../views/Clientes.vue'
import HistorialVentas from '../views/historialVentas.vue'
import { supabase } from '../supabase'

const routes = [
    { path: '/', component: Login, meta: { layout: 'empty' } },
    { path: '/login', component: Login, meta: { layout: 'empty' } },
    { path: '/register', component: Register, meta: { layout: 'default' } },
    { path: '/dashboard', component: Dashboard, meta: { layout: 'default', section: "Dashboard", requiresAuth: true } },
    { path: '/ventas-diarias', component: () => import('../views/VentasDiarias.vue'), meta: { layout: 'default', section: "Ventas Diarias", requiresAuth: true } },
    { path: '/ventas-live', component: () => import('../views/VentasLive.vue'), meta: { layout: 'default', section: "Ventas Live", requiresAuth: true } },
    { path: '/retiros', component: () => import('../views/Retiros.vue'), meta: { layout: 'default', section: "Retiros Pendientes", requiresAuth: true } },
    { path: '/clientes', component: Clientes, meta: { layout: 'default', section: "Clientes", requiresAuth: true } },
    { path: '/historialVentas', component: HistorialVentas, meta: { layout: 'default', section: "Historial Ventas", requiresAuth: true } },

]


const router = createRouter({
    history: createWebHistory(),
    routes,
})
router.beforeEach(async (to) => {
    const requiresAuth = to.meta.requiresAuth
    
    // Obtener la sesión actual de Supabase
    const { data } = await supabase.auth.getSession()
    const currentUser = data.session?.user

    if (requiresAuth && !currentUser) {
        // Redirige al login si la ruta requiere autenticación y no hay usuario
        return { path: '/' }
    } else if ((to.path === '/' || to.path === '/register') && currentUser) {
        // Redirige al dashboard si ya hay un usuario y está en la página de inicio o registro
        return { path: '/dashboard' }
    }

    // Si no hay redirección, la navegación continúa
    return true
})
// router.beforeEach((to, next) => {
//     const requiresAuth = to.meta.requiresAuth
//     const currentUser = auth.currentUser

//     if (requiresAuth && !currentUser) {
//         next('/') // Redirige al login
//     } else if ((to.path === '/' || to.path === '/register') && currentUser) {
//         next('/dashboard')
//     } else {
//         next()
//     }
// })

export { router }
