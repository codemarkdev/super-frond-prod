<template>
  <section>
    <div class="level mb-5">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-4">Gestión de Descuentos</h1>
        </div>
      </div>
    </div>

    <!-- Tabs de navegación -->
    <div class="tabs is-boxed mb-4">
      <ul>
        <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'lista' }">
          <a @click="activeTab = 'lista'">
            <span class="icon is-small"><i class="mdi mdi-tag-multiple"></i></span>
            <span>Lista de Descuentos</span>
          </a>
        </li>
        <li v-if="esAdmin" :class="{ 'is-active': activeTab === 'nuevo' }">
          <a @click="activeTab = 'nuevo'">
            <span class="icon is-small"><i class="mdi mdi-tag-plus"></i></span>
            <span>Nuevo Descuento</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'verificar' }">
          <a @click="activeTab = 'verificar'">
            <span class="icon is-small"><i class="mdi mdi-check-circle"></i></span>
            <span>Verificar Validez</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'calcular' }">
          <a @click="activeTab = 'calcular'">
            <span class="icon is-small"><i class="mdi mdi-calculator"></i></span>
            <span>Calcular Descuentos</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Tab: Lista de Descuentos -->
    <div v-if="activeTab === 'lista'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span class="icon mr-2"><i class="mdi mdi-tag-multiple"></i></span>
          Lista de Descuentos
        </p>
      </header>
      <div class="card-content">
        <mensaje-inicial v-if="!descuentos.length && !cargando.lista" :titulo="'No hay descuentos registrados'"
          :subtitulo="'Crea un nuevo descuento usando la pestaña Nuevo Descuento'" />

        <b-table v-else :data="descuentos" :loading="cargando.lista" :striped="true" :hoverable="true" :paginated="true"
          :per-page="10" :pagination-simple="false" :pagination-position="'bottom'" :pagination-rounded="true">
          <b-table-column field="name" label="Nombre" v-slot="props">
            {{ props.row.name }}
          </b-table-column>

          <b-table-column field="type" label="Tipo" v-slot="props">
            <b-tag
                :type="props.row.type === 'PERCENTAGE' ? 'is-info' : props.row.type === 'FIXED_AMOUNT' ? 'is-success' : 'is-warning'">
                {{ props.row.type === 'PERCENTAGE' ? 'Porcentaje' :
                  props.row.type === 'FIXED_AMOUNT' ? 'Monto Fijo' :
                    props.row.type === 'BUY_X_GET_Y' ? 'Promoción ' :
                      props.row.type === 'BUNDLE' ? 'Paquete' :
                        props.row.type === 'SEASONAL' ? 'Temporal' : 'Otro' }}
              </b-tag>
          </b-table-column>

          <b-table-column field="type" label="Tipo y Valor" v-slot="props">
            <div>
            
              <span class="ml-2">
                {{ props.row.type === 'PERCENTAGE' ? `${props.row.value}%` :
                  props.row.type === 'FIXED_AMOUNT' ? `$${props.row.value}` :
                    props.row.type === 'BUY_X_GET_Y' ? `${props.row.name} ` :
                      props.row.type === 'BUNDLE' ? `Paquete ${props.row.value}` :
                        props.row.type === 'SEASONAL' ? `Descuento ${props.row.value}` : 'N/A' }}
              </span>
            </div>
          </b-table-column>

          <b-table-column field="minQuantity" label="Cantidad Mínima" v-slot="props">
            {{ props.row.minQuantity }}
          </b-table-column>

          <b-table-column field="product" label="Producto" v-slot="props">
            {{ props.row.productId ? props.row.productId: 'Todos' }}
          </b-table-column>

          <b-table-column field="category" label="Categoría" v-slot="props">
            {{ props.row.categoryId ? props.row.categoryId : 'Todas' }}
          </b-table-column>

          <b-table-column field="startDate" label="Fecha Inicio" v-slot="props">
            {{ formatDate(props.row.startDate) }}
          </b-table-column>

          <b-table-column field="endDate" label="Fecha Fin" v-slot="props">
            {{ formatDate(props.row.endDate) }}
          </b-table-column>

          <b-table-column field="isActive" label="Estado" v-slot="props">
            <b-tag :type="props.row.isActive ? 'is-success' : 'is-danger'">
              {{ props.row.isActive ? 'Activo' : 'Inactivo' }}
            </b-tag>
          </b-table-column>

          <b-table-column field="acciones" label="Acciones" centered v-slot="props">
            <div class="buttons is-centered">

              <b-tooltip label="Editar" position="is-top">
                <b-button class="is-info" @click="editarDescuento(props.row)" size="is-small">
                  <b-icon icon="pencil" />
                </b-button>
              </b-tooltip>
              <b-tooltip label="Desactivar" position="is-top">
                <b-button class="is-danger" @click="eliminarDescuento(props.row.id)" size="is-small">
                  <b-icon icon="power-off" />
                  <span>Desactivar</span>
                </b-button>
              </b-tooltip>
            </div>
          </b-table-column>
        </b-table>
      </div>
    </div>

    <!-- Tab: Nuevo Descuento -->
    <nuevo-descuento 
      v-if="activeTab === 'nuevo'" 
      :modo-edicion="modoEdicion"
      :descuento-editando-id="descuentoEditandoId"
      :descuento-para-editar="descuentoParaEditar"
      @descuento-guardado="onDescuentoGuardado"
      @cancelar-edicion="cancelarEdicion"
    />

    <!-- Tab: Verificar Validez de Descuento -->
    <verificar-validez 
      v-if="activeTab === 'verificar'" 
      :descuentos="descuentos"
    />

    <!-- Tab: Calcular Descuentos para un Producto -->
    <calcular-descuentos 
      v-if="activeTab === 'calcular'" 
    />

    <b-loading :is-full-page="false" v-model="cargando.general" :can-cancel="false"></b-loading>
  </section>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';
import MensajeInicial from '../Extras/MensajeInicial';
import AyudanteSesion from '../../Servicios/AyudanteSesion';
import NuevoDescuento from './NuevoDescuento.vue';
import VerificarValidez from './VerificarValidez.vue';
import CalcularDescuentos from './CalcularDescuentos.vue';
// Eliminamos la importación de CalendarioSelector ya que no se usa directamente aquí

export default {
  name: 'GestionDescuentos', // Nombre multi-palabra para evitar errores
  components: { 
    MensajeInicial,
    NuevoDescuento,
    VerificarValidez,
    CalcularDescuentos
    // Eliminamos CalendarioSelector de los componentes registrados
  },

  data() {
    return {
      // Añadir filtros para los descuentos
      filtros: {
        isActive: null,
        productId: null,
        includeExpired: false,
        date: null
      },
      activeTab: 'lista',
      descuentos: [],
      categorias: [],
      cargando: {
        general: false,
        lista: false
      },
      modoEdicion: false,
      descuentoEditandoId: null,
      descuentoParaEditar: {}
    };
  },

  computed: {
    esAdmin() {
      const datosUsuario = AyudanteSesion.obtenerDatosSesion();
      return datosUsuario.rol === 'Admin';
    }
  },

  mounted() {
    this.cargarDescuentos();
    this.cargarCategorias();
    this.verificarPermisos();
  },

  watch: {
    activeTab() {
      this.verificarPermisos();
    }
  },

  methods: {
    // Método para formatear fechas
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    verificarPermisos() {
      // Si no es admin y está en una pestaña restringida, redirigir a una pestaña permitida
      if (!this.esAdmin && (this.activeTab === 'lista' || this.activeTab === 'nuevo')) {
        this.activeTab = 'verificar';
      }
    },

    async cargarDescuentos() {
      this.cargando.lista = true;
      try {
        // Construir los parámetros de consulta basados en los filtros
        const params = {};

        if (this.filtros.isActive !== null) {
          params.isActive = this.filtros.isActive;
        }

        if (this.filtros.productId) {
          params.productId = this.filtros.productId;
        }

        if (this.filtros.includeExpired) {
          params.includeExpired = this.filtros.includeExpired;
        }

        if (this.filtros.date) {
          // Asegurarse de que la fecha esté en formato YYYY-MM-DD
          params.date = this.formatDateForApi(this.filtros.date);
        }

        const response = await apiRequest({
          method: 'GET',
          path: 'discounts',
          params: params
        });

        if (response && response.data) {
          this.descuentos = Array.isArray(response.data) ? response.data : [];

          // Depuración para ver la estructura de los datos
          console.log('Descuentos cargados:', this.descuentos);
        } else {
          this.descuentos = [];
        }
      } catch (error) {
        console.error('Error al cargar descuentos:', error);
        this.$buefy.toast.open({
          message: 'Error al cargar la lista de descuentos',
          type: 'is-danger',
          duration: 3000
        });
        this.descuentos = [];
      } finally {
        this.cargando.lista = false;
      }
    },

    async cargarCategorias() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'categories'
        });

        if (response && response.data) {
          this.categorias = Array.isArray(response.data) ? response.data : [];
        } else {
          this.categorias = [];
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      }
    },

    formatDateForApi(date) {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    editarDescuento(descuento) {
      this.modoEdicion = true;
      this.descuentoEditandoId = descuento.id;
      this.descuentoParaEditar = descuento;
      this.activeTab = 'nuevo';
    },
    
    cancelarEdicion() {
      this.modoEdicion = false;
      this.descuentoEditandoId = null;
      this.descuentoParaEditar = {};
    },

    onDescuentoGuardado(resultado) {
      if (resultado.exito) {
        this.$buefy.toast.open({
          message: resultado.mensaje,
          type: 'is-success',
          duration: 3000
        });
        this.cargarDescuentos();
        this.activeTab = 'lista';
      } else {
        this.$buefy.toast.open({
          message: resultado.mensaje,
          type: 'is-danger',
          duration: 5000
        });
      }
    },

    async eliminarDescuento(id) {
      this.$buefy.dialog.confirm({
        title: 'Eliminar Descuento',
        message: '¿Está seguro que desea Desactivar este descuento?   ',
        confirmText: 'Desactivar',
        cancelText: 'Cancelar',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: async () => {
          this.cargando.general = true;

          try {
            const response = await apiRequest({
              method: 'DELETE',
              path: `discounts/${id}`
            });

            // Verificar si la respuesta es exitosa (código 200)
            if (response && response.status === 200) {
              this.$buefy.toast.open({
                message: 'Descuento Desactivado exitosamente',
                type: 'is-success',
                duration: 3000
              });

              this.cargarDescuentos();
            }
          } catch (error) {
            console.error('Error al eliminar descuento:', error);

            // Verificar si el error es porque el descuento no fue encontrado
            if (error.response && error.response.status === 404) {
              this.$buefy.toast.open({
                message: 'El descuento no existe o ya fue Desactivado',
                type: 'is-warning',
                duration: 3000
              });
              // Recargar la lista para asegurar que esté actualizada
              this.cargarDescuentos();
            } else {
              this.$buefy.toast.open({
                message: 'Error al eliminar el descuento',
                type: 'is-danger',
                duration: 3000
              });
            }
          } finally {
            this.cargando.general = false;
          }
        }
      });
    },

    // Método para aplicar filtros
    aplicarFiltros() {
      this.cargarDescuentos();
    },

    // Método para resetear filtros
    resetearFiltros() {
      this.filtros = {
        isActive: null,
        productId: null,
        includeExpired: false,
        date: null
      };
      this.cargarDescuentos();
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 1.5rem;
}
</style>