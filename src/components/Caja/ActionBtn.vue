<template>
    <button 
      :class="buttonClass"
      :disabled="isButtonDisabled"
      @click="onAction"
    >
      <span class="icon">
        <i class="mdi mdi-cash-register"></i>
      </span>
      <span>{{ buttonText }}</span>
    </button>
</template>

<script>
export default {
  props: {
    cajaAbierta: Boolean,
    isValidAmount: Boolean,
    cargando: Boolean,
    actionCash: {
      type: Function,
      required: true
    },
    isButtonDisabled: Boolean
  },
  computed: {
    buttonClass() {
      return this.cajaAbierta
        ? 'button is-danger is-fullwidth is-medium'
        : 'button is-primary is-fullwidth is-medium';
    },
    buttonText() {
      return this.cajaAbierta ? 'Cerrar Caja' : 'Abrir Caja';
    }
  },
  methods: {
    onAction() {
      this.actionCash();
    }
  }
}
</script>
