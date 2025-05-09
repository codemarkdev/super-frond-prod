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
            <calendario-selector v-model="filtroFechas.inicio" placeholder="dd/mm/aaaa" />
          </b-field>
        </div>
        <div class="column is-4">
          <b-field label="Fecha Final">
            <calendario-selector v-model="filtroFechas.fin" placeholder="dd/mm/aaaa" />
          </b-field>
        </div>
        <div class="column is-4">
          <b-field label="Buscar">
            <div class="buttons">
              <b-button type="is-primary" icon-left="magnify" @click="buscarVentas"
                :loading="cargando" :disabled="!filtroFechas.inicio || !filtroFechas.fin">
                Buscar
              </b-button>
              <b-button type="is-light" icon-left="close-circle" @click="limpiarFiltro"
                :disabled="!filtroFechas.inicio && !filtroFechas.fin">
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
  name: "FiltroVentas",
  
  components: {
    CalendarioSelector
  },
  
  data() {
    return {
      filtroFechas: {
        inicio: null,
        fin: null
      },
      cargando: false
    };
  },
  
  methods: {
    buscarVentas() {
      if (!this.filtroFechas.inicio || !this.filtroFechas.fin) {
        return;
      }
      
      this.cargando = true;
      
      // Formatear fechas para la API
      const formatearFecha = (fecha) => {
        const d = new Date(fecha);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const startDate = formatearFecha(this.filtroFechas.inicio);
      const endDate = formatearFecha(this.filtroFechas.fin);
      
      // Emitir evento para que el componente padre realice la búsqueda
      this.$emit('buscar', { startDate, endDate });
      
      this.cargando = false;
    },
    
    limpiarFiltro() {
      this.filtroFechas.inicio = null;
      this.filtroFechas.fin = null;
      this.$emit('limpiar');
    }
  }
};
</script>

<style scoped>
.buttons {
  display: flex;
  gap: 0.5rem;
}

.mb-5 {
  margin-bottom: 1.5rem;
}

@media screen and (max-width: 768px) {
  .buttons {
    flex-direction: column;
    width: 100%;
  }

  .buttons .button {
    width: 100%;
  }
}
</style>