<template>
  <section>
    <b-switch v-model="isActive" @input="handleSwitchChange">
      {{ isActive ? 'Usuarios activados' : 'Usuarios inactivos' }}
    </b-switch>
    <nav-component :isActive="isActive" :titulo="'Usuarios'" :link="{ path: '/agregar-usuario' }" :texto="'Agregar usuario'" />

    <mensaje-inicial :titulo="`No se han econtrado ${isActive ? 'usuario' : 'usuarios inactivos'}`" :subtitulo="`${isActive ? 'Agraga algunos usuario' : 'usuarios inactivos'}`"
      v-if="usuarios.length < 1" />
    <b-table :data="usuarios" v-if="usuarios.length > 0">
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

    <!-- Modal mejorado para el historial de caja -->
    <b-modal v-model="isHistorialModalActive" :width="720" scroll="keep" trap-focus :destroy-on-hide="false" aria-role="dialog" aria-modal>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span class="icon-text">
              <span class="icon">
                <i class="mdi mdi-history"></i>
              </span>
              <span>Historial de Caja - {{ usuarioSeleccionado ? usuarioSeleccionado.name : '' }}</span>
            </span>
          </p>
          <button class="delete" aria-label="close" @click="isHistorialModalActive = false"></button>
        </header>
        
        <section class="modal-card-body">
          <!-- Estado de carga -->
          <div v-if="cargandoHistorial" class="has-text-centered p-6">
            <b-loading :is-full-page="false" v-model="cargandoHistorial" :can-cancel="false"></b-loading>
            <p class="mt-4">Cargando historial...</p>
          </div>
          
          <!-- Mensaje cuando no hay registros -->
          <div v-else-if="historialCaja.length === 0" class="notification is-info is-light">
            <p class="has-text-centered">
              <span class="icon">
                <i class="mdi mdi-information"></i>
              </span>
              No se encontraron registros de caja para este usuario.
            </p>
          </div>
          
          <!-- Tabla de historial -->
          <div v-else>
            <b-table
              :data="historialCaja"
              :mobile-cards="true"
              default-sort="date"
              default-sort-direction="desc"
              detailed
              detail-key="id"
              :show-detail-icon="false"
              aria-next-label="Siguiente página"
              aria-previous-label="Página anterior"
              aria-page-label="Página"
              aria-current-label="Página actual">
              
              <b-table-column field="date" label="Fecha" sortable v-slot="props">
                <span class="has-text-weight-medium">{{ formatDate(props.row.date) }}</span>
              </b-table-column>
              
              <b-table-column field="state" label="Estado" centered v-slot="props">
                <b-tag :type="props.row.state === 'closed' ? 'is-success' : 'is-warning'">
                  {{ props.row.state === 'closed' ? 'Cerrado' : 'Abierto' }}
                </b-tag>
              </b-table-column>
              
              <b-table-column field="cashInHand" label="Efectivo" numeric v-slot="props">
                <span v-if="props.row.state === 'closed'" class="has-text-weight-bold">{{ formatCurrency(props.row.cashInHand) }}</span>
                <span v-else></span>
              </b-table-column>
              
              <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                <b-button
                  v-if="props.row.state === 'closed'"
                  size="is-small"
                  type="is-info"
                  icon-left="eye"
                  @click="verDetalleCierre(props.row)">
                  Ver Detalle
                </b-button>
                <span v-else></span>
              </b-table-column>
              
              <template #detail="props">
                <div class="content p-3">
                  <div class="columns is-multiline">
                    <div class="column is-6">
                      <p><strong>ID:</strong> {{ props.row.id }}</p>
                    </div>
                    <div class="column is-6">
                      <p><strong>Usuario:</strong> {{ props.row.user ? props.row.user.name : '-' }}</p>
                    </div>
                    <div class="column is-6">
                      <p><strong>Ventas totales:</strong> {{ formatCurrency(props.row.totalSales) }}</p>
                    </div>
                    <div class="column is-6">
                      <p><strong>Efectivo esperado:</strong> {{ formatCurrency(props.row.expectedCash) }}</p>
                    </div>
                    <div class="column is-6">
                      <p><strong>Discrepancia:</strong> 
                        <span :class="{
                          'has-text-danger': props.row.discrepancy < 0,
                          'has-text-success': props.row.discrepancy > 0,
                          'has-text-info': props.row.discrepancy === 0
                        }">
                          {{ formatCurrency(props.row.discrepancy) }}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="has-text-centered mt-3">
                    <b-button
                      v-if="props.row.state === 'closed'"
                      type="is-primary"
                      size="is-small"
                      icon-left="file-document-outline"
                      @click="verDetalleCierre(props.row)">
                      Ver Reporte Completo
                    </b-button>
                  </div>
                </div>
              </template>
            </b-table>
          </div>
        </section>
        
        <footer class="modal-card-foot">
          <button class="button" @click="isHistorialModalActive = false">Cerrar</button>
        </footer>
      </div>
    </b-modal>

    <!-- Componente CierreInfo para mostrar el detalle del cierre -->
    <cierre-info 
      v-if="cierreSeleccionado" 
      :cierreInfo.sync="cierreSeleccionado" 
      :userData="usuarioSeleccionado"
      :hayTurnoPrevio="hayTurnoPrevioParaResumen"
      :esTurnoPrevioMismoUsuario="esTurnoPrevioMismoUsuarioParaResumen"
      :turnoPrevioInfo="turnoPrevioInfoParaResumen"
      :ventasTurno="ventasTurnoActual"
    />
  </section>
</template>

<script>
import MensajeInicial from '../Extras/MensajeInicial'
import NavComponent from '../Extras/NavComponent'
import CierreInfo from '../Caja/CierreInfo.vue'
import apiRequest from '../../Servicios/HttpService';

export default {
  name: "UsuariosComponent",
  components: { 
    MensajeInicial, 
    NavComponent,
    CierreInfo
  },

  data: () => ({
    isActive: true,
    cargando: false,
    cargandoHistorial: false,
    usuarios: [],
    historialCaja: [],
    isHistorialModalActive: false,
    usuarioSeleccionado: null,
    // Nuevas propiedades para el detalle del cierre
    cierreSeleccionado: null,
    hayTurnoPrevioParaResumen: false,
    esTurnoPrevioMismoUsuarioParaResumen: false,
    turnoPrevioInfoParaResumen: {},
    ventasTurnoActual: 0
  }),

  mounted() {
    this.obtenerUsuarios()
  },

  methods: {
    handleSwitchChange(value) {
      this.isActive = value;
      this.obtenerUsuarios();
    },

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
      this.historialCaja = []; // Clear previous data
      
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `cash-register/historial`
        });
        
        // Filtrar solo los registros del usuario seleccionado
        this.historialCaja = response.data.filter(registro => 
          registro.user && registro.user.id === usuario.id
        );
        
        // Ordenar por fecha (más reciente primero)
        this.historialCaja.sort((a, b) => new Date(b.date) - new Date(a.date));
        
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

    // Método para ver el detalle de un cierre específico
    async verDetalleCierre(cierre) {
      // Cerrar el modal de historial
      this.isHistorialModalActive = false;
      
      try {
        // Buscar el cierre anterior para determinar si hay turno previo
        const cierresAnteriores = this.historialCaja.filter(c => 
          c.state === 'closed' && 
          new Date(c.date) < new Date(cierre.date)
        );
        
        // Ordenar por fecha (más reciente primero)
        cierresAnteriores.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Verificar si hay un cierre anterior
        if (cierresAnteriores.length > 0) {
          const cierreAnterior = cierresAnteriores[0];
          this.hayTurnoPrevioParaResumen = true;
          
          // Verificar si el cierre anterior es del mismo usuario
          this.esTurnoPrevioMismoUsuarioParaResumen = 
            cierreAnterior.user && cierre.user && 
            cierreAnterior.user.id === cierre.user.id;
          
          this.turnoPrevioInfoParaResumen = cierreAnterior;
          
          // Obtener las ventas específicas del usuario para este cierre
          await this.obtenerVentasUsuarioEnTurno(cierre);
        } else {
          this.hayTurnoPrevioParaResumen = false;
          this.esTurnoPrevioMismoUsuarioParaResumen = false;
          this.turnoPrevioInfoParaResumen = {};
          
          // Obtener las ventas específicas del usuario para este cierre
          await this.obtenerVentasUsuarioEnTurno(cierre);
        }
        
        // Mostrar el cierre seleccionado
        this.cierreSeleccionado = cierre;
        
      } catch (error) {
        console.error('Error al procesar el detalle del cierre:', error);
        this.$buefy.toast.open({
          message: 'Error al mostrar el detalle del cierre',
          type: 'is-danger'
        });
      }
    },

    // Método para obtener las ventas específicas del usuario en su turno
    async obtenerVentasUsuarioEnTurno(cierre) {
      try {
        if (!cierre.user || !cierre.user.id) {
          console.warn('No se pudo obtener el ID del usuario del cierre');
          this.ventasTurnoActual = cierre.totalSales || 0;
          return;
        }
        
        // Obtener el ID del usuario
        const userId = cierre.user.id;
        
        // Intentar obtener las ventas específicas del usuario para esa fecha
        const response = await apiRequest({
          method: 'GET',
          path: `users/${userId}/today-income`
        }).catch(() => ({ data: null }));
        
        // Si la API devuelve las ventas del usuario, usamos ese valor
        if (response && response.data !== null && response.data !== undefined) {
          this.ventasTurnoActual = Number(response.data.totalIncome || 0);
          
          // Si hay un cierre anterior del mismo usuario, ajustamos para mostrar solo las ventas de este turno
          if (this.hayTurnoPrevioParaResumen && this.esTurnoPrevioMismoUsuarioParaResumen) {
            const ventasPrevias = this.turnoPrevioInfoParaResumen.totalSales || 0;
            this.ventasTurnoActual = this.ventasTurnoActual - ventasPrevias;
          }
        } else {
          // Si no hay datos específicos, usamos el valor de totalSales del cierre
          console.warn('No se pudieron obtener ventas específicas del usuario, usando valor del cierre');
          this.ventasTurnoActual = cierre.totalSales || 0;
        }
        
        // Asegurarse de que no sea negativo
        if (this.ventasTurnoActual < 0) this.ventasTurnoActual = 0;
        
      } catch (error) {
        console.error('Error al obtener ventas del usuario:', error);
        // En caso de error, usamos el valor de totalSales del cierre
        this.ventasTurnoActual = cierre.totalSales || 0;
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
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-MX', options);
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return '-';
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    }
  }
}
</script>

<style scoped>
.buttons.is-centered {
  justify-content: center;
}

.modal-card-body {
  max-height: 70vh;
  overflow-y: auto;
}

.p-3 {
  padding: 0.75rem;
}

.p-6 {
  padding: 1.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

.has-text-weight-medium {
  font-weight: 500;
}

.has-text-weight-bold {
  font-weight: 700;
}
</style>

