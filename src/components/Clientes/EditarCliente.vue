<template>
    <section>
        <h1 class="title is-1">Editar cliente</h1>
        <b-breadcrumb
            align="is-left"
        >
            <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
            <b-breadcrumb-item tag='router-link' to="/cientes">Clientes</b-breadcrumb-item>
            <b-breadcrumb-item active>Editar cliente</b-breadcrumb-item>
        </b-breadcrumb>
        <form-cliente :cliente="datosCliente" @registrar="onEditar" v-if="datosCliente" />
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
    import apiRequest from '../../Servicios/HttpService';
    import FormCliente from './FormCliente'

    export default{
        name: "EditaCliente",
        components: { FormCliente },

        data:()=>({
            cargando: false,
            datosCliente: null
        }),

        async mounted(){
            this.cargando = true    
            // const cliente = await HttpService.obtenerConConsultas('clientes.php', {
            //     accion: 'obtener_por_id',
            //     id: this.$route.params.id
            // })
            apiRequest({
                method: 'GET',
            path: `customers/${this.$route.params.id}`
            }).then(cliente => {
                this.datosCliente = cliente.data
                this.cargando = false
            })
        },

        methods: {
            async onEditar(datosCliente){
                this.cargando = true
                // const resultado = await HttpService.editar('clientes.php',{
                //     accion: 'editar',
                //     cliente: datosCliente
                // })

                apiRequest({
                    method: 'PUT',
                    path: `customers/${this.$route.params.id}`,
                    data: datosCliente
                }).then(resultado => {
                    if(!resultado) {
                        this.$buefy.toast.open('Error al editar')
                        this.cargando = false
                        return
                    }
                    else{
                        this.cargando = false
                        this.$buefy.toast.open({
                            type: 'is-info',
                            message: 'Información de cliente actualizada con éxito.'
                        })
                        this.$router.push({ name: 'ClientesComponent'})
                    }
                })

            }
        }
    }
</script>