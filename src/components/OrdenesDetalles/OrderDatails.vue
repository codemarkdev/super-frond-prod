<template>
  <div class="order-details">
    <div class="page-header">
      <i class="fas fa-boxes header-icon"></i>
      <h2>Detalles de Orden</h2>
    </div>

    <!-- Tabs de navegación principal -->
    <div class="tabs is-boxed mb-4">
      <ul>
        <li :class="{ 'is-active': activeTab === 'crear' }">
          <a @click="cambiarTab('crear')">
            <span class="icon is-small"><i class="fas fa-plus-circle"></i></span>
            <span>Crear Orden</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'activos' }">
          <a @click="cambiarTab('activos')">
            <span class="icon is-small"><i class="fas fa-file-invoice"></i></span>
            <span>Registrar Orden</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'ordenes' }">
          <a @click="cambiarTab('ordenes')">
            <span class="icon is-small"><i class="fas fa-list-alt"></i></span>
            <span>Listado de Órdenes</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'ordenesLista' }">
          <a @click="cambiarTab('ordenesLista')">
            <span class="icon is-small"><i class="fas fa-clipboard-list"></i></span>
            <span>Órdenes Registradas</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'buscar' }">
          <a @click="cambiarTab('buscar')">
            <span class="icon is-small"><i class="fas fa-search"></i></span>
            <span>Buscar Orden</span>
          </a>
        </li>
        <!-- Solo mostrar la pestaña de Órdenes Eliminadas si el usuario es admin -->
        <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'eliminados' }">
          <a @click="cambiarTab('eliminados')">
            <span class="icon is-small"><i class="fas fa-archive"></i></span>
            <span>Órdenes Eliminadas</span>
          </a>
        </li>
        <!-- Solo mostrar la pestaña de Listado de Órdenes eliminados si el usuario es admin -->
        <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'pedidosEliminados' }">
          <a @click="cambiarTab('pedidosEliminados')">
            <span class="icon is-small"><i class="fas fa-trash-restore"></i></span>
            <span>Listado de Órdenes eliminados</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Contenido de las pestañas -->
    <div v-if="activeTab === 'activos'">
      <registrar-orden-form 
        :ordenes-disponibles="ordenesDisponibles"
        :productos-disponibles="productosDisponibles"
        :categorias="categorias"
        :marcas="marcas"
        :cargando-ordenes="cargandoOrdenes"
        @recargar-ordenes="cargarOrdenesDisponibles"
      />
    </div>

    <!-- Componentes para las diferentes pestañas -->
    <create-orden v-else-if="activeTab === 'crear'" />
    <ordenes v-else-if="activeTab === 'ordenes'" />
    <ordenes-lista v-else-if="activeTab === 'ordenesLista'" />
    <buscar-details v-else-if="activeTab === 'buscar'" />
    <details-eliminados 
      v-else-if="activeTab === 'eliminados' && esAdmin" 
      @detalle-restaurado="onDetalleRestaurado" 
    />
    <order-delets 
      v-else-if="activeTab === 'pedidosEliminados' && esAdmin" 
      @orden-restaurada="onOrdenRestaurada" 
    />
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';
import AyudanteSesion from '@/Servicios/AyudanteSesion';
import '@/components/stilos/order-details.css';
import DetailsEliminados from '../OrdenesDetalles/Details-eliminados.vue';
import BuscarDetails from './BusacarDetails.vue';
import CreateOrden from './CreateOrden.vue';
import Ordenes from './Ordenes.vue';
import OrdenesLista from './OrdenesLista.vue';
import OrderDelets from './OrderDelets.vue';
import RegistrarOrdenForm from './Details/RegistrarOrdenForm.vue';

export default {
  name: 'OrderDetails',
  components: {
    DetailsEliminados,
    BuscarDetails,
    CreateOrden,
    Ordenes,
    OrdenesLista,
    OrderDelets,
    RegistrarOrdenForm
  },

  data() {
    return {
      activeTab: 'activos',
      categorias: [],
      marcas: [],
      productosDisponibles: [],
      cargandoCategorias: false,
      cargandoMarcas: false,
      cargandoProductos: false,
      esAdmin: false,
      ordenesDisponibles: [],
      cargandoOrdenes: false,
      paginaActual: 1,
      totalPaginas: 1,
      limite: 100
    };
  },

  created() {
    this.cargarCategorias();
    this.cargarMarcas();
    this.cargarProductos();
    this.verificarAdmin();

    if (this.activeTab === 'activos') {
      this.cargarOrdenesDisponibles();
    }
  },

  methods: {
    cambiarTab(tab) {
      if ((tab === 'eliminados' || tab === 'pedidosEliminados') && !this.esAdmin) {
        this.$buefy.toast.open({
          message: 'No tiene permisos para acceder a esta sección',
          type: 'is-danger'
        });
        return;
      }

      this.activeTab = tab;

      if (tab === 'activos') {
        this.cargarOrdenesDisponibles();
        
        if (this.productosDisponibles.length === 0 && !this.cargandoProductos) {
          this.cargarProductos();
        }
      }
    },

    async cargarProductos() {
      this.cargandoProductos = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `products?page=${this.paginaActual}&limit=${this.limite}`
        });

        if (response.status === 200) {
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            this.productosDisponibles = response.data.data;
            this.totalPaginas = response.data.totalPages || 1;
            
            if (this.totalPaginas > 1 && this.paginaActual < this.totalPaginas) {
              this.cargarMasProductos();
            }
          } else {
            console.warn('Estructura de respuesta inesperada:', response.data);
            this.productosDisponibles = [];
          }
        } else {
          console.error('Error al cargar productos:', response.status);
          this.productosDisponibles = [];
        }
      } catch (err) {
        console.error('Error al cargar productos:', err);
        this.$buefy.toast.open({
          message: `Error al cargar productos: ${err.message || 'Error desconocido'}`,
          type: 'is-danger'
        });
        this.productosDisponibles = [];
      } finally {
        this.cargandoProductos = false;
      }
    },

    async cargarMasProductos() {
      if (this.paginaActual >= this.totalPaginas) return;
      
      this.paginaActual++;
      this.cargandoProductos = true;
      
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `products?page=${this.paginaActual}&limit=${this.limite}`
        });

        if (response.status === 200 && response.data && response.data.data) {
          this.productosDisponibles = [...this.productosDisponibles, ...response.data.data];
          
          if (this.paginaActual < response.data.totalPages) {
            this.cargarMasProductos();
          }
        }
      } catch (err) {
        console.error('Error al cargar más productos:', err);
      } finally {
        this.cargandoProductos = false;
      }
    },

    async cargarOrdenesDisponibles() {
      this.cargandoOrdenes = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'orders/findActive'
        });

        if (response.status === 200) {
          this.ordenesDisponibles = response.data;
        } else {
          console.error('Error al cargar órdenes disponibles:', response.status);
        }
      } catch (err) {
        console.error('Error al cargar órdenes disponibles:', err);
        this.$buefy.toast.open({
          message: `Error al cargar órdenes disponibles: ${err.message || 'Error desconocido'}`,
          type: 'is-danger'
        });
      } finally {
        this.cargandoOrdenes = false;
      }
    },

    verificarAdmin() {
      const datosUsuario = AyudanteSesion.obtenerDatosSesion();
      this.esAdmin = datosUsuario.rol === 'Admin';

      if (!this.esAdmin && (this.activeTab === 'eliminados' || this.activeTab === 'pedidosEliminados')) {
        this.activeTab = 'activos';
      }
    },

    onDetalleRestaurado() {
      this.$buefy.toast.open({
        message: 'Detalle restaurado correctamente',
        type: 'is-success'
      });
    },

    onOrdenRestaurada() {
      this.$buefy.toast.open({
        message: 'Pedido restaurado correctamente',
        type: 'is-success'
      });
    },

    async cargarCategorias() {
      this.cargandoCategorias = true;
      try {
        const response = await apiRequest({ method: 'GET', path: 'categories' });
        if (response.status === 200) this.categorias = response.data;
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      } finally {
        this.cargandoCategorias = false;
      }
    },

    async cargarMarcas() {
      this.cargandoMarcas = true;
      try {
        const response = await apiRequest({ method: 'GET', path: 'brands' });
        if (response.status === 200) this.marcas = response.data;
      } catch (err) {
        console.error('Error al cargar marcas:', err);
      } finally {
        this.cargandoMarcas = false;
      }
    }
  }
};
</script>

<style scoped>
.orden-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
}

.orden-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.orden-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.orden-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.orden-switch input:checked+.orden-slider {
  background-color: #2196F3;
}

.orden-switch input:checked+.orden-slider:before {
  transform: translateX(20px);
}

.orden-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.switch-text {
  font-weight: 500;
  font-size: 15px;
}
</style>