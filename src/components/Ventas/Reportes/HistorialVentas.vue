<template>
  <div class="historial-ventas">
    <div class="tabs-container">
      <b-tabs v-model="activeTab" expanded>
        <!-- Pestaña de Resumen -->
        <b-tab-item label="Resumen" icon="chart-box">
          <ResumenIngresos :isAdmin="isAdmin" />
        </b-tab-item>
        
        <!-- Pestaña de Ventas por Fecha -->
        <b-tab-item label="Ventas por Fecha" icon="calendar-search">
          <FiltroVentas @buscar="obtenerVentasPorFecha" @limpiar="limpiarFiltroFechas">
            <template #tabla-ventas>
              <TablaVentas 
                :ventas="ventasPorFecha" 
                :cargando="cargando.ventas" 
                :mensajeTablaVacia="mensajeTablaVacia"
                @ver-detalles="verDetalles" 
              />
            </template>
          </FiltroVentas>
        </b-tab-item>
        
        <!-- Pestaña de Ventas Mensuales -->
        <b-tab-item label="Ventas Mensuales" icon="chart-timeline-variant">
          <VentasMensuales :isAdmin="isAdmin" />
        </b-tab-item>
      </b-tabs>
    </div>

    <!-- Modal de Detalles de Venta (fuera de las tabs) -->
    <DetallesVenta v-model="modalDetalles.activo" :venta="modalDetalles.venta" />
  </div>
</template>

<script>
import AyudanteSesion from "@/Servicios/AyudanteSesion";
import apiRequest from "@/Servicios/HttpService";
import ResumenIngresos from './HistorialVentas/ResumenIngresos.vue';
import FiltroVentas from './HistorialVentas/FiltroVentas.vue';
import TablaVentas from './HistorialVentas/TablaVentas.vue';
import VentasMensuales from './HistorialVentas/VentasMensuales.vue';
import DetallesVenta from './HistorialVentas/DetallesVenta.vue';

export default {
  name: "HistorialVentas",

  components: {
    ResumenIngresos,
    FiltroVentas,
    TablaVentas,
    VentasMensuales,
    DetallesVenta
  },

  data() {
    return {
      activeTab: 0,
      isAdmin: false,
      ventasPorFecha: [],
      cargando: {
        ventas: false
      },
      mensajeTablaVacia: "Seleccione un rango de fechas para ver las ventas",
      modalDetalles: {
        activo: false,
        venta: {}
      }
    };
  },

  mounted() {
    this.validRol();
  },

  methods: {
    validRol() {
      const { rol } = AyudanteSesion.obtenerDatosSesion();
      this.isAdmin = rol === 'Admin';
    },
    
    async obtenerVentasPorFecha({ startDate, endDate }) {
      this.cargando.ventas = true;
      this.mensajeTablaVacia = "Cargando ventas...";

      try {
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
      this.ventasPorFecha = [];
      this.mensajeTablaVacia =
        "Seleccione un rango de fechas para ver las ventas";
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
.historial-ventas {
  padding: 1rem;
}

.tabs-container {
  margin-bottom: 1.5rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}

/* Estilos para las pestañas */
:deep(.b-tabs .tabs) {
  margin-bottom: 0;
}

:deep(.b-tabs .tab-content) {
  padding: 1.5rem;
  background-color: white;
}

@media screen and (max-width: 768px) {
  .historial-ventas {
    padding: 0.5rem;
  }
  
  :deep(.b-tabs .tab-content) {
    padding: 1rem;
  }
}
</style>