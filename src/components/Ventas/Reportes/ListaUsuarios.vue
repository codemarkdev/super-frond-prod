<template>
  <div class="card dashboard-card mb-6" v-if="isAdmin">
    <header class="card-header">
      <p class="card-header-title">
        <b-icon icon="account-multiple" type="is-info"></b-icon>
        Lista de Usuarios
      </p>
    </header>
    <div class="card-content">
      <b-field grouped>
       
        
      </b-field>
      
      <b-table 
        :data="usuariosFiltrados" 
        :loading="cargando" 
        :striped="true" 
        :hoverable="true"
        :selected.sync="usuarioSeleccionado"
        @select="seleccionarUsuario">
        <b-table-column field="id" label="ID" v-slot="props">
          {{ props.row.id }}
        </b-table-column>
        <b-table-column field="username" label="Usuario" v-slot="props">
          {{ props.row.username }}
        </b-table-column>
        <b-table-column field="name" label="Nombre" v-slot="props">
          {{ props.row.name }}
        </b-table-column>
        <b-table-column field="phone" label="Teléfono" v-slot="props">
          {{ props.row.phone }}
        </b-table-column>
      </b-table>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "ListaUsuarios",
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      usuarios: [],
      usuarioSeleccionado: null,
      busqueda: '',
      cargando: false
    };
  },
  
  computed: {
    usuariosFiltrados() {
      if (!this.busqueda) {
        return this.usuarios;
      }
      
      const busquedaLower = this.busqueda.toLowerCase();
      return this.usuarios.filter(usuario => 
        usuario.username.toLowerCase().includes(busquedaLower) ||
        usuario.name.toLowerCase().includes(busquedaLower) ||
        usuario.id.toString().includes(busquedaLower)
      );
    }
  },
  
  mounted() {
    this.obtenerUsuarios();
  },
  
  methods: {
    async obtenerUsuarios() {
      this.cargando = true;
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
        this.cargando = false;
      }
    },
    
    seleccionarUsuario(usuario) {
      this.usuarioSeleccionado = usuario;
      this.$emit('usuario-seleccionado', usuario);
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
</style>