<template>
  <div class="card mb-5" v-if="isAdmin">
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

    <div class="ventas-mensuales-content" :class="{ 'is-loading': cargando }">
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
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "VentasMensuales",
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      ventasMensuales: [],
      yearSeleccionado: new Date().getFullYear(),
      cargando: false,
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
      ]
    };
  },
  
  computed: {
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
    this.obtenerVentasMensuales(this.yearSeleccionado);
  },
  
  methods: {
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
    
    getNombreMes(numeroMes) {
      return this.meses[numeroMes - 1].charAt(0).toUpperCase() + this.meses[numeroMes - 1].slice(1);
    },
    
    async obtenerVentasMensuales(year) {
      this.cargando = true;
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
        this.cargando = false;
      }
    },
    
    cambiarYear(year) {
      this.yearSeleccionado = year;
      this.obtenerVentasMensuales(year);
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

<style scoped>
.mb-5 {
  margin-bottom: 1.5rem;
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
  .ventas-mensuales-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .summary-item {
    padding: 0.5rem;
  }
}
</style>