<template>
  <div class="modal" :class="{ 'is-active': activo }">
    <div class="modal-background" @click="cerrar"></div>
    <div class="modal-card" style="width: auto; max-width: 80vw;">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <i class="fas fa-calculator mr-2"></i> Resumen Financiero: 
          {{ resumen && resumen.summary && resumen.summary.invoice ? resumen.summary.invoice.number : 'Factura' }}
        </p>
        <button class="delete" aria-label="close" @click="cerrar"></button>
      </header>
      <section class="modal-card-body">
        <!-- Mensaje cuando no hay datos disponibles -->
        <div v-if="!resumen || !resumen.summary" class="no-data-message">
          <div class="message is-warning">
            <div class="message-body">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <span>No hay información de resumen financiero disponible para esta orden.</span>
            </div>
          </div>
          <div class="no-data-details mt-4">
            <p>Posibles razones:</p>
            <ul>
              <li>La orden no tiene productos asociados</li>
              <li>La orden está en proceso de creación</li>
            </ul>
            <p class="mt-3">Por favor, verifique que la orden tenga productos asociados y esté correctamente configurada.</p>
          </div>
        </div>

        <!-- Contenido del resumen cuando hay datos -->
        <div v-else class="box p-5">
          <!-- Información de la factura -->
          <div class="invoice-info mb-5">
            <div class="columns">
              <div class="column is-6">
                <div class="field">
                  <label class="label">Número de Factura</label>
                  <div class="control">
                    <input class="input" type="text" readonly 
                      :value="resumen.summary.invoice.number">
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="field">
                  <label class="label">Fecha</label>
                  <div class="control">
                    <input class="input" type="text" readonly 
                      :value="formatDate(resumen.summary.invoice.date)">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Detalles de la orden -->
          <h4 class="title is-5 mb-3">Detalles de la Orden</h4>
          <b-table :data="resumen.details" :striped="true" :hoverable="true">
            <b-table-column field="productName" label="Producto" v-slot="props">
              {{ props.row.productName || 'N/A' }}
            </b-table-column>
            <b-table-column field="productId" label="ID Producto" numeric v-slot="props">
              {{ props.row.productId }}
            </b-table-column>
            <b-table-column field="quantity" label="Cantidad" numeric v-slot="props">
              {{ props.row.quantity }}
            </b-table-column>
            <b-table-column field="unitPriceWithoutVAT" label="Precio sin IVA" numeric v-slot="props">
              {{ formatearMoneda(props.row.unitPriceWithoutVAT) }}
            </b-table-column>
            <b-table-column field="unitPriceWithVAT" label="Precio con IVA" numeric v-slot="props">
              {{ formatearMoneda(props.row.unitPriceWithVAT) }}
            </b-table-column>
            <b-table-column field="totalPriceWithoutVAT" label="Total sin IVA" numeric v-slot="props">
              {{ formatearMoneda(props.row.totalPriceWithoutVAT) }}
            </b-table-column>
            <b-table-column field="totalPriceWithVAT" label="Total con IVA" numeric v-slot="props">
              {{ formatearMoneda(props.row.totalPriceWithVAT) }}
            </b-table-column>
          </b-table>

          <!-- Resumen financiero -->
          <div class="financial-summary mt-5">
            <h4 class="title is-5 mb-3">Resumen Financiero</h4>
            <div class="box has-background-light p-4">
              <div class="columns is-multiline">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Total sin IVA</label>
                    <div class="control">
                      <input class="input" type="text" readonly 
                        :value="formatearMoneda(resumen.summary.totalWithoutVAT)">
                    </div>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Total IVA</label>
                    <div class="control">
                      <input class="input" type="text" readonly 
                        :value="formatearMoneda(resumen.summary.totalVAT)">
                    </div>
                  </div>
                </div>
                <div class="column is-12">
                  <div class="field">
                    <label class="label">Total con IVA</label>
                    <div class="control">
                      <input class="input is-primary has-text-weight-bold" type="text" readonly 
                        :value="formatearMoneda(resumen.summary.totalWithVAT)">
                    </div>
                  </div>
                </div>
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
  name: 'ResumenFinanciero',
  
  props: {
    activo: {
      type: Boolean,
      default: false
    },
    resumen: {
      type: Object,
      default: null
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
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    }
  }
};
</script>

<style src="../../stilos/ordenes.css"></style>