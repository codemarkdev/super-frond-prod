<template>
  <div class="modal" :class="{ 'is-active': activo }">
    <div class="modal-background" @click="cerrar"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-danger">
        <p class="modal-card-title has-text-white">
          <i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación
        </p>
        <button class="delete" aria-label="close" @click="cerrar"></button>
      </header>
      <section class="modal-card-body">
        <p>
          ¿Está seguro que desea eliminar la orden con número de factura 
          <strong>{{ orden ? orden.invoiceNumber : '' }}</strong>?
        </p>
        <p class="has-text-danger mt-3">
          <i class="fas fa-exclamation-circle mr-2"></i>
          Esta acción no se puede deshacer y eliminará todos los detalles asociados a esta orden.
        </p>
      </section>
      <footer class="modal-card-foot">
        <button 
          class="button is-danger" 
          @click="confirmar" 
          :disabled="eliminando"
        >
          <i class="fas" :class="eliminando ? 'fa-spinner fa-spin' : 'fa-trash-alt'"></i>
          {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
        </button>
        <button class="button" @click="cerrar">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmarEliminar',
  
  props: {
    activo: {
      type: Boolean,
      default: false
    },
    orden: {
      type: Object,
      default: null
    },
    eliminando: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    cerrar() {
      this.$emit('cerrar');
    },
    
    confirmar() {
      this.$emit('confirmar');
    }
  }
};
</script>

<style src="../../stilos/ordenes.css"></style>