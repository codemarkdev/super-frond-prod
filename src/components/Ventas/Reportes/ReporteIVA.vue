<template>
  <div>
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
              <calendario-selector v-model="filtroIVARango.startDate" placeholder="dd/mm/aaaa" />
            </b-field>
          </div>
          <div class="control">
            <b-field label="Fecha de Fin">
              <calendario-selector v-model="filtroIVARango.endDate" placeholder="dd/mm/aaaa" />
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
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";
import { generateYearRange } from "@/helpers/yearHelper";
import CalendarioSelector from '../../Extras/CalendarioSelector.vue';

export default {
  name: "ReporteIVA",
  
  components: {
    CalendarioSelector
  },
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    const currentYear = new Date().getFullYear();
    
    return {
      filtroIVA: {
        year: currentYear,
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
      cargando: {
        iva: false,
        ivaRango: false
      }
    };
  },
  
  mounted() {
    this.obtenerIVAMensual();
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
        this.mostrarError("Por favor, seleccione un rango de fechas válido");
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