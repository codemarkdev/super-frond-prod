<template>
    <section>
        <nav-component :titulo="'Inventario'" :link="{ path: '/agregar-producto' }" :texto="'Agregar producto'" />
        <b-breadcrumb align="is-left">
            <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
            <b-breadcrumb-item active>Inventario</b-breadcrumb-item>
        </b-breadcrumb>
        <mensaje-inicial :titulo="'No se han encontrado productos :('"
            :subtitulo="'Agrega productos pulsando el botón de Agregar productos'" v-if="productos.length < 1" />

        <div class="" v-if="productos.length > 0">
            <cartas-totales :totales="cartasTotales" class="mb-4" />
            <!-- <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <b-select v-model="perPage" class="is-flex-grow-1 mr-2" @change="resetPagination">
                    <option value="5">5 por página</option>
                    <option value="10">10 por página</option>
                </b-select>
             
            </div> -->
            <div class="table-container">
                <b-table class="box" :data="productos"  :per-page="perPage"
                    :current-page.sync="currentPage" :pagination-simple="isPaginationSimple"
                    :pagination-position="paginationPosition" :default-sort-direction="defaultSortDirection"
                    :pagination-rounded="isPaginationRounded" :sort-icon="sortIcon" :sort-icon-size="sortIconSize"
                    default-sort="user.first_name" aria-next-label="Next page" aria-previous-label="Previous page"
                    aria-page-label="Page" aria-current-label="Current page">
                    <b-table-column label="ID" sortable v-slot="props">
                        {{ props.row.id }}
                    </b-table-column>
                    <b-table-column field="code" label="Código de barras" sortable searchable v-slot="props">
                        {{ props.row.code }}
                    </b-table-column>

                    <b-table-column field="name" label="Nombre" sortable searchable v-slot="props">
                        {{ props.row.name }}
                    </b-table-column>

                    <b-table-column field="precioCompra" label="Precio compra" sortable v-slot="props">
                        ${{ props.row.purchasePrice }}
                    </b-table-column>

                    <b-table-column field="precioVenta" label="Precio venta" sortable v-slot="props">
                        ${{ props.row.salePrice }}
                    </b-table-column>

                    <b-table-column field="precioTurista" label="Precio turista" sortable v-slot="props">
                        ${{ props.row.touristPrice }}
                    </b-table-column>

                    <b-table-column field="ganancia" label="Ganancia" sortable v-slot="props">
                        <b>${{ (props.row.salePrice - props.row.purchasePrice).toFixed(2) }}</b>
                    </b-table-column>
                    <b-table-column field="ganancia" label="Ganancia turista" sortable v-slot="props">
                        <b>${{ (props.row.touristPrice - props.row.purchasePrice).toFixed(2)}}</b>
                    </b-table-column>

                    <b-table-column field="vendidoMayoreo" label="¿Mayoreo?" sortable v-slot="props">
                        <b-tag type="is-danger" v-if="!props.row.wholesaleSale">No</b-tag>

                        <div v-if="props.row.wholesaleSale">
                            <b>Precio: </b>${{ props.row.wholesalePrice }}<br>
                            <b>A partir de: </b>{{ parseInt(props.row.wholesaleQuantity) }}
                        </div>
                    </b-table-column>

                    <b-table-column field="existencia" label="Existencia" sortable v-slot="props">
                        {{ props.row.stock }}
                    </b-table-column>
                    <!-- <b-table-column field="reservación de existencias " label="Reservación de existencias" v-slot="props">
                        {{ props.row.reservedStock }}
                    </b-table-column> -->

                    <b-table-column field="brand.brandName" label="Marca" sortable searchable v-slot="props">
                        {{ props.row.brand.brandName }}
                    </b-table-column>

                    <b-table-column field="category.categoryName" label="Categoría" sortable searchable v-slot="props">
                        {{ props.row.category.categoryName }}
                    </b-table-column>

                    <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                        <div class="buttons is-centered">
                            <b-tooltip label="Eliminar producto" position="is-top">
                                <b-button type="is-danger" @click="eliminar(props.row.id)">
                                    <b-icon icon="delete" />
                                </b-button>
                            </b-tooltip>
                            <b-tooltip label="Editar producto" position="is-top">
                                <b-button type="is-info" @click="editar(props.row.id)">
                                    <b-icon icon="pen" />
                                </b-button>
                            </b-tooltip>
                            <b-tooltip label="Agregar existencia" position="is-top">
                                <b-button type="is-primary" @click="agregarExistencia(props.row)">
                                    <b-icon icon="plus" />
                                </b-button>
                            </b-tooltip>
                            <b-tooltip label="Quitar existencia" position="is-top">
                                <b-button type="is-warning" @click="quitarExistencia(props.row)">
                                    <b-icon icon="minus" />
                                </b-button>
                            </b-tooltip>
                        </div>
                    </b-table-column>
                </b-table>
                <b-pagination
                    v-if="totalPages > 1"
                    :total="totalProductos"
                    :current.sync="currentPage"
                    :per-page="perPage"
                    :rounded="isPaginationRounded"
                    :simple="isPaginationSimple"
                    :position="paginationPosition"
                    @change="obtenerProductos"
                ></b-pagination>
            </div>
       
        </div>
        
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
</template>
<script>
// import HttpService from '../../Servicios/HttpService'
import NavComponent from '../Extras/NavComponent'
import MensajeInicial from '../Extras/MensajeInicial'
import CartasTotales from '../Extras/CartasTotales'
import apiRequest from '../../Servicios/HttpService';

export default {
    name: "ProductosComponent",
    components: { NavComponent, MensajeInicial, CartasTotales },

    data: () => ({
        productos: [],
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
        cartasTotales: [],
        totalProductos: 0,
        totalPages: 1
    }),

    mounted() {
        this.obtenerProductos()
    },

    methods: {
        agregarExistencia(producto) {
            this.$buefy.dialog.prompt({
                message: '¿Cuántas piezas vas a agregar de ' + producto.name+ '?',
                cancelText: 'Cancelar',
                confirmText: 'Agregar',
                inputAttrs: {
                    type: 'number',
                    placeholder: 'Escribe la cantidad de productos', 
                    value: '',
                    min: 1
                },
                trapFocus: true,
                onConfirm: (value) => {
                    this.cargando = true
                    apiRequest({
                        method: 'PATCH', 
                        path: `products/${producto.id}/add-stock?quantity=${Number(value)}`
                    })
                        .then(registrado => {
                            if (registrado) {
                                this.cargando = false
                                this.$buefy.toast.open(value + ' Productos agregados a ' + producto.name)
                                this.obtenerProductos()
                            }
                        })

                }
            })
        },

        quitarExistencia(producto) {
            this.$buefy.dialog.prompt({
                message: '¿Cuántas piezas vas a quitar de ' + producto.name + '?',
                cancelText: 'Cancelar',
                confirmText: 'Quitar',
                inputAttrs: {
                    type: 'number',
                    placeholder: 'Escribe la cantidad de productos',
                    value: '',
                    min: 1
                },
                trapFocus: true,
                onConfirm: (value) => {
                    if (value > producto.existencia) {
                        this.$buefy.toast.open('No puedes quitar más de ' + producto.stock+ ' productos')
                        return
                    }
                    this.cargando = true
                    
                    apiRequest({
                        method: 'PATCH', 
                        path: `products/${producto.id}/subtract-stock?quantity=${value}`
                    })
                        .then(registrado => {
                            if (registrado) {
                                this.cargando = false
                                this.$buefy.toast.open(value + ' Productos quitados a ' + producto.name)
                                this.obtenerProductos()
                            }
                        })

                }
            })
        },

        async eliminar(idProducto) {
            this.$buefy.dialog.confirm({
                title: 'Eliminar producto',
                message: 'Seguro que quieres <b>eliminar</b> este producto? Esta acción no se puede revertir.',
                confirmText: 'Sí, eliminar',
                cancelText: 'Cancelar',
                type: 'is-danger',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true

                    apiRequest({
                        method: 'DELETE', 
                        path: `products/${idProducto}`
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
                                    message: 'Producto eliminado.'
                                })
                                this.obtenerProductos()
                            }
                        })
                }
            })
        },

        editar(idProducto) {
            this.$router.push({
                name: "EditarProducto",
                params: { id: idProducto }
            })
        },

        obtenerProductos() {
            this.cargando = true
            apiRequest({
                method: "GET",
                path: `products?page=${this.currentPage}&limit=${this.perPage}`
            })
                .then(respuesta => {

                    this.productos = respuesta.data.data
                    this.totalProductos = respuesta.data.total
                    this.totalPages = respuesta.data.totalPages
                     apiRequest({
                        method: "GET",
                        path: 'products/inventory/total-value'})
                        .then(respuesta => {
                          
                            this.cartasTotales = [
                                { nombre: "Número Productos", total: this.totalProductos, icono: "package-variant-closed", clase: "has-text-danger" },
                                { nombre: "Total Inventario", total: `$ ${respuesta.data.toFixed(2)}`, icono: "chart-bar-stacked", clase: "has-text-primary" },
                        
                               
                            ]

                        })
              
                    apiRequest({
                        method: "GET",
                        path: 'products/inventory/total-profit'
                    })
                        .then(respuesta => {
                            this.cartasTotales.push(
                                { nombre: "Ganancia a precio venta", total: `$ ${respuesta.data.toFixed(2)}`, icono: "currency-usd", clase: "has-text-info" }
                            )
                        })

                    this.cargando = false
                })

      
        },

        resetPagination() {
            this.currentPage = 1;
            this.obtenerProductos();
        }
    }
}
</script>

