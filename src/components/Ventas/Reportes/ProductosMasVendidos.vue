<template>
  <div class="card dashboard-card" v-if="isAdmin">
    <header class="card-header">
      <p class="card-header-title">
        <b-icon icon="trophy" type="is-warning"></b-icon>
        Productos más vendidos
      </p>
      <div class="card-header-icon">
        <b-select v-model="limite" @input="obtenerProductosMayoresVentas" size="is-small">
          <option :value="5">Top 5</option>
          <option :value="10">Top 10</option>
          <option :value="15">Top 15</option>
          <option :value="20">Top 20</option>
        </b-select>
      </div>
    </header>
    <div class="card-content">
      <b-table :data="productosMayoresVentas" :loading="cargando" :striped="true" :hoverable="true">
        <b-table-column field="product_name" label="Producto" v-slot="props">
          {{ props.row.product_name }}
        </b-table-column>
        <b-table-column field="units" label="Unidades" numeric v-slot="props">
          {{ formatNumber(props.row.units) }}
        </b-table-column>
        <b-table-column field="total" label="Total" numeric v-slot="props">
          ${{ formatNumber(props.row.total) }}
        </b-table-column>
      </b-table>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "ProductosMasVendidos",
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      productosMayoresVentas: [],
      limite: 5,
      cargando: false
    };
  },
  
  mounted() {
    this.obtenerProductosMayoresVentas();
  },
  
  methods: {
    formatNumber(value) {
      if (!value) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num)
        ? "0.00"
        : num.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    },
    
    async obtenerProductosMayoresVentas() {
      this.cargando = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `sold-products/top-sold?limit=${this.limite}`,
        });

        if (response?.data) {
          this.productosMayoresVentas = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
        }
      } catch (error) {
        console.error("Error al obtener productos más vendidos:", error);
        this.mostrarError("Error al cargar los productos más vendidos");
      } finally {
        this.cargando = false;
      }
    },
    
    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: "is-danger",
        duration: 5000,
      });
    }
  }
};
</script>