<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <img src="@/assets/logo.png" class="sidebar-logo" alt="Logo" />
      <span>{{ usuario }}</span>
    </div>
    <nav class="sidebar-menu">
      <b-navbar-item tag="router-link" :to="{ path: '/' }" class="sidebar-item">
        <b-icon icon="view-dashboard" size="is-medium"></b-icon>
        <span>Inicio</span>
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/inventario' }" class="sidebar-item">
        <b-icon icon="chart-bar-stacked" size="is-medium"></b-icon>
        <span>Inventario</span>
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/marcas-y-categorias' }" class="sidebar-item">
        <b-icon icon="archive" size="is-medium"></b-icon>
        <span>Marcas y categorías</span>
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/realizar-venta' }" class="sidebar-item">
        <b-icon icon="cash-fast" size="is-medium"></b-icon>
        <span>Vender</span>
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/usuarios' }" class="sidebar-item">
        <b-icon icon="account" size="is-medium"></b-icon>
        <span>Usuarios</span>
      </b-navbar-item>
      <b-navbar-item tag="router-link" :to="{ path: '/clientes' }" class="sidebar-item">
        <b-icon icon="account-supervisor" size="is-medium"></b-icon>
        <span>Clientes</span>
      </b-navbar-item>
      <b-navbar-dropdown label="Reportes" class="sidebar-item">
        <b-navbar-item tag="router-link" :to="{ path: '/reporte-ventas' }">
          <span>Ventas</span>
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/reporte-cuentas' }">
          <span>Cuentas</span>
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/reporte-apartados' }">
          <span>Apartados</span>
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/reporte-cotizaciones' }">
          <span>Cotizaciones</span>
        </b-navbar-item>
      </b-navbar-dropdown>
      <b-navbar-item tag="router-link" :to="{ path: '/configurar' }" class="sidebar-item">
        <b-icon icon="cogs" size="is-medium"></b-icon>
        <span>Configurar</span>
      </b-navbar-item>
    </nav>
    <div class="sidebar-footer">
      <button class="button is-danger" @click="salir">Salir</button>
    </div>
  </div>
</template>

<script>
import AyudanteSesion from '../Servicios/AyudanteSesion';

export default {
  name: 'SidebarComponent',
  data: () => ({
    usuario: '',
  }),
  mounted() {
    this.usuario = AyudanteSesion.obtenerDatosSesion().usuario;
  },
  methods: {
    salir() {
      AyudanteSesion.cerrarSesion();
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #34495e;
  color: #ecf0f1;
}

.sidebar-logo {
  max-height: 50px;
  margin-bottom: 10px;
}

.sidebar-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.sidebar-item:hover {
  background-color: #3b5998;
}

.sidebar-item span {
  margin-left: 10px;
}

.sidebar-footer {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.button.is-danger {
  width: 100%;
  background-color: #e74c3c;
  color: white;
  font-weight: bold;
  transition: background-color 0.3s;
}

.button.is-danger:hover {
  background-color: #c0392b;
}
</style>