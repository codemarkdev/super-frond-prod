<template>
  <div class="card dashboard-card mb-6" v-if="isAdmin">
    <header class="card-header">
      <p class="card-header-title">
        <b-icon icon="chart-bar" type="is-primary"></b-icon>
        Ventas Mensuales por Usuario
      </p>
    </header>
    <div class="card-content">
      <div class="is-flex is-align-items-end" :style="{ gap: '1rem' }">
        <div class="control is-expanded">
          <b-field label="Usuario">
            <b-select v-model="usuarioSeleccionado" placeholder="Seleccione un usuario" expanded>
              <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario">
                {{ usuario.name }} ({{ usuario.username }})
              </option>
            </b-select>
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
          <b-button type="is-primary" @click="obtenerVentasMensualesUsuario" 
            :loading="cargando"
            :disabled="!usuarioSeleccionado">
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
        <div class="subtitle mt-4 mb-2">
          Ventas mensuales de {{ usuarioSeleccionado ? usuarioSeleccionado.name : '' }} - {{ filtroVentasUsuario.year }}
        </div>
        <b-table :data="ventasMensualesUsuario" :loading="cargando" :striped="true" :hoverable="true">
          <b-table-column field="month" label="Mes" v-slot="props">
            {{ obtenerNombreMes(props.row.month) }}
          </b-table-column>
          <b-table-column field="totalSales" label="Total Ventas" numeric v-slot="props">
            ${{ formatNumber(props.row.totalSales) }}
          </b-table-column>
        </b-table>
      </div>
      
      <div v-else-if="!cargando" class="has-text-centered mt-4">
        <p class="is-size-5 has-text-grey">
          {{ mensajeTablaVacia }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";
import { generateYearRange } from "@/helpers/yearHelper";

export default {
  name: "VentasMensualesUsuario",
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    },
    usuarioSeleccionadoExterno: {
      type: Object,
      default: null
    }
  },
  
  data() {
    const currentYear = new Date().getFullYear();
    
    return {
      usuarios: [],
      usuarioSeleccionado: null,
      ventasMensualesUsuario: [],
      filtroVentasUsuario: {
        year: currentYear,
      },
      availableYears: generateYearRange(2000, currentYear),
      cargando: false,
      cargandoUsuarios: false,
      mensajeTablaVacia: "Seleccione un usuario y año para ver las ventas mensuales"
    };
  },
  
  watch: {
    usuarioSeleccionadoExterno(nuevoUsuario) {
      if (nuevoUsuario) {
        this.usuarioSeleccionado = nuevoUsuario;
        this.obtenerVentasMensualesUsuario();
      }
    }
  },
  
  mounted() {
    this.obtenerUsuarios();
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
    
    async obtenerUsuarios() {
      this.cargandoUsuarios = true;
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
        this.cargandoUsuarios = false;
      }
    },
    
    async obtenerVentasMensualesUsuario() {
      if (!this.usuarioSeleccionado) {
        this.mostrarError("Por favor, seleccione un usuario");
        return;
      }

      this.ventasMensualesUsuario = []; // Limpiar datos antes de la consulta
      this.cargando = true;
      this.mensajeTablaVacia = "Cargando datos...";
      
      try {
        const response = await apiRequest({
          method: "GET",
          path: `users/${this.usuarioSeleccionado.id}/monthly-sales?year=${this.filtroVentasUsuario.year}`,
        });

        if (response?.data) {
          this.ventasMensualesUsuario = Array.isArray(response.data)
            ? response.data
            : [];
            
          if (this.ventasMensualesUsuario.length === 0) {
            this.mensajeTablaVacia = `No hay ventas registradas para ${this.usuarioSeleccionado.name} en ${this.filtroVentasUsuario.year}`;
          }
        }
      } catch (error) {
        console.error("Error al obtener ventas mensuales del usuario:", error);
        this.mostrarError("Error al cargar las ventas mensuales del usuario");
        this.mensajeTablaVacia = "Error al cargar los datos";
      } finally {
        this.cargando = false;
      }
    },
    
    limpiarVentasMensualesUsuario() {
      this.ventasMensualesUsuario = [];
      this.usuarioSeleccionado = null;
      this.filtroVentasUsuario.year = new Date().getFullYear();
      this.mensajeTablaVacia = "Seleccione un usuario y año para ver las ventas mensuales";
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
.mb-6 {
  margin-bottom: 1.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>