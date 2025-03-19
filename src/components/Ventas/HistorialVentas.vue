<template>
  <div class="historial-ventas">
    <header class="header">
      <h1 class="title is-2">Historial General</h1>
      <p class="subtitle is-5">
        <b-icon icon="calendar-today"></b-icon>
        {{
          new Date().toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </p>
    </header>

    <!-- Resumen de Ingresos -->
    <div class="columns is-multiline">
      <!-- Ingreso del Día -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">HOY</p>
                    <p class="title is-4">${{ formatNumber(ingresoHoy) }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="calendar-today" size="is-large" type="is-info"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingreso Semanal -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">ESTA SEMANA</p>
                    <p class="title is-4">
                      ${{ formatNumber(ingresoSemanal) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="calendar-week" size="is-large" type="is-primary"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingreso Mensual -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">ESTE MES</p>
                    <p class="title is-4">
                      ${{ formatNumber(ingresoMensual) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="calendar-month" size="is-large" type="is-warning"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ganancia del Inventario -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">GANANCIA INVENTARIO</p>
                    <p class="title is-4">
                      ${{ formatNumber(inventoryProfit) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="trending-up" size="is-large" type="is-success"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Valor Total del Inventario -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">VALOR INVENTARIO</p>
                    <p class="title is-4">
                      ${{ formatNumber(inventoryTotal) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="package" size="is-large" type="is-info"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Stock del Inventario -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">TOTAL PRODUCTOS</p>
                    <p class="title is-4">
                      {{ formatNumber(inventoryTotalStock) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="archive" size="is-large" type="is-primary"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Producto Más Vendido -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">PRODUCTO MÁS VENDIDO</p>
                    <p class="title is-5">{{ topSellingProduct.product_name || 'Sin datos' }}</p>

                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="trophy" size="is-large" type="is-warning"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total de Proveedores -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">TOTAL PROVEEDORES</p>
                    <p class="title is-4">{{ totalProveedores }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="truck-delivery" size="is-large" type="is-danger"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtro de Ventas por Fecha -->
    <div class="card mb-5">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="filter"></b-icon>
          Filtrar Ventas por Fecha
        </p>
      </header>
      <div class="card-content">
        <div class="columns">
          <div class="column is-4">
            <b-field label="Fecha Inicial">
              <div class="date-input-container" ref="startDateContainer">
                <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="fechaInicioInput"
                  @click="toggleStartCalendar" readonly>
                <span class="icon is-right">
                  <i class="mdi mdi-calendar"></i>
                </span>
              </div>
            </b-field>
          </div>
          <div class="column is-4">
            <b-field label="Fecha Final">
              <div class="date-input-container" ref="endDateContainer">
                <input type="text" class="input" placeholder="dd/mm/aaaa" v-model="fechaFinInput"
                  @click="toggleEndCalendar" readonly>
                <span class="icon is-right">
                  <i class="mdi mdi-calendar"></i>
                </span>
              </div>
            </b-field>
          </div>
          <div class="column is-4">
            <b-field label="Buscar">
              <div class="buttons">
                <b-button type="is-primary" icon-left="magnify" @click="obtenerVentasPorFecha"
                  :loading="cargando.ventas" :disabled="!filtroFechas.inicio || !filtroFechas.fin">
                  Buscar
                </b-button>
                <b-button type="is-light" icon-left="close-circle" @click="limpiarFiltroFechas"
                  :disabled="!filtroFechas.inicio && !filtroFechas.fin">
                  Limpiar
                </b-button>
              </div>
            </b-field>
          </div>
        </div>

        <!-- Tabla de Ventas -->
        <b-table :data="ventasPorFecha" :loading="cargando.ventas" :striped="true" :hoverable="true"
          :empty="mensajeTablaVacia">
          <b-table-column field="date" label="Fecha" v-slot="props">
            {{ formatearFecha(props.row.date) }}
          </b-table-column>
          <b-table-column field="totalWithIVA" label="Total con IVA" numeric v-slot="props">
            ${{ formatNumber(props.row.totalWithIVA) }}
          </b-table-column>
          <b-table-column field="totalWithoutIVA" label="Total sin IVA" numeric v-slot="props">
            ${{ formatNumber(props.row.totalWithoutIVA) }}
          </b-table-column>
          <b-table-column field="totalIVA" label="IVA" numeric v-slot="props">
            ${{ formatNumber(props.row.totalIVA) }}
          </b-table-column>
          <b-table-column field="paid" label="Pagado" numeric v-slot="props">
            ${{ formatNumber(props.row.paid) }}
          </b-table-column>
          <b-table-column field="actions" label="Acciones" v-slot="props">
            <b-button size="is-small" type="is-info" icon-left="eye" @click="verDetalles(props.row)">
              Ver productos
            </b-button>
          </b-table-column>
        </b-table>
      </div>
    </div>

    <!-- Ventas Mensuales por Año -->
    <div class="card mb-5">
      <div class="ventas-mensuales-header">
        <div class="ventas-mensuales-title">
          <b-icon icon="chart-bar"></b-icon>
          <span>Ventas Mensuales</span>
        </div>
        <div class="ventas-mensuales-year">
          <b-select v-model="yearSeleccionado" @input="cambiarYear">
            <option v-for="year in [2023, 2024, 2025]" :key="year" :value="year">
              {{ year }}
            </option>
          </b-select>
        </div>
      </div>

      <div class="ventas-mensuales-content" :class="{ 'is-loading': cargandoVentasMensuales }">
        <!-- Lista de meses con ventas -->
        <div class="ventas-mensuales-list">
          <div v-for="(mes, index) in mesesConVentas" :key="mes.month" class="ventas-mensuales-item"
            :class="{ 'is-alternate': index % 2 !== 0 }">
            <div class="mes-nombre">{{ getNombreMes(mes.month) }}</div>
            <div class="mes-valor" :class="mes.totalSales > 0 ? 'is-success' : 'is-purple'">
              ${{ formatNumber(mes.totalSales) }}
            </div>
          </div>
        </div>

        <!-- Resumen de ventas anuales -->
        <div class="ventas-mensuales-summary">
          <div class="summary-item">
            <div class="summary-label">Total Anual:</div>
            <div class="summary-value">${{ formatNumber(totalAnual) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Promedio Mensual:</div>
            <div class="summary-value">${{ formatNumber(promedioMensual) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Mes más Alto:</div>
            <div class="summary-value">{{ mesMasAlto }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendarios flotantes -->
    <div v-if="showStartCalendar" class="floating-calendar" :style="startCalendarStyle" ref="startCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMes }} de {{ startCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('start')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('start')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in startCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedStartDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectStartDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearStartDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsStart">Hoy</button>
      </div>
    </div>

    <div v-if="showEndCalendar" class="floating-calendar" :style="endCalendarStyle" ref="endCalendarRef">
      <div class="calendar-header">
        <div class="month-year">
          {{ nombreMesFin }} de {{ endCalendarYear }}
          <div class="nav-buttons">
            <button @click.stop="prevMonth('end')">
              <span class="icon">←</span>
            </button>
            <button @click.stop="nextMonth('end')">
              <span class="icon">→</span>
            </button>
          </div>
        </div>
      </div>
      <div class="weekdays">
        <div v-for="day in diasSemana" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in endCalendarDays" :key="day.id" :class="[
          'day',
          { 'other-month': day.otherMonth },
          { 'selected': isSelectedEndDate(day.date) },
          { 'today': isToday(day.date) }
        ]" @click.stop="selectEndDate(day.date)">
          {{ day.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="btn-clear" @click.stop="clearEndDate">Borrar</button>
        <button class="btn-today" @click.stop="setTodayAsEnd">Hoy</button>
      </div>
    </div>

    <!-- Modal de Detalles de Venta -->
    <b-modal :active.sync="modalDetalles.activo" has-modal-card>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Detalles de Venta</p>
        </header>
        <section class="modal-card-body">
          <div class="content">
            <h4>Fecha: {{ formatearFecha(modalDetalles.venta.date) }}</h4>
            <h4>Total: ${{ formatNumber(modalDetalles.venta.totalWithIVA) }}</h4>

            <b-table :data="modalDetalles.venta.products || []" :striped="true" :hoverable="true">
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
          <b-button @click="modalDetalles.activo = false">Cerrar</b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "HistorialVentas",

  data() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return {
      ingresoHoy: 0,
      ingresoSemanal: 0,
      ingresoMensual: 0,
      inventoryProfit: 0,
      inventoryTotal: 0,
      inventoryTotalStock: 0,
      totalProveedores: 0,
      topSellingProduct: {
        product_name: "",
        total: 0,
        units: 0
      },
      ventasPorFecha: [],
      filtroFechas: {
        inicio: null,
        fin: null,
      },
      fechaInicioInput: "",
      fechaFinInput: "",
      showStartCalendar: false,
      showEndCalendar: false,
      startCalendarMonth: currentMonth,
      startCalendarYear: currentYear,
      endCalendarMonth: currentMonth,
      endCalendarYear: currentYear,
      startCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      endCalendarStyle: {
        top: '0px',
        left: '0px'
      },
      cargando: {
        ingresosHoy: false,
        ingresosSemana: false,
        ingresosMes: false,
        ventas: false,
      },
      mensajeTablaVacia: "Seleccione un rango de fechas para ver las ventas",
      modalDetalles: {
        activo: false,
        venta: {}
      },
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
      diasSemana: ["L", "M", "X", "J", "V", "S", "D"],
      ventasMensuales: [],
      yearSeleccionado: new Date().getFullYear(),
      cargandoVentasMensuales: false,
    };
  },

  computed: {
    nombreMes() {
      return this.meses[this.startCalendarMonth];
    },
    nombreMesFin() {
      return this.meses[this.endCalendarMonth];
    },
    startCalendarDays() {
      return this.getCalendarDays(this.startCalendarYear, this.startCalendarMonth);
    },
    endCalendarDays() {
      return this.getCalendarDays(this.endCalendarYear, this.endCalendarMonth);
    },
    totalAnual() {
      if (!this.ventasMensuales.length) return 0;
      return this.ventasMensuales.reduce((sum, item) => sum + item.totalSales, 0);
    },
    promedioMensual() {
      if (!this.ventasMensuales.length) return 0;
      return this.totalAnual / this.ventasMensuales.length;
    },
    mesesConVentas() {
      // Crear un array con todos los meses del año
      const todosMeses = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalSales: 0
      }));

      // Actualizar con los datos reales de ventas
      this.ventasMensuales.forEach(venta => {
        const index = venta.month - 1;
        if (index >= 0 && index < 12) {
          todosMeses[index].totalSales = venta.totalSales;
        }
      });

      return todosMeses;
    },
    mesMasAlto() {
      if (!this.ventasMensuales.length) return "Ninguno";

      const mesMaximo = this.ventasMensuales.reduce((max, item) =>
        item.totalSales > max.totalSales ? item : max,
        { month: 0, totalSales: 0 }
      );

      if (mesMaximo.totalSales === 0) return "Ninguno";

      return `${this.getNombreMes(mesMaximo.month)} ($${this.formatNumber(mesMaximo.totalSales)})`;
    }
  },

  mounted() {
    this.cargarDatos();
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('resize', this.updateCalendarPositions);
    window.addEventListener('scroll', this.updateCalendarPositions);
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.updateCalendarPositions);
    window.removeEventListener('scroll', this.updateCalendarPositions);
  },

  methods: {
    async obtenerVentasMensuales(year) {
      this.cargandoVentasMensuales = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `sales/monthly/${year}`,
        });

        if (response.status === 200) {
          this.ventasMensuales = response.data;
        }
      } catch (error) {
        console.error("Error al obtener ventas mensuales:", error);
        this.mostrarError("Error al cargar las ventas mensuales");
        this.ventasMensuales = [];
      } finally {
        this.cargandoVentasMensuales = false;
      }
    },

    cambiarYear(year) {
      this.yearSeleccionado = year;
      this.obtenerVentasMensuales(year);
    },

    getNombreMes(numeroMes) {
      return this.meses[numeroMes - 1].charAt(0).toUpperCase() + this.meses[numeroMes - 1].slice(1);
    },

    async cargarDatos() {
      try {
        await Promise.all([
          this.obtenerIngresoHoy(),
          this.obtenerIngresoSemanal(),
          this.obtenerIngresoMensual(),
          this.obtenerInventoryProfit(),
          this.obtenerInventoryTotal(),
          this.obtenerInventoryTotalStock(),
          this.obtenerVentasMensuales(this.yearSeleccionado),
          this.obtenerProductoMasVendido(),
          this.obtenerTotalProveedores(),
        ]);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        this.mostrarError("Error al cargar los datos iniciales.");
      }
    },

    async obtenerTotalProveedores() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "providers/total-providers",
        });

        if (response.status === 200) {
          this.totalProveedores = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener total de proveedores:", error);
        this.mostrarError("Error al cargar el total de proveedores");
        this.totalProveedores = 0;
      }
    },

    async obtenerProductoMasVendido() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/top-sold?limit=1",
        });

        if (response.status === 200 && response.data.length > 0) {
          this.topSellingProduct = response.data[0];
        }
      } catch (error) {
        console.error("Error al obtener producto más vendido:", error);
        this.mostrarError("Error al cargar el producto más vendido");
        this.topSellingProduct = {
          product_name: "",
          total: 0,
          units: 0
        };
      }
    },

    toggleStartCalendar() {
      if (this.showEndCalendar) {
        this.showEndCalendar = false;
      }
      this.showStartCalendar = !this.showStartCalendar;
      if (this.showStartCalendar) {
        this.$nextTick(() => {
          this.positionStartCalendar();
        });
      }
    },

    toggleEndCalendar() {
      if (this.showStartCalendar) {
        this.showStartCalendar = false;
      }
      this.showEndCalendar = !this.showEndCalendar;
      if (this.showEndCalendar) {
        this.$nextTick(() => {
          this.positionEndCalendar();
        });
      }
    },

    positionStartCalendar() {
      const inputEl = this.$refs.startDateContainer;
      if (inputEl && this.$refs.startCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.startCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.startCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    positionEndCalendar() {
      const inputEl = this.$refs.endDateContainer;
      if (inputEl && this.$refs.endCalendarRef) {
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.$refs.endCalendarRef.offsetHeight;
        const windowHeight = window.innerHeight;

        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;

        this.endCalendarStyle = {
          top: showBelow ? `${rect.bottom + window.scrollY}px` : `${rect.top + window.scrollY - calendarHeight}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: '1000'
        };
      }
    },

    updateCalendarPositions() {
      if (this.showStartCalendar) {
        this.positionStartCalendar();
      }
      if (this.showEndCalendar) {
        this.positionEndCalendar();
      }
    },

    handleClickOutside(event) {
      // Cerrar calendario inicial si se hace clic fuera
      if (this.showStartCalendar &&
        this.$refs.startCalendarRef &&
        !this.$refs.startCalendarRef.contains(event.target) &&
        this.$refs.startDateContainer &&
        !this.$refs.startDateContainer.contains(event.target)) {
        this.showStartCalendar = false;
      }

      // Cerrar calendario final si se hace clic fuera
      if (this.showEndCalendar &&
        this.$refs.endCalendarRef &&
        !this.$refs.endCalendarRef.contains(event.target) &&
        this.$refs.endDateContainer &&
        !this.$refs.endDateContainer.contains(event.target)) {
        this.showEndCalendar = false;
      }
    },

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

    isSelectedStartDate(date) {
      if (!this.filtroFechas.inicio) return false;

      return date.getDate() === this.filtroFechas.inicio.getDate() &&
        date.getMonth() === this.filtroFechas.inicio.getMonth() &&
        date.getFullYear() === this.filtroFechas.inicio.getFullYear();
    },

    isSelectedEndDate(date) {
      if (!this.filtroFechas.fin) return false;

      return date.getDate() === this.filtroFechas.fin.getDate() &&
        date.getMonth() === this.filtroFechas.fin.getMonth() &&
        date.getFullYear() === this.filtroFechas.fin.getFullYear();
    },

    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    },

    selectStartDate(date) {
      this.filtroFechas.inicio = new Date(date);
      this.fechaInicioInput = this.formatDateForInput(date);
      this.showStartCalendar = false;
    },

    selectEndDate(date) {
      this.filtroFechas.fin = new Date(date);
      this.fechaFinInput = this.formatDateForInput(date);
      this.showEndCalendar = false;
    },

    prevMonth(type) {
      if (type === 'start') {
        if (this.startCalendarMonth === 0) {
          this.startCalendarMonth = 11;
          this.startCalendarYear--;
        } else {
          this.startCalendarMonth--;
        }
      } else {
        if (this.endCalendarMonth === 0) {
          this.endCalendarMonth = 11;
          this.endCalendarYear--;
        } else {
          this.endCalendarMonth--;
        }
      }
    },

    nextMonth(type) {
      if (type === 'start') {
        if (this.startCalendarMonth === 11) {
          this.startCalendarMonth = 0;
          this.startCalendarYear++;
        } else {
          this.startCalendarMonth++;
        }
      } else {
        if (this.endCalendarMonth === 11) {
          this.endCalendarMonth = 0;
          this.endCalendarYear++;
        } else {
          this.endCalendarMonth++;
        }
      }
    },

    clearStartDate() {
      this.filtroFechas.inicio = null;
      this.fechaInicioInput = "";
      this.showStartCalendar = false;
    },

    clearEndDate() {
      this.filtroFechas.fin = null;
      this.fechaFinInput = "";
      this.showEndCalendar = false;
    },

    setTodayAsStart() {
      const today = new Date();
      this.filtroFechas.inicio = today;
      this.fechaInicioInput = this.formatDateForInput(today);
      this.startCalendarMonth = today.getMonth();
      this.startCalendarYear = today.getFullYear();
      this.showStartCalendar = false;
    },

    setTodayAsEnd() {
      const today = new Date();
      this.filtroFechas.fin = today;
      this.fechaFinInput = this.formatDateForInput(today);
      this.endCalendarMonth = today.getMonth();
      this.endCalendarYear = today.getFullYear();
      this.showEndCalendar = false;
    },

    formatDateForInput(date) {
      if (!date) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

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

    async obtenerVentasPorFecha() {
      if (!this.filtroFechas.inicio || !this.filtroFechas.fin) {
        return; // Simplemente retornar sin mostrar alerta
      }

      this.cargando.ventas = true;
      this.mensajeTablaVacia = "Cargando ventas...";

      try {
        const formatearFecha = (fecha) => {
          const d = new Date(fecha);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`;
        };

        const startDate = formatearFecha(this.filtroFechas.inicio);
        const endDate = formatearFecha(this.filtroFechas.fin);

        const response = await apiRequest({
          method: "GET",
          path: `sales?startDate=${startDate}&endDate=${endDate}`,
        });

        if (response.status === 200) {
          this.ventasPorFecha = response.data;

          if (this.ventasPorFecha.length === 0) {
            this.mensajeTablaVacia =
              "No se encontraron ventas en las fechas seleccionadas";
          }
        }
      } catch (error) {
        console.error("Error al obtener ventas por fecha:", error);
        this.mostrarError(
          "Error al cargar las ventas. Por favor, intente nuevamente."
        );
        this.ventasPorFecha = [];
        this.mensajeTablaVacia = "Error al cargar las ventas";
      } finally {
        this.cargando.ventas = false;
      }
    },

    verDetalles(venta) {
      this.modalDetalles.venta = venta;
      this.modalDetalles.activo = true;
    },

    limpiarFiltroFechas() {
      this.filtroFechas.inicio = null;
      this.filtroFechas.fin = null;
      this.fechaInicioInput = "";
      this.fechaFinInput = "";
      this.ventasPorFecha = [];
      this.mensajeTablaVacia =
        "Seleccione un rango de fechas para ver las ventas";
    },

    async obtenerIngresoHoy() {
      this.cargando.ingresosHoy = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sales/today-income",
        });

        if (response.status === 200) {
          this.ingresoHoy = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingreso del día:", error);
        this.mostrarError("Error al cargar el ingreso del día");
        this.ingresoHoy = 0;
      } finally {
        this.cargando.ingresosHoy = false;
      }
    },

    async obtenerIngresoSemanal() {
      this.cargando.ingresosSemana = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sales/weekly-income",
        });

        if (response.status === 200) {
          this.ingresoSemanal = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingreso semanal:", error);
        this.mostrarError("Error al cargar el ingreso semanal");
        this.ingresoSemanal = 0;
      } finally {
        this.cargando.ingresosSemana = false;
      }
    },

    async obtenerIngresoMensual() {
      this.cargando.ingresosMes = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sales/monthly-income",
        });

        if (response.status === 200) {
          this.ingresoMensual = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingreso mensual:", error);
        this.mostrarError("Error al cargar el ingreso mensual");
        this.ingresoMensual = 0;
      } finally {
        this.cargando.ingresosMes = false;
      }
    },

    async obtenerInventoryProfit() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "products/inventory/total-profit",
        });

        if (response.status === 200) {
          this.inventoryProfit = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ganancia del inventario:", error);
        this.mostrarError("Error al cargar la ganancia del inventario");
        this.inventoryProfit = 0;
      }
    },

    async obtenerInventoryTotal() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "products/inventory/total-value",
        });

        if (response.status === 200) {
          this.inventoryTotal = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener valor total del inventario:", error);
        this.mostrarError("Error al cargar el valor total del inventario");
        this.inventoryTotal = 0;
      }
    },

    async obtenerInventoryTotalStock() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "products/inventory/total-stock",
        });

        if (response.status === 200) {
          this.inventoryTotalStock = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener total de stock:", error);
        this.mostrarError("Error al cargar el total de stock");
        this.inventoryTotalStock = 0;
      }
    },

    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: "is-danger",
        duration: 5000,
      });
    },
  },
};
</script>

<style scoped>
.historial-ventas {
  padding: 1rem;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.card {
  margin-bottom: 1rem;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}

.card-header-title {
  display: flex;
  align-items: center;
}

.card-header-title .icon {
  margin-right: 0.5rem;
}

.heading {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 0.5rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.mb-5 {
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

/* Estilos para ventas mensuales */
.ventas-mensuales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dbdbdb;
}

.ventas-mensuales-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.ventas-mensuales-title .icon {
  margin-right: 0.5rem;
}

.ventas-mensuales-content {
  padding: 1rem;
  position: relative;
}

.ventas-mensuales-content.is-loading::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.ventas-mensuales-list {
  margin-bottom: 2rem;
}

.ventas-mensuales-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.ventas-mensuales-item.is-alternate {
  background-color: #f9f9f9;
}

.mes-nombre {
  font-weight: 500;
}

.mes-valor {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  color: white;
  min-width: 100px;
  text-align: center;
}

.mes-valor.is-purple {
  background-color: #8a4baf;
}

.mes-valor.is-success {
  background-color: #23d160;
}

.ventas-mensuales-summary {
  display: flex;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 1px solid #dbdbdb;
}

.summary-item {
  text-align: center;
  flex: 1;
}

.summary-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #666;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .historial-ventas {
    padding: 0.5rem;
  }

  .column {
    padding: 0.5rem;
  }

  .buttons {
    flex-direction: column;
    width: 100%;
  }

  .buttons .button {
    width: 100%;
  }

  .floating-calendar {
    width: 280px;
    left: 50% !important;
    transform: translateX(-50%);
  }

  .ventas-mensuales-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .summary-item {
    padding: 0.5rem;
  }
}
</style>