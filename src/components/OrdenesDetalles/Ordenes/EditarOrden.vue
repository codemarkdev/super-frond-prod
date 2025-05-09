<template>
  <div class="modal" :class="{ 'is-active': activo }">
    <div class="modal-background" @click="cerrar"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <i class="fas fa-edit mr-2"></i> Editar Orden
        </p>
        <button class="delete" aria-label="close" @click="cerrar"></button>
      </header>
      <section class="modal-card-body">
        <form @submit.prevent="guardar">
          <!-- Número de factura -->
          <div class="field">
            <label class="label">
              <i class="fas fa-file-invoice mr-2"></i> Número de Factura:
            </label>
            <div class="control">
              <input 
                type="text" 
                class="input" 
                v-model="ordenLocal.invoiceNumber" 
                placeholder="Ej: INV-12345"
                required
                :disabled="tieneProductosRegistrados"
              >
              <p v-if="tieneProductosRegistrados" class="help is-warning">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                No se puede editar el número de factura porque ya tiene productos registrados.
              </p>
            </div>
          </div>

          <!-- Fecha de orden -->
          <div class="field">
            <label class="label">
              <i class="fas fa-calendar-alt mr-2"></i> Fecha de Orden:
            </label>
            <div class="control">
              <input 
                type="date" 
                class="input" 
                v-model="ordenLocal.orderDate" 
                required
              >
            </div>
          </div>

          <!-- Información del proveedor (solo lectura) -->
          <div class="field">
            <label class="label">
              <i class="fas fa-truck mr-2"></i> Proveedor:
            </label>
            <div class="control">
              <input 
                type="text" 
                class="input" 
                :value="ordenLocal.provider ? ordenLocal.provider.name : ''" 
                readonly
                disabled
              >
              <p class="help">El proveedor no se puede cambiar una vez creada la orden.</p>
            </div>
          </div>
        </form>
      </section>
      <footer class="modal-card-foot">
        <button 
          class="button is-primary" 
          @click="guardar" 
          :disabled="actualizando"
        >
          <i class="fas" :class="actualizando ? 'fa-spinner fa-spin' : 'fa-save'"></i>
          {{ actualizando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <button class="button" @click="cerrar">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditarOrden',
  
  props: {
    activo: {
      type: Boolean,
      default: false
    },
    orden: {
      type: Object,
      default: null
    },
    actualizando: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      ordenLocal: {
        id: null,
        invoiceNumber: '',
        orderDate: '',
        isActive: true,
        provider: null,
        orderDetails: []
      }
    };
  },
  
  computed: {
    tieneProductosRegistrados() {
      return this.ordenLocal && 
             this.ordenLocal.orderDetails && 
             this.ordenLocal.orderDetails.length > 0;
    }
  },
  
  watch: {
    orden: {
      handler(newVal) {
        if (newVal) {
          this.ordenLocal = JSON.parse(JSON.stringify(newVal));
        }
      },
      immediate: true
    }
  },
  
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    
    guardar() {
      // Si tiene productos registrados, no permitimos cambiar el número de factura
      const datosActualizacion = {
        orderDate: this.ordenLocal.orderDate
      };
      
      // Solo incluimos el invoiceNumber si no tiene productos registrados
      if (!this.tieneProductosRegistrados) {
        datosActualizacion.invoiceNumber = this.ordenLocal.invoiceNumber;
      }
      
      this.$emit('guardar', datosActualizacion);
    }
  }
};
</script>

<style src="../../stilos/ordenes.css"></style>