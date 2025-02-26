```vue type="vue" project="Historial de Ventas" file="HistorialVentas.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="historial-ventas">
    <header class="header">
      <h1 class="title is-2">Historial General</h1>
      <p class="subtitle is-5">
        <b-icon icon="calendar-today"></b-icon>
        {{ new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) }}
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
                    <p class="title is-4">${{ formatNumber(ingresoSemanal) }}</p>
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
                    <p class="title is-4">${{ formatNumber(ingresoMensual) }}</p>
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

      <!-- Ingreso Pendiente -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">PENDIENTE</p>
                    <p class="title is-4">${{ formatNumber(pendingIncome) }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="clock" size="is-large" type="is-danger"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Cuentas por Cobrar -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">CUENTAS POR COBRAR</p>
                    <p class="title is-4">${{ formatNumber(totalCuentasPorCobrar) }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="cash-multiple" size="is-large" type="is-warning"></b-icon>
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
                    <p class="title is-4">${{ formatNumber(inventoryProfit) }}</p>
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
                    <p class="title is-4">${{ formatNumber(inventoryTotal) }}</p>
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
                    <p class="title is-4">{{ formatNumber(inventoryTotalStock) }}</p>
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
              <b-datepicker
                v-model="filtroFechas.inicio"
                :max-date="filtroFechas.fin || new Date()"
                :first-day-of-week="1"
                locale="es-MX"
                placeholder="Seleccione fecha inicial"
                icon="calendar-today"
                :focused="false"
                :mobile-native="false"
              ></b-datepicker>
            </b-field>
          </div>
          <div class="column is-4">
            <b-field label="Fecha Final">
              <b-datepicker
                v-model="filtroFechas.fin"
                :min-date="filtroFechas.inicio"
                :max-date="new Date()"
                :first-day-of-week="1"
                locale="es-MX"
                placeholder="Seleccione fecha final"
                icon="calendar-today"
                :focused="false"
                :mobile-native="false"
              ></b-datepicker>
            </b-field>
          </div>
          <div class="column is-4">
            <b-field label="Buscar">
              <div class="buttons">
                <b-button
                  type="is-primary"
                  icon-left="magnify"
                  @click="obtenerVentasPorFecha"
                  :loading="cargando.ventas"
                  :disabled="!filtroFechas.inicio || !filtroFechas.fin"
                >
                  Buscar
                </b-button>
                <b-button
                  type="is-light"
                  icon-left="close-circle"
                  @click="limpiarFiltroFechas"
                  :disabled="!filtroFechas.inicio && !filtroFechas.fin"
                >
                  Limpiar
                </b-button>
              </div>
            </b-field>
          </div>
        </div>

        <!-- Tabla de Ventas -->
        <b-table
          :data="ventasPorFecha"
          :loading="cargando.ventas"
          :striped="true"
          :hoverable="true"
          :empty="mensajeTablaVacia"
        >
          <b-table-column field="date" label="Fecha" v-slot="props">
            {{ formatearFecha(props.row.date) }}
          </b-table-column>
          <b-table-column field="total" label="Total" numeric v-slot="props">
            ${{ formatNumber(props.row.total) }}
          </b-table-column>
          <b-table-column field="items" label="Items" numeric v-slot="props">
            {{ props.row.items }}
          </b-table-column>
        </b-table>
      </div>
    </div>

    <!-- Ventas Mensuales -->
    <div class="card mb-5">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="chart-bar"></b-icon>
          Ventas Mensuales
        </p>
        <div class="card-header-icon">
          <b-select v-model="yearFilter" @input="obtenerVentasMensuales" size="is-small">
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </b-select>
        </div>
      </header>
      <div class="card-content">
        <!-- Nueva Visualización de Ventas Mensuales -->
        <div class="monthly-sales-list" v-if="!cargando.mensual">
          <div 
            v-for="venta in ventasMensuales" 
            :key="venta.month" 
            class="month-row"
            :class="{ 'has-background-light': venta.month % 2 === 0 }"
          >
            <span class="month-name">{{ obtenerNombreMes(venta.month) }}</span>
            <div class="amount-badge" :class="{ 'has-amount': venta.total > 0 }">
              ${{ formatNumber(venta.total) }}
            </div>
           
          </div>
        </div>
        <div v-else class="has-text-centered py-6">
          <b-loading :is-full-page="false" :active="true"></b-loading>
        </div>

        <!-- Resumen de Ventas Mensuales -->
        <div class="monthly-summary" v-if="!cargando.mensual && ventasMensuales.length">
          <div class="summary-columns">
            <div class="summary-item">
              <span class="summary-label">Total Anual:</span>
              <span class="summary-value">${{ formatNumber(totalAnual) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Promedio Mensual:</span>
              <span class="summary-value">${{ formatNumber(promedioMensual) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Mes más Alto:</span>
              <span class="summary-value">{{ mejorMes.nombre }} (${{ formatNumber(mejorMes.total) }})</span>
            </div>
          </div>
        </div>
        <div v-if="!ventasMensuales.length && !cargando.mensual" class="has-text-centered py-6">
          <p class="has-text-grey">No hay datos de ventas disponibles para el año {{ yearFilter }}</p>
        </div>
      </div>
    </div>

    <!-- Ventas Diarias -->
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="calendar-range"></b-icon>
          Ventas Diarias
        </p>
        <div class="card-header-icon">
          <div class="buttons has-addons">
            <b-select 
              v-model="filtrosDiarios.mes" 
              size="is-small"
              @input="obtenerVentasDiarias"
            >
              <option v-for="(mes, index) in meses" :key="index" :value="index + 1">
                {{ mes }}
              </option>
            </b-select>
            <b-select 
              v-model="filtrosDiarios.año" 
              size="is-small"
              @input="obtenerVentasDiarias"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </b-select>
          </div>
        </div>
      </header>
      <div class="card-content">
        <b-table
          :data="ventasDiarias"
          :loading="cargando.diario"
          :striped="true"
          :hoverable="true"
          :empty="!ventasDiarias.length ? 'No hay ventas para el período seleccionado' : ''"
        >
          <b-table-column field="date" label="Día" v-slot="props">
            {{ new Date(props.row.date).getDate() }}
          </b-table-column>
          <b-table-column field="total" label="Total" numeric v-slot="props">
            ${{ formatNumber(props.row.total) }}
          </b-table-column>
        
        </b-table>
      </div>
    </div>

    <!-- Ventas por Usuario -->
    <div class="card mb-5">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="account-multiple" type="is-info"></b-icon>
          Ventas por Usuario
        </p>
      </header>
      <div class="card-content">
        <b-table
          :data="ventasPorUsuario"
          :striped="true"
          :hoverable="true"
          :empty="'No hay datos de ventas por usuario disponibles'"
        >
          <b-table-column field="username" label="Usuario" v-slot="props">
            {{ props.row.username }}
          </b-table-column>
          <b-table-column field="totalSales" label="Total Ventas" numeric v-slot="props">
            ${{ formatNumber(props.row.totalSales) }}
          </b-table-column>
        </b-table>
      </div>
    </div>

    <!-- Cuentas por Cobrar -->
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="cash" type="is-danger"></b-icon>
          Cuentas por Cobrar
        </p>
      </header>
      <div class="card-content">
        <div class="columns">
          <div class="column is-4">
            <b-field>
              <b-input placeholder="Buscar cliente" v-model="busquedaCliente" icon="magnify"></b-input>
            </b-field>
          </div>
          <div class="column is-4">
            <b-field>
              <b-select placeholder="Filtrar por estado" v-model="filtroEstado">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="parcial">Pago Parcial</option>
              </b-select>
            </b-field>
          </div>
        </div>
        <b-table
          :data="accountsHoldingsAgrupados"
          :loading="cargando.accountsHoldings"
          :striped="true"
          :hoverable="true"
          :paginated="true"
          :per-page="5"
          :current-page.sync="currentPage"
          :pagination-simple="false"
          :pagination-size="'is-small'"
          :pagination-position="'bottom'"
          :default-sort-direction="'desc'"
          default-sort="totalDeuda"
          :empty="'No hay cuentas por cobrar pendientes'"
          detailed
          detail-key="customerId"
          :show-detail-icon="true"
        >
          <b-table-column field="customerName" label="Cliente" sortable v-slot="props">
            {{ props.row.customerName }}
          </b-table-column>
          <b-table-column field="totalDeuda" label="Total Adeudado" numeric sortable v-slot="props">
            ${{ formatNumber(props.row.totalDeuda) }}
          </b-table-column>
          <b-table-column field="ultimaFecha" label="Última Compra" sortable v-slot="props">
            {{ formatearFecha(props.row.ultimaFecha) }}
          </b-table-column>
          <b-table-column field="telefono" label="Teléfono" v-slot="props">
            {{ props.row.telefono }}
          </b-table-column>
          <b-table-column field="status" label="Estado" v-slot="props">
            <b-tag :type="getStatusType(props.row)">{{ getStatusText(props.row) }}</b-tag>
          </b-table-column>

          <template #detail="props">
            <div class="content">
              <p><strong>Detalle de transacciones:</strong></p>
              <b-table :data="props.row.transacciones" :striped="true" :hoverable="true">
                <b-table-column field="date" label="Fecha" v-slot="props">
                  {{ formatearFecha(props.row.date) }}
                </b-table-column>
                <b-table-column field="total" label="Total" numeric v-slot="props">
                  ${{ formatNumber(props.row.total) }}
                </b-table-column>
                <b-table-column field="paid" label="Pagado" numeric v-slot="props">
                  ${{ formatNumber(props.row.paid) }}
                </b-table-column>
                <b-table-column field="toPay" label="Por Pagar" numeric v-slot="props">
                  ${{ formatNumber(props.row.toPay) }}
                </b-table-column>
              </b-table>
            </div>
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';

export default {
  name: 'HistorialVentas',

  data() {
    return {
      ingresoHoy: 0,
      ingresoSemanal: 0,
      ingresoMensual: 0,
      pendingIncome: 0,
      totalCuentasPorCobrar: 0,
      inventoryProfit: 0,
      inventoryTotal: 0,
      inventoryTotalStock: 0,
      accountsHoldings: [],
      ventasPorFecha: [],
      ventasMensuales: [],
      ventasDiarias: [],
      ventasPorUsuario: [],
      filtroFechas: {
        inicio: null,
        fin: null
      },
      yearFilter: new Date().getFullYear(),
      filtrosDiarios: {
        mes: new Date().getMonth() + 1,
        año: new Date().getFullYear()
      },
      cargando: {
        ventas: false,
        mensual: false,
        diario: false,
        ingresosHoy: false,
        ingresosSemana: false,
        ingresosMes: false,
        ventasMensuales: false,
        ventasDiarias: false,
        ingresosPendientes: false,
        accountsHoldings: false
      },
      meses: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      availableYears: Array.from(
        { length: 5 }, 
        (_, i) => new Date().getFullYear() - i
      ),
      mensajeTablaVacia: 'Seleccione un rango de fechas para ver las ventas',
      busquedaCliente: '',
      filtroEstado: '',
      currentPage: 1,
    }
  },

  computed: {
    totalAnual() {
      return this.ventasMensuales.reduce((sum, mes) => sum + (mes.total || 0), 0);
    },
    promedioMensual() {
      const mesesConVentas = this.ventasMensuales.filter(mes => mes.total > 0).length;
      return mesesConVentas ? this.totalAnual / mesesConVentas : 0;
    },
    mejorMes() {
      const mejorMes = this.ventasMensuales.reduce((mejor, actual) => 
        actual.total > (mejor.total || 0) ? actual : mejor
      , { total: 0 });
      
      return {
        nombre: this.obtenerNombreMes(mejorMes.month),
        total: mejorMes.total
      };
    },
    accountsHoldingsFiltrados() {
      return this.accountsHoldings.filter(account => {
        const clienteMatch = this.getCustomerName(account).toLowerCase().includes(this.busquedaCliente.toLowerCase());
        const estadoMatch = this.filtroEstado === '' || this.getStatusText(account).toLowerCase() === this.filtroEstado;
        return clienteMatch && estadoMatch;
      });
    },
    accountsHoldingsAgrupados() {
      const agrupados = this.accountsHoldings.reduce((acc, cuenta) => {
        const customerId = cuenta.customer.id;
        if (!acc[customerId]) {
          acc[customerId] = {
            customerId: customerId,
            customerName: cuenta.customer.name,
            telefono: cuenta.customer.phone,
            totalDeuda: 0,
            ultimaFecha: new Date(0),
            transacciones: []
          };
        }
        acc[customerId].totalDeuda += (cuenta.total - cuenta.paid);
        acc[customerId].transacciones.push(cuenta);
        const fechaCuenta = new Date(cuenta.date);
        if (fechaCuenta > acc[customerId].ultimaFecha) {
          acc[customerId].ultimaFecha = fechaCuenta;
        }
        return acc;
      }, {});

      return Object.values(agrupados).filter(cuenta => {
        const clienteMatch = cuenta.customerName.toLowerCase().includes(this.busquedaCliente.toLowerCase());
        
        if (this.filtroEstado === '') return clienteMatch;
        
        if (this.filtroEstado === 'pendiente') {
          return clienteMatch && cuenta.totalDeuda > 0 && !cuenta.transacciones.some(t => t.paid > 0);
        }
        
        if (this.filtroEstado === 'parcial') {
          return clienteMatch && cuenta.totalDeuda > 0 && cuenta.transacciones.some(t => t.paid > 0);
        }
        
        return clienteMatch;
      });
    }
  },

  mounted() {
    this.cargarDatos();
  },

  methods: {
    formatNumber(value) {
      if (value === null || value === undefined) return '0.00';
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? '0.00' : num.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    formatearFecha(fecha) {
      if (!fecha) return '';
      return new Date(fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    obtenerNombreMes(monthNumber) {
      return this.meses[monthNumber - 1] || '';
    },

    calcularPorcentajeVenta(total) {
      const maxVenta = Math.max(...this.ventasMensuales.map(v => v.total));
      return maxVenta ? (total / maxVenta) * 100 : 0;
    },

    async cargarDatos() {
      try {
        await Promise.all([
          this.obtenerIngresoHoy(),
          this.obtenerIngresoSemanal(),
          this.obtenerIngresoMensual(),
          this.obtenerIngresoPendiente(),
          this.obtenerAccountsHoldings(),
          this.obtenerVentasMensuales(),
          this.obtenerVentasDiarias(),
          this.obtenerVentasPorUsuario(),
          this.obtenerInventoryProfit(),
          this.obtenerInventoryTotal(),
          this.obtenerInventoryTotalStock()
        ]);
        // Call obtenerTotalCuentasPorCobrar after accountsHoldings have been fetched
        await this.obtenerTotalCuentasPorCobrar();
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        this.mostrarError('Error al cargar los datos iniciales.');
      }
    },

    async obtenerVentasPorFecha() {
      if (!this.filtroFechas.inicio || !this.filtroFechas.fin) {
        this.$buefy.toast.open({
          message: 'Por favor, seleccione ambas fechas',
          type: 'is-warning'
        });
        return;
      }

      this.cargando.ventas = true;
      this.mensajeTablaVacia = 'Cargando ventas...';

      try {
        const formatearFecha = (fecha) => {
          const d = new Date(fecha);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const startDate = formatearFecha(this.filtroFechas.inicio);
        const endDate = formatearFecha(this.filtroFechas.fin);
        
        const response = await apiRequest({
          method: 'GET',
          path: `sales?startDate=${startDate}&endDate=${endDate}`
        });

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            this.ventasPorFecha = response.data.map(venta => ({
              date: venta.date,
              total: venta.total || 0,
              items: Array.isArray(venta.products) ? venta.products.length : 
                     (typeof venta.items === 'number' ? venta.items : 0)
            }));
        
            if (this.ventasPorFecha.length === 0) {
              this.mensajeTablaVacia = 'No se encontraron ventas en las fechas seleccionadas';
              this.$buefy.toast.open({
                message: 'No se encontraron ventas en las fechas seleccionadas',
                type: 'is-warning',
                position: 'is-bottom',
                duration: 3000
              });
            }
          } else {
            throw new Error('Formato de respuesta inválido');
          }
        }
      } catch (error) {
        console.error('Error al obtener ventas por fecha:', error);
        this.mostrarError('Error al cargar las ventas. Por favor, intente nuevamente.');
        this.ventasPorFecha = [];
        this.mensajeTablaVacia = 'Error al cargar las ventas';
      } finally {
        this.cargando.ventas = false;
      }
    },

    async obtenerIngresoHoy() {
      this.cargando.ingresosHoy = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sales/today-income'
        });

        if (response.status === 200) {
          this.ingresoHoy = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener ingreso del día:', error);
        this.mostrarError('Error al cargar el ingreso del día');
        this.ingresoHoy = 0;
      } finally {
        this.cargando.ingresosHoy = false;
      }
    },

    async obtenerIngresoSemanal() {
      this.cargando.ingresosSemana = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sales/weekly-income'
        });

        if (response.status === 200) {
          this.ingresoSemanal = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener ingreso semanal:', error);
        this.mostrarError('Error al cargar el ingreso semanal');
        this.ingresoSemanal = 0;
      } finally {
        this.cargando.ingresosSemana = false;
      }
    },

    async obtenerIngresoMensual() {
      this.cargando.ingresosMes = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sales/monthly-income'
        });

        if (response.status === 200) {
          this.ingresoMensual = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener ingreso mensual:', error);
        this.mostrarError('Error al cargar el ingreso mensual');
        this.ingresoMensual = 0;
      } finally {
        this.cargando.ingresosMes = false;
      }
    },

    async obtenerIngresoPendiente() {
      this.cargando.ingresosPendientes = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sales/pending-income'
        });

        if (response.status === 200) {
          this.pendingIncome = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener ingreso pendiente:', error);
        this.mostrarError('Error al cargar el ingreso pendiente');
        this.pendingIncome = 0;
      } finally {
        this.cargando.ingresosPendientes = false;
      }
    },

    async obtenerAccountsHoldings() {
      this.cargando.accountsHoldings = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'accountsholdings'
        });

        if (response.status === 200) {
          this.accountsHoldings = Array.isArray(response.data) ? response.data : [];
        }
      } catch (error) {
        console.error('Error al obtener cuentas por cobrar:', error);
        this.mostrarError('Error al cargar las cuentas por cobrar');
        this.accountsHoldings = [];
      } finally {
        this.cargando.accountsHoldings = false;
      }
    },

    async obtenerVentasMensuales() {
      this.cargando.ventasMensuales = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `sales/monthly/${this.yearFilter}`
        });

        if (response.status === 200) {
          const ventasPorMes = Array.isArray(response.data) ? response.data : [];
          
          const añoActual = new Date().getFullYear();
          const mesActualNum = new Date().getMonth() + 1;
          
          this.ventasMensuales = this.meses.map((_, index) => {
            const numeroMes = index + 1;
            
            if (this.yearFilter === añoActual && numeroMes > mesActualNum) {
              return null;
            }

            const datosMes = ventasPorMes.find(v => v.month === numeroMes);
            
            return {
              month: numeroMes,
              total: datosMes ? parseFloat(datosMes.totalSales) : 0,
              items: datosMes && Array.isArray(datosMes.products) ? datosMes.products.length : 0
            };
          }).filter(Boolean);
        }
      } catch (error) {
        console.error('Error detallado al obtener las ventas mensuales:', error);
        this.mostrarError('Error al cargar las ventas mensuales');
        this.ventasMensuales = [];
      } finally {
        this.cargando.ventasMensuales = false;
      }
    },

    async obtenerVentasDiarias() {
      this.cargando.ventasDiarias = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `sales/daily/${this.filtrosDiarios.mes}/${this.filtrosDiarios.año}`
        });

        if (response.status === 200) {
          this.ventasDiarias = Array.isArray(response.data) ? response.data.map(venta => {
            const fecha = new Date(venta.day || venta.date);
            return {
              date: fecha,
              total: venta.totalSales ? parseFloat(venta.totalSales) : 0,
              items: Array.isArray(venta.products) ? venta.products.length : (venta.items || 0)
            };
          }) : [];

          this.ventasDiarias.sort((a, b) => a.date - b.date);
        }
      } catch (error) {
        console.error('Error al obtener las ventas diarias:', error);
        this.mostrarError('Error al cargar las ventas diarias');
        this.ventasDiarias = [];
      } finally {
        this.cargando.ventasDiarias = false;
      }
    },

    async obtenerVentasPorUsuario() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'users/report/sales-by-user'
        });

        if (response.status === 200) {
          this.ventasPorUsuario = Array.isArray(response.data) ? response.data.map(user => ({
            username: user.username,
            totalSales: parseFloat(user.totalSales) || 0
          })) : [];
        }
      } catch (error) {
        console.error('Error al obtener ventas por usuario:', error);
        this.mostrarError('Error al cargar las ventas por usuario');
        this.ventasPorUsuario = [];
      }
    },

    async obtenerTotalCuentasPorCobrar() {
      try {
        // If we haven't fetched accountsHoldings yet, fetch them
        if (this.accountsHoldings.length === 0) {
          await this.obtenerAccountsHoldings();
        }
        
        // Calculate the total from accountsHoldings
        this.totalCuentasPorCobrar = this.accountsHoldings.reduce((total, account) => {
          return total + (account.total - account.paid);
        }, 0);
      } catch (error) {
        console.error('Error al calcular el total de cuentas por cobrar:', error);
        this.mostrarError('Error al calcular el total de cuentas por cobrar');
        this.totalCuentasPorCobrar = 0;
      }
    },

    async obtenerInventoryProfit() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'products/inventory/total-profit'
        });

        if (response.status === 200) {
          this.inventoryProfit = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener ganancia del inventario:', error);
        this.mostrarError('Error al cargar la ganancia del inventario');
        this.inventoryProfit = 0;
      }
    },

    async obtenerInventoryTotal() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'products/inventory/total-value'
        });

        if (response.status === 200) {
          this.inventoryTotal = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener valor total del inventario:', error);
        this.mostrarError('Error al cargar el valor total del inventario');
        this.inventoryTotal = 0;
      }
    },

    async obtenerInventoryTotalStock() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'products/inventory/total-stock'
        });

        if (response.status === 200) {
          this.inventoryTotalStock = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener total de stock:', error);
        this.mostrarError('Error al cargar el total de stock');
        this.inventoryTotalStock = 0;
      }
    },

    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: 'is-danger',
        duration: 5000
      });
    },

    limpiarFiltroFechas() {
      this.filtroFechas.inicio = null;
      this.filtroFechas.fin = null;
      this.ventasPorFecha = [];
      this.mensajeTablaVacia = 'Seleccione un rango de fechas para ver las ventas';
    },

    getCustomerName(row) {
      return row.customer && row.customer.name ? row.customer.name : '';
    },

    getCustomerPhone(row) {
      return row.customer && row.customer.phone ? row.customer.phone : '';
    },

    getStatusText(row) {
      if (row.totalDeuda === 0) return 'Pagado';
      if (row.transacciones.some(t => t.paid > 0)) return 'Pago Parcial';
      return 'Pendiente';
    },

    getStatusType(row) {
      if (row.totalDeuda === 0) return 'is-success';
      if (row.transacciones.some(t => t.paid > 0)) return 'is-warning';
      return 'is-danger';
    },
  },

  watch: {
    filtroEstado() {
      this.obtenerAccountsHoldings();
    },
    busquedaCliente() {
      this.obtenerAccountsHoldings();
    }
  },
}
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

.buttons.has-addons .button {
  margin: 0;
}

.mb-5 {
  margin-bottom: 1.5rem;
}

.monthly-sales-list {
  margin: 1rem 0;
}

.month-row {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 4px;
}

.month-row:hover {
  background-color: #f5f5f5;
}

.month-name {
  width: 120px;
  font-weight: 500;
  color: #363636;
}

.amount-badge {
  background-color: #7957d5;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  min-width: 80px;
  text-align: center;
}

.amount-badge.has-amount {
  background-color: #48c78e;
}

.items-count {
  margin-left: auto;
  color: #666;
  font-size: 0.875rem;
}

.monthly-summary {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.summary-columns {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-label {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #363636;
}

@media screen and (max-width: 768px) {
  .historial-ventas {
    padding: 0.5rem;
  }

  .column {
    padding: 0.5rem;
  }

  .card-header-icon .buttons {
    flex-direction: column;
  }

  .card-header-icon .select {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .month-row {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
    padding: 1rem;
  }

  .month-name {
    width: 100%;
  }

  .items-count {
    margin: 0;
  }

  .summary-columns {
    flex-direction: column;
    gap: 1rem;
  }

  .buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .buttons .button {
    width: 100%;
  }
}
</style>