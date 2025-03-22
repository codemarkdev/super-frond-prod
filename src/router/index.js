import Vue from 'vue'
import VueRouter from 'vue-router'
import InicioSesion from '@/components/Usuarios/InicioSesion'
import ProductosComponent from '@/components/Inventario/ProductosComponent'
import AgregarProducto from '@/components/Inventario/AgregarProducto'
import EditarProducto from '@/components/Inventario/EditarProducto'
import ProveedoresMarcasCategorias from '@/components/MarcasCategoriasProveedores/ProveedoresMarcasCategorias.vue'
import RealizarVenta from '@/components/Ventas/RealizarVenta'
import ReporteVentas from '@/components/Ventas/ReporteVentas'
import ClientesComponent from '@/components/Clientes/ClientesComponent'
import AgregarCliente from '@/components/Clientes/AgregarCliente'
import EditarCliente from '@/components/Clientes/EditarCliente'
import UsuariosComponent from '@/components/Usuarios/UsuariosComponent'
import AgregarUsuario from '@/components/Usuarios/AgregarUsuario'
import EditarUsuario from '@/components/Usuarios/EditarUsuario'
import CambiarPassword from '@/components/Usuarios/CambiarPassword'
import Empleados from '@/components/Empleados/Empleados.vue'
import CierreCaja from '@/components/Caja/CierreCaja.vue'
import PerfilComponent from '@/components/Usuarios/PerfilComponent.vue'
import DetallesPedido from '@/components/OrdenesDetalles/DetallesPedido.vue'
import Details from '@/components/OrdenesDetalles/OrderDatails.vue'
import AyudanteSesion from '../Servicios/AyudanteSesion';
import rolesConfig from '../config/RolesConfig';

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
    path: '/proveedores-marcas-y-categorias',
    name: 'MarcasCategoriasProveedores',
    component: ProveedoresMarcasCategorias,
    meta: { requiresAuth: true }
  },
  {
    path: '/DetallesPedido',
    name: 'Detalles de ordenes',
    component: DetallesPedido,
    meta: { requiresAuth: true }
  },
  {
    path: '/Details',
    name: 'OrderDetails',
    component: Details,
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
    path: '/empleados',
    name: 'Empleados',
    component: Empleados,
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'CierreCaja',
    component: CierreCaja,
    meta: { requiresAuth: true }
  },  
  {
    path: '/perfil-old',
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
  routes
});

router.beforeEach((to, from, next) => {
  const sesion = AyudanteSesion.obtenerDatosSesion();
  if (!sesion || !sesion.rol) {
    if (to.path !== '/login') {
      return next('/login');
    }
    return next();
  }

  const rol = sesion.rol;
  const allowedPaths = rolesConfig[rol].views.flatMap(view => {
    return view.children && view.children.length > 0
      ? [view.href, ...view.children.map(child => child.href)]
      : [view.href];
  });

  const dynamicPaths = rolesConfig[rol].access.filter(path => path.includes(':'));

  const isDynamicPathAllowed = (path) => {
    return dynamicPaths.some(dynamicPath => {
      const regex = new RegExp(`^${dynamicPath.replace(/:\w+/g, '\\w+')}$`);
      return regex.test(path);
    });
  };

  if (
    !allowedPaths.includes(to.path) &&
    !rolesConfig[rol].access.includes(to.path) &&
    !isDynamicPathAllowed(to.path)
  ) {
    return next('/');
  }

  next();
});

export default router;