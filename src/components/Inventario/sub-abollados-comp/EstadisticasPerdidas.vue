
<template>
  <div class="box mb-4" v-if="show">
    <h3 class="title is-5 mb-3">Estadísticas de Pérdidas</h3>
    <div class="is-flex" style="gap: 10.5rem; flex-wrap: wrap;">
      <cartas-totales :totales="cartas" class="mb-4" />
    </div>
    <div v-if="byBrand.length">
      <h4 class="subtitle is-6 mt-4 mb-2">Pérdidas por Marca</h4>
      <b-table
        :data="byBrand"
        :columns="columnas"
        striped
        narrowed
        hoverable
      />
    </div>
  </div>
</template>

<script>
import CartasTotales from '../../Extras/CartasTotales.vue';

export default {
  name: 'EstadisticasPerdidas',
  components: { CartasTotales },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    cartas: {
      type: Array,
      default: () => []
    },
    byBrand: {
      type: Array,
      default: () => []
    },
    columnas: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style scoped>
.box {
  margin-bottom: 1.5rem;
}
</style>
