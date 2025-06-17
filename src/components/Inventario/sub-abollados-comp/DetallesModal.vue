<!-- File: src/components/Inventario/sub/DetallesModal.vue -->
<template>
  <b-modal :active.sync="active" has-modal-card>
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Detalles del producto abollado</p>
      </header>
      <section class="modal-card-body">
        <!-- Contenido del body inyectado por slot -->
        <slot name="body" />
      </section>
      <footer class="modal-card-foot">
        <button class="button" @click="close">Cerrar</button>
        <button
          class="button is-success"
          v-if="showProcess"
          @click="$emit('procesar', item)"
        >
          Procesar reposición
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DetallesModal',
  props: {
    active: {
      type: Boolean,
      required: true
    },
    item: {
      type: Object,
      default: null
    },
    showProcess: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    close() {
      this.$emit('update:active', false)
    }
  }
}
</script>

<style scoped>
.modal-card {
  width: auto;
}
</style>
