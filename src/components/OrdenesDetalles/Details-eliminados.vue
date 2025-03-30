<template>
    <div class="details-eliminados">
        <mensaje-inicial :titulo="'No se han encontrado detalles de órdenes eliminados'"
            :subtitulo="'Los detalles de órdenes eliminados aparecerán aquí'" 
            v-if="!detallesEliminados || detallesEliminados.length < 1" />
    
        <div v-if="detallesEliminados && detallesEliminados.length > 0">
            <b-table class="box" :data="detallesEliminados"
                :paginated="isPaginated"
                :per-page="perPage"
                :current-page.sync="currentPage"
                :pagination-simple="isPaginationSimple"
                :pagination-position="paginationPosition"
                :default-sort-direction="defaultSortDirection"
                :pagination-rounded="isPaginationRounded"
                :sort-icon="sortIcon"
                :sort-icon-size="sortIconSize"
                default-sort="product.name"
                aria-next-label="Next page"
                aria-previous-label="Previous page"
                aria-page-label="Page"
                aria-current-label="Current page">
                
                <b-table-column field="product.name" label="Producto" sortable searchable v-slot="props">
                    {{ props.row.product ? props.row.product.name : 'N/A' }}
                </b-table-column>
    
                <b-table-column field="product.code" label="Código" sortable searchable v-slot="props">
                    {{ props.row.product ? props.row.product.code : 'N/A' }}
                </b-table-column>
    
                <b-table-column field="quantity" label="Cantidad" sortable numeric v-slot="props">
                    {{ props.row.quantity }}
                </b-table-column>
    
                <b-table-column field="purchasePriceUnit" label="Precio Unitario" sortable numeric v-slot="props">
                    {{ formatearMoneda(props.row.purchasePriceUnit) }}
                </b-table-column>
    
                <b-table-column field="calculatedTotalPriceWithTax" label="Total con Impuestos" sortable numeric v-slot="props">
                    {{ formatearMoneda(props.row.calculatedTotalPriceWithTax) }}
                </b-table-column>
    
                <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                    <div class="buttons is-centered">
                        <b-tooltip label="Restaurar detalle" position="is-top">
                            <b-button class="btn-primary" @click="restaurarDetalle(props.row)">
                                <b-icon icon="restore" />
                            </b-button>
                        </b-tooltip>
                        <b-tooltip label="Ver detalles" position="is-top">
                            <b-button class="btn-primary" @click="verDetalles(props.row)">
                                <b-icon icon="eye" />
                            </b-button>
                        </b-tooltip>
                    </div>
                </b-table-column>
            </b-table>
        </div>
        
        <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>
    
        <!-- Modal para mostrar los detalles completos -->
        <b-modal :active.sync="isDetallesModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
            <div class="modal-card" style="width: auto; max-width: 80vw;">
                <header class="modal-card-head">
                    <p class="modal-card-title">Detalles del Producto: {{ detalleSeleccionadoNombre }}</p>
                    <button class="delete" aria-label="close" @click="isDetallesModalActive = false"></button>
                </header>
                <section class="modal-card-body">
                    <div v-if="detalleSeleccionado" class="box p-5">
                        <div class="columns is-multiline">
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Producto</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="detalleSeleccionado.product ? detalleSeleccionado.product.name : 'N/A'">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Código</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="detalleSeleccionado.product ? detalleSeleccionado.product.code : 'N/A'">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Cantidad</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="detalleSeleccionado.quantity">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Precio de Compra Unitario</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="formatearMoneda(detalleSeleccionado.purchasePriceUnit)">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Impuesto Unitario</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="formatearMoneda(detalleSeleccionado.calculatedTaxUnit)">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Total sin Impuestos</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="formatearMoneda(detalleSeleccionado.calculatedTotalPriceWithouthTax)">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Total de Impuestos</label>
                                    <div class="control">
                                        <input class="input" type="text" readonly :value="formatearMoneda(detalleSeleccionado.calculatedTotalTax)">
                                    </div>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Total con Impuestos</label>
                                    <div class="control">
                                        <input class="input is-primary has-text-weight-bold" type="text" readonly 
                                            :value="formatearMoneda(detalleSeleccionado.calculatedTotalPriceWithTax)">
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        <!-- Información adicional del producto -->
                        <div class="mt-5">
                            <h4 class="title is-5 mb-3">Información del Producto</h4>
                            <div class="columns is-multiline">
                                <div class="column is-6">
                                    <div class="field">
                                        <label class="label">Precio de Venta</label>
                                        <div class="control">
                                            <input class="input" type="text" readonly 
                                                :value="detalleSeleccionado.product ? formatearMoneda(detalleSeleccionado.product.salePrice) : 'N/A'">
                                        </div>
                                    </div>
                                </div>
                                <div class="column is-6">
                                    <div class="field">
                                        <label class="label">Precio Turista</label>
                                        <div class="control">
                                            <input class="input" type="text" readonly 
                                                :value="detalleSeleccionado.product ? formatearMoneda(detalleSeleccionado.product.touristPrice) : 'N/A'">
                                        </div>
                                    </div>
                                </div>
                                <div class="column is-6">
                                    <div class="field">
                                        <label class="label">Stock Actual</label>
                                        <div class="control">
                                            <input class="input" type="text" readonly 
                                                :value="detalleSeleccionado.product ? detalleSeleccionado.product.stock : 'N/A'">
                                        </div>
                                    </div>
                                </div>
                                <div class="column is-6">
                                    <div class="field">
                                        <label class="label">Venta al por Mayor</label>
                                        <div class="control">
                                            <input class="input" type="text" readonly 
                                                :value="detalleSeleccionado.product && detalleSeleccionado.product.wholesaleSale ? 'Habilitado' : 'Deshabilitado'">
                                        </div>
                                    </div>
                                </div>
                                <div v-if="detalleSeleccionado.product && detalleSeleccionado.product.wholesaleSale" class="column is-6">
                                    <div class="field">
                                        <label class="label">Precio Mayorista</label>
                                        <div class="control">
                                            <input class="input" type="text" readonly 
                                                :value="formatearMoneda(detalleSeleccionado.product.wholesalePrice)">
                                        </div>
                                    </div>
                                </div>
                                <div v-if="detalleSeleccionado.product && detalleSeleccionado.product.wholesaleSale" class="column is-6">
                                    <div class="field">
                                        <label class="label">Cantidad Mínima Mayoreo</label>
                                        <div class="control">
                                            <input class="input" type="text" readonly 
                                                :value="detalleSeleccionado.product.wholesaleQuantity">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" @click="restaurarDetalle(detalleSeleccionado)">Restaurar</button>
                    <button class="button" @click="isDetallesModalActive = false">Cerrar</button>
                </footer>
            </div>
        </b-modal>
    </div>
    </template>
    
    <script>
    import MensajeInicial from '../Extras/MensajeInicial'
    import apiRequest from '../../Servicios/HttpService';
    
    export default {
    name: "DetailsEliminados",
    components: { MensajeInicial },
    
    data: () => ({
        detallesEliminados: [],
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
        isDetallesModalActive: false,
        detalleSeleccionado: null,
        detalleSeleccionadoNombre: ''
    }),
    
    mounted() {
        this.obtenerDetallesEliminados()
    },
    
    methods: {
        restaurarDetalle(detalle) {
            this.$buefy.dialog.confirm({
                title: 'Restaurar detalle de orden',
                message: `¿Deseas restaurar el detalle del producto ${detalle.product ? detalle.product.name : 'seleccionado'}?`,
                confirmText: 'Sí, restaurar',
                cancelText: 'Cancelar',
                type: 'is-success',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true
                    
                    // Usamos el endpoint correcto para activar el detalle de orden
                    apiRequest({
                        method: 'POST',
                        path: `order-details/active/${detalle.id}`
                    })
                    .then(resultado => {
                        this.cargando = false
                        if (resultado && resultado.status >= 200 && resultado.status < 300) {
                            this.$buefy.toast.open({
                                message: 'Detalle restaurado correctamente',
                                type: 'is-success'
                            })
                            this.obtenerDetallesEliminados()
                            // Cerramos el modal si está abierto
                            if (this.isDetallesModalActive) {
                                this.isDetallesModalActive = false
                            }
                            // Emitimos un evento para que el componente padre sepa que debe actualizar la lista
                            this.$emit('detalle-restaurado')
                        } else {
                            this.$buefy.toast.open({
                                message: 'Error al restaurar el detalle',
                                type: 'is-danger'
                            })
                        }
                    })
                    .catch(error => {
                        console.error("Error al restaurar detalle:", error);
                        this.cargando = false;
                        this.$buefy.toast.open({
                            message: 'Error al restaurar el detalle',
                            type: 'is-danger'
                        });
                    });
                }
            })
        },
    
        obtenerDetallesEliminados() {
            this.cargando = true
            
            // Usamos el endpoint correcto para obtener detalles de órdenes eliminados
            apiRequest({
                method: "GET",
                path: "order-details/findDeleted"
            })
            .then(respuesta => {
                this.cargando = false;
                console.log("Respuesta del servidor:", respuesta);
                
                if (respuesta && Array.isArray(respuesta.data)) {
                    this.detallesEliminados = respuesta.data;
                } else {
                    this.detallesEliminados = [];
                    console.error("Formato de respuesta inesperado:", respuesta);
                }
            })
            .catch(error => {
                console.error("Error al obtener detalles eliminados:", error);
                this.detallesEliminados = [];
                this.cargando = false;
                this.$buefy.toast.open({
                    message: 'Error al cargar los detalles eliminados',
                    type: 'is-danger'
                });
            });
        },
    
        verDetalles(detalle) {
            this.detalleSeleccionado = detalle;
            this.detalleSeleccionadoNombre = detalle.product ? detalle.product.name : 'Detalle';
            this.isDetallesModalActive = true;
        },
    
        formatearMoneda(valor) {
            // Verificar si es un número válido
            if (!valor || isNaN(valor)) return '$0.00';
    
            // Formatear con 2 decimales y separador de miles
            return new Intl.NumberFormat('es-SV', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            }).format(valor);
        }
    }
    }
    </script>
    
  