<template>
  <section>
    <b-switch v-model="isActive" @input="handleSwitchChange" >
            {{ isActive ? 'Usuarios activados' : 'Usuarios inactivos' }}
        </b-switch>
    <nav-component :isActive="isActive" :titulo="'Usuarios'" :link="{ path: '/agregar-usuario' }" :texto="'Agregar usuario'" />

    <mensaje-inicial :titulo="`No se han econtrado ${isActive ? 'usuario' : 'usuarios inactivos'}`" :subtitulo="`${isActive ? 'Agraga algunos usuario' : 'usuarios inactivos'}`"
      v-if="usuarios.length < 1" />
    <b-table :data="usuarios"  v-if="usuarios.length > 0">
      <b-table-column field="usuario" label="Nombre de usuario" sortable v-slot="props">
        {{ props.row.username }}
      </b-table-column>

      <b-table-column field="nombre" label="Nombre completo" sortable v-slot="props">
        {{ props.row.name }}
      </b-table-column>

      <b-table-column field="telefono" label="Teléfono" sortable v-slot="props">
        {{ props.row.phone }}
      </b-table-column>

      <b-table-column field="acciones" label="Acciones" centered v-slot="props">
        <div class="buttons is-centered">


          <b-button v-if="isActive" size="is-small" class="btn-link" icon-left="key" @click="changePass(props.row.id)"></b-button>
          <b-button class="btn-link-primary" style="width: 100px" @click="isActiveUser(props.row.id)" size="is-small">{{ props.row.isActive ?
            'Desactivar' : 'Activar' }}</b-button>
          <b-button v-if="isActive" class="btn-ghost" size="is-small" icon-left="pen" @click="editar(props.row.id)">Editar</b-button>

          <b-button v-if="isActive" size="is-small" type="is-primary" icon-left="history" @click="verHistorial(props.row)">Historial
            Caja</b-button>
        </div>
      </b-table-column>
    </b-table>
    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>

    <b-modal v-model="isHistorialModalActive" :width="640" scroll="keep">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Historial de Caja - {{ usuarioSeleccionado ? usuarioSeleccionado.name : '' }}
          </p>
        </header>
        <div class="card-content">
          <b-table  :data="historialCaja" :loading="cargandoHistorial" :mobile-cards="true" default-sort="date"
            default-sort-direction="desc">

            <b-table-column field="date" label="Fecha" sortable v-slot="props">
              {{ formatDate(props.row.date) }}
            </b-table-column>
            <b-table-column class="state" field="state" label="Estado de" sortable v-slot="props">
              {{ props.row.state == 'closed' ? 'Cerrada' : 'Abierta' }}
            </b-table-column>

            <b-table-column field="cashInHand" label="Efectivo" numeric sortable v-slot="props">
              <template v-if="props.row.state == 'closed'">
                {{ formatCurrency(props.row.cashInHand) }}
              </template>
              <template v-else>-</template>
            </b-table-column>

            <b-table-column field="totalSales" label="Ventas" numeric sortable v-slot="props">
              <template v-if="props.row.state == 'closed'">
                {{ formatCurrency(props.row.totalSales) }}
              </template>
              <template v-else>-</template>
            </b-table-column>

            <!-- <b-table-column field="totalPayments" label="Pagos" numeric sortable v-slot="props">
                {{ formatCurrency(props.row.totalPayments) }}
              </b-table-column> -->

            <b-table-column field="expectedCash" label="Esperado" numeric sortable v-slot="props">
              <template v-if="props.row.state == 'closed'">
                {{ formatCurrency(props.row.expectedCash) }}
              </template>
              <template v-else>-</template>
            </b-table-column>

            <b-table-column field="discrepancy" label="Discrepancia" numeric sortable v-slot="props">
              <template v-if="props.row.state == 'closed'">
                <span
                  :class="{ 'has-text-danger': props.row.discrepancy > 0, 'has-text-success': props.row.discrepancy < 0 }">
                  {{ formatCurrency(props.row.discrepancy) }}
                </span>
              </template>
              <template v-else>-</template>
            </b-table-column>
          </b-table>
        </div>
      </div>
    </b-modal>
  </section>
</template>

<script>
import MensajeInicial from '../Extras/MensajeInicial'
import NavComponent from '../Extras/NavComponent'
import apiRequest from '../../Servicios/HttpService';

export default {
  name: "UsuariosComponent",
  components: { MensajeInicial, NavComponent },

  data: () => ({
    isActive: true,
    cargando: false,
    cargandoHistorial: false,
    usuarios: [],
    historialCaja: [],
    isHistorialModalActive: false,
    usuarioSeleccionado: null
  }),

  mounted() {
    this.obtenerUsuarios()
  },

  methods: {
    handleSwitchChange(value) {
      this.isActive = value;
      this.obtenerUsuarios();
    },
    // async eliminar(idUsuario) {
    //   this.$buefy.dialog.confirm({
    //     title: 'Eliminar usuario',
    //     message: 'Seguro que quieres <b>eliminar</b> este usuario? Esta acción no se puede revertir.',
    //     confirmText: 'Sí, eliminar',
    //     cancelText: 'Cancelar',
    //     type: 'is-danger',
    //     hasIcon: true,
    //     onConfirm: () => {
    //       this.cargando = true
    //       apiRequest({
    //         method: 'DELETE', 
    //         path: `users/${idUsuario}`
    //       })
    //       .then(resultado => {
    //         if(!resultado.data) {
    //           this.$buefy.toast.open('Error al eliminar')
    //           this.cargando = false
    //           return
    //         }

    //         if(resultado.data){
    //           this.cargando = false
    //           this.$buefy.toast.open({
    //             type: 'is-info',
    //             message: 'Usuario eliminado.'
    //           })
    //           this.obtenerUsuarios()
    //         }
    //       })
    //     }
    //   })
    // },

    async isActiveUser(idUsuario) {
      this.cargando = true
      const { status, data } = await apiRequest({
        method: 'POST',
        path: `users/${idUsuario}/isActive`
      })

      if (status == 201) {
        this.cargando = false
        this.$buefy.toast.open({
          type: 'is-info',
          message: `El usuario ${data.username} ha sido ${data.isActive ? 'activado' : 'desactivado'}.`
        })
        this.obtenerUsuarios()

      } else {
        this.$buefy.toast.open('Error al cambiar el estado del usuario')
        this.cargando = false
        return
      }

    },

    editar(idUsuario) {
      this.$router.push({
        name: "EditarUsuario",
        params: { id: idUsuario }
      })
    },

    changePass(idUsuario) {
      this.$router.push({
        name: "CambiarPassword",
        params: { id: idUsuario }
      })
    },

    async verHistorial(usuario) {
      this.usuarioSeleccionado = usuario;
      this.isHistorialModalActive = true;
      this.cargandoHistorial = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `cash-register/historial`
        });
        this.historialCaja = response.data.filter(registro => registro.user.id === usuario.id);
      } catch (error) {
        console.error('Error al obtener el historial de cajas:', error);
        this.$buefy.toast.open({
          message: 'Error al cargar el historial de cajas',
          type: 'is-danger'
        });
      } finally {
        this.cargandoHistorial = false;
      }
    },

    obtenerUsuarios() {
      this.cargando = true
      apiRequest({
        method: 'GET',
        path: 'users'
      })
        .then(response => {
          this.usuarios = response.data.filter((user) => user.isActive === this.isActive )
          this.cargando = false
        })
        .catch(error => {
          console.error('Error fetching users:', error)
          this.cargando = false
        })
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-MX', options);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    }
  }
}
</script>

<style scoped>
.buttons.is-centered {
  justify-content: center;
}

.card-content {
  max-height: 400px;
  overflow-y: auto;
}
</style>

