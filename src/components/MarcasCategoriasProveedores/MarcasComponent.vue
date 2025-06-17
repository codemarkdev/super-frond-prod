<template>

    <section class="section">
        <b-switch v-if="isAdmin" v-model="isActive" @input="handleSwitchChange" :disabled="!isAdmin">
            {{ isActive ? 'Marcas activas' : 'Marcas inactivas' }}
        </b-switch>
        <div class="container">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <h1 class="title">Gestión de Marcas</h1>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <b-button v-if="isActive" type="is-primary" size="is-medium" class="is-rounded" icon-left="plus"
                            @click="agregarMarca">

                            Agregar Marca
                        </b-button>
                    </div>
                </div>
            </div>
        </div>

        <b-table paginated :data="marcas">
            <b-table-column field="provider" label="Proveedor" sortable searchable v-slot="props">
                {{ props.row.provider.name }}
            </b-table-column>
            <b-table-column field="brandName" label="Marca" sortable searchable v-slot="props">
                {{ props.row.brandName }}
            </b-table-column>
            <b-table-column field="nombreMarca" label="Productos" sortable v-slot="props">
                <b-tag size="is-medium">
                    {{ props.row.products.length }}
                </b-tag>
            </b-table-column>
            <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                <div class="buttons is-centered">


                    <b-button v-if="isActive" class="btn-link" icon-left="delete" size="is-small"
                        @click="eliminar(props.row)">Eliminar</b-button>

                    <b-button class="btn-primary" size="is-small"
                        @click="!isActive ? activarMarca(props.row) : editar(props.row)">
                        {{ !isActive
                            ? 'Activar' : '✏️' }}
                    </b-button>
                </div>
            </b-table-column>

            <template #empty>
                <div class="has-text-centered p-4">
                    <b-icon icon="tag-off" size="is-large"></b-icon>
                    <p class="is-size-5 mt-2">No hay marcas registradas</p>
                </div>
            </template>
        </b-table>

        <b-modal v-model="mostrarDialogoMarcas" has-modal-card trap-focus :destroy-on-hide="false" aria-role="dialog"
            aria-label="Modal" close-button-aria-label="Close" aria-modal>
            <dialogo-marcas :titulo="tituloModal" :nombre="nombreMarca" :provider-id="proveedorId"
                :providers="proveedores" @close="onCerrarDialogo" @registrar="onRegistrar" v-if="mostrarDialogoMarcas">
            </dialogo-marcas>
        </b-modal>

        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
import DialogoMarcas from './DialogoMarcas'
import apiRequest from '../../Servicios/HttpService';
import AyudanteSesion from '@/Servicios/AyudanteSesion';

export default {
    name: "MarcasComponent",
    components: { DialogoMarcas },

    data: () => ({
        isAdmin: false,
        isActive: true,
        cargando: false,
        marcas: [],
        proveedores: [],
        mostrarDialogoMarcas: false,
        tituloModal: "",
        nombreMarca: "",
        idMarca: "",
        proveedorId: null,
    }),

    mounted() {
        this.obtenerProveedores()
        this.obtenerMarcas()
        this.isRole()
    },

    methods: {


        isRole() {
            const { rol } = AyudanteSesion.obtenerDatosSesion()
            this.isAdmin = rol === 'Admin'

        },
        async handleSwitchChange() {
            this.obtenerMarcas();
        },
        activarMarca(marca) {
            this.$buefy.dialog.confirm({
                title: 'Activar marca',
                message: `¿Seguro que quieres reactivar la marca <b>${marca.brandName}</b>?`,
                confirmText: 'Sí, activar',
                cancelText: 'Cancelar',
                type: 'is-success',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true
                    apiRequest({
                        method: 'POST',
                        path: `brands/active/${marca.id}`
                    })
                        .then(resultado => {
                            if (resultado) {
                                this.$buefy.toast.open({
                                    type: 'is-success',
                                    message: 'Marca reactivada correctamente'
                                })
                                this.obtenerMarcas() // Refrescar la lista
                            }
                        })
                        .catch(() => {
                            this.$buefy.toast.open({
                                type: 'is-danger',
                                message: 'Error al reactivar la marca'
                            })
                        })
                        .finally(() => {
                            this.cargando = false
                        })
                }
            })
        },


        eliminar(marca) {
            this.$buefy.dialog.confirm({
                title: 'Eliminar marca',
                message: 'Seguro que quieres <b>eliminar</b> la marca? Esta acción no se puede revertir.',
                confirmText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true

                    apiRequest({
                        method: 'DELETE',
                        path: `brands/${marca.id}`
                    })
                        .then(resultado => {
                            if (!resultado) {
                                this.$buefy.toast.open('Error al eliminar')
                                this.cargando = false
                                return
                            }

                            if (resultado) {
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

        editar(marca) {
            this.tituloModal = "Editar"
            this.mostrarDialogoMarcas = true,
                this.idMarca = marca.id
            this.nombreMarca = marca.brandName
            this.proveedorId = marca.provider?.id
        },

        onCerrarDialogo() {
            this.mostrarDialogoMarcas = false
            this.nombreMarca = ""
            this.proveedorId = null
        },

        onRegistrar(datos) {
            this.cargando = true

            apiRequest({
                method: `${this.tituloModal == 'Agregar' ? 'POST' : 'PATCH'}`,
                path: `${this.tituloModal == 'Agregar' ? 'brands' : `brands/${this.idMarca}`}`,
                data: {
                    brandName: datos.nombre,
                    providerId: datos.providerId
                }
            })
                .then(registrado => {
                    if (registrado === 'existe') {
                        this.$buefy.toast.open({
                            type: 'is-primary',
                            message: 'La marca ' + datos.nombre + ' ya existe, selecciona otra.'
                        })
                        this.cargando = false
                        return
                    }

                    if (registrado) {
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

        agregarMarca() {
            this.tituloModal = "Agregar";
            this.obtenerProveedores()
            this.mostrarDialogoMarcas = true;
            this.nombreMarca = "";
            this.proveedorId = null;
        },

        obtenerMarcas() {
            this.cargando = true
            const endpoint = this.isActive ? 'brands' : 'brands/deleted';

            apiRequest({
                method: 'GET',
                path: endpoint
            })
                .then(response => {
                    this.marcas = response.data || [];
                    this.cargando = false;
                })
                .catch(error => {
                    console.error("Error al obtener marcas:", error);
                    this.cargando = false;
                    this.$buefy.toast.open({
                        type: 'is-danger',
                        message: 'Error al cargar las marcas'
                    });
                });
        },

        obtenerProveedores() {
            apiRequest({ method: 'GET', path: 'providers' })
                .then(response => this.proveedores = response.data ?? [])
        },

        getProviderName(providerId) {
            const proveedor = this.proveedores.find(p => p.id === providerId);
            return proveedor?.name ?? 'Sin Proveedor'
        }
    }
}
</script>