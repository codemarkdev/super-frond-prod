<template>
    <section>
        <p class="title is-1">Agregar usuario</p> 
         <b-breadcrumb
            align="is-left"
        >
            <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
            <b-breadcrumb-item tag='router-link' to="/usuarios">Usuarios</b-breadcrumb-item>
            <b-breadcrumb-item active>Agregar usuario</b-breadcrumb-item>
        </b-breadcrumb>
        <form-usuario @registrar="onRegistrar" :usuario="datosUsuario"/> 
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
    import apiRequest from '@/Servicios/HttpService';
import FormUsuario from './FormUsuario'


    export default{
        name: "AgregarUsuario",
        components: { FormUsuario },

        data:()=>({
            cargando: false,
            datosUsuario: {
                username: "",
                name: "",
                phone: "",
                password: "codemark.es",
            }
        }),

        methods: {
            onRegistrar(usuario) {
                console.log(usuario)
                this.cargando = true
                apiRequest({
                 method: 'POST', 
                 path: "users/register",
                 data: usuario
                })
                .then(registrado => {
                    if(registrado) {
                        this.cargando = false
                        this.$buefy.toast.open({
                          type: 'is-info',
                          message: 'Usuario registrado con éxito. Recuerda que la contraseña por defecto es codemark.es'
                        })
                    }
                })
            }   
        }

    }
</script>