<template>
  <div class="top-controls">
    <div class="search-container">
      <buscar-producto 
        ref="buscadorInput"
        @seleccionado="onProductoSeleccionado"
        class="full-width-search"
        autofocus/>

      <div
        class="emoji-toggle tourist-toggle"
        :class="{ active: turistaActivo }"
        @click="togglePrecioTurista"
        title="Aplicar precio de turista antes de agregar los productos!"
      >
       🌴
      </div>
    </div>

    <transition name="fade">
      <div v-if="showMessage" class="tourist-msg">
        {{ turistaActivo ? 'Precio turista aplicado' : 'Precio turista desactivado' }}
      </div>
    </transition>
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
    usarPrecioTurista: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showMessage: false,
      turistaActivo: this.usarPrecioTurista
    }
  },
  watch: {
    usarPrecioTurista(newVal) {
      this.turistaActivo = newVal
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
        const input = document.querySelector('#producto input');
        if (input) {
          input.focus();
          input.setAttribute('autofocus', '');
        }
      }
    },
    togglePrecioTurista() {
      this.turistaActivo = !this.turistaActivo;
      this.$emit('toggle-tourist-price', this.turistaActivo);
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
      }, 2000);
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
  flex-direction: column;
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

.emoji-toggle {
  font-size: 1.8rem;
  cursor: pointer;
  user-select: none;
  margin-right: 15px;
  transition: transform 0.2s;
}

.emoji-toggle.active {
  color: #2b9e4f;
}

.emoji-lupa {
  display: inline-block;
  transition: transform 0.2s ease;
}

.emoji-lupa:hover {
  transform: scale(1.3);
}

.tourist-msg {
  margin-top: 0.75rem;
  color: #2b9e4f;
  font-weight: bold;
  font-size: 1rem;
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .emoji-toggle {
    margin-top: 0.75rem;
  }
}
</style>