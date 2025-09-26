<template>
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
            <calendario-selector
              v-model="filtroFechas.inicio"
              placeholder="dd/mm/aaaa"
            />
          </b-field>
        </div>

        <div class="column is-4">
          <b-field label="Fecha Final">
            <calendario-selector
              v-model="filtroFechas.fin"
              placeholder="dd/mm/aaaa"
            />
          </b-field>
        </div>

        <div class="column is-4">
          <b-field label="Buscar">
            <div class="buttons">
              <b-button
                type="is-primary"
                icon-left="magnify"
                @click="buscarVentas"
                :loading="cargando"
                :disabled="!filtroFechas.inicio || !filtroFechas.fin"
              >
                Buscar
              </b-button>

              <b-button
                type="is-light"
                icon-left="close-circle"
                @click="limpiarFiltro"
                :disabled="!filtroFechas.inicio && !filtroFechas.fin"
              >
                Limpiar
              </b-button>
            </div>
          </b-field>
        </div>
      </div>

      <slot name="tabla-ventas"></slot>
    </div>
  </div>
</template>

<script>
import CalendarioSelector from '../../../Extras/CalendarioSelector.vue';

export default {
  name: 'FiltroVentas',
  components: { CalendarioSelector },

  data() {
    const hoy = this.hoy();
    return {
      filtroFechas: {
        inicio: hoy, // HOY por defecto
        fin: hoy     // HOY por defecto
      },
      cargando: false,
      // ❌ _midnightTimer
      midnightTimer: null // ✅ sin guion bajo
    };
  },

  mounted() {
    this.$nextTick(() => this.buscarVentas());
    this.programarRolloverMedianoche();
    document.addEventListener('visibilitychange', this.onFocusRefrescar);
  },

  // Vue 2: beforeDestroy; (si usas Vue 3, cambia a beforeUnmount)
  beforeDestroy() {
    if (this.midnightTimer) clearTimeout(this.midnightTimer);
    document.removeEventListener('visibilitychange', this.onFocusRefrescar);
  },

  methods: {
    hoy() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },

    formatearFecha(fecha) {
      const d = new Date(fecha);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },

    buscarVentas() {
      if (!this.filtroFechas.inicio || !this.filtroFechas.fin) return;

      this.cargando = true;

      const startDate = this.formatearFecha(this.filtroFechas.inicio);
      const endDate = this.formatearFecha(this.filtroFechas.fin);

      this.$emit('buscar', { startDate, endDate });

      this.cargando = false;
    },

    limpiarFiltro() {
      const hoy = this.hoy();
      this.filtroFechas.inicio = hoy;
      this.filtroFechas.fin = hoy;

      this.$emit('limpiar');
      this.buscarVentas();
    },

    programarRolloverMedianoche() {
      if (this.midnightTimer) clearTimeout(this.midnightTimer);

      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const ms = nextMidnight - now;

      this.midnightTimer = setTimeout(() => {
        const hoy = this.hoy();
        this.filtroFechas.inicio = hoy;
        this.filtroFechas.fin = hoy;
        this.buscarVentas();
        this.programarRolloverMedianoche();
      }, ms);
    },

    onFocusRefrescar() {
      if (document.visibilityState === 'visible') {
        const today = this.hoy().toDateString();
        const inicioStr = new Date(this.filtroFechas.inicio).toDateString();
        if (today !== inicioStr) {
          const hoy = this.hoy();
          this.filtroFechas.inicio = hoy;
          this.filtroFechas.fin = hoy;
          this.buscarVentas();
          this.programarRolloverMedianoche();
        }
      }
    }
  }
};
</script>

<style scoped>
.buttons { display: flex; gap: 0.5rem; }
.mb-5 { margin-bottom: 1.5rem; }

@media screen and (max-width: 768px) {
  .buttons { flex-direction: column; width: 100%; }
  .buttons .button { width: 100%; }
}
</style>
