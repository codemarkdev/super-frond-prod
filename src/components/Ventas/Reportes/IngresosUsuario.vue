<template>
  <div>
    <!-- Ingresos Diarios del Usuario -->
    <div class="card dashboard-card mb-6" v-if="isAdmin">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="cash-register" type="is-info"></b-icon>
          Ingresos Diarios del Usuario
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
          <div class="control align-self-flex-end">
            <b-button type="is-primary" @click="obtenerIngresosDiariosUsuario" 
              :loading="cargando.ingresosDiarios"
              :disabled="!usuarioSeleccionado">
              Consultar
            </b-button>
          </div>
          <div class="control align-self-flex-end">
            <b-button type="is-light" @click="limpiarIngresosDiariosUsuario"
              :disabled="!ingresosDiarios.totalIncome || ingresosDiarios.totalIncome === '0.00'">
              Limpiar
            </b-button>
          </div>
        </div>

        <div class="columns mt-4">
          <div class="column">
            <div class="box has-text-centered">
              <p class="heading">Ingresos de Hoy</p>
              <p class="title">${{ formatNumber(ingresosDiarios.totalIncome) }}</p>
              <p class="subtitle is-6">
                <span v-if="usuarioSeleccionado">{{ usuarioSeleccionado.name }}</span>
                <span v-else>Seleccione un usuario</span>
                - {{ obtenerFechaActual() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ingresos Semanales del Usuario -->
    <div class="card dashboard-card mb-6" v-if="isAdmin">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="calendar-week" type="is-success"></b-icon>
          Ingresos Semanales del Usuario
        </p>
      </header>
      <div class="card-content">
        <div class="is-flex is-align-items-end" :style="{ gap: '1rem' }">
          <div class="control is-expanded">
            <b-field label="Usuario">
              <b-select v-model="usuarioSeleccionadoSemanal" placeholder="Seleccione un usuario" expanded>
                <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario">
                  {{ usuario.name }} ({{ usuario.username }})
                </option>
              </b-select>
            </b-field>
          </div>
          <div class="control align-self-flex-end">
            <b-button type="is-primary" @click="obtenerIngresosSemanalesUsuario" 
              :loading="cargando.ingresosSemanales"
              :disabled="!usuarioSeleccionadoSemanal">
              Consultar
            </b-button>
          </div>
          <div class="control align-self-flex-end">
            <b-button type="is-light" @click="limpiarIngresosSemanalesUsuario"
              :disabled="!ingresosSemanales.totalIncome || ingresosSemanales.totalIncome === '0.00'">
              Limpiar
            </b-button>
          </div>
        </div>

        <div class="columns mt-4">
          <div class="column">
            <div class="box has-text-centered">
              <p class="heading">Ingresos de la Semana</p>
              <p class="title">${{ formatNumber(ingresosSemanales.totalIncome) }}</p>
              <p class="subtitle is-6">
                <span v-if="usuarioSeleccionadoSemanal">{{ usuarioSeleccionadoSemanal.name }}</span>
                <span v-else>Seleccione un usuario</span>
                - {{ obtenerRangoSemanaActual() }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "IngresosUsuario",
  
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
    return {
      usuarios: [],
      usuarioSeleccionado: null,
      usuarioSeleccionadoSemanal: null,
      ingresosDiarios: {
        totalIncome: "0.00"
      },
      ingresosSemanales: {
        totalIncome: "0.00"
      },
      cargando: {
        usuarios: false,
        ingresosDiarios: false,
        ingresosSemanales: false
      }
    };
  },
  
  watch: {
    usuarioSeleccionadoExterno(nuevoUsuario) {
      if (nuevoUsuario) {
        this.usuarioSeleccionado = nuevoUsuario;
        this.usuarioSeleccionadoSemanal = nuevoUsuario;
        this.obtenerIngresosDiariosUsuario();
        this.obtenerIngresosSemanalesUsuario();
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
    
    async obtenerIngresosDiariosUsuario() {
      if (!this.usuarioSeleccionado) {
        this.mostrarError("Por favor, seleccione un usuario");
        return;
      }

      this.cargando.ingresosDiarios = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `users/${this.usuarioSeleccionado.id}/today-income`,
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
    
    async obtenerIngresosSemanalesUsuario() {
      if (!this.usuarioSeleccionadoSemanal) {
        this.mostrarError("Por favor, seleccione un usuario");
        return;
      }

      this.cargando.ingresosSemanales = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: `users/${this.usuarioSeleccionadoSemanal.id}/weekly-income`,
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
    
    limpiarIngresosDiariosUsuario() {
      this.ingresosDiarios.totalIncome = "0.00";
      this.usuarioSeleccionado = null;
    },
    
    limpiarIngresosSemanalesUsuario() {
      this.ingresosSemanales.totalIncome = "0.00";
      this.usuarioSeleccionadoSemanal = null;
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
</style>