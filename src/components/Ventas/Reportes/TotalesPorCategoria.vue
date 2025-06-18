<template>
  <div class="columns is-multiline" v-if="isAdmin">
    <!-- Totales por marca -->
    <div class="column is-half">
      <div class="card dashboard-card">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="tag" type="is-info"></b-icon>
            Totales por marca
          </p>
        </header>
        <div class="card-content">
          <b-table :data="totalesPorMarca" :loading="cargando.byBrand" :striped="true" :hoverable="true">
            <b-table-column field="brandName" label="Marca" v-slot="props">
              {{ props.row.brandName }}
            </b-table-column>
            <b-table-column field="totalSales" label="Total ventas" numeric v-slot="props">
              ${{ formatNumber(props.row.totalSales) }}
            </b-table-column>
          </b-table>
          <div v-if="!totalesPorMarca.length && !cargando.byBrand" class="message is-warning is-light mt-2">
            <div class="message-body">No hay totales registrados por marca.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Totales por categoría -->
    <div class="column is-half">
      <div class="card dashboard-card">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="folder" type="is-success"></b-icon>
            Totales por categoría
          </p>
        </header>
        <div class="card-content">
          <b-table :data="totalesPorCategoria" :loading="cargando.byCategory" :striped="true" :hoverable="true">
            <b-table-column field="categoryName" label="Categoría" v-slot="props">
              {{ props.row.categoryName }}
            </b-table-column>
            <b-table-column field="totalSales" label="Total ventas" numeric v-slot="props">
              ${{ formatNumber(props.row.totalSales) }}
            </b-table-column>
          </b-table>
          <div v-if="!totalesPorCategoria.length && !cargando.byCategory" class="message is-warning is-light mt-2">
            <div class="message-body">No hay totales registrados por categoría.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos por marca -->
    <div class="column is-half">
      <div class="card dashboard-card">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="trophy" type="is-danger"></b-icon>
            Top productos por marca
          </p>
        </header>
        <div class="card-content">
          <b-table :data="productosPorMarca" :loading="cargando.topByBrand" :striped="true" :hoverable="true">
            <b-table-column field="brandName" label="Marca" v-slot="props">
              {{ props.row.brandName }}
            </b-table-column>
            <b-table-column field="productName" label="Producto" v-slot="props">
              {{ props.row.productName }}
            </b-table-column>
            <b-table-column field="totalUnitsSold" label="Unidades" numeric v-slot="props">
              {{ formatNumber(props.row.totalUnitsSold) }}
            </b-table-column>
          </b-table>
          <div v-if="!productosPorMarca.length && !cargando.topByBrand" class="message is-warning is-light mt-2">
            <div class="message-body">No hay productos registrados por marca.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos por categoría -->
    <div class="column is-half">
      <div class="card dashboard-card">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="trophy" type="is-danger"></b-icon>
            Top productos por categoría
          </p>
        </header>
        <div class="card-content">
          <b-table :data="productosPorCategoria" :loading="cargando.topByCategory" :striped="true" :hoverable="true">
            <b-table-column field="categoryName" label="Categoría" v-slot="props">
              {{ props.row.categoryName }}
            </b-table-column>
            <b-table-column field="productName" label="Producto" v-slot="props">
              {{ props.row.productName }}
            </b-table-column>
            <b-table-column field="totalUnitsSold" label="Unidades" numeric v-slot="props">
              {{ formatNumber(props.row.totalUnitsSold) }}
            </b-table-column>
          </b-table>
          <div v-if="!productosPorCategoria.length && !cargando.topByCategory" class="message is-warning is-light mt-2">
            <div class="message-body">No hay productos registrados por categoría.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "TotalesPorCategoria",
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      totalesPorMarca: [],
      totalesPorCategoria: [],
      productosPorMarca: [],
      productosPorCategoria: [],
      cargando: {
        byBrand: false,
        byCategory: false,
        topByBrand: false,
        topByCategory: false
      }
    };
  },
  mounted() {
    this.cargarDatos();
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

    async cargarDatos() {
      await Promise.all([
        this.obtenerTotalesPorMarca(),
        this.obtenerTotalesPorCategoria(),
        this.obtenerProductosPorMarca(),
        this.obtenerProductosPorCategoria()
      ]);
    },

    async obtenerTotalesPorMarca() {
      this.cargando.byBrand = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/totals-by-brand",
        });
        this.totalesPorMarca = Array.isArray(response?.data)
          ? response.data
          : response?.data?.data || [];
      } catch (error) {
        if (error?.response?.status !== 404) {
          this.mostrarError("Error al cargar los totales por marca");
          console.error("Error al obtener totales por marca:", error);
        }
        this.totalesPorMarca = [];
      } finally {
        this.cargando.byBrand = false;
      }
    },

    async obtenerTotalesPorCategoria() {
      this.cargando.byCategory = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/totals-by-category",
        });
        this.totalesPorCategoria = Array.isArray(response?.data)
          ? response.data
          : response?.data?.data || [];
      } catch (error) {
        if (error?.response?.status !== 404) {
          this.mostrarError("Error al cargar los totales por categoría");
          console.error("Error al obtener totales por categoría:", error);
        }
        this.totalesPorCategoria = [];
      } finally {
        this.cargando.byCategory = false;
      }
    },

    async obtenerProductosPorMarca() {
      this.cargando.topByBrand = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/top-sold-by-brand",
        });
        this.productosPorMarca = Array.isArray(response?.data)
          ? response.data
          : response?.data?.data || [];
      } catch (error) {
        if (error?.response?.status !== 404) {
          this.mostrarError("Error al cargar los productos por marca");
          console.error("Error al obtener productos por marca:", error);
        }
        this.productosPorMarca = [];
      } finally {
        this.cargando.topByBrand = false;
      }
    },

    async obtenerProductosPorCategoria() {
      this.cargando.topByCategory = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/top-sold-by-category",
        });
        this.productosPorCategoria = Array.isArray(response?.data)
          ? response.data
          : response?.data?.data || [];
      } catch (error) {
        if (error?.response?.status !== 404) {
          this.mostrarError("Error al cargar los productos por categoría");
          console.error("Error al obtener productos por categoría:", error);
        }
        this.productosPorCategoria = [];
      } finally {
        this.cargando.topByCategory = false;
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
