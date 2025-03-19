<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <!-- Historial de Ventas -->
      <HistorialVentas class="mb-6" />
      <!-- Lista de Usuarios -->
      <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="account-multiple" type="is-info"></b-icon>
            Lista de Usuarios
          </p>
        </header>
        <div class="card-content">
          <b-table
            :data="usuarios"
            :loading="cargando.usuarios"
            :striped="true"
            :hoverable="true"
          >
            <b-table-column field="id" label="ID" v-slot="props">
              {{ props.row.id }}
            </b-table-column>
            <b-table-column field="username" label="Usuario" v-slot="props">
              {{ props.row.username }}
            </b-table-column>
            <b-table-column field="name" label="Nombre" v-slot="props">
              {{ props.row.name }}
            </b-table-column>
            <b-table-column field="phone" label="Teléfono" v-slot="props">
              {{ props.row.phone }}
            </b-table-column>
          </b-table>
        </div>
      </div>
      <!-- Nueva tarjeta: Ventas Mensuales por Usuario -->
      <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="chart-bar" type="is-primary"></b-icon>
            Ventas Mensuales por Usuario
          </p>
        </header>
        <div class="card-content">
          <div class="field is-grouped mb-4">
            <div class="control">
              <b-field label="ID de Usuario">
                <b-input
                  v-model="filtroVentasUsuario.id"
                  type="number"
                  min="1"
                  placeholder="ID del usuario"
                ></b-input>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Año">
                <b-select v-model="filtroVentasUsuario.year" expanded>
                  <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-primary"
                @click="obtenerVentasMensualesUsuario"
                :loading="cargando.ventasUsuario"
              >
                Consultar
              </b-button>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-light"
                @click="limpiarVentasMensualesUsuario"
                :disabled="!ventasMensualesUsuario.length"
              >
                Limpiar
              </b-button>
            </div>
          </div>

          <div v-if="ventasMensualesUsuario.length">
            <b-table
              :data="ventasMensualesUsuario"
              :loading="cargando.ventasUsuario"
              :striped="true"
              :hoverable="true"
            >
              <b-table-column field="month" label="Mes" v-slot="props">
                {{ obtenerNombreMes(props.row.month) }}
              </b-table-column>
              <b-table-column
                field="totalSales"
                label="Total Ventas"
                numeric
                v-slot="props"
              >
                ${{ formatNumber(props.row.totalSales) }}
              </b-table-column>
            </b-table>
          </div>
        </div>
      </div>

      <!-- Cuentas por Cobrar -->
      <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="cash" type="is-success"></b-icon>
            Historial de Cuentas por Cobrar
          </p>
        </header>
        <div class="card-content">
          <!-- Filtros -->
          <div class="field is-grouped mb-4">
            <div class="control is-expanded">
              <b-input
                v-model="busquedaCliente"
                placeholder="Buscar por nombre de cliente"
                expanded
              ></b-input>
            </div>
            <div class="control">
              <b-select v-model="filtroEstado">
                <option value="">Todos los estados</option>
                <option value="Pagada">Pagada</option>
                <option value="Pendiente">Pendiente</option>
              </b-select>
            </div>
          </div>

          <b-table
            :data="cuentasAgrupadasPaginadas"
            :loading="cargando.cuentas"
            :striped="true"
            :hoverable="true"
            detailed
            detail-key="id"
            :show-detail-icon="true"
          >
            <b-table-column
              field="customer.name"
              label="Cliente"
              v-slot="props"
            >
              {{ props.row.customer.name }}
            </b-table-column>

            <b-table-column
              field="customer.phone"
              label="Teléfono"
              v-slot="props"
            >
              {{ props.row.customer.phone }}
            </b-table-column>

            <b-table-column
              field="totalAmount"
              label="Total"
              numeric
              v-slot="props"
            >
              ${{ formatNumber(props.row.totalAmount) }}
            </b-table-column>

            <b-table-column
              field="totalPaid"
              label="Pagado"
              numeric
              v-slot="props"
            >
              ${{ formatNumber(props.row.totalPaid) }}
            </b-table-column>

            <b-table-column
              field="totalToPay"
              label="Por Pagar"
              numeric
              v-slot="props"
            >
              ${{ formatNumber(props.row.totalToPay) }}
            </b-table-column>

            <b-table-column field="estado" label="Estado" v-slot="props">
              <b-tag :type="obtenerColorEstado(props.row)">
                {{ obtenerEstadoCuenta(props.row) }}
              </b-tag>
            </b-table-column>

            <template #detail="props">
              <div class="content">
                <p><strong>Detalles de las cuentas:</strong></p>
                <b-table
                  :data="props.row.cuentas"
                  :striped="true"
                  :hoverable="true"
                >
                  <b-table-column field="id" label="ID Cuenta" v-slot="props">
                    {{ props.row.id }}
                  </b-table-column>
                  <b-table-column
                    field="total"
                    label="Total"
                    numeric
                    v-slot="props"
                  >
                    ${{ formatNumber(props.row.total) }}
                  </b-table-column>
                  <b-table-column
                    field="paid"
                    label="Pagado"
                    numeric
                    v-slot="props"
                  >
                    ${{ formatNumber(props.row.paid) }}
                  </b-table-column>
                  <b-table-column
                    field="toPay"
                    label="Por Pagar"
                    numeric
                    v-slot="props"
                  >
                    ${{ formatNumber(props.row.toPay) }}
                  </b-table-column>
                  <b-table-column field="date" label="Fecha" v-slot="props">
                    {{ formatDate(props.row.date) }}
                  </b-table-column>
                </b-table>
              </div>
            </template>

            <template #empty>
              <div class="has-text-centered">
                No hay cuentas por cobrar registradas
              </div>
            </template>
          </b-table>

          <b-pagination
            v-model="paginaActualCuentas"
            :total="cuentasPaginacion.total"
            :per-page="cuentasPorPagina"
            :range-before="3"
            :range-after="3"
            order="is-centered"
            aria-next-label="Página siguiente"
            aria-previous-label="Página anterior"
            aria-page-label="Página"
            aria-current-label="Página actual"
          >
          </b-pagination>
        </div>
      </div>
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
            :data="pagosPaginados"
            :loading="cargando.pagos"
            :striped="true"
            :hoverable="true"
          >
            <b-table-column field="date" label="Fecha" v-slot="props">
              {{ formatDate(props.row.date) }}
            </b-table-column>
            <b-table-column field="amount" label="Monto" numeric v-slot="props">
              ${{ formatNumber(props.row.amount) }}
            </b-table-column>
          </b-table>

          <b-pagination
            v-model="paginaActualPagos"
            :total="historialPagos.total"
            :per-page="historialPagos.limit"
            :range-before="3"
            :range-after="3"
            order="is-centered"
            aria-next-label="Siguiente página"
            aria-previous-label="Página anterior"
            aria-page-label="Página"
            aria-current-label="Página actual"
          >
          </b-pagination>
        </div>
      </div>
      <!-- Detalles de Productos Vendidos -->
      <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="package" type="is-info"></b-icon>
            Detalles de Productos Vendidos
          </p>
        </header>
        <div class="card-content">
          <b-field label="Buscar por nombre de producto">
            <b-input
              v-model="filtroNombreProducto"
              placeholder="Escriba el nombre del producto"
              expanded
            ></b-input>
          </b-field>

          <b-table
            :data="productosPaginados"
            :loading="cargando.productos"
            :striped="true"
            :hoverable="true"
          >
            <b-table-column
              field="nombreProducto"
              label="Nombre Producto"
              v-slot="props"
            >
              {{ props.row.nombreProducto }}
            </b-table-column>
            <b-table-column
              field="quantity"
              label="Cantidad"
              numeric
              v-slot="props"
            >
              {{ formatNumber(props.row.quantity) }}
            </b-table-column>
            <b-table-column
              field="price"
              label="Precio Venta"
              numeric
              v-slot="props"
            >
              ${{ formatNumber(props.row.price) }}
            </b-table-column>
            <b-table-column
              field="priceWithouthIVA"
              label="Precio sin IVA"
              numeric
              v-slot="props"
            >
              ${{ formatNumber(props.row.priceWithouthIVA) }}
            </b-table-column>
            <b-table-column field="iva" label="IVA" numeric v-slot="props">
              ${{ formatNumber(props.row.iva) }}
            </b-table-column>
          </b-table>

          <b-pagination
            v-model="productosPaginacion.currentPage"
            :total="productosPaginacion.total"
            :per-page="productosPaginacion.perPage"
            :range-before="3"
            :range-after="3"
            order="is-centered"
            aria-next-label="Siguiente página"
            aria-previous-label="Página anterior"
            aria-page-label="Página"
            aria-current-label="Página actual"
            @change="cambiarPaginaProductos"
          >
          </b-pagination>
        </div>
      </div>
      <!-- IVA Mensual -->
      <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="calculator" type="is-info"></b-icon>
            IVA Mensual
          </p>
        </header>
        <div class="card-content">
          <div class="field is-grouped mb-4">
            <div class="control">
              <b-field label="Año">
                <b-select v-model="filtroIVA.year" expanded>
                  <option v-for="year in years" :key="year" :value="year">
                    {{ year }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Mes">
                <b-select v-model="filtroIVA.month" expanded>
                  <option
                    v-for="month in months"
                    :key="month.value"
                    :value="month.value"
                  >
                    {{ month.label }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-primary"
                @click="obtenerIVAMensual"
                :loading="cargando.iva"
              >
                Consultar
              </b-button>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading">Total IVA</p>
                <p class="title">${{ formatNumber(ivaMensual.totalIVA) }}</p>
              </div>
            </div>
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading">Total Ventas</p>
                <p class="title">${{ formatNumber(ivaMensual.totalSales) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- IVA por Rango de Fechas -->
      <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="calendar-range" type="is-info"></b-icon>
            IVA por Rango de Fechas
          </p>
        </header>
        <div class="card-content">
          <div class="field is-grouped mb-4">
            <div class="control">
              <b-field label="Fecha de Inicio">
                <b-datepicker
                  v-model="filtroIVARango.startDate"
                  placeholder="Seleccione fecha de inicio"
                ></b-datepicker>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Fecha de Fin">
                <b-datepicker
                  v-model="filtroIVARango.endDate"
                  placeholder="Seleccione fecha de fin"
                ></b-datepicker>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-primary"
                @click="obtenerIVARango"
                :loading="cargando.ivaRango"
              >
                Consultar
              </b-button>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading">Total IVA</p>
                <p class="title">${{ formatNumber(ivaRango.totalIVA) }}</p>
              </div>
            </div>
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading">Total Ventas</p>
                <p class="title">${{ formatNumber(ivaRango.totalSales) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
 <!-- Cotizaciones por Rango de Fechas -->
 <div class="card dashboard-card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="file-document" type="is-info"></b-icon>
            Cotizaciones por Rango de Fechas
          </p>
        </header>
        <div class="card-content">
          <div class="field is-grouped mb-4">
            <div class="control">
              <b-field label="Fecha de Inicio">
                <b-datepicker
                  v-model="filtroCotizaciones.startDate"
                  placeholder="Seleccione fecha de inicio"
                >
                </b-datepicker>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Fecha de Fin">
                <b-datepicker
                  v-model="filtroCotizaciones.endDate"
                  placeholder="Seleccione fecha de fin"
                >
                </b-datepicker>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-primary"
                @click="obtenerCotizaciones"
                :loading="cargando.cotizaciones"
              >
                Consultar
              </b-button>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-light"
                @click="
                  filtroCotizaciones = { startDate: null, endDate: null };
                  cotizaciones = [];
                "
                :disabled="!cotizaciones.length"
              >
                Limpiar
              </b-button>
            </div>
          </div>

          <div v-if="cotizaciones.length">
            <b-table
              :data="cotizaciones"
              :loading="cargando.cotizaciones"
              :striped="true"
              :hoverable="true"
            >
              <b-table-column field="id" label="ID" v-slot="props">
                {{ props.row.id }}
              </b-table-column>
              <b-table-column field="date" label="Fecha" v-slot="props">
                {{ formatDate(props.row.date) }}
              </b-table-column>
              <b-table-column
                field="total"
                label="Total"
                numeric
                v-slot="props"
              >
                ${{ formatNumber(props.row.total) }}
              </b-table-column>
              <b-table-column
                field="customer.name"
                label="Cliente"
                v-slot="props"
              >
                {{ props.row.customer.name }}
              </b-table-column>
              <b-table-column
                field="customer.phone"
                label="Teléfono Cliente"
                v-slot="props"
              >
                {{ props.row.customer.phone }}
              </b-table-column>
              <b-table-column field="user.name" label="Usuario" v-slot="props">
                {{ props.row.user.name }}
              </b-table-column>
              <b-table-column
                field="user.phone"
                label="Teléfono Usuario"
                v-slot="props"
              >
                {{ props.row.user.phone }}
              </b-table-column>
            </b-table>
          </div>
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
            <b-select
              v-model="limite"
              @input="obtenerProductosMayoresVentas"
              size="is-small"
            >
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
            :hoverable="true"
          >
            <b-table-column
              field="product_name"
              label="Producto"
              v-slot="props"
            >
              {{ props.row.product_name }}
            </b-table-column>
            <b-table-column
              field="units"
              label="Unidades"
              numeric
              v-slot="props"
            >
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
                :hoverable="true"
              >
                <b-table-column field="brandName" label="Marca" v-slot="props">
                  {{ props.row.brandName }}
                </b-table-column>
                <b-table-column
                  field="totalSales"
                  label="Total ventas"
                  numeric
                  v-slot="props"
                >
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
                :hoverable="true"
              >
                <b-table-column
                  field="categoryName"
                  label="Categoría"
                  v-slot="props"
                >
                  {{ props.row.categoryName }}
                </b-table-column>
                <b-table-column
                  field="totalSales"
                  label="Total ventas"
                  numeric
                  v-slot="props"
                >
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
                :hoverable="true"
              >
                <b-table-column field="brandName" label="Marca" v-slot="props">
                  {{ props.row.brandName }}
                </b-table-column>
                <b-table-column
                  field="productName"
                  label="Producto"
                  v-slot="props"
                >
                  {{ props.row.productName }}
                </b-table-column>
                <b-table-column
                  field="totalUnitsSold"
                  label="Unidades"
                  numeric
                  v-slot="props"
                >
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
                :hoverable="true"
              >
                <b-table-column
                  field="categoryName"
                  label="Categoría"
                  v-slot="props"
                >
                  {{ props.row.categoryName }}
                </b-table-column>
                <b-table-column
                  field="productName"
                  label="Producto"
                  v-slot="props"
                >
                  {{ props.row.productName }}
                </b-table-column>
                <b-table-column
                  field="totalUnitsSold"
                  label="Unidades"
                  numeric
                  v-slot="props"
                >
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
import apiRequest from "@/Servicios/HttpService";
import HistorialVentas from "../Ventas/HistorialVentas";

export default {
  name: "InicioComponent",

  components: {
    HistorialVentas,
  },

  data() {
    return {
      historialPagos: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      productosMayoresVentas: [],
      totalesPorMarca: [],
      totalesPorCategoria: [],
      productosPorMarca: [],
      productosPorCategoria: [],
      productosVendidos: [],
      productosPaginacion: {
        total: 0,
        currentPage: 1,
        perPage: 10,
        totalPages: 0,
      },
      productosVendidosPorId: [],
      filtroProductos: {
        id: 1,
        type: "sale",
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
        byIdAndType: false,
        cuentas: false,
        iva: false,
        ivaRango: false,
        ventasUsuario: false,
        usuarios: false,
        cotizaciones: false,
      },
      filtroNombreProducto: "",
      paginaActual: 1,
      porPagina: 10,
      filtroFechas: {
        inicio: null,
        fin: null,
      },
      paginaActualPagos: 1,
      porPaginaPagos: 10,
      cuentasPorCobrar: [],
      cuentasPaginacion: {
        total: 0,
        currentPage: 1,
        perPage: 10,
        totalPages: 0,
      },
      paginaActualCuentas: 1,
      porPaginaCuentas: 10,
      filtroIVA: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
      ivaMensual: {
        totalIVA: "0.00",
        totalSales: "0.00",
      },
      filtroIVARango: {
        startDate: null,
        endDate: null,
      },
      ivaRango: {
        totalIVA: "0.00",
        totalSales: "0.00",
      },
      months: [
        { value: 1, label: "Enero" },
        { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" },
        { value: 6, label: "Junio" },
        { value: 7, label: "Julio" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" },
        { value: 12, label: "Diciembre" },
      ],
      years: [2023, 2024, 2025, 2026, 2027],
      ventasMensualesUsuario: [],
      filtroVentasUsuario: {
        id: 1,
        year: new Date().getFullYear(),
      },
      usuarios: [],
      cotizaciones: [],
      filtroCotizaciones: {
        startDate: null,
        endDate: null,
      },
      busquedaCliente: "",
      filtroEstado: "",
      cuentasPorPagina: 10,
    };
  },

  computed: {
    productosPaginados() {
      if (!this.filtroNombreProducto) {
        return this.productosVendidos;
      }
      const filtro = this.filtroNombreProducto.toLowerCase();
      return this.productosVendidos.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(filtro)
      );
    },
    pagosFiltrados() {
      if (!this.filtroFechas.inicio || !this.filtroFechas.fin) {
        return this.historialPagos;
      }
      return this.historialPagos.filter((pago) => {
        const fechaPago = new Date(pago.date);
        return (
          fechaPago >= this.filtroFechas.inicio &&
          fechaPago <= this.filtroFechas.fin
        );
      });
    },
    pagosPaginados() {
      return this.historialPagos.data || [];
    },
    cuentasAgrupadasPorCliente() {
      const cuentasAgrupadas = this.cuentasPorCobrar.reduce((acc, cuenta) => {
        const clienteId = cuenta.customer.id;
        if (!acc[clienteId]) {
          acc[clienteId] = {
            id: clienteId,
            customer: cuenta.customer,
            cuentas: [],
            totalAmount: 0,
            totalPaid: 0,
            totalToPay: 0,
          };
        }
        acc[clienteId].cuentas.push(cuenta);
        acc[clienteId].totalAmount += parseFloat(cuenta.total);
        acc[clienteId].totalPaid += parseFloat(cuenta.paid);
        acc[clienteId].totalToPay += parseFloat(cuenta.toPay);
        return acc;
      }, {});

      return Object.values(cuentasAgrupadas);
    },
    cuentasAgrupadasFiltradas() {
      return this.cuentasAgrupadasPorCliente.filter((cuenta) => {
        const nombreCoincide =
          !this.busquedaCliente ||
          cuenta.customer.name
            .toLowerCase()
            .includes(this.busquedaCliente.toLowerCase());
        const estadoCoincide =
          !this.filtroEstado ||
          this.obtenerEstadoCuenta(cuenta) === this.filtroEstado;
        return nombreCoincide && estadoCoincide;
      });
    },
    cuentasAgrupadasPaginadas() {
      const inicio = (this.paginaActualCuentas - 1) * this.cuentasPorPagina;
      const fin = inicio + this.cuentasPorPagina;
      return this.cuentasAgrupadasFiltradas.slice(inicio, fin);
    },
  },

  mounted() {
    this.cargarTodosDatos();
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

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    async cargarTodosDatos() {
      await Promise.all([
        this.obtenerHistorialPagos(),
        this.obtenerProductosVendidosConNombres(),
        this.obtenerProductosMayoresVentas(),
        this.obtenerTotalesPorMarca(),
        this.obtenerTotalesPorCategoria(),
        this.obtenerProductosPorMarca(),
        this.obtenerProductosPorCategoria(),
        this.obtenerCuentasPorCobrar(),
        this.obtenerIVAMensual(),
        this.obtenerIVARango(),
        this.obtenerVentasMensualesUsuario(),
        this.obtenerUsuarios(),
        this.obtenerCotizaciones(),
      ]);
    },

    async obtenerProductosVendidosConNombres() {
      this.cargando.productos = true;
      try {
        const respuestaProductosVendidos = await apiRequest({
          method: "GET",
          path: `sold-products?page=${this.productosPaginacion.currentPage}&limit=${this.productosPaginacion.perPage}`,
        });

        if (respuestaProductosVendidos?.data) {
          const productosVendidos = respuestaProductosVendidos.data.data || [];

          this.productosPaginacion.total =
            respuestaProductosVendidos.data.total || 0;
          this.productosPaginacion.totalPages =
            respuestaProductosVendidos.data.totalPages || 0;

          const peticionesDetallesProductos = productosVendidos.map(
            (producto) =>
              apiRequest({
                method: "GET",
                path: `sold-products/${producto.id}/${producto.type}`,
              })
          );

          const respuestasDetallesProductos = await Promise.all(
            peticionesDetallesProductos
          );

          this.productosVendidos = productosVendidos.map(
            (producto, indice) => ({
              ...producto,
              nombreProducto:
                respuestasDetallesProductos[indice].data[0]?.product_name ||
                "Desconocido",
            })
          );

          console.log(
            "Productos vendidos con nombres:",
            this.productosVendidos
          );
        }
      } catch (error) {
        console.error("Error obteniendo productos vendidos:", error);
        this.mostrarError("Error al cargar los productos vendidos");
      } finally {
        this.cargando.productos = false;
      }
    },

    async obtenerHistorialPagos() {
      this.cargando.pagos = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `payments?page=${this.paginaActualPagos}&limit=${this.porPaginaPagos}`,
        });

        if (response?.data) {
          this.historialPagos = response.data;
        }
      } catch (error) {
        console.error("Error al obtener historial de pagos:", error);
        this.mostrarError("Error al cargar el historial de pagos");
      } finally {
        this.cargando.pagos = false;
      }
    },

    async obtenerProductosMayoresVentas() {
      this.cargando.topSold = true;
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
        this.cargando.topSold = false;
      }
    },

    async obtenerTotalesPorMarca() {
      this.cargando.byBrand = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/totals-by-brand",
        });

        if (response?.data) {
          this.totalesPorMarca = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
        }
      } catch (error) {
        console.error("Error al obtener totales por marca:", error);
        this.mostrarError("Error al cargar los totales por marca");
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

        if (response?.data) {
          this.totalesPorCategoria = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
        }
      } catch (error) {
        console.error("Error al obtener totales por categoría:", error);
        this.mostrarError("Error al cargar los totales por categoría");
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

        if (response?.data) {
          this.productosPorMarca = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
        }
      } catch (error) {
        console.error("Error al obtener productos por marca:", error);
        this.mostrarError("Error al cargar los productos por marca");
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

        if (response?.data) {
          this.productosPorCategoria = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
        }
      } catch (error) {
        console.error("Error al obtener productos por categoría:", error);
        this.mostrarError("Error al cargar los productos por categoría");
      } finally {
        this.cargando.topByCategory = false;
      }
    },

    async obtenerCuentasPorCobrar() {
      this.cargando.cuentas = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `accountsholdings?page=${this.paginaActualCuentas}&limit=${this.cuentasPorPagina}`,
        });

        if (response?.data) {
          this.cuentasPorCobrar = response.data.data || [];
          // Actualizar la información de paginación
          this.cuentasPaginacion.total = response.data.total || 0;
          this.cuentasPaginacion.totalPages = response.data.totalPages || 0;
        }
      } catch (error) {
        console.error("Error al obtener cuentas por cobrar:", error);
        this.mostrarError("Error al cargar las cuentas por cobrar");
      } finally {
        this.cargando.cuentas = false;
      }
    },

    async obtenerIVAMensual() {
      this.cargando.iva = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `Tax/monthly?year=${this.filtroIVA.year}&month=${this.filtroIVA.month}`,
        });

        if (response?.data) {
          this.ivaMensual = response.data;
        }
      } catch (error) {
        console.error("Error al obtener IVA mensual:", error);
        this.mostrarError("Error al cargar el IVA mensual");
      } finally {
        this.cargando.iva = false;
      }
    },

    async obtenerIVARango() {
      if (!this.filtroIVARango.startDate || !this.filtroIVARango.endDate) {
        this.mostrarError("Por favor, seleccione ambas fechas");
        return;
      }

      this.cargando.ivaRango = true;
      try {
        const formatDate = (date) => {
          return date.toISOString().split("T")[0];
        };

        const response = await apiRequest({
          method: "GET",
          path: `Tax/range?startDate=${formatDate(
            this.filtroIVARango.startDate
          )}&endDate=${formatDate(this.filtroIVARango.endDate)}`,
        });

        if (response?.data) {
          this.ivaRango = response.data;
        }
      } catch (error) {
        console.error("Error al obtener IVA por rango:", error);
        this.mostrarError("Error al cargar el IVA por rango");
      } finally {
        this.cargando.ivaRango = false;
      }
    },

    async obtenerVentasMensualesUsuario() {
      if (!this.filtroVentasUsuario.id) {
        this.mostrarError("Por favor, ingrese un ID de usuario válido");
        return;
      }

      this.ventasMensualesUsuario = []; // Limpiar datos antes de la consulta
      this.cargando.ventasUsuario = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `users/${this.filtroVentasUsuario.id}/monthly-sales?year=${this.filtroVentasUsuario.year}`,
        });

        if (response?.data) {
          this.ventasMensualesUsuario = Array.isArray(response.data)
            ? response.data
            : [];
        }
      } catch (error) {
        console.error("Error al obtener ventas mensuales del usuario:", error);
        this.mostrarError("Error al cargar las ventas mensuales del usuario");
      } finally {
        this.cargando.ventasUsuario = false;
      }
    },

    async obtenerUsuarios() {
      this.cargando.usuarios = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "users",
        });

        if (response?.data) {
          this.usuarios = Array.isArray(response.data) ? response.data : [];
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
        this.mostrarError("Error al cargar los usuarios");
      } finally {
        this.cargando.usuarios = false;
      }
    },

    async obtenerCotizaciones() {
      if (
        !this.filtroCotizaciones.startDate ||
        !this.filtroCotizaciones.endDate
      ) {
        this.mostrarError("Por favor, seleccione ambas fechas");
        return;
      }

      this.cargando.cotizaciones = true;
      try {
        const formatDate = (date) => {
          return date.toISOString().split("T")[0];
        };

        const response = await apiRequest({
          method: "GET",
          path: `quotations?startDate=${formatDate(
            this.filtroCotizaciones.startDate
          )}&endDate=${formatDate(this.filtroCotizaciones.endDate)}`,
        });

        if (response?.data) {
          this.cotizaciones = Array.isArray(response.data) ? response.data : [];
        }
      } catch (error) {
        console.error("Error al obtener cotizaciones:", error);
        this.mostrarError("Error al cargar las cotizaciones");
      } finally {
        this.cargando.cotizaciones = false;
      }
    },

    cambiarPaginaProductos(pagina) {
      this.productosPaginacion.currentPage = pagina;
      this.obtenerProductosVendidosConNombres();
    },

    obtenerNombreMes(numeroMes) {
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      return meses[numeroMes - 1] || "";
    },

    limpiarVentasMensualesUsuario() {
      this.ventasMensualesUsuario = [];
      this.filtroVentasUsuario.id = null;
      this.filtroVentasUsuario.year = new Date().getFullYear();
    },

    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: "is-danger",
        duration: 5000,
      });
    },
    obtenerEstadoCuenta(cuenta) {
      if (parseFloat(cuenta.totalToPay) === 0) {
        return "Pagada";
      } else {
        return "Pendiente";
      }
    },
    obtenerColorEstado(cuenta) {
      const estado = this.obtenerEstadoCuenta(cuenta);
      switch (estado) {
        case "Pagada":
          return "is-success";
        case "Pendiente":
          return "is-danger";
        default:
          return "is-info";
      }
    },
  },

  watch: {
    "cuentasPaginacion.currentPage"() {
      this.obtenerCuentasPorCobrar();
    },
    filtroNombreProducto() {
      this.productosPaginacion.currentPage = 1;
      this.obtenerProductosVendidosConNombres();
    },
    "filtroFechas.inicio"() {
      this.paginaActualPagos = 1;
    },
    "filtroFechas.fin"() {
      this.paginaActualPagos = 1;
    },
    "productosPaginacion.currentPage"() {
      this.obtenerProductosVendidosConNombres();
    },
    busquedaCliente() {
      this.paginaActualCuentas = 1;
    },
    filtroEstado() {
      this.paginaActualCuentas = 1;
    },
    paginaActualPagos() {
      this.obtenerHistorialPagos();
    },
    porPaginaPagos() {
      this.paginaActualPagos = 1;
      this.obtenerHistorialPagos();
    },
  },
};
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