<template>
    <section>
         <b-button type="is-primary" size="is-medium" class="is-rounded" icon-left="plus" @click="agregarMarca">
          Agregar marca
        </b-button>

        <b-table
        paginated
        :data="marcas">
          <b-table-column field="brandName" label="Marca" sortable searchable v-slot="props">
                {{ props.row.brandName }}
            </b-table-column>
          <b-table-column field="nombreMarca" label="Productos" sortable v-slot="props">
        <b-tag  type="is-info" size="is-medium">
                {{ props.row.products.length }}
            </b-tag>
            </b-table-column>
            <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                <div class="buttons is-centered">

                    <b-button
                    type="is-info"
                    icon-left="pen"
                     size="is-small"
                    @click="editar(props.row)">Editar</b-button>
                <b-button
                type="is-danger"
                icon-left="delete"
                size="is-small"
                @click="eliminar(props.row)">Eliminar</b-button>
                </div>
            </b-table-column>
        </b-table>

         <b-modal
          v-model="mostrarDialogoMarcas"
          has-modal-card
          trap-focus
          :destroy-on-hide="false"
          aria-role="dialog"
          aria-label="Modal"
          close-button-aria-label="Close"
          aria-modal>
              <dialogo-marcas :titulo="tituloModal" :nombre="nombreMarca" @close="onCerrarDialogo" @registrar="onRegistrar" v-if="mostrarDialogoMarcas"></dialogo-marcas>
        </b-modal>

        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
    import DialogoMarcas from './DialogoMarcas'
    // import HttpService from '../../Servicios/HttpService'
import apiRequest from '../../Servicios/HttpService';

    export default{
        name: "MarcasComponent",
        components: { DialogoMarcas },

        data:()=>({
            cargando: false,
            marcas: [],
            mostrarDialogoMarcas: false,
            tituloModal: "",
            nombreMarca: "",
            idMarca: "",
        }),

        mounted(){
            this.obtenerMarcas()
        },

        methods: {
            eliminar(marca){
                this.$buefy.dialog.confirm({
                    title: 'Eliminar marca',
                    message: 'Seguro que quieres <b>eliminar</b> la marca ' + marca.nombreMarca +'? Esta acción no se puede revertir.',
                    confirmText: 'Sí, eliminar',
                    cancelText: 'Cancelar',
                    type: 'is-danger',
                    hasIcon: true,
                    onConfirm: () => {
                        this.cargando = true
                        // HttpService.eliminar('marcas.php',{
                        //     accion: 'eliminar',
                        //     id: marca.id
                        // })
                        apiRequest({
                            method: 'DELETE',
                            path: `brands/${marca.id}`
                        })
                        .then(resultado => {
                            if(!resultado) {
                                this.$buefy.toast.open('Error al eliminar')
                                this.cargando = false
                                return
                            }

                            if(resultado){
                                this.cargando = false
                                this.$buefy.toast.open({
                                    type: 'is-info',
                                    message: 'Marca eliminada.'
                                })
                                this.obtenerMarcas()
                            }
                        })
                    }
                })
            },
            editar(marca){
                this.tituloModal = "Editar"
                this.mostrarDialogoMarcas = true,
                this.idMarca = marca.id
                this.nombreMarca = marca.nombreMarca
            },

            onCerrarDialogo(){
                this.mostrarDialogoMarcas = false
                this.nombreMarca = ""
            },

            onRegistrar(nombre) {
                this.cargando = true


                // HttpService.registrar('marcas.php', {
                //     accion: accionARealizar,
                //     marca: {nombreMarca:nombre, id: this.idMarca }
                // })
          
                console.log('')
                apiRequest({
                    method: `${this.tituloModal == 'Agregar' ? 'POST': 'PATCH'}`,
                    path:  `${this.tituloModal == 'Agregar' ? 'brands': `brands/${this.idMarca}`}`,
                    data: {
                        brandName: nombre
                    }
                })
                .then(registrado => {
                    if(registrado === 'existe'){
                        this.$buefy.toast.open({
                          type: 'is-primary',
                          message: 'La marca' + nombre +' ya existe, selecciona otra.'
                        })
                        this.cargando = false
                        return
                    }

                    if(registrado) {
                        this.cargando = false
                        this.$buefy.toast.open({
                          type: 'is-info',
                          message: 'Información de marca registrada con éxito.'
                        })
                        this.obtenerMarcas()
                        this.nombreMarca = ""
                        this.mostrarDialogoMarcas = false
                    }
                })
            },

            agregarMarca(){
                this.tituloModal = "Agregar"
                this.mostrarDialogoMarcas = true
            },

            obtenerMarcas(){
                this.cargando = true
                // let payload = {
                //   accion: 'obtener'
                // }
                // HttpService.obtenerConConsultas('marcas.php', payload)
                apiRequest({
                    method: 'GET',
                    path: 'brands'
                })
                .then(marcas => {
                  this.marcas = marcas.data
                  this.cargando = false
                })
            },
        }
    }
</script>