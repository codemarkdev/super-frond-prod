<template>
    <section>
        <h1 class="title is-1">Editar usuario</h1>
         <b-breadcrumb
            align="is-left"
        >
            <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
            <b-breadcrumb-item tag='router-link' to="/usuarios">Usuarios</b-breadcrumb-item>
            <b-breadcrumb-item active>Editar usuario</b-breadcrumb-item>
        </b-breadcrumb>
        <form-usuario :usuario="datosUsuario" @registrar="onEditar" v-if="datosUsuario"/>
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>

    import apiRequest from '@/Servicios/HttpService';
import FormUsuario from './FormUsuario'

    export default{
        name: "EditarUsuario",
        components: { FormUsuario },

        data:()=>({
            datosUsuario: null,
            cargando: false
        }),

        async mounted(){
            this.cargando = true
            // const usuario = await HttpService.obtenerConConsultas('usuarios.php', {
            //     accion: 'obtener_por_id',
            //     id: this.$route.params.id
            // }) 

            const usuario = await apiRequest({
                method: "get", 
                path: `users/${this.$route.params.id}`
            })
            this.datosUsuario = usuario.data
            this.cargando = false
        },

        methods: {
            async onEditar(datosUsuario) {
                this.cargando = true
                // const resultado = await HttpService.editar('usuarios.php',{
                //     accion: 'editar',
                //     usuario: datosUsuario
                // })

                const resultado = await apiRequest({
                    method: 'PUT', 
                    path: `users/${this.$route.params.id}`,
                    data: datosUsuario
                })

                if(resultado.data) {
                    this.cargando = false
                    this.$buefy.toast.open({
                         type: 'is-info',
                         message: 'Información de usuario actualizada con éxito.'
                    })
                    this.$router.push({ name: 'UsuariosComponent'})
                }
            }
        }
    }
</script>