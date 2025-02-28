import Vue from 'vue'
import VueRouter from 'vue-router'
import InicioSesion from '@/components/Usuarios/InicioSesion'
import ProductosComponent from '@/components/Inventario/ProductosComponent'
import AgregarProducto from '@/components/Inventario/AgregarProducto'
import EditarProducto from '@/components/Inventario/EditarProducto'
import MarcasCategorias from '@/components/MarcasCategorias/MarcasCategorias'
import RealizarVenta from '@/components/Ventas/RealizarVenta'
import ReporteVentas from '@/components/Ventas/ReporteVentas'
import ReporteCuentas from '@/components/Ventas/ReporteCuentas'
import ClientesComponent from '@/components/Clientes/ClientesComponent'
import AgregarCliente from '@/components/Clientes/AgregarCliente'
import EditarCliente from '@/components/Clientes/EditarCliente'
import UsuariosComponent from '@/components/Usuarios/UsuariosComponent'
import AgregarUsuario from '@/components/Usuarios/AgregarUsuario'
import EditarUsuario from '@/components/Usuarios/EditarUsuario'
import Pagos from '@/components/Pagos/Pagos'
import PerfilComponent from '@/components/Usuarios/PerfilComponent'
import CambiarPassword from '@/components/Usuarios/CambiarPassword'

// Add this line to import the new component


Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: InicioSesion
  },
  {
    path: '/',
    name: 'RealizarVenta',
    component: RealizarVenta,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'ProductosComponent',
    component: ProductosComponent,
    meta: { requiresAuth: true }
  },  
  {
    path: '/agregar-producto',
    name: 'AgregarProducto',
    component: AgregarProducto,
    meta: { requiresAuth: true }
  },  
  {
    path: '/editar-producto/:id',
    name: 'EditarProducto',
    component: EditarProducto,
    meta: { requiresAuth: true }
  },
  {
    path: '/marcas-y-categorias',
    name: 'MarcasCategorias',
    component: MarcasCategorias,
    meta: { requiresAuth: true }
  },
  {
    path: '/realizar-venta',
    name: 'RealizarVenta',
    component: RealizarVenta,
    meta: { requiresAuth: true }
  },  
  {
    path: '/reporte-ventas',
    name: 'ReporteVentas',
    component: ReporteVentas,
    meta: { requiresAuth: true }
  },  
  {
    path: '/reporte-cuentas',
    name: 'ReporteCuentas',
    component: ReporteCuentas,
    meta: { requiresAuth: true }
  },  
 
  {
    path: '/clientes',
    name: 'ClientesComponent',
    component: ClientesComponent,
    meta: { requiresAuth: true }
  }, 
  {
    path: '/agregar-cliente',
    name: 'AgregarCliente',
    component: AgregarCliente,
    meta: { requiresAuth: true }
  },
  {
    path: '/editar-cliente/:id',
    name: 'EditarCliente',
    component: EditarCliente,
    meta: { requiresAuth: true }
  },  
  {
    path: '/usuarios',
    name: 'UsuariosComponent',
    component: UsuariosComponent,
    meta: { requiresAuth: true }
  },  
  {
    path: '/agregar-usuario',
    name: 'AgregarUsuario',
    component: AgregarUsuario,
    meta: { requiresAuth: true }
  },
  {
    path: '/editar-usuario/:id',
    name: 'EditarUsuario',
    component: EditarUsuario,
    meta: { requiresAuth: true }
  },  
  {
    path: '/cambiar-password/:id',
    name: 'CambiarPassword',
    component: CambiarPassword,
    meta: { requiresAuth: true }
  },  
  {
    path: '/pagos',
    name: 'Pagos',
    component: Pagos,
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'PerfilComponent',
    component: PerfilComponent,
    meta: { requiresAuth: true }
  },  
  {
    path: '/cambiar-password',
    name: 'CambiarPassword',
    component: CambiarPassword,
    meta: { requiresAuth: true }
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = localStorage.getItem('userData')

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router