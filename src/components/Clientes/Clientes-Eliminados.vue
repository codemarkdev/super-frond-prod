<template>
    <div>
        <mensaje-inicial :titulo="'No se han encontrado clientes eliminados'"
            :subtitulo="'Los clientes eliminados aparecerán aquí'" v-if="!clientesEliminados || clientesEliminados.length < 1" />
    
        <div v-if="clientesEliminados && clientesEliminados.length > 0">
            <b-table class="box" :data="clientesEliminados"
                :paginated="isPaginated"
                :per-page="perPage"
                :current-page.sync="currentPage"
                :pagination-simple="isPaginationSimple"
                :pagination-position="paginationPosition"
                :default-sort-direction="defaultSortDirection"
                :pagination-rounded="isPaginationRounded"
                :sort-icon="sortIcon"
                :sort-icon-size="sortIconSize"
                default-sort="name"
                aria-next-label="Next page"
                aria-previous-label="Previous page"
                aria-page-label="Page"
                aria-current-label="Current page">
                
                <b-table-column field="name" label="Nombre del cliente" sortable searchable v-slot="props">
                    {{ props.row.name }}
                </b-table-column>
    
                <b-table-column field="phone" label="Teléfono" sortable searchable v-slot="props">
                    {{ props.row.phone }}
                </b-table-column>
    
                <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                    <div class="buttons is-centered">
                        <b-tooltip label="Restaurar cliente" position="is-top">
                            <b-button class="btn-primary" @click="restaurarCliente(props.row)">
                                <b-icon icon="restore" />
                            </b-button>
                        </b-tooltip>
                        <b-tooltip label="Ver ventas" position="is-top">
                            <b-button class="btn-link" @click="verVentas(props.row.id, props.row.name)">
                                <b-icon icon="shopping" />
                            </b-button>
                        </b-tooltip>
                    </div>
                </b-table-column>
            </b-table>
        </div>
        
        <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>
    
        <!-- Modal para mostrar las ventas del cliente -->
        <b-modal :active.sync="isVentasModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
            <div class="modal-card" style="width: auto; max-width: 80vw;">
                <header class="modal-card-head">
                    <p class="modal-card-title">Ventas del Cliente: {{ clienteSeleccionadoNombre }}</p>
                    <button class="delete" aria-label="close" @click="isVentasModalActive = false"></button>
                </header>
                <section class="modal-card-body">
                    <div v-if="!clienteTieneVentas" class="has-text-centered">
                        <div class="box p-6">
                            <div class="icon-text is-flex is-justify-content-center mb-4">
                                <span class="icon has-text-warning is-large">
                                    <i class="mdi mdi-alert-circle mdi-36px"></i>
                                </span>
                            </div>
                            <p class="is-size-4 mb-4">Este cliente no tiene compras registradas</p>
                            <p class="is-size-6 has-text-grey">
                                El cliente no ha realizado ninguna compra hasta el momento.
                            </p>
                        </div>
                    </div>
                    <div v-else class="has-text-centered">
                        <div class="box p-6">
                            <h2 class="title is-4 mb-4">Resumen de Ventas</h2>
                            <div class="columns">
                                <div class="column">
                                    <div class="card">
                                        <div class="card-content">
                                            <p class="title is-5">Total de Ventas</p>
                                            <p class="subtitle is-2 has-text-primary">${{ ventasCliente.totalSales.toFixed(2) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-4 is-size-6 has-text-grey">
                                Para ver el detalle completo de las ventas, consulte el módulo de ventas.
                            </p>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button" @click="isVentasModalActive = false">Cerrar</button>
                </footer>
            </div>
        </b-modal>
    </div>
    </template>
    
    <script>
    import MensajeInicial from '../Extras/MensajeInicial'
    import apiRequest from '../../Servicios/HttpService';
    
    export default {
    name: "ClientesEliminados",
    components: { MensajeInicial },
    
    data: () => ({
        clientesEliminados: [],
        cargando: false,
        isPaginated: true,
        isPaginationSimple: false,
        isPaginationRounded: true,
        paginationPosition: 'bottom',
        defaultSortDirection: 'asc',
        sortIcon: 'arrow-up',
        sortIconSize: 'is-medium',
        currentPage: 1,
        perPage: 10,
        isVentasModalActive: false,
        ventasCliente: null,
        clienteSeleccionado: null,
        clienteSeleccionadoNombre: '',
        clienteTieneVentas: false
    }),
    
    mounted() {
        this.obtenerClientesEliminados()
    },
    
    methods: {
        formatDate(dateString) {
            if (!dateString) return ''
            const date = new Date(dateString)
            return date.toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
    
        restaurarCliente(cliente) {
            this.$buefy.dialog.confirm({
                title: 'Restaurar cliente',
                message: `¿Deseas restaurar el cliente ${cliente.name}?`,
                confirmText: 'Sí, restaurar',
                cancelText: 'Cancelar',
                type: 'is-success',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true
                    
                    // Usamos el endpoint para activar el cliente
                    apiRequest({
                        method: 'POST',
                        path: `customers/activate/${cliente.id}`
                    })
                    .then(resultado => {
                        this.cargando = false
                        if (resultado && resultado.status >= 200 && resultado.status < 300) {
                            this.$buefy.toast.open({
                                message: 'Cliente restaurado correctamente',
                                type: 'is-success'
                            })
                            this.obtenerClientesEliminados()
                            // Emitimos un evento para que el componente padre sepa que debe actualizar la lista de clientes
                            this.$emit('cliente-restaurado')
                        } else {
                            this.$buefy.toast.open({
                                message: 'Error al restaurar el cliente',
                                type: 'is-danger'
                            })
                        }
                    })
                    .catch(error => {
                        console.error("Error al restaurar cliente:", error);
                        this.cargando = false;
                        this.$buefy.toast.open({
                            message: 'Error al restaurar el cliente',
                            type: 'is-danger'
                        });
                    });
                }
            })
        },
    
        obtenerClientesEliminados() {
            this.cargando = true
            
            // Usamos el endpoint correcto para obtener clientes eliminados
            apiRequest({
                method: "GET",
                path: "customers/deletedCustomers"
            })
            .then(respuesta => {
                this.cargando = false;
                console.log("Respuesta del servidor:", respuesta);
                
                // La respuesta directamente es el array, no está dentro de una propiedad data
                if (respuesta && Array.isArray(respuesta.data)) {
                    this.clientesEliminados = respuesta.data;
                } else {
                    this.clientesEliminados = [];
                    console.error("Formato de respuesta inesperado:", respuesta);
                }
            })
            .catch(error => {
                console.error("Error al obtener clientes eliminados:", error);
                this.clientesEliminados = [];
                this.cargando = false;
                this.$buefy.toast.open({
                    message: 'Error al cargar los clientes eliminados',
                    type: 'is-danger'
                });
            });
        },
    
        verVentas(idCliente, nombreCliente) {
            this.cargando = true;
            this.clienteSeleccionado = idCliente;
            this.clienteSeleccionadoNombre = nombreCliente || 'Cliente';
            this.clienteTieneVentas = false;
            
            apiRequest({
                method: 'GET',
                path: `customers/sales-by-customer/${idCliente}`
            })
            .then(respuesta => {
                this.cargando = false;
                
                if (respuesta && respuesta.data && Array.isArray(respuesta.data)) {
                    // Buscamos específicamente el cliente solicitado en el array
                    const clienteVentas = respuesta.data.find(item => item.id === idCliente);
                    
                    // Verificamos si el cliente existe y tiene ventas
                    if (clienteVentas && clienteVentas.totalSales !== null && clienteVentas.totalSales > 0) {
                        this.ventasCliente = clienteVentas;
                        this.clienteTieneVentas = true;
                    } else {
                        // Si no tiene ventas o totalSales es null
                        this.ventasCliente = { id: idCliente, totalSales: 0 };
                        this.clienteTieneVentas = false;
                    }
                } else {
                    // Si la respuesta no es válida
                    this.ventasCliente = { id: idCliente, totalSales: 0 };
                    this.clienteTieneVentas = false;
                }
                
                this.isVentasModalActive = true;
            })
            .catch(error => {
                console.error("Error al obtener ventas del cliente:", error);
                this.cargando = false;
                this.ventasCliente = { id: idCliente, totalSales: 0 };
                this.clienteTieneVentas = false;
                this.$buefy.toast.open({
                    message: 'Error al cargar las ventas del cliente',
                    type: 'is-danger'
                });
                this.isVentasModalActive = true;
            });
        }
    }
    }
    </script>