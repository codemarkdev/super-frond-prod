<template>
  <div class="">

    <div class="dashboard-content">
      <!-- Historial de Ventas -->
      <HistorialVentas class="mb-6" />


 <!-- Lista de Usuarios -->
 <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="account-multiple" type="is-info"></b-icon>
            Lista de Usuarios
          </p>
        </header>
        <div class="card-content">
          <b-table :data="usuarios" :loading="cargando.usuarios" :striped="true" :hoverable="true">
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

      <!-- Nueva sección: Ingresos Diarios del Usuario -->
      <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="cash-register" type="is-info"></b-icon>
            Ingresos Diarios del Usuario
          </p>
        </header>
        <div class="card-content">
          <div class="is-flex is-align-items-end" :style="{ gap: '1rem' }">
            <div class="control">
              <b-field label="ID de Usuario">
                <b-input v-model="filtroIngresosDiarios.id" type="number" min="1" placeholder="ID del usuario"></b-input>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-primary" @click="obtenerIngresosDiariosUsuario" :loading="cargando.ingresosDiarios">
                Consultar
              </b-button>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-light" @click="limpiarIngresosDiariosUsuario"
                :disabled="!ingresosDiarios.totalIncome">
                Limpiar
              </b-button>
            </div>
          </div>

          <div class="columns mt-4">
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading">Ingresos de Hoy</p>
                <p class="title">${{ formatNumber(ingresosDiarios.totalIncome) }}</p>
                <p class="subtitle is-6">{{ obtenerFechaActual() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nueva sección: Ingresos Semanales del Usuario -->
      <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="calendar-week" type="is-success"></b-icon>
            Ingresos Semanales del Usuario
          </p>
        </header>
        <div class="card-content">
          <div class="is-flex is-align-items-end" :style="{ gap: '1rem' }">
            <div class="control">
              <b-field label="ID de Usuario">
                <b-input v-model="filtroIngresosSemanales.id" type="number" min="1" placeholder="ID del usuario"></b-input>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-primary" @click="obtenerIngresosSemanalesUsuario" :loading="cargando.ingresosSemanales">
                Consultar
              </b-button>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-light" @click="limpiarIngresosSemanalesUsuario"
                :disabled="!ingresosSemanales.totalIncome">
                Limpiar
              </b-button>
            </div>
          </div>

          <div class="columns mt-4">
            <div class="column">
              <div class="box has-text-centered">
                <p class="heading">Ingresos de la Semana</p>
                <p class="title">${{ formatNumber(ingresosSemanales.totalIncome) }}</p>
                <p class="subtitle is-6">{{ obtenerRangoSemanaActual() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

     
      <!-- Nueva tarjeta: Ventas Mensuales por Usuario -->
      <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="chart-bar" type="is-primary"></b-icon>
            Ventas Mensuales por Usuario
          </p>
        </header>
        <div class="card-content">
          <div class="is-flex is-align-items-end" :style="{ gap: '1rem' }">
            <div class="control">
              <b-field label="ID de Usuario">
                <b-input v-model="filtroVentasUsuario.id" type="number" min="1" placeholder="ID del usuario"></b-input>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Año">
                <b-select v-model="filtroVentasUsuario.year" expanded>
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-primary" @click="obtenerVentasMensualesUsuario" :loading="cargando.ventasUsuario">
                Consultar
              </b-button>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-light" @click="limpiarVentasMensualesUsuario"
                :disabled="!ventasMensualesUsuario.length">
                Limpiar
              </b-button>
            </div>
          </div>

          <div v-if="ventasMensualesUsuario.length">
            <b-table :data="ventasMensualesUsuario" :loading="cargando.ventasUsuario" :striped="true" :hoverable="true">
              <b-table-column field="month" label="Mes" v-slot="props">
                {{ obtenerNombreMes(props.row.month) }}
              </b-table-column>
              <b-table-column field="totalSales" label="Total Ventas" numeric v-slot="props">
                ${{ formatNumber(props.row.totalSales) }}
              </b-table-column>
            </b-table>
          </div>
        </div>
      </div>


      <!-- Detalles de Productos Vendidos -->
      <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="package" type="is-info"></b-icon>
            Detalles de Productos Vendidos
          </p>
        </header>
        <div class="card-content">
          <b-field label="Buscar por nombre de producto">
            <b-input v-model="filtroNombreProducto" placeholder="Escriba el nombre del producto" expanded></b-input>
          </b-field>

          <b-table :data="productosPaginados" :loading="cargando.productos" :striped="true" :hoverable="true">
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

          <b-pagination v-model="productosPaginacion.currentPage" :total="productosPaginacion.total"
            :per-page="productosPaginacion.perPage" :range-before="3" :range-after="3" order="is-centered"
            aria-next-label="Siguiente página" aria-previous-label="Página anterior" aria-page-label="Página"
            aria-current-label="Página actual" @change="cambiarPaginaProductos">
          </b-pagination>
        </div>
      </div>
      <!-- IVA Mensual -->
      <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="calculator" type="is-info"></b-icon>
            IVA Mensual
          </p>
        </header>
        <div class="card-content">
          <div class="is-flex is-align-items-end mb-5" :style="{ gap: '1rem' }">
            <div class="control">
              <b-field label="Año">
                <b-select v-model="filtroIVA.year" expanded>
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Mes">
                <b-select v-model="filtroIVA.month" expanded>
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </b-select>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-primary" @click="obtenerIVAMensual" :loading="cargando.iva">
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
      <div class="card dashboard-card mb-6" v-if="isAdmin">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="calendar-range" type="is-info"></b-icon>
            IVA por Rango de Fechas
          </p>
        </header>
        <div class="card-content">
          <div class="is-flex is-align-items-end mb-5" :style="{ gap: '1rem' }">
            <div class="control">
              <b-field label="Fecha de Inicio">
                <div class="date-input-container" ref="ivaStartDateContainer">
                  <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="ivaFechaInicioInput"
                    @click="toggleIvaStartCalendar" readonly>
                  <span class="icon is-right">
                    <i class="mdi mdi-calendar"></i>
                  </span>
                </div>
              </b-field>
            </div>
            <div class="control">
              <b-field label="Fecha de Fin">
                <div class="date-input-container" ref="ivaEndDateContainer">
                  <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="ivaFechaFinInput"
                    @click="toggleIvaEndCalendar" readonly>
                  <span class="icon is-right">
                    <i class="mdi mdi-calendar"></i>
                  </span>
                </div>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button type="is-primary" @click="obtenerIVARango" :loading="cargando.ivaRango">
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

      <!-- Productos más vendidos -->
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
          <b-table :data="productosMayoresVentas" :loading="cargando.topSold" :striped="true" :hoverable="true">
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
              <b-table :data="productosPorCategoria" :loading="cargando.topByCategory" :striped="true"
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

    <!-- Calendarios flotantes para IVA -->
    <div v-if="showIvaStartCalendar" class="floating-calendar" :style="ivaStartCalendarStyle" ref="ivaStartCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMesIvaStart }} de {{ ivaStartCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('ivaStart')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('ivaStart')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in ivaStartCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedIvaStartDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectIvaStartDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearIvaStartDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsIvaStart">Hoy</button>
      </div>
    </div>

    <div v-if="showIvaEndCalendar" class="floating-calendar" :style="ivaEndCalendarStyle" ref="ivaEndCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMesIvaEnd }} de {{ ivaEndCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('ivaEnd')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('ivaEnd')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in ivaEndCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedIvaEndDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectIvaEndDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearIvaEndDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsIvaEnd">Hoy</button>
      </div>
    </div>

    <!-- Calendarios flotantes para Cotizaciones -->
    <div v-if="showCotizacionesStartCalendar" class="floating-calendar" :style="cotizacionesStartCalendarStyle"
      ref="cotizacionesStartCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMesCotizacionesStart }} de {{ cotizacionesStartCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('cotizacionesStart')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('cotizacionesStart')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in cotizacionesStartCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedCotizacionesStartDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectCotizacionesStartDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearCotizacionesStartDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsCotizacionesStart">Hoy</button>
      </div>
    </div>

    <div v-if="showCotizacionesEndCalendar" class="floating-calendar" :style="cotizacionesEndCalendarStyle"
      ref="cotizacionesEndCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMesCotizacionesEnd }} de {{ cotizacionesEndCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('cotizacionesEnd')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('cotizacionesEnd')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in cotizacionesEndCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedCotizacionesEndDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectCotizacionesEndDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearCotizacionesEndDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsCotizacionesEnd">Hoy</button>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";
import HistorialVentas from "../Ventas/HistorialVentas";
import '@/components/stilos/detalles.css';
import { generateYearRange } from "@/helpers/yearHelper";
import AyudanteSesion from "@/Servicios/AyudanteSesion";

export default {
  name: "InicioComponent",

  components: {
    HistorialVentas,
  },

  data() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return {
      isAdmin: false,
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
        ingresosDiarios: false,
        ingresosSemanales: false, // Nuevo estado de carga para ingresos semanales
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
      availableYears: generateYearRange(2000, currentYear),
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

      // Variables para ingresos diarios
      ingresosDiarios: {
        totalIncome: "0.00"
      },
      filtroIngresosDiarios: {
        id: 1
      },

      // Nuevas variables para ingresos semanales
      ingresosSemanales: {
        totalIncome: "0.00"
      },
      filtroIngresosSemanales: {
        id: 1
      },

      // Variables para los calendarios personalizados
      // Calendario IVA
      ivaFechaInicioInput: "",
      ivaFechaFinInput: "",
      showIvaStartCalendar: false,
      showIvaEndCalendar: false,
      ivaStartCalendarMonth: currentMonth,
      ivaStartCalendarYear: currentYear,
      ivaEndCalendarMonth: currentMonth,
      ivaEndCalendarYear: currentYear,
      ivaStartCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      ivaEndCalendarStyle: {
        top: '0px',
        left: '0px'
      },

      // Calendario Cotizaciones
      cotizacionesFechaInicioInput: "",
      cotizacionesFechaFinInput: "",
      showCotizacionesStartCalendar: false,
      showCotizacionesEndCalendar: false,
      cotizacionesStartCalendarMonth: currentMonth,
      cotizacionesStartCalendarYear: currentYear,
      cotizacionesEndCalendarMonth: currentMonth,
      cotizacionesEndCalendarYear: currentYear,
      cotizacionesStartCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      cotizacionesEndCalendarStyle: {
        top: '0px',
        left: '0px'
      },

      // Variables comunes para los calendarios
      diasSemana: ["L", "M", "X", "J", "V", "S", "D"],
      meses: [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ],
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

    // Computed properties para los calendarios de IVA
    nombreMesIvaStart() {
      return this.meses[this.ivaStartCalendarMonth];
    },
    nombreMesIvaEnd() {
      return this.meses[this.ivaEndCalendarMonth];
    },
    ivaStartCalendarDays() {
      return this.getCalendarDays(this.ivaStartCalendarYear, this.ivaStartCalendarMonth);
    },
    ivaEndCalendarDays() {
      return this.getCalendarDays(this.ivaEndCalendarYear, this.ivaEndCalendarMonth);
    },

    // Computed properties para los calendarios de Cotizaciones
    nombreMesCotizacionesStart() {
      return this.meses[this.cotizacionesStartCalendarMonth];
    },
    nombreMesCotizacionesEnd() {
      return this.meses[this.cotizacionesEndCalendarMonth];
    },
    cotizacionesStartCalendarDays() {
      return this.getCalendarDays(this.cotizacionesStartCalendarYear, this.cotizacionesStartCalendarMonth);
    },
    cotizacionesEndCalendarDays() {
      return this.getCalendarDays(this.cotizacionesEndCalendarYear, this.cotizacionesEndCalendarMonth);
    },
  },

  mounted() {
    this.cargarTodosDatos();
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('resize', this.updateCalendarPositions);
    window.addEventListener('scroll', this.updateCalendarPositions);
    this.validRol()
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.updateCalendarPositions);
    window.removeEventListener('scroll', this.updateCalendarPositions);
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

    obtenerFechaActual() {
      return new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    },

    obtenerRangoSemanaActual() {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando el día es domingo
      firstDayOfWeek.setDate(diff);
      
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
      
      const formatOptions = { day: 'numeric', month: 'long' };
      const firstDayFormatted = firstDayOfWeek.toLocaleDateString('es-MX', formatOptions);
      const lastDayFormatted = lastDayOfWeek.toLocaleDateString('es-MX', formatOptions);
      const yearFormatted = today.toLocaleDateString('es-MX', { year: 'numeric' });
      
      return `${firstDayFormatted} al ${lastDayFormatted} de ${yearFormatted}`;
    },

    async cargarTodosDatos() {
      await Promise.all([
        this.obtenerProductosVendidosConNombres(),
        this.obtenerProductosMayoresVentas(),
        this.obtenerTotalesPorMarca(),
        this.obtenerTotalesPorCategoria(),
        this.obtenerProductosPorMarca(),
        this.obtenerProductosPorCategoria(),
        this.obtenerIVAMensual(),
        this.obtenerIVARango(),
        this.obtenerVentasMensualesUsuario(),
        this.obtenerUsuarios(),
        this.obtenerIngresosDiariosUsuario(),
        this.obtenerIngresosSemanalesUsuario(), // Agregamos la carga de ingresos semanales
      ]);
    },
    validRol (){
      const {rol} = AyudanteSesion.obtenerDatosSesion();
      this.isAdmin = rol === 'Admin';
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

    // Método para obtener ingresos diarios del usuario
    async obtenerIngresosDiariosUsuario() {
      if (!this.filtroIngresosDiarios.id) {
        this.mostrarError("Por favor, ingrese un ID de usuario válido");
        return;
      }

      this.cargando.ingresosDiarios = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `users/${this.filtroIngresosDiarios.id}/today-income`,
        });

        if (response?.data) {
          this.ingresosDiarios.totalIncome = response.data.totalIncome || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingresos diarios del usuario:", error);
        this.mostrarError("Error al cargar los ingresos diarios del usuario");
      } finally {
        this.cargando.ingresosDiarios = false;
      }
    },

    // Método para obtener ingresos semanales del usuario
    async obtenerIngresosSemanalesUsuario() {
      if (!this.filtroIngresosSemanales.id) {
        this.mostrarError("Por favor, ingrese un ID de usuario válido");
        return;
      }

      this.cargando.ingresosSemanales = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `users/${this.filtroIngresosSemanales.id}/weekly-income`,
        });

        if (response?.data) {
          this.ingresosSemanales.totalIncome = response.data.totalIncome || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingresos semanales del usuario:", error);
        this.mostrarError("Error al cargar los ingresos semanales del usuario");
      } finally {
        this.cargando.ingresosSemanales = false;
      }
    },

    // Método para limpiar los ingresos diarios
    limpiarIngresosDiariosUsuario() {
      this.ingresosDiarios.totalIncome = "0.00";
      this.filtroIngresosDiarios.id = null;
    },

    // Método para limpiar los ingresos semanales
    limpiarIngresosSemanalesUsuario() {
      this.ingresosSemanales.totalIncome = "0.00";
      this.filtroIngresosSemanales.id = null;
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

    // Métodos para el calendario personalizado
    getCalendarDays(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, ..., 6 = sábado)
      let firstDayOfWeek = firstDay.getDay();
      // Ajustar para que lunes sea 0
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      const days = [];

      // Días del mes anterior
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

      for (let i = 0; i < firstDayOfWeek; i++) {
        const day = daysInPrevMonth - firstDayOfWeek + i + 1;
        days.push({
          day,
          date: new Date(prevMonthYear, prevMonth, day),
          otherMonth: true,
          id: `prev-${day}`
        });
      }

      // Días del mes actual
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          day: i,
          date: new Date(year, month, i),
          otherMonth: false,
          id: `current-${i}`
        });
      }

      // Días del mes siguiente
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      const remainingDays = 42 - days.length; // 6 filas x 7 días

      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          date: new Date(nextMonthYear, nextMonth, i),
          otherMonth: true,
          id: `next-${i}`
        });
      }

      return days;
    },

    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    },

    formatDateForInput(date) {
      if (!date) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    // Métodos para el calendario de IVA
    toggleIvaStartCalendar() {
      if (this.showIvaEndCalendar) {
        this.showIvaEndCalendar = false;
      }

      this.showIvaStartCalendar = !this.showIvaStartCalendar;
      if (this.showIvaStartCalendar) {
        this.$nextTick(() => {
          this.positionIvaStartCalendar();
        });
      }
    },

    toggleIvaEndCalendar() {
      if (this.showIvaStartCalendar) {
        this.showIvaStartCalendar = false;
      }
      if (this.showCotizacionesStartCalendar) {
        this.showCotizacionesStartCalendar = false;
      }
      if (this.showCotizacionesEndCalendar) {
        this.showCotizacionesEndCalendar = false;
      }
      this.showIvaEndCalendar = !this.showIvaEndCalendar;
      if (this.showIvaEndCalendar) {
        this.$nextTick(() => {
          this.positionIvaEndCalendar();
        });
      }
    },

    positionIvaStartCalendar() {
      const inputEl = this.$refs.ivaStartDateContainer;
      if (inputEl && this.$refs.ivaStartCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.ivaStartCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.ivaStartCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    positionIvaEndCalendar() {
      const inputEl = this.$refs.ivaEndDateContainer;
      if (inputEl && this.$refs.ivaEndCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.ivaEndCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.ivaEndCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    isSelectedIvaStartDate(date) {
      if (!this.filtroIVARango.startDate) return false;

      return date.getDate() === this.filtroIVARango.startDate.getDate() &&
        date.getMonth() === this.filtroIVARango.startDate.getMonth() &&
        date.getFullYear() === this.filtroIVARango.startDate.getFullYear();
    },

    isSelectedIvaEndDate(date) {
      if (!this.filtroIVARango.endDate) return false;

      return date.getDate() === this.filtroIVARango.endDate.getDate() &&
        date.getMonth() === this.filtroIVARango.endDate.getMonth() &&
        date.getFullYear() === this.filtroIVARango.endDate.getFullYear();
    },

    selectIvaStartDate(date) {
      this.filtroIVARango.startDate = new Date(date);
      this.ivaFechaInicioInput = this.formatDateForInput(date);
      this.showIvaStartCalendar = false;
    },

    selectIvaEndDate(date) {
      this.filtroIVARango.endDate = new Date(date);
      this.ivaFechaFinInput = this.formatDateForInput(date);
      this.showIvaEndCalendar = false;
    },

    clearIvaStartDate() {
      this.filtroIVARango.startDate = null;
      this.ivaFechaInicioInput = "";
      this.showIvaStartCalendar = false;
    },

    clearIvaEndDate() {
      this.filtroIVARango.endDate = null;
      this.ivaFechaFinInput = "";
      this.showIvaEndCalendar = false;
    },

    setTodayAsIvaStart() {
      const today = new Date();
      this.filtroIVARango.startDate = today;
      this.ivaFechaInicioInput = this.formatDateForInput(today);
      this.ivaStartCalendarMonth = today.getMonth();
      this.ivaStartCalendarYear = today.getFullYear();
      this.showIvaStartCalendar = false;
    },

    setTodayAsIvaEnd() {
      const today = new Date();
      this.filtroIVARango.endDate = today;
      this.ivaFechaFinInput = this.formatDateForInput(today);
      this.ivaEndCalendarMonth = today.getMonth();
      this.ivaEndCalendarYear = today.getFullYear();
      this.showIvaEndCalendar = false;
    },

    toggleCotizacionesEndCalendar() {
      if (this.showIvaStartCalendar) {
        this.showIvaStartCalendar = false;
      }
      if (this.showIvaEndCalendar) {
        this.showIvaEndCalendar = false;
      }
      this.showCotizacionesEndCalendar = !this.showCotizacionesEndCalendar;
      if (this.showCotizacionesEndCalendar) {
        this.$nextTick(() => {
          this.positionCotizacionesEndCalendar();
        });
      }
    },

    positionCotizacionesStartCalendar() {
      const inputEl = this.$refs.cotizacionesStartDateContainer;
      if (inputEl && this.$refs.cotizacionesStartCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.cotizacionesStartCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.cotizacionesStartCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    positionCotizacionesEndCalendar() {
      const inputEl = this.$refs.cotizacionesEndDateContainer;
      if (inputEl && this.$refs.cotizacionesEndCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.cotizacionesEndCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.cotizacionesEndCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    isSelectedCotizacionesStartDate(date) {
      if (!this.filtroCotizaciones.startDate) return false;

      return date.getDate() === this.filtroCotizaciones.startDate.getDate() &&
        date.getMonth() === this.filtroCotizaciones.startDate.getMonth() &&
        date.getFullYear() === this.filtroCotizaciones.startDate.getFullYear();
    },

    isSelectedCotizacionesEndDate(date) {
      if (!this.filtroCotizaciones.endDate) return false;

      return date.getDate() === this.filtroCotizaciones.endDate.getDate() &&
        date.getMonth() === this.filtroCotizaciones.endDate.getMonth() &&
        date.getFullYear() === this.filtroCotizaciones.endDate.getFullYear();
    },

    selectCotizacionesStartDate(date) {
      this.filtroCotizaciones.startDate = new Date(date);
      this.cotizacionesFechaInicioInput = this.formatDateForInput(date);
      this.showCotizacionesStartCalendar = false;
    },

    selectCotizacionesEndDate(date) {
      this.filtroCotizaciones.endDate = new Date(date);
      this.cotizacionesFechaFinInput = this.formatDateForInput(date);
      this.showCotizacionesEndCalendar = false;
    },

    clearCotizacionesStartDate() {
      this.filtroCotizaciones.startDate = null;
      this.cotizacionesFechaInicioInput = "";
      this.showCotizacionesStartCalendar = false;
    },

    clearCotizacionesEndDate() {
      this.filtroCotizaciones.endDate = null;
      this.cotizacionesFechaFinInput = "";
      this.showCotizacionesEndCalendar = false;
    },

    setTodayAsCotizacionesStart() {
      const today = new Date();
      this.filtroCotizaciones.startDate = today;
      this.cotizacionesFechaInicioInput = this.formatDateForInput(today);
      this.cotizacionesStartCalendarMonth = today.getMonth();
      this.cotizacionesStartCalendarYear = today.getFullYear();
      this.showCotizacionesStartCalendar = false;
    },

    setTodayAsCotizacionesEnd() {
      const today = new Date();
      this.filtroCotizaciones.endDate = today;
      this.cotizacionesFechaFinInput = this.formatDateForInput(today);
      this.cotizacionesEndCalendarMonth = today.getMonth();
      this.cotizacionesEndCalendarYear = today.getFullYear();
      this.showCotizacionesEndCalendar = false;
    },

    // Métodos comunes para todos los calendarios
    prevMonth(type) {
      switch (type) {
        case 'ivaStart':
          if (this.ivaStartCalendarMonth === 0) {
            this.ivaStartCalendarMonth = 11;
            this.ivaStartCalendarYear--;
          } else {
            this.ivaStartCalendarMonth--;
          }
          break;
        case 'ivaEnd':
          if (this.ivaEndCalendarMonth === 0) {
            this.ivaEndCalendarMonth = 11;
            this.ivaEndCalendarYear--;
          } else {
            this.ivaEndCalendarMonth--;
          }
          break;
        case 'cotizacionesStart':
          if (this.cotizacionesStartCalendarMonth === 0) {
            this.cotizacionesStartCalendarMonth = 11;
            this.cotizacionesStartCalendarYear--;
          } else {
            this.cotizacionesStartCalendarMonth--;
          }
          break;
        case 'cotizacionesEnd':
          if (this.cotizacionesEndCalendarMonth === 0) {
            this.cotizacionesEndCalendarMonth = 11;
            this.cotizacionesEndCalendarYear--;
          } else {
            this.cotizacionesEndCalendarMonth--;
          }
          break;
      }
    },

    nextMonth(type) {
      switch (type) {
        case 'ivaStart':
          if (this.ivaStartCalendarMonth === 11) {
            this.ivaStartCalendarMonth = 0;
            this.ivaStartCalendarYear++;
          } else {
            this.ivaStartCalendarMonth++;
          }
          break;
        case 'ivaEnd':
          if (this.ivaEndCalendarMonth === 11) {
            this.ivaEndCalendarMonth = 0;
            this.ivaEndCalendarYear++;
          } else {
            this.ivaEndCalendarMonth++;
          }
          break;
        case 'cotizacionesStart':
          if (this.cotizacionesStartCalendarMonth === 11) {
            this.cotizacionesStartCalendarMonth = 0;
            this.cotizacionesStartCalendarYear++;
          } else {
            this.cotizacionesStartCalendarMonth++;
          }
          break;
        case 'cotizacionesEnd':
          if (this.cotizacionesEndCalendarMonth === 11) {
            this.cotizacionesEndCalendarMonth = 0;
            this.cotizacionesEndCalendarYear++;
          } else {
            this.cotizacionesEndCalendarMonth++;
          }
          break;
      }
    },

    updateCalendarPositions() {
      if (this.showIvaStartCalendar) {
        this.positionIvaStartCalendar();
      }
      if (this.showIvaEndCalendar) {
        this.positionIvaEndCalendar();
      }
      if (this.showCotizacionesStartCalendar) {
        this.positionCotizacionesStartCalendar();
      }
      if (this.showCotizacionesEndCalendar) {
        this.positionCotizacionesEndCalendar();
      }
    },

    handleClickOutside(event) {
      // Cerrar calendario IVA inicio si se hace clic fuera
      if (this.showIvaStartCalendar &&
        this.$refs.ivaStartCalendarRef &&
        !this.$refs.ivaStartCalendarRef.contains(event.target) &&
        this.$refs.ivaStartDateContainer &&
        !this.$refs.ivaStartDateContainer.contains(event.target)) {
        this.showIvaStartCalendar = false;
      }

      // Cerrar calendario IVA fin si se hace clic fuera
      if (this.showIvaEndCalendar &&
        this.$refs.ivaEndCalendarRef &&
        !this.$refs.ivaEndCalendarRef.contains(event.target) &&
        this.$refs.ivaEndDateContainer &&
        !this.$refs.ivaEndDateContainer.contains(event.target)) {
        this.showIvaEndCalendar = false;
      }

      // Cerrar calendario Cotizaciones inicio si se hace clic fuera
      if (this.showCotizacionesStartCalendar &&
        this.$refs.cotizacionesStartCalendarRef &&
        !this.$refs.cotizacionesStartCalendarRef.contains(event.target) &&
        this.$refs.cotizacionesStartDateContainer &&
        !this.$refs.cotizacionesStartDateContainer.contains(event.target)) {
        this.showCotizacionesStartCalendar = false;
      }

      // Cerrar calendario Cotizaciones fin si se hace clic fuera
      if (this.showCotizacionesEndCalendar &&
        this.$refs.cotizacionesEndCalendarRef &&
        !this.$refs.cotizacionesEndCalendarRef.contains(event.target) &&
        this.$refs.cotizacionesEndDateContainer &&
        !this.$refs.cotizacionesEndDateContainer.contains(event.target)) {
        this.showCotizacionesEndCalendar = false;
      }
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

/* Estilos para el contenedor de entrada de fecha */
.date-input-container {
  position: relative;
  width: 100%;
}

.date-input-container .icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* Estilos para el calendario flotante */
.floating-calendar {
  position: absolute;
  width: 300px;
  background-color: white;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 1000;
}

.calendar-header {
  margin-bottom: 15px;
  text-align: center;
}

.month-year {
  font-weight: bold;
  position: relative;
  font-size: 1.1rem;
  text-transform: capitalize;
}

.nav-buttons {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  gap: 10px;
}

.nav-buttons button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  font-size: 1.2rem;
  color: #3273dc;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 5px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.day:hover {
  background-color: #f5f5f5;
}

.day.other-month {
  color: #b5b5b5;
}

.day.selected {
  background-color: #3273dc;
  color: white;
}

.day.today {
  border: 1px solid #3273dc;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.btn-clear,
.btn-today {
  background: none;
  border: none;
  cursor: pointer;
  color: #3273dc;
  padding: 5px 10px;
  border-radius: 4px;
}

.btn-clear:hover,
.btn-today:hover {
  background-color: #f0f0f0;
}

.btn-today {
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .column {
    padding: 0.5rem;
  }

  .floating-calendar {
    width: 280px;
    left: 50% !important;
    transform: translateX(-50%);
  }
}
</style>