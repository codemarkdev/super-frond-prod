<template>
  <div class="section-header">
    <div class="header-left">
      <i class="fas fa-clipboard-list section-icon"></i>
      <h3>Listado de Órdenes</h3>
    </div>
    <div class="header-right">
      <div class="search-box">
        <input 
          type="text" 
          v-model="busquedaLocal" 
          placeholder="Buscar por número de factura..." 
          class="search-input"
          @input="emitirBusqueda"
        >
        <i class="fas fa-search search-icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BuscadorOrdenes',
  
  props: {
    busqueda: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      busquedaLocal: this.busqueda
    };
  },
  
  watch: {
    busqueda(newVal) {
      this.busquedaLocal = newVal;
    }
  },
  
  methods: {
    emitirBusqueda() {
      this.$emit('buscar', this.busquedaLocal);
    }
  }
};
</script>

<style src="../../stilos/ordenes.css"></style>