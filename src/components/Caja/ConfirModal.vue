<template>
  <b-modal v-model="localShowConfirmModal" has-modal-card trap-focus aria-role="dialog" @close="handleClose">
    <div class="modal-card">
      <header class="modal-card-head has-background-primary">
        <p class="modal-card-title has-text-white">Confirmar Cierre de Caja</p>
      </header>
      <section class="modal-card-body">
        <div class="content">
          <h3>Resumen del Cierre:</h3>
          <p><strong>Efectivo en Mano:</strong> {{ formatNumber(cashInHand) }}</p>
          <p class="has-text-danger has-text-weight-bold">Esta acción no se puede deshacer.</p>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-primary" :class="{ 'is-loading': cargando }" @click="confirmarCierre">
          Confirmar
        </button>
        <button class="button" @click="handleClose" :disabled="cargando">
          Cancelar
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    showConfirmModal: Boolean,
    cashInHand: Number,
    cargando: Boolean,
    actionModal: {
        type: Function,
        required: true
      }
  },
  data() {
    return {
      localShowConfirmModal: this.showConfirmModal
    };
  },
  watch: {
    showConfirmModal(newVal) {
      this.localShowConfirmModal = newVal;
    }
  },
  methods: {
    formatNumber(value) {
      return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    },
    confirmarCierre() {
      this.$emit('confirmar-cierre');
    },
    handleClose() {
      this.$emit('update:showConfirmModal', false);
    }
  }
}
</script>
