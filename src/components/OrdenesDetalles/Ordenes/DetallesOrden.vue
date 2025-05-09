<template>
  <div class="modal" :class="{ 'is-active': activo }">
    <div class="modal-background" @click="cerrar"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <i class="fas fa-info-circle mr-2"></i> Detalles de la Orden
        </p>
        <button class="delete" aria-label="close" @click="cerrar"></button>
      </header>
      <section class="modal-card-body">
        <div v-if="orden">
          <div class="order-detail-header">
            <div class="order-info">
              <h4 class="title is-5">Orden #{{ orden.id }}</h4>
              <p class="subtitle is-6">
                {{ orden.invoiceNumber }}
              </p>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="orden.isActive ? 'active' : 'inactive'">
                {{ orden.isActive ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>
      
          <div class="info-box">
            <h5 class="title is-6">Información del Proveedor</h5>
            <div class="columns is-multiline">
              <div class="column is-6">
                <p><strong>Nombre:</strong> {{ orden.provider.name }}</p>
              </div>
              <div class="column is-6">
                <p><strong>ID Fiscal:</strong> {{ orden.provider.taxId }}</p>
              </div>
              <div class="column is-6">
                <p><strong>Teléfono:</strong> {{ orden.provider.phone }}</p>
              </div>
              <div class="column is-6">
                <p><strong>Dirección:</strong> {{ orden.provider.address }}</p>
              </div>
            </div>
          </div>
      
          <div class="order-details-section">
            <h5 class="title is-6">Detalles de Productos</h5>
            
            <div v-if="!orden.orderDetails || orden.orderDetails.length === 0" class="message info">
              <i class="fas fa-info-circle message-icon"></i>
              <span>No hay productos registrados en esta orden.</span>
            </div>
            
            <div v-else>
              <table class="table is-fullwidth">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Impuesto Unitario</th>
                    <th>Total sin Impuesto</th>
                    <th>Total con Impuesto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in orden.orderDetails" :key="detalle.id" 
                    :class="{ 'inactive-row': !detalle.isActive }">
                    <td>{{ obtenerNombreProducto(detalle) }}</td>
                    <td>{{ detalle.quantity }}</td>
                    <td>{{ formatearMoneda(detalle.purchasePriceUnit) }}</td>
                    <td>{{ formatearMoneda(detalle.calculatedTaxUnit) }}</td>
                    <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithouthTax) }}</td>
                    <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithTax) }}</td>
                    <td>
                      <span class="status-badge" :class="detalle.isActive ? 'active' : 'inactive'">
                        {{ detalle.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="totals-row">
                <span>Totales:</span>
                <span>{{ calcularTotalSinImpuesto() }}</span>
                <span>{{ calcularTotalConImpuesto() }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button" @click="cerrar">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetallesOrden',
  
  props: {
    activo: {
      type: Boolean,
      default: false
    },
    orden: {
      type: Object,
      default: null
    },
    productosCache: {
      type: Object,
      default: () => ({})
    }
  },
  
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    
    formatearMoneda(valor) {
      if (valor === undefined || valor === null) return '$0.00';
      
      return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(valor);
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
    
    calcularTotalSinImpuesto() {
      if (!this.orden || !this.orden.orderDetails) return this.formatearMoneda(0);
      
      const total = this.orden.orderDetails.reduce((sum, detalle) => {
        return sum + (detalle.calculatedTotalPriceWithouthTax || 0);
      }, 0);
      
      return this.formatearMoneda(total);
    },
    
    calcularTotalConImpuesto() {
      if (!this.orden || !this.orden.orderDetails) return this.formatearMoneda(0);
      
      const total = this.orden.orderDetails.reduce((sum, detalle) => {
        return sum + (detalle.calculatedTotalPriceWithTax || 0);
      }, 0);
      
      return this.formatearMoneda(total);
    }
  }
};
</script>

<style src="../../stilos/ordenes.css"></style>