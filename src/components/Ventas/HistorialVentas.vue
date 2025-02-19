<template>
  <div class="historial-ventas">
    <header class="header">
      <h1 class="title is-2">Historial de Ventas</h1>
      <p class="subtitle is-5">
        <b-icon icon="calendar-today"></b-icon>
        {{ new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </p>
    </header>

    <!-- Resumen de Ingresos -->
    <div class="columns is-multiline">
      <!-- Ingreso Total -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">INGRESO TOTAL</p>
                    <p class="title is-4">${{ formatNumber(ingresoTotal) }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="cash-multiple" size="is-large" type="is-success"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';

export default {
  name: 'HistorialVentas',

  data() {
    return {
      ingresoTotal: 0,
      ingresoHoy: 0,
      ingresoSemanal: 0,
      ingresoMensual: 0,
      ventasPorFecha: [],
      ventasMensuales: [],
      ventasDiarias: [],
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
        totalIngresos: false,
        ingresosHoy: false,
        ingresosSemana: false,
        ingresosMes: false,
        ventasMensuales: false,
        ventasDiarias: false
      },
      meses: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      availableYears: Array.from(
        { length: 5 }, 
        (_, i) => new Date().getFullYear() - i
      ),
      mensajeTablaVacia: 'Seleccione un rango de fechas para ver las ventas'
    }
  },

  mounted() {
    this.cargarDatos();
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
    }
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
          this.obtenerIngresoTotal(),
          this.obtenerIngresoHoy(),
          this.obtenerIngresoSemanal(),
          this.obtenerIngresoMensual(),
          this.obtenerVentasMensuales(),
          this.obtenerVentasDiarias()
        ]);
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
        
        console.log('Consultando ventas:', { startDate, endDate });
        
        const response = await apiRequest({
          method: 'GET',
          path: `sales?startDate=${startDate}&endDate=${endDate}`
        });

        console.log('Respuesta ventas por fecha:', response);

        if (response.status === 200) {
          if (Array.isArray(response.data)) {
            this.ventasPorFecha = response.data.map(venta => ({
              date: venta.date,
              total: venta.total || 0,
              items: Array.isArray(venta.products) ? venta.products.length : 
                     (typeof venta.items === 'number' ? venta.items : 0)
            }));
            
            if (this.ventasPorFecha.length === 0) {
              this.mensajeTablaVacia = 'No se encontraron ventas en el período seleccionado';
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

    async obtenerIngresoTotal() {
      this.cargando.totalIngresos = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sales/total-income'
        });

        console.log('Respuesta ingreso total:', response);

        if (response.status === 200) {
          this.ingresoTotal = response.data || 0;
        }
      } catch (error) {
        console.error('Error al obtener ingreso total:', error);
        this.mostrarError('Error al cargar el ingreso total');
        this.ingresoTotal = 0;
      } finally {
        this.cargando.totalIngresos = false;
      }
    },

    async obtenerIngresoHoy() {
      this.cargando.ingresosHoy = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'sales/today-income'
        });

        console.log('Respuesta ingreso hoy:', response);

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

        console.log('Respuesta ingreso semanal:', response);

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

        console.log('Respuesta ingreso mensual:', response);

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

    async obtenerVentasMensuales() {
      this.cargando.ventasMensuales = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `sales/monthly/${this.yearFilter}`
        });

        console.log('Respuesta ventas mensuales:', response);

        if (response.status === 200) {
          const ventasPorMes = Array.isArray(response.data) ? response.data : [];
          console.log('Datos recibidos de ventas por mes:', ventasPorMes);
          
          const añoActual = new Date().getFullYear();
          const mesActualNum = new Date().getMonth() + 1;
          
          // Crear array con todos los meses hasta el actual
          this.ventasMensuales = this.meses.map((_, index) => {
            const numeroMes = index + 1;
            
            // Solo filtrar meses futuros si estamos en el año actual
            if (this.yearFilter === añoActual && numeroMes > mesActualNum) {
              return null;
            }

            // Buscar datos del mes en la respuesta de la API
            const datosMes = ventasPorMes.find(v => v.month === numeroMes);
            
            return {
              month: numeroMes,
              // Usar totalSales en lugar de total y convertir a número
              total: datosMes ? parseFloat(datosMes.totalSales) : 0,
              // Calcular items desde products si existe, o usar 0
              items: datosMes && Array.isArray(datosMes.products) ? datosMes.products.length : 0
            };
          }).filter(Boolean); // Eliminar meses nulos (futuros)

          console.log('Ventas mensuales procesadas:', this.ventasMensuales);
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
        console.log('Consultando ventas diarias:', {
          mes: this.filtrosDiarios.mes,
          año: this.filtrosDiarios.año
        });

        const response = await apiRequest({
          method: 'GET',
          path: `sales/daily/${this.filtrosDiarios.mes}/${this.filtrosDiarios.año}`
        });

        console.log('Respuesta ventas diarias:', response);

        if (response.status === 200) {
          // Procesar los datos recibidos
          this.ventasDiarias = Array.isArray(response.data) ? response.data.map(venta => {
            // Convertir la fecha a objeto Date
            const fecha = new Date(venta.day || venta.date);
            return {
              date: fecha,
              // Usar totalSales en lugar de total y convertir a número
              total: venta.totalSales ? parseFloat(venta.totalSales) : 0,
              // Obtener items desde products si existe
              items: Array.isArray(venta.products) ? venta.products.length : (venta.items || 0)
            };
          }) : [];

          // Ordenar por fecha
          this.ventasDiarias.sort((a, b) => a.date - b.date);
          
          console.log('Ventas diarias procesadas:', this.ventasDiarias);
        }
      } catch (error) {
        console.error('Error al obtener las ventas diarias:', error);
        this.mostrarError('Error al cargar las ventas diarias');
        this.ventasDiarias = [];
      } finally {
        this.cargando.ventasDiarias = false;
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
  }
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

