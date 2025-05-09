<template>
  <b-modal 
    :active="mostrarDialogo" 
    has-modal-card 
    trap-focus 
    :destroy-on-hide="false" 
    aria-role="dialog"
    aria-label="Modal Terminar Venta" 
    close-button-aria-label="Close" 
    aria-modal>
    <dialogo-terminar-venta 
      :totalVenta="totalVenta" 
      @close="onCerrar" 
      @terminar="onTerminar"
      v-if="mostrarTerminarVenta">
    </dialogo-terminar-venta>
    
   <!--
<dialogo-agregar-cuenta 
  :totalVenta="totalVenta" 
  @close="onCerrar" 
  @terminar="onTerminar"
  v-if="mostrarAgregarCuenta">
</dialogo-agregar-cuenta>

<dialogo-agregar-apartado 
  :totalVenta="totalVenta" 
  @close="onCerrar" 
  @terminar="onTerminar"
  v-if="mostrarAgregarApartado">
</dialogo-agregar-apartado>

<dialogo-cotizar 
  :totalVenta="totalVenta" 
  @close="onCerrar" 
  @terminar="onTerminar"
  v-if="mostrarRegistrarCotizacion">
</dialogo-cotizar>
-->

  </b-modal>
</template>

<script>
import DialogoTerminarVenta from '../DialogoTerminarVenta'
// import DialogoAgregarCuenta from './DialogoAgregarCuenta.vue'
// import DialogoAgregarApartado from './DialogoAgregarApartado.vue'
// import DialogoCotizar from './DialogoCotizar.vue'


export default {
  name: 'GestorDialogos',
  components: {
    DialogoTerminarVenta,
   // DialogoAgregarCuenta,
   // DialogoAgregarApartado,
    //DialogoCotizar
  },
  props: {
    mostrarDialogo: {
      type: Boolean,
      required: true
    },
    mostrarTerminarVenta: {
      type: Boolean,
      required: true
    },
    mostrarAgregarCuenta: {
      type: Boolean,
      required: true
    },
    mostrarAgregarApartado: {
      type: Boolean,
      required: true
    },
    mostrarRegistrarCotizacion: {
      type: Boolean,
      required: true
    },
    totalVenta: {
      type: Number,
      required: true
    }
  },
  methods: {
    onCerrar(opcion) {
      this.$emit('close', opcion);
    },
    onTerminar(venta) {
      this.$emit('terminar', venta);
    }
  }
}
</script>