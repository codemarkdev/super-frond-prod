<template>
  <div class="dashboard">


    <div class="dashboard-content">
      <!-- Historial de Ventas -->
      <HistorialVentas class="mb-6" />

      <!-- Productos más vendidos -->
      <div class="card dashboard-card">
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
          <b-table 
            :data="productosMayoresVentas"
            :loading="cargando.topSold"
            :striped="true"
            :hoverable="true">
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

      <div class="columns is-multiline">
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
              <b-table 
                :data="totalesPorMarca"
                :loading="cargando.byBrand"
                :striped="true"
                :hoverable="true">
                <b-table-column field="brandName" label="Marca" v-slot="props">
                  {{ props.row.brandName }}
                </b-table-column>
                <b-table-column field="totalSales" label="Total ventas" numeric v-slot="props">
                  ${{ formatNumber(props.row.totalSales) }}
                </b-table-column>
              </b-table>
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
              <b-table 
                :data="totalesPorCategoria"
                :loading="cargando.byCategory"
                :striped="true"
                :hoverable="true">
                <b-table-column field="categoryName" label="Categoría" v-slot="props">
                  {{ props.row.categoryName }}
                </b-table-column>
                <b-table-column field="totalSales" label="Total ventas" numeric v-slot="props">
                  ${{ formatNumber(props.row.totalSales) }}
                </b-table-column>
              </b-table>
            </div>
          </div>
        </div>

        <!-- Productos por marca -->
        <div class="column is-half">
          <div class="card dashboard-card">
            <header class="card-header">
              <p class="card-header-title">
                <b-icon icon="award" type="is-primary"></b-icon>
                Top productos por marca
              </p>
            </header>
            <div class="card-content">
              <b-table 
                :data="productosPorMarca"
                :loading="cargando.topByBrand"
                :striped="true"
                :hoverable="true">
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
              <b-table 
                :data="productosPorCategoria"
                :loading="cargando.topByCategory"
                :striped="true"
                :hoverable="true">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService'
import HistorialVentas from './Ventas/HistorialVentas.vue'

export default {
  name: "InicioComponent",
  
  components: {
    HistorialVentas
  },
  
  data() {
    return {
      productosMayoresVentas: [],
      totalesPorMarca: [],
      totalesPorCategoria: [],
      productosPorMarca: [],
      productosPorCategoria: [],
      limite: 5,
      cargando: {
        topSold: false,
        byBrand: false,
        byCategory: false,
        topByBrand: false,
        topByCategory: false
      }
    }
  },
  
  mounted() {
    this.cargarTodosDatos()
  },

  methods: {
    formatNumber(value) {
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? '0.00' : num.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    async cargarTodosDatos() {
      await Promise.all([
        this.obtenerProductosMayoresVentas(),
        this.obtenerTotalesPorMarca(),
        this.obtenerTotalesPorCategoria(),
        this.obtenerProductosPorMarca(),
        this.obtenerProductosPorCategoria()
      ])
    },

    async obtenerProductosMayoresVentas() {
      this.cargando.topSold = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `sold-products/top-sold?limit=${this.limite}`
        })
        
        if (response?.data) {
          this.productosMayoresVentas = Array.isArray(response.data) ? response.data : response.data.data || []
        }
      } catch (error) {
        console.error('Error al obtener productos más vendidos:', error)
        this.mostrarError('Error al cargar los productos más vendidos')
      } finally {
        this.cargando.topSold = false
      }
    },

    async obtenerTotalesPorMarca() {
      this.cargando.byBrand = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sold-products/totals-by-brand'
        })
        
        if (response?.data) {
          this.totalesPorMarca = Array.isArray(response.data) ? response.data : response.data.data || []
        }
      } catch (error) {
        console.error('Error al obtener totales por marca:', error)
        this.mostrarError('Error al cargar los totales por marca')
      } finally {
        this.cargando.byBrand = false
      }
    },

    async obtenerTotalesPorCategoria() {
      this.cargando.byCategory = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sold-products/totals-by-category'
        })
        
        if (response?.data) {
          this.totalesPorCategoria = Array.isArray(response.data) ? response.data : response.data.data || []
        }
      } catch (error) {
        console.error('Error al obtener totales por categoría:', error)
        this.mostrarError('Error al cargar los totales por categoría')
      } finally {
        this.cargando.byCategory = false
      }
    },

    async obtenerProductosPorMarca() {
      this.cargando.topByBrand = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sold-products/top-sold-by-brand'
        })
        
        if (response?.data) {
          this.productosPorMarca = Array.isArray(response.data) ? response.data : response.data.data || []
        }
      } catch (error) {
        console.error('Error al obtener productos por marca:', error)
        this.mostrarError('Error al cargar los productos por marca')
      } finally {
        this.cargando.topByBrand = false
      }
    },

    async obtenerProductosPorCategoria() {
      this.cargando.topByCategory = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sold-products/top-sold-by-category'
        })
        
        if (response?.data) {
          this.productosPorCategoria = Array.isArray(response.data) ? response.data : response.data.data || []
        }
      } catch (error) {
        console.error('Error al obtener productos por categoría:', error)
        this.mostrarError('Error al cargar los productos por categoría')
      } finally {
        this.cargando.topByCategory = false
      }
    },

    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: 'is-danger',
        duration: 5000
      })
    }
  },
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  background-color: #f0f2f5;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-card {
  margin-bottom: 2rem;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.card-header-title {
  display: flex;
  align-items: center;
}

.card-header-title .icon {
  margin-right: 0.5rem;
}

.card-content {
  padding: 1.5rem;
}

.b-table {
  margin-top: 0.5rem;
}

.b-table .table {
  background-color: transparent;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .column {
    padding: 0.5rem;
  }
}
</style>

