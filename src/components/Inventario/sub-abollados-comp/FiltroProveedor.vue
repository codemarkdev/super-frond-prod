
<template>
  <div class="field mt-4">
    <label class="label">Filtrar por Proveedor</label>
    <div class="control is-flex">
      <b-input
        v-model="nombre"
        placeholder="Nombre del proveedor"
        expanded
        class="mr-2"
      />
      <b-button type="is-primary" @click="emitFiltrar">
        Filtrar
      </b-button>
      <b-button
        v-if="filtro"
        type="is-light"
        class="ml-2"
        @click="$emit('limpiar')"
      >
        Limpiar
      </b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FiltroProveedor',
  props: {
    filtro: {
      type: [Number, null],
      default: null
    }
  },
  data() {
    return {
      nombre: ''
    };
  },
  methods: {
    emitFiltrar() {
      this.$emit('filtrar', this.nombre.trim());
    }
  }
};
</script>

<style scoped>
.field {
  margin-top: 1rem;
}
</style>
