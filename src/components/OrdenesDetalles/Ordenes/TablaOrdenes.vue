<template>
  <div>
    <!-- Mensaje de carga -->
    <div v-if="cargando && !ordenes.length" class="message info">
      <i class="fas fa-spinner fa-spin message-icon"></i>
      <span>Cargando órdenes, por favor espere...</span>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="message error">
      <i class="fas fa-exclamation-circle message-icon"></i>
      <span>{{ error }}</span>
      <button @click="$emit('recargar')" class="btn-retry">
        <i class="fas fa-redo"></i> Reintentar
      </button>
    </div>

    <!-- Mensaje de no hay órdenes -->
    <div v-if="!cargando && !error && !ordenes.length" class="message info">
      <i class="fas fa-info-circle message-icon"></i>
      <span>No hay órdenes registradas en el sistema.</span>
    </div>

    <!-- Tabla de órdenes -->
    <div v-if="!cargando && !error && ordenes.length > 0" class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Número de Factura</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="orden in ordenes" :key="orden.id" :class="{ 'inactive-row': !orden.isActive }">
            <td>{{ orden.id }}</td>
            <td>{{ orden.invoiceNumber }}</td>
            <td>{{ formatearFecha(orden.orderDate) }}</td>
            <td>
              <div class="provider-info">
                <span class="provider-name">{{ orden.provider.name }}</span>
                <span class="provider-details">{{ orden.provider.taxId }}</span>
              </div>
            </td>
            <td>
              <div v-if="orden.orderDetails && orden.orderDetails.length > 0" class="productos-lista">
                <div v-for="(detalle, index) in orden.orderDetails.slice(0, 3)" :key="index" class="producto-item">
                  <span class="producto-nombre">{{ obtenerNombreProducto(detalle) }}</span>
                  <span class="producto-cantidad">({{ detalle.quantity }})</span>
                </div>
                <div v-if="orden.orderDetails.length > 3" class="ver-mas">
                  <a @click="$emit('ver-detalles', orden)">Ver todos ({{ orden.orderDetails.length }})</a>
                </div>
              </div>
              <span v-else class="badge">
                Sin productos
              </span>
            </td>
            <td>
              <span class="status-badge" :class="orden.isActive ? 'active' : 'inactive'">
                {{ orden.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <b-tooltip label="Eliminar" position="is-top">
                  <b-button class="btn-primary" @click="$emit('eliminar', orden)" :disabled="!esAdmin">
                    <b-icon icon="delete" />
                  </b-button>
                </b-tooltip>
                <b-tooltip label="Ver detalles" position="is-top">
                  <b-button class="btn-primary" @click="$emit('ver-detalles', orden)">
                    <b-icon icon="eye" />
                  </b-button>
                </b-tooltip>
                <b-tooltip label="Resumen Financiero" position="is-top">
                  <b-button class="btn-primary" @click="$emit('ver-resumen', orden)">
                    <b-icon icon="calculator" />
                  </b-button>
                </b-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginación -->
      <div class="pagination-container">
        <div class="pagination-info">
          Mostrando {{ paginaInicio }} - {{ paginaFin }} de {{ totalOrdenes }} órdenes
        </div>
        <b-pagination
          :total="totalOrdenes"
          v-model="paginaActualLocal"
          :per-page="elementosPorPaginaLocal"
          :range-before="2"
          :range-after="2"
          :simple="false"
          :rounded="true"
          :size="'is-small'"
          aria-next-label="Siguiente página"
          aria-previous-label="Página anterior"
          aria-page-label="Página"
          aria-current-label="Página actual"
          @change="cambiarPagina"
        >
        </b-pagination>
        <div class="per-page-selector">
          <span>Mostrar:</span>
          <b-select v-model="elementosPorPaginaLocal" size="is-small" @input="cambiarElementosPorPagina">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </b-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TablaOrdenes',
  
  props: {
    ordenes: {
      type: Array,
      required: true
    },
    cargando: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    esAdmin: {
      type: Boolean,
      default: false
    },
    totalOrdenes: {
      type: Number,
      required: true
    },
    paginaActual: {
      type: Number,
      default: 1
    },
    elementosPorPagina: {
      type: Number,
      default: 10
    },
    productosCache: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      paginaActualLocal: this.paginaActual,
      elementosPorPaginaLocal: this.elementosPorPagina
    };
  },
  
  computed: {
    paginaInicio() {
      if (this.totalOrdenes === 0) return 0;
      return (this.paginaActualLocal - 1) * this.elementosPorPaginaLocal + 1;
    },
    
    paginaFin() {
      const fin = this.paginaActualLocal * this.elementosPorPaginaLocal;
      return fin > this.totalOrdenes ? this.totalOrdenes : fin;
    }
  },
  
  watch: {
    paginaActual(newVal) {
      this.paginaActualLocal = newVal;
    },
    
    elementosPorPagina(newVal) {
      this.elementosPorPaginaLocal = newVal;
    }
  },
  
  methods: {
    formatearFecha(fecha) {
      if (!fecha) return 'N/A';
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(fecha).toLocaleDateString('es-ES', options);
    },
    
    obtenerNombreProducto(detalle) {
      if (detalle.productName) {
        return detalle.productName;
      }
      
      if (detalle.product && detalle.product.name) {
        return detalle.product.name;
      }
      
      if (detalle.product && detalle.product.id && this.productosCache[detalle.product.id]) {
        return this.productosCache[detalle.product.id].name;
      }
      
      if (detalle.productId && this.productosCache[detalle.productId]) {
        return this.productosCache[detalle.productId].name;
      }
      
      return "Producto sin información";
    },
    
    cambiarPagina(pagina) {
      this.paginaActualLocal = pagina;
      this.$emit('cambiar-pagina', pagina);
    },
    
    cambiarElementosPorPagina() {
      this.$emit('cambiar-elementos-por-pagina', this.elementosPorPaginaLocal);
    }
  }
};
</script>

<style src="../../stilos/ordenes.css"></style>