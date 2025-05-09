<template>
  <div class="card sticky-card">
    <div class="card-content">
      <!-- Resumen de venta -->
      <div class="notification is-primary-bg mb-3">
        <div v-if="descuentoTotal > 0" class="has-text-centered mb-2">
          <p class="is-size-5">Subtotal: ${{ formatearNumero(subtotal) }}</p>
          <p class="is-size-5 has-text-success">Descuento: -${{ formatearNumero(descuentoTotal) }}</p>
        </div>
        <p class="has-text-weight-bold has-text-centered" style="font-size:3em">
          Total ${{ formatearNumero(total) }}
        </p>
      </div>
      
      <!-- Botones de acción principales -->
      <div class="buttons is-centered mb-4">
        <b-button class="button" type="is-success" icon-left="check" expanded
          @click="$emit('abrir-dialogo', 'venta')">
          Terminar venta
        </b-button>
        <b-button class="button" type="is-danger" icon-left="cancel" expanded
          @click="$emit('cancelar-venta')">
          Cancelar
        </b-button>
      </div>
      
      <!-- Botón de búsqueda de descuentos -->
      <div class="has-text-centered">
        <b-button type="is-info" @click="$emit('buscar-descuentos')" :loading="cargandoDescuentos" expanded>
          <span class="icon"><i class="mdi mdi-tag-multiple"></i></span>
          <span>Buscar descuentos disponibles</span>
        </b-button>
        
        <!-- Mensaje informativo - solo cuando no hay descuentos disponibles -->
        <div class="notification is-warning is-light mt-2 py-2 px-3">
          <p class="is-size-7 has-text-centered">
            <span class="icon is-small mr-1"><i class="mdi mdi-information"></i></span>
            ¡IMPORTANTE!

AGREGA LA CANTIDAD CORRECTA DE CADA PRODUCTO ANTES DE BUSCAR LOS DESCUENTOS

Los descuentos se calculan en base a la cantidad y precio de los productos seleccionados.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResumenVenta',
  props: {
    total: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    descuentoTotal: {
      type: Number,
      required: true
    },
    cargandoDescuentos: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatearNumero(valor) {
      return parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }
}
</script>

<style scoped>
.notification.is-primary-bg {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 1.25rem;
}

.sticky-card {
  position: sticky;
  top: 20px;
}

@media screen and (max-width: 768px) {
  .level-item .button {
    font-size: 0.8rem;
    padding: 0.5em 0.75em;
  }

  .level-item .button .icon {
    margin-right: 0.25em;
  }

  p[style="font-size:3em"] {
    font-size: 2em !important;
  }
  
  .sticky-card {
    position: relative;
    top: 0;
  }
}
</style>