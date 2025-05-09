<template>
  <div class="top-controls">
    <div class="search-container">
      <b-switch
        :value="searchByBarcode"
        size="is-medium"
        type="is-info"
        class="search-toggle"
        @input="$emit('toggle-search-mode')">
        {{ searchByBarcode ? '🔍 Modo Escaner' : '🔍 Modo Manual' }}
      </b-switch>

      <buscar-producto 
        ref="buscadorInput"
        @seleccionado="onProductoSeleccionado"
        :modo-busqueda="searchByBarcode ? 'codigo' : 'nombre'" 
        class="full-width-search"
        autofocus/>
        
      <b-switch 
        :value="usarPrecioTurista" 
        type="is-info" 
        class="tourist-switch"
        @input="$emit('toggle-tourist-price')">
        💸 Aplicar precio de turista antes de agregar los productos!
      </b-switch>
    </div>
  </div>
</template>

<script>
import BuscarProducto from '../../Inventario/BuscarProducto.vue'

export default {
  name: 'BuscadorProductosVenta',
  components: {
    BuscarProducto
  },
  props: {
    searchByBarcode: {
      type: Boolean,
      default: true
    },
    usarPrecioTurista: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onProductoSeleccionado(producto) {
      this.$emit('seleccionado', producto);
    },
    focusInput() {
      if (this.$refs.buscadorInput?.focusInput) {
        this.$refs.buscadorInput.focusInput();
      } else {
        // Fallback directo al DOM
        const input = document.querySelector('#producto input');
        if (input) {
          input.focus();
          input.setAttribute('autofocus', '');
        }
      }
    }
  }
}
</script>

<style scoped>
.top-controls {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  background-color: white;
  width: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.full-width-search {
  flex: 1;
  min-width: 300px;
  margin-right: 2rem;
}

.tourist-switch {
  white-space: nowrap;
  font-size: 1.1rem;
}

.search-toggle {
  margin-right: 15px;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

@media screen and (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .tourist-switch {
    margin-left: 0;
    margin-top: 0.75rem;
  }
  
  .search-toggle >>> .switch span {
    font-size: 1.2rem;
    font-weight: bold;
  }
}
</style>