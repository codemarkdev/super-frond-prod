<template>
    <div class="ordenes-lista">
        <div class="section">
            <div class="section-header">
                <div class="header-left">
                    <i class="fas fa-file-invoice-dollar section-icon"></i>
                    <h3>Órdenes Registradas</h3>
                </div>
            </div>

            <div class="section-content">
                <mensaje-inicial :titulo="'No se han encontrado órdenes registradas'"
                    :subtitulo="'Las órdenes registradas aparecerán aquí'" 
                    v-if="!ordenes || ordenes.length < 1" />

                <div v-if="ordenes && ordenes.length > 0">
                    <!-- Filtros y búsqueda -->
                    <div class="filters mb-4">
                        <div class="field has-addons">
                            <div class="control is-expanded">
                                <input class="input" type="text" placeholder="Buscar por nombre de producto o código" 
                                    v-model="busqueda" @input="filtrarOrdenes">
                            </div>
                            <div class="control">
                                <button class="button is-info">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de órdenes -->
                    <b-table class="box" :data="ordenesFiltradas"
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
                                <!-- Solo mostrar botones de editar y eliminar si el usuario es admin -->
                                <b-tooltip label="Editar" position="is-top" v-if="esAdmin">
                                    <b-button class="btn-primary" @click="editarOrden(props.row)">
                                        <b-icon icon="pencil" />
                                    </b-button>
                                </b-tooltip>
                                <b-tooltip label="Eliminar" position="is-top" v-if="esAdmin">
                                    <b-button class="btn-primary" @click="eliminarOrden(props.row)">
                                        <b-icon icon="delete" />
                                    </b-button>
                                </b-tooltip>
                                
                            </div>
                        </b-table-column>
                    </b-table>
                </div>
            </div>
        </div>

        <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>

        <!-- Modal para editar orden (solo accesible para admin) -->
        <b-modal :active.sync="isEditModalActive" has-modal-card trap-focus aria-role="dialog" aria-modal>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">Editar Orden</p>
                    <button class="delete" aria-label="close" @click="isEditModalActive = false"></button>
                </header>
                <section class="modal-card-body">
                    <div v-if="ordenSeleccionada" class="form">
                        <div class="field">
                            <label class="label">Producto</label>
                            <div class="control">
                                <input class="input" type="text" readonly 
                                    :value="ordenSeleccionada.product ? ordenSeleccionada.product.name : 'N/A'">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Cantidad</label>
                            <div class="control">
                                <input class="input" type="number" v-model="ordenEditada.quantity" min="1">
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Precio de Compra</label>
                            <div  class="control">
                                <input readonly class="input" type="number" v-model="ordenEditada.purchasePrice" step="0.01" min="0">
                            </div>
                        </div>
                    </div>
                </section>
                <footer class="modal-card-foot">
                    <button class="button is-success" @click="guardarEdicion" :disabled="!ordenEditadaValida">Guardar</button>
                    <button class="button" @click="isEditModalActive = false">Cancelar</button>
                </footer>
            </div>
        </b-modal>

       
    </div>
</template>

<script>
import MensajeInicial from '../Extras/MensajeInicial'
import apiRequest from '../../Servicios/HttpService';
import AyudanteSesion from '../../Servicios/AyudanteSesion';

export default {
    name: "OrdenesLista", // Cambiado a un nombre multi-palabra para cumplir con las reglas de linting
    components: { MensajeInicial },

    data: () => ({
        ordenes: [],
        ordenesFiltradas: [],
        busqueda: '',
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
        
        // Modal de edición
        isEditModalActive: false,
        ordenSeleccionada: null,
        ordenEditada: {
            quantity: 0,
            purchasePrice: 0
        },
        
    
        // Estado de administrador
        esAdmin: false
    }),

    computed: {
        ordenEditadaValida() {
            return this.ordenEditada.quantity > 0 && this.ordenEditada.purchasePrice > 0;
        }
    },

    created() {
        // Verificar si el usuario es administrador
        this.verificarAdmin();
    },

    mounted() {
        this.obtenerOrdenes();
    },

    methods: {
        // Método para verificar si el usuario es administrador
        verificarAdmin() {
            // Obtener el rol del usuario desde AyudanteSesion
            const datosUsuario = AyudanteSesion.obtenerDatosSesion();
            this.esAdmin = datosUsuario.rol === 'Admin';
        },
        
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
        },

        obtenerOrdenes() {
            this.cargando = true;
            
            apiRequest({
                method: "GET",
                path: "order-details"
            })
            .then(respuesta => {
                this.cargando = false;
                console.log("Respuesta del servidor:", respuesta);
                
                if (respuesta && Array.isArray(respuesta.data)) {
                    this.ordenes = respuesta.data;
                    this.ordenesFiltradas = [...this.ordenes];
                } else {
                    this.ordenes = [];
                    this.ordenesFiltradas = [];
                    console.error("Formato de respuesta inesperado:", respuesta);
                }
            })
            .catch(error => {
                console.error("Error al obtener órdenes:", error);
                this.ordenes = [];
                this.ordenesFiltradas = [];
                this.cargando = false;
                this.$buefy.toast.open({
                    message: 'Error al cargar las órdenes',
                    type: 'is-danger'
                });
            });
        },

        filtrarOrdenes() {
            if (!this.busqueda.trim()) {
                this.ordenesFiltradas = [...this.ordenes];
                return;
            }

            const busquedaLower = this.busqueda.toLowerCase().trim();
            this.ordenesFiltradas = this.ordenes.filter(orden => {
                const nombreProducto = orden.product?.name?.toLowerCase() || '';
                const codigoProducto = orden.product?.code?.toLowerCase() || '';
                
                return nombreProducto.includes(busquedaLower) || codigoProducto.includes(busquedaLower);
            });
        },

        editarOrden(orden) {
            // Verificar si el usuario es administrador antes de permitir la edición
            if (!this.esAdmin) {
                this.$buefy.toast.open({
                    message: 'No tiene permisos para editar órdenes',
                    type: 'is-danger'
                });
                return;
            }
            
            this.ordenSeleccionada = orden;
            this.ordenEditada = {
                quantity: orden.quantity,
                purchasePrice: orden.purchasePriceUnit
            };
            this.isEditModalActive = true;
        },

        guardarEdicion() {
            // Verificar si el usuario es administrador antes de guardar cambios
            if (!this.esAdmin) {
                this.$buefy.toast.open({
                    message: 'No tiene permisos para editar órdenes',
                    type: 'is-danger'
                });
                return;
            }
            
            if (!this.ordenSeleccionada || !this.ordenEditadaValida) return;

            this.cargando = true;
            
            const datosActualizados = {
                quantity: parseInt(this.ordenEditada.quantity),
                purchasePrice: parseFloat(this.ordenEditada.purchasePrice),
                isActive: true
            };

            apiRequest({
                method: 'PATCH',
                path: `order-details/${this.ordenSeleccionada.id}`,
                data: datosActualizados
            })
            .then(resultado => {
                this.cargando = false;
                if (resultado && resultado.status >= 200 && resultado.status < 300) {
                    this.$buefy.toast.open({
                        message: 'Orden actualizada correctamente',
                        type: 'is-success'
                    });
                    this.isEditModalActive = false;
                    this.obtenerOrdenes(); // Recargar las órdenes
                } else {
                    this.$buefy.toast.open({
                        message: 'Error al actualizar la orden',
                        type: 'is-danger'
                    });
                }
            })
            .catch(error => {
                console.error("Error al actualizar orden:", error);
                this.cargando = false;
                this.$buefy.toast.open({
                    message: 'Error al actualizar la orden',
                    type: 'is-danger'
                });
            });
        },

        eliminarOrden(orden) {
            // Verificar si el usuario es administrador antes de permitir la eliminación
            if (!this.esAdmin) {
                this.$buefy.toast.open({
                    message: 'No tiene permisos para eliminar órdenes',
                    type: 'is-danger'
                });
                return;
            }
            
            this.$buefy.dialog.confirm({
                title: 'Eliminar orden',
                message: `¿Estás seguro de que deseas eliminar esta orden del producto ${orden.product ? orden.product.name : ''}?`,
                confirmText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true;
                    
                    apiRequest({
                        method: 'DELETE',
                        path: `order-details/${orden.id}`
                    })
                    .then(resultado => {
                        this.cargando = false;
                        if (resultado && resultado.status >= 200 && resultado.status < 300) {
                            this.$buefy.toast.open({
                                message: 'Orden eliminada correctamente',
                                type: 'is-success'
                            });
                            this.obtenerOrdenes(); // Recargar las órdenes
                        } else {
                            this.$buefy.toast.open({
                                message: 'Error al eliminar la orden',
                                type: 'is-danger'
                            });
                        }
                    })
                    .catch(error => {
                        console.error("Error al eliminar orden:", error);
                        this.cargando = false;
                        this.$buefy.toast.open({
                            message: 'Error al eliminar la orden',
                            type: 'is-danger'
                        });
                    });
                }
            });
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

