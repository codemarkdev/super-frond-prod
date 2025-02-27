<template>
    <div class="dashboard">
      <div class="dashboard-content">
        <!-- Historial de Ventas -->
        <HistorialVentas class="mb-6" />
  
        <!-- Historial de Pagos -->
        <div class="card dashboard-card mb-6">
          <header class="card-header">
            <p class="card-header-title">
              <b-icon icon="cash-multiple" type="is-primary"></b-icon>
              Historial de Pagos
            </p>
          </header>
          <div class="card-content">
            <b-table 
              :data="historialPagos"
              :loading="cargando.pagos"
              :striped="true"
              :hoverable="true">
              <b-table-column field="date" label="Fecha" v-slot="props">
                {{ formatDate(props.row.date) }}
              </b-table-column>
              <b-table-column field="amount" label="Monto" numeric v-slot="props">
                ${{ formatNumber(props.row.amount) }}
              </b-table-column>
            </b-table>
          </div>
        </div>
  
        <!-- Detalles de Productos Vendidos -->
        <div class="card dashboard-card mb-6">
          <header class="card-header">
            <p class="card-header-title">
              <b-icon icon="package" type="is-info"></b-icon>
              Detalles de Productos Vendidos
            </p>
            <div class="card-header-icon">
              <div class="field is-grouped">
                <div class="control">
                 
                </div>
                <div class="control">
        
                </div>
               
              </div>
            </div>
          </header>
          <div class="card-content">
            <b-field label="Buscar por nombre de producto">
              <b-input v-model="filtroNombreProducto" placeholder="Escriba el nombre del producto" expanded></b-input>
            </b-field>
  
            <b-table 
              :data="productosFiltrados"
              :loading="cargando.productos"
              :striped="true"
              :hoverable="true">
              <b-table-column field="nombreProducto" label="Nombre Producto" v-slot="props">
                {{ props.row.nombreProducto }}
              </b-table-column>
              <b-table-column field="quantity" label="Cantidad" numeric v-slot="props">
                {{ formatNumber(props.row.quantity) }}
              </b-table-column>
              <b-table-column field="price" label="Precio Venta" numeric v-slot="props">
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
        </div>
  
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
                  <b-icon icon="trophy" type="is-danger"></b-icon>  
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
  import HistorialVentas from '../Ventas/HistorialVentas'
  
  export default {
    name: "InicioComponent",
    
    components: {
      HistorialVentas
    },
    
    data() {
      return {
        historialPagos: [],
        productosMayoresVentas: [],
        totalesPorMarca: [],
        totalesPorCategoria: [],
        productosPorMarca: [],
        productosPorCategoria: [],
        productosVendidos: [],
        productosVendidosPorId: [],
        filtroProductos: {
          id: 1,
          type: 'sale'
        },
        limite: 5,
        cargando: {
          pagos: false,
          productos: false,
          topSold: false,
          byBrand: false,
          byCategory: false,
          topByBrand: false,
          topByCategory: false,
          byIdAndType: false
        },
        filtroNombreProducto: ''
      }
    },
  
    computed: {
      productosFiltrados() {
        if (!this.filtroNombreProducto) {
          return this.productosVendidos;
        }
        const filtro = this.filtroNombreProducto.toLowerCase();
        return this.productosVendidos.filter(producto => 
          producto.nombreProducto.toLowerCase().includes(filtro)
        );
      }
    },
  
    mounted() {
      this.cargarTodosDatos()
    },
  
    methods: {
      formatNumber(value) {
        if (!value) return '0.00'
        const num = typeof value === 'string' ? parseFloat(value) : Number(value)
        return isNaN(num) ? '0.00' : num.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      },
  
      formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
  
      async cargarTodosDatos() {
        await Promise.all([
          this.obtenerHistorialPagos(),
          this.obtenerProductosVendidosConNombres(),
          this.obtenerProductosMayoresVentas(),
          this.obtenerTotalesPorMarca(),
          this.obtenerTotalesPorCategoria(),
          this.obtenerProductosPorMarca(),
          this.obtenerProductosPorCategoria()
        ])
      },
  
      async obtenerProductosVendidosConNombres() {
        this.cargando.productos = true
        try {
          // 1️⃣ Obtener todos los productos vendidos
          const respuestaProductosVendidos = await apiRequest({
            method: 'GET',
            path: 'sold-products'
          })
          
          if (respuestaProductosVendidos?.data) {
            const productosVendidos = Array.isArray(respuestaProductosVendidos.data) ? respuestaProductosVendidos.data : []
  
            // 2️⃣ Para cada producto, hacer una petición a `/sold-products/{id}/{type}` para obtener el nombre
            const peticionesDetallesProductos = productosVendidos.map(producto =>
              apiRequest({
                method: 'GET',
                path: `sold-products/${producto.id}/${producto.type}`
              })
            )
  
            // 3️⃣ Ejecutar todas las peticiones en paralelo
            const respuestasDetallesProductos = await Promise.all(peticionesDetallesProductos)
  
            // 4️⃣ Agregar el nombre a cada producto
            this.productosVendidos = productosVendidos.map((producto, indice) => ({
              ...producto,
              nombreProducto: respuestasDetallesProductos[indice].data[0]?.product_name || "Desconocido",
            }))
  
            console.log("Productos vendidos con nombres:", this.productosVendidos)
          }
        } catch (error) {
          console.error("Error obteniendo productos vendidos:", error)
          this.mostrarError('Error al cargar los productos vendidos')
        } finally {
          this.cargando.productos = false
        }
      },
  
      async obtenerHistorialPagos() {
        this.cargando.pagos = true
        try {
          const response = await apiRequest({
            method: 'GET',
            path: 'payments'
          })
          
          if (response?.data) {
            this.historialPagos = Array.isArray(response.data) ? response.data : response.data.data || []
          }
        } catch (error) {
          console.error('Error al obtener historial de pagos:', error)
          this.mostrarError('Error al cargar el historial de pagos')
        } finally {
          this.cargando.pagos = false
        }
      },
  
      async obtenerProductosVendidosPorId() {
        if (!this.filtroProductos.id || !this.filtroProductos.type) {
          this.mostrarError('Por favor, ingrese ID y tipo de venta')
          return
        }
  
        this.cargando.byIdAndType = true
        try {
          const response = await apiRequest({
            method: 'GET',
            path: `sold-products/${this.filtroProductos.id}/${this.filtroProductos.type}`
          })
          
          if (response?.data) {
            this.productosVendidosPorId = Array.isArray(response.data) ? response.data : response.data.data || []
          }
        } catch (error) {
          console.error('Error al obtener productos vendidos:', error)
          this.mostrarError('Error al cargar los productos vendidos')
        } finally {
          this.cargando.byIdAndType = false
        }
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
  
  