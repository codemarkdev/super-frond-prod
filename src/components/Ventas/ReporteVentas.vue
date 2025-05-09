<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <b-tabs v-model="activeTab" expanded>
        <!-- Historial de Ventas -->
        <b-tab-item label="Historial de Ventas" icon="history">
          <HistorialVentas class="tab-content-section" />
        </b-tab-item>
        
        <!-- Usuarios y Ventas -->
        <b-tab-item label="Usuarios y Ventas" icon="account-group" :disabled="!isAdmin">
          <div class="tab-content-section">
            <ListaUsuarios 
              :isAdmin="isAdmin" 
              @usuario-seleccionado="seleccionarUsuario" 
            />
            <IngresosUsuario 
              :isAdmin="isAdmin" 
              :usuarioSeleccionadoExterno="usuarioSeleccionado" 
              class="mt-4" 
            />
            <VentasMensualesUsuario 
              :isAdmin="isAdmin" 
              :usuarioSeleccionadoExterno="usuarioSeleccionado" 
              class="mt-4" 
            />
          </div>
        </b-tab-item>
        
        <!-- Productos y Categorías -->
        <b-tab-item label="Productos y Categorías" icon="package-variant">
          <div class="tab-content-section">
            <ProductosVendidos :isAdmin="isAdmin" />
            <ProductosMasVendidos :isAdmin="isAdmin" class="mt-4" />
            <TotalesPorCategoria :isAdmin="isAdmin" class="mt-4" />
          </div>
        </b-tab-item>
        
        <!-- Reportes Fiscales -->
        <b-tab-item label="Reportes Fiscales" icon="file-document" :disabled="!isAdmin">
          <div class="tab-content-section">
            <ReporteIVA :isAdmin="isAdmin" />
          </div>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import HistorialVentas from "./Reportes/HistorialVentas.vue";
import ListaUsuarios from "./Reportes/ListaUsuarios.vue";
import IngresosUsuario from "./Reportes/IngresosUsuario.vue";
import VentasMensualesUsuario from "./Reportes/VentasMensualesUsuario.vue";
import ProductosVendidos from "./Reportes/ProductosVendidos.vue";
import ReporteIVA from "./Reportes/ReporteIVA.vue";
import ProductosMasVendidos from "./Reportes/ProductosMasVendidos.vue";
import TotalesPorCategoria from "./Reportes/TotalesPorCategoria.vue";
import '@/components/stilos/detalles.css';
import AyudanteSesion from "@/Servicios/AyudanteSesion";

export default {
  name: "ReporteVentas",

  components: {
    HistorialVentas,
    ListaUsuarios,
    IngresosUsuario,
    VentasMensualesUsuario,
    ProductosVendidos,
    ReporteIVA,
    ProductosMasVendidos,
    TotalesPorCategoria
  },

  data() {
    return {
      activeTab: 0,
      isAdmin: false,
      usuarioSeleccionado: null
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
    
    seleccionarUsuario(usuario) {
      this.usuarioSeleccionado = usuario;
    }
  }
};
</script>

