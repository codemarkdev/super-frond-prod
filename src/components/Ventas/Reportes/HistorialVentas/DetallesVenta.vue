<template>
  <b-modal :active.sync="activo" has-modal-card @close="cerrarModal">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Detalles de Venta</p>
      </header>
      <section class="modal-card-body">
        <div class="content">
          <h4>Fecha: {{ formatearFecha(venta.date) }}</h4>
          <h4>Total: ${{ formatNumber(venta.totalWithIVA) }}</h4>

          <b-table :data="venta.products || []" :striped="true" :hoverable="true">
            <b-table-column field="productId" label="ID Producto" v-slot="props">
              {{ props.row.productId }}
            </b-table-column>
            <b-table-column field="quantity" label="Cantidad" numeric v-slot="props">
              {{ props.row.quantity }}
            </b-table-column>
            <b-table-column field="price" label="Precio" numeric v-slot="props">
              ${{ formatNumber(props.row.price) }}
            </b-table-column>
            <b-table-column field="priceWithouthIVA" label="Precio sin IVA" numeric v-slot="props">
              ${{ formatNumber(props.row.priceWithouthIVA) }}
            </b-table-column>
            <b-table-column field="iva" label="IVA" numeric v-slot="props">
              ${{ formatNumber(props.row.iva) }}
            </b-table-column>
          </b-table>
        </div>
      </section>
      <footer class="modal-card-foot">
        <b-button @click="cerrarModal">Cerrar</b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: "DetallesVenta",
  
  props: {
    value: {
      type: Boolean,
      default: false
    },
    venta: {
      type: Object,
      default: () => ({})
    }
  },
  
  computed: {
    activo: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  },
  
  methods: {
    formatNumber(value) {
      if (value === null || value === undefined) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num)
        ? "0.00"
        : num.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    },
    
    formatearFecha(fecha) {
      if (!fecha) return "";
      return new Date(fecha).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    
    cerrarModal() {
      this.activo = false;
    }
  }
};
</script>