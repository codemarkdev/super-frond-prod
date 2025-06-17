<template>
  <div>
    <div v-if="productos.length === 0 && !cargando" class="box has-text-centered py-6">
      <b-icon icon="alert-circle-outline" size="is-large" type="is-danger" />
      <h1 class="title is-3 has-text-danger mt-2">El Producto que busca no existe</h1>
    </div>

    <div v-else-if="productos.length > 0">
      <div class="is-flex" style="gap: 10.5rem; flex-wrap: wrap;">
        <cartas-totales :totales="totales" class="mb-4" />
      </div>

      <b-table
        class="box"
        :data="productos"
        :per-page="pagination.perPage"
        :current-page="pagination.currentPage"
        @update:current-page="$emit('page-change', $event)"
        :pagination-simple="false"
        :pagination-position="'bottom'"
        :default-sort-direction="'asc'"
        :pagination-rounded="true"
        :sort-icon="'arrow-up'"
        :sort-icon-size="'is-medium'"
        default-sort="id"
        :sticky-header="false"
        :height="null"
      >
        <b-table-column label="ID" sortable v-slot="props">
          {{ props.row.id }}
        </b-table-column>

        <b-table-column field="code" label="Código de barras" sortable v-slot="props">
          {{ props.row.code }}
        </b-table-column>

        <b-table-column field="name" label="Nombre" sortable v-slot="props">
          {{ props.row.name }}
        </b-table-column>

        <b-table-column field="purchasePrice" label="Precio compra" sortable v-slot="props">
          ${{ props.row.purchasePrice }}
        </b-table-column>

        <b-table-column field="salePrice" label="Precio venta" sortable v-slot="props">
          ${{ props.row.salePrice }}
        </b-table-column>

        <b-table-column field="touristPrice" label="Precio turista" sortable v-slot="props">
          ${{ props.row.touristPrice }}
        </b-table-column>

        <b-table-column label="Ganancia" sortable v-slot="props">
          <b>${{ (props.row.salePrice - props.row.purchasePrice).toFixed(2) }}</b>
        </b-table-column>

        <b-table-column label="Ganancia turista" sortable v-slot="props">
          <b>${{ (props.row.touristPrice - props.row.purchasePrice).toFixed(2) }}</b>
        </b-table-column>

        <b-table-column label="¿Mayoreo?" v-slot="props">
          <b-tag type="is-danger" v-if="!props.row.wholesaleSale">No</b-tag>
          <div v-else>
            <b>Precio:</b> ${{ props.row.wholesalePrice }}<br />
            <b>A partir de:</b> {{ parseInt(props.row.wholesaleQuantity) }}
          </div>
        </b-table-column>

        <b-table-column label="Existencia" sortable v-slot="props">
          {{ props.row.stock }}
        </b-table-column>

        <b-table-column label="Marca" sortable v-slot="props">
          {{ props.row.brand.brandName }}
        </b-table-column>

        <b-table-column label="Categoría" sortable v-slot="props">
          {{ props.row.category.categoryName }}
        </b-table-column>

        <b-table-column label="Acciones" centered v-slot="props">
          <div class="buttons is-centered">
            <b-tooltip label="Agregar existencia" position="is-top">
              <b-button class="btn-primary" @click="$emit('agregar', props.row)">
                <b-icon icon="plus" />
              </b-button>
            </b-tooltip>
            <b-tooltip label="Quitar existencia" position="is-top">
              <b-button class="btn-ghost" @click="$emit('quitar', props.row)">
                <b-icon icon="minus" />
              </b-button>
            </b-tooltip>
            <b-tooltip label="Marcar como abollado" position="is-top">
              <b-button class="btn-warning" @click="$emit('marcar-danado', props.row)">
                <b-icon icon="alert-circle" />
              </b-button>
            </b-tooltip>
            <b-tooltip label="Editar producto" position="is-top">
              <b-button class="btn-link-primary" @click="$emit('editar', props.row.id)">
                <b-icon icon="pen" />
              </b-button>
            </b-tooltip>
            <b-tooltip label="Eliminar producto" position="is-top">
              <b-button class="btn-link" @click="$emit('eliminar', props.row.id)">
                <b-icon icon="delete" />
              </b-button>
            </b-tooltip>
          </div>
        </b-table-column>
      </b-table>

      <b-pagination
        v-if="total > pagination.perPage"
        :total="total"
        :current="pagination.currentPage"
        @update:current="$emit('page-change', $event)"
        :per-page="pagination.perPage"
        :rounded="true"
        :simple="false"
        :position="'bottom'"
      />
    </div>
  </div>
</template>

<script>
import CartasTotales from '../../Extras/CartasTotales.vue'

export default {
  name: 'InventarioTab',
  props: {
    productos: { type: Array, default: () => [] },
    totales: { type: Array, default: () => [] },
    cargando: Boolean,
    pagination: Object,
    total: Number
  },
  components: {
    CartasTotales
  }
}
</script>
