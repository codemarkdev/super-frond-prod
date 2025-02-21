<template>
    <section>
        <nav-component :titulo="'Usuarios'" :link="{ path: '/agregar-usuario' }" :texto="'Agregar usuario'" />
        <mensaje-inicial :titulo="'No se han registrado usuarios'" :subtitulo="'Agrega algunos usuarios'" v-if="usuarios.length < 1" />
        <b-table
        :data="usuarios">
            <b-table-column field="usuario" label="Nombre de usuario" sortable v-slot="props">
                {{ props.row.username }}
            </b-table-column>

            <b-table-column field="nombre" label="Nombre completo" sortable  v-slot="props">
                {{ props.row.name }}
            </b-table-column>

            <b-table-column field="telefono" label="Teléfono" sortable v-slot="props">
                {{ props.row.phone }}
            </b-table-column>

            <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                <div class="buttons is-centered">
                    <b-button 
                        type="is-danger" 
                        icon-left="delete"
                        size="is-small"
                        @click="eliminar(props.row.id)">Eliminar</b-button>
           
                    <b-button 
                        type="is-info"
                        size="is-small"
                        icon-left="pen" 
                        @click="editar(props.row.id)">Editar</b-button>
    
                    <b-button 
                        size="is-small"
                        type="is-info" 
                        icon-left="key" 
                        @click="changePass(props.row.id)"></b-button>

                    <b-button 
                        size="is-small"
                        type="is-primary" 
                        icon-left="history" 
                        @click="verHistorial(props.row)">Historial Caja</b-button>
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
                    <b-table
                        :data="historialCaja"
                        :loading="cargandoHistorial"
                        :mobile-cards="true"
                        default-sort="date"
                        default-sort-direction="desc"
                    >
                        <b-table-column field="date" label="Fecha" sortable v-slot="props">
                            {{ formatDate(props.row.date) }}
                        </b-table-column>

                        <b-table-column field="cashInHand" label="Efectivo" numeric sortable v-slot="props">
                            {{ formatCurrency(props.row.cashInHand) }}
                        </b-table-column>

                        <b-table-column field="totalSales" label="Ventas" numeric sortable v-slot="props">
                            {{ formatCurrency(props.row.totalSales) }}
                        </b-table-column>

                        <b-table-column field="discrepancy" label="Discrepancia" numeric sortable v-slot="props">
                            <span :class="{'has-text-danger': props.row.discrepancy > 0, 'has-text-success': props.row.discrepancy < 0}">
                                {{ formatCurrency(props.row.discrepancy) }}
                            </span>
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
            async eliminar(idUsuario) {
                this.$buefy.dialog.confirm({
                    title: 'Eliminar usuario',
                    message: 'Seguro que quieres <b>eliminar</b> este usuario? Esta acción no se puede revertir.',
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => {
                        this.cargando = true
                        apiRequest({
                            method: 'DELETE', 
                            path: `users/${idUsuario}`
                        })
                        .then(resultado => {
                            if(!resultado.data) {
                                this.$buefy.toast.open('Error al eliminar')
                                this.cargando = false
                                return
                            }

                            if(resultado.data){
                                this.cargando = false
                                this.$buefy.toast.open({
                                    type: 'is-info',
                                    message: 'Usuario eliminado.'
                                })
                                this.obtenerUsuarios()
                            }
                        })
                    }
                })
            },

            editar(idUsuario) {
                this.$router.push({
                    name: "EditarUsuario",
                    params: { id: idUsuario}
                })
            },

            changePass(idUsuario) {
                this.$router.push({
                    name: "CambiarPassword",
                    params: { id: idUsuario}
                })
            },

            async verHistorial(usuario) {
                this.usuarioSeleccionado = usuario;
                this.isHistorialModalActive = true;
                this.cargandoHistorial = true;
                try {
                    const response = await apiRequest({
                        method: 'GET',
                        path: `Cash-Register/historial`
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
                    this.usuarios = response.data
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

