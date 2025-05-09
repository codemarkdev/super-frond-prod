<template>
    <div>
        <mensaje-inicial :titulo="'No se han encontrado productos eliminados'"
            :subtitulo="'Los productos eliminados aparecerán aquí'" v-if="!productosEliminados || productosEliminados.length < 1" />
    
        <div class="" v-if="productosEliminados && productosEliminados.length > 0">
            <!-- Quitamos la clase table-container que añade scrollbar -->
            <div>
                <b-table class="box" :data="productosEliminados" :per-page="perPage"
                    :current-page.sync="currentPage" :pagination-simple="isPaginationSimple"
                    :pagination-position="paginationPosition" :default-sort-direction="defaultSortDirection"
                    :pagination-rounded="isPaginationRounded" :sort-icon="sortIcon" :sort-icon-size="sortIconSize"
                    default-sort="user.first_name" aria-next-label="Next page" aria-previous-label="Previous page"
                    aria-page-label="Page" aria-current-label="Current page"
                    :sticky-header="false" :height="null">
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
    
                    <b-table-column field="deletedAt" label="Fecha eliminación" sortable v-slot="props">
                        {{ formatDate(props.row.deletedAt) }}
                    </b-table-column>
    
                    <b-table-column field="brand.brandName" label="Marca" sortable searchable v-slot="props">
                        {{ props.row.brand ? props.row.brand.brandName : '' }}
                    </b-table-column>
    
                    <b-table-column field="category.categoryName" label="Categoría" sortable searchable v-slot="props">
                        {{ props.row.category ? props.row.category.categoryName : '' }}
                    </b-table-column>
    
                    <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                        <div class="buttons is-centered">
                            <b-tooltip label="Restaurar al inventario" position="is-top">
                                <b-button class="btn-primary" @click="restaurarInventario(props.row)">
                                    <b-icon icon="restore" />
                                </b-button>
                            </b-tooltip>
                          
                        </div>
                    </b-table-column>
                </b-table>
                <b-pagination
                    v-if="totalPages > 1"
                    :total="totalProductosEliminados"
                    :current.sync="currentPage"
                    :per-page="perPage"
                    :rounded="isPaginationRounded"
                    :simple="isPaginationSimple"
                    :position="paginationPosition"
                    @change="obtenerProductosEliminados"
                ></b-pagination>
            </div>
        </div>
        
        <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>
    </div>
</template>
    
<script>
import MensajeInicial from '../Extras/MensajeInicial'
import apiRequest from '../../Servicios/HttpService';

export default {
    name: "ProductosEliminados",
    components: { MensajeInicial },
    
    data: () => ({
        productosEliminados: [],
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
        totalProductosEliminados: 0,
        totalPages: 1,
        totalValorEliminados: 0
    }),
    
    mounted() {
        this.obtenerProductosEliminados();
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
    
        restaurarInventario(producto) {
            this.$buefy.dialog.confirm({
                title: 'Restaurar al inventario',
                message: `¿Deseas restaurar el producto ${producto.name} al inventario?`,
                confirmText: 'Sí, restaurar',
                cancelText: 'Cancelar',
                type: 'is-success',
                hasIcon: true,
                onConfirm: () => {
                    this.cargando = true
                    
                    // Cambiamos el método y la ruta para usar el nuevo endpoint
                    apiRequest({
                        method: 'POST',
                        path: `products/activate-product/${producto.id}`
                    })
                    .then(resultado => {
                        this.cargando = false
                        if (resultado) {
                            this.$buefy.toast.open({
                                message: 'Producto restaurado al inventario correctamente',
                                type: 'is-success'
                            })
                            this.obtenerProductosEliminados()
                            // Emitimos un evento para que el componente padre sepa que debe actualizar el inventario
                            this.$emit('producto-restaurado')
                        } else {
                            this.$buefy.toast.open({
                                message: 'Error al restaurar el producto',
                                type: 'is-danger'
                            })
                        }
                    })
                }
            })
        },
    
      
    
        obtenerProductosEliminados() {
            this.cargando = true
            
            apiRequest({
                method: "GET",
                path: `products/findDeleted?page=${this.currentPage}&limit=${this.perPage}`
            })
            .then(respuesta => {
                if (respuesta && respuesta.data) {
                    this.productosEliminados = respuesta.data.data || [];
                    this.totalProductosEliminados = respuesta.data.total || 0;
                    this.totalPages = respuesta.data.totalPages || 1;
                    
                    // Calcular el valor total de los productos eliminados
                    let valorTotal = 0;
                    if (this.productosEliminados && this.productosEliminados.length > 0) {
                        this.productosEliminados.forEach(producto => {
                            if (producto.purchasePrice && producto.stock) {
                                valorTotal += producto.purchasePrice * producto.stock;
                            }
                        });
                    }
                    this.totalValorEliminados = valorTotal;
                } else {
                    // Si no hay datos, inicializar con arrays vacíos
                    this.productosEliminados = [];
                    this.totalProductosEliminados = 0;
                    this.totalPages = 1;
                    this.totalValorEliminados = 0;
                }
                
                this.cargando = false;
            })
            .catch(error => {
                console.error("Error al obtener productos eliminados:", error);
                this.cargando = false;
                this.productosEliminados = [];
                this.totalProductosEliminados = 0;
                this.totalPages = 1;
                this.totalValorEliminados = 0;
                
                this.$buefy.toast.open({
                    message: 'Error al cargar los productos eliminados',
                    type: 'is-danger'
                });
            });
        }
    }
}
</script>