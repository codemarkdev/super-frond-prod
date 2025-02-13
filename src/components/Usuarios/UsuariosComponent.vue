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

            <b-table-column field="eliminar" label="Eliminar" v-slot="props">
                <b-button type="is-danger" icon-left="delete" @click="eliminar(props.row.id)">Eliminar</b-button>
            </b-table-column>

            <b-table-column field="editar" label="Editar" v-slot="props">
                <b-button type="is-info" icon-left="pen" @click="editar(props.row.id)">Editar</b-button>
            </b-table-column>

            <b-table-column field="editar" label="Cambiar contraseña" v-slot="props">
                <b-button type="is-info" icon-left="shield" @click="changePass(props.row.id)">Cambiar contraseña</b-button>
            </b-table-column>
        </b-table>
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
    import MensajeInicial from '../Extras/MensajeInicial'
    import NavComponent from '../Extras/NavComponent'
 
    import apiRequest from '../../Servicios/HttpService';

    export default {
        name: "UsuariosComponent",
        components: { MensajeInicial, NavComponent },

        data:()=>({
            cargando: false,
            usuarios: []
        }),

        mounted(){
            this.obtenerUsuarios()
        },

        methods: {
            async eliminar(idUsuario){
                this.$buefy.dialog.confirm({
                    title: 'Eliminar usuario',
                    message: 'Seguro que quieres <b>eliminar</b> este usuario? Esta acción no se puede revertir.',
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => {
                        this.cargando = true
                        // HttpService.eliminar('usuarios.php',{
                        //     accion: 'eliminar',
                        //     id: idUsuario
                        // })

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

            editar(idUsuario){
                this.$router.push({
                    name: "EditarUsuario",
                    params: { id: idUsuario}
                })
            },
            changePass(idUsuario){
                this.$router.push({
                    name: "CambiarPassword",
                    params: { id: idUsuario}
                })
            },


            obtenerUsuarios (){
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
            }
        }
    }
</script>