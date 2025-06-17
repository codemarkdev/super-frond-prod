
<template>
  <div class="box">
    <b-table
      :data="rows"
      :per-page="perPage"
      :current-page.sync="currentPage"
      :pagination-simple="simple"
      :pagination-rounded="rounded"
      :pagination-position="position"
      :sort-icon="icon"
      :sort-icon-size="iconSize"
      default-sort="dateReported"
      default-sort-direction="desc"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
    >
      <!-- Slot para definir las columnas desde el componente padre -->
      <slot name="columns"/>
    </b-table>

    <b-pagination
      v-if="totalPages > 1"
      :total="total"
      :current.sync="currentPage"
      :per-page="perPage"
      :rounded="rounded"
      :simple="simple"
      :position="position"
      @change="$emit('page-change', currentPage)"
    />
  </div>
</template>

<script>
export default {
  name: 'AbolladosTable',
  props: {
    rows: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    perPage: {
      type: Number,
      default: 10
    },
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      default: 1
    },
    simple: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: true
    },
    position: {
      type: String,
      default: 'bottom'
    },
    icon: {
      type: String,
      default: 'arrow-up'
    },
    iconSize: {
      type: String,
      default: 'is-medium'
    }
  }
};
</script>

<style scoped>
.box {
  margin-bottom: 1.5rem;
}
</style>
