<template>
    <section>
        <!-- Título principal que cambia según la pestaña activa -->
        <div v-if="activeTab === 'inventario'">
            <div class="level mb-5">
                <div class="level-left">
                    <div class="level-item">
                        <h1 class="title is-4">Inventario</h1>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <router-link to="/agregar-producto" class="button is-primary">
                            <span class="icon">
                                <i class="mdi mdi-plus"></i>
                            </span>
                            <span>Agregar producto</span>
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="activeTab === 'abollados'">
            <div class="level mb-5">
                <div class="level-left">
                    <div class="level-item">
                        <h1 class="title is-4">Productos Dañados</h1>
                    </div>
                </div>
                <!-- Sin botón de agregar en esta vista -->
            </div>
        </div>
        <div v-else-if="activeTab === 'eliminados'">
            <div class="level mb-5">
                <div class="level-left">
                    <div class="level-item">
                        <h1 class="title is-4">Productos Eliminados</h1>
                    </div>
                </div>
                <!-- Sin botón de agregar en esta vista -->
            </div>
        </div>
        <div v-else-if="activeTab === 'descuentos'">
            <div class="level mb-5">
                <div class="level-left">
                    <div class="level-item">
                        <h1 class="title is-4">Descuentos</h1>
                    </div>
                </div>
                <!-- Sin botón de agregar en esta vista -->
            </div>
        </div>
        
        <!-- Implementando tabs de Bulma según la documentación -->
        <div class="tabs is-boxed mb-4">
            <ul>
                <li :class="{ 'is-active': activeTab === 'inventario' }">
                    <a @click="cambiarTab('inventario')">
                        <span class="icon is-small"><i class="mdi mdi-package-variant-closed"></i></span>
                        <span>Inventario</span>
                    </a>
                </li>
                <li :class="{ 'is-active': activeTab === 'abollados' }">
                    <a @click="cambiarTab('abollados')">
                        <span class="icon is-small"><i class="mdi mdi-alert-circle"></i></span>
                        <span>Dañados</span>
                    </a>
                </li>
                <li :class="{ 'is-active': activeTab === 'descuentos' }">
                    <a @click="cambiarTab('descuentos')">
                        <span class="icon is-small"><i class="mdi mdi-tag-multiple"></i></span>
                        <span>Descuentos</span>
                    </a>
                </li>
                <!-- Solo mostrar la pestaña de eliminados si el usuario es admin -->
                <li v-if="isAdmin" :class="{ 'is-active': activeTab === 'eliminados' }">
                    <a @click="cambiarTab('eliminados')">
                        <span class="icon is-small"><i class="mdi mdi-archive"></i></span>
                        <span>Eliminados</span>
                    </a>
                </li>
            </ul>
        </div>
    
        <!-- Inventario Tab Content -->
        <div v-if="activeTab === 'inventario'">
            <mensaje-inicial :titulo="'No se han encontrado productos'"
                :subtitulo="'Agrega productos pulsando el botón de Agregar productos'" v-if="productos.length < 1" />
    
            <div class="" v-if="productos.length > 0">
                <div class="is-flex" style="gap: 10.5rem; flex-wrap: wrap;">
                    <cartas-totales :totales="cartasTotales" class="mb-4" />
                </div>
                <!-- Quitamos la clase table-container que añade scrollbar -->
                <div>
                    <b-table class="box" :data="productos" :per-page="perPageNumber"
                        :current-page.sync="currentPageNumber" :pagination-simple="isPaginationSimple"
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
    
                        <b-table-column field="existencia" label="Existencia" sortable v-slot="props">
                            {{ props.row.stock }}
                        </b-table-column>
    
                        <b-table-column field="brand.brandName" label="Marca" sortable searchable v-slot="props">
                            {{ props.row.brand.brandName }}
                        </b-table-column>
    
                        <b-table-column field="category.categoryName" label="Categoría" sortable searchable v-slot="props">
                            {{ props.row.category.categoryName }}
                        </b-table-column>
    
                        <b-table-column field="acciones" label="Acciones" centered v-slot="props">
                            <div class="buttons is-centered">
                                <b-tooltip label="Agregar existencia" position="is-top">
                                    <b-button class="btn-primary" @click="agregarExistencia(props.row)">
                                        <b-icon icon="plus" />
                                    </b-button>
                                </b-tooltip>
                                <b-tooltip label="Quitar existencia" position="is-top">
                                    <b-button class="btn-ghost" @click="quitarExistencia(props.row)">
                                        <b-icon icon="minus" />
                                    </b-button>
                                </b-tooltip>
                                <b-tooltip label="Marcar como abollado" position="is-top">
                                    <b-button class="btn-warning" @click="marcarComoDanado(props.row)">
                                        <b-icon icon="alert-circle" />
                                    </b-button>
                                </b-tooltip>
                                <b-tooltip label="Editar producto" position="is-top">
                                    <b-button class="btn-link-primary" @click="editar(props.row.id)">
                                        <b-icon icon="pen" />
                                    </b-button>
                                </b-tooltip>
                                <b-tooltip label="Eliminar producto" position="is-top">
                                    <b-button class="btn-link" @click="eliminar(props.row.id)">
                                        <b-icon icon="delete" />
                                    </b-button>
                                </b-tooltip>
                            </div>
                        </b-table-column>
                    </b-table>
                    <b-pagination
                        v-if="totalPages > 1"
                        :total="totalProductos"
                        :current.sync="currentPageNumber"
                        :per-page="perPageNumber"
                        :rounded="isPaginationRounded"
                        :simple="isPaginationSimple"
                        :position="paginationPosition"
                        @change="onPageChange"
                    ></b-pagination>
                </div>
            </div>
        </div>
    
        <!-- Componente Abollados -->
        <productos-abollados v-if="activeTab === 'abollados'" @producto-restaurado="obtenerProductos" />
        
        <!-- Componente Descuentos -->
        <gestion-descuentos v-if="activeTab === 'descuentos'" />
        
        <!-- Componente Eliminados (solo visible para admin) -->
        <productos-eliminados v-if="activeTab === 'eliminados' && isAdmin" @producto-restaurado="obtenerProductos" />
        
        <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    </section>
    </template>
    <script>
    import MensajeInicial from '../Extras/MensajeInicial'
    import CartasTotales from '../Extras/CartasTotales'
    import ProductosAbollados from '../Inventario/Productos-Abollados.vue'
    import ProductosEliminados from '../Inventario/Productos-Eliminados.vue'
    import GestionDescuentos from '../Descuentos/Descuentos.vue'
    import apiRequest from '../../Servicios/HttpService';
    import AyudanteSesion from '../../Servicios/AyudanteSesion';
    
    export default {
    name: "ProductosComponent",
    components: { 
        MensajeInicial, 
        CartasTotales,
        ProductosAbollados,
        ProductosEliminados,
        GestionDescuentos
    },
    
    data: () => ({
        activeTab: 'inventario',
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
        totalPages: 1,
        isAdmin: false // Por defecto no es admin
    }),
    
    computed: {
        // Asegurar que currentPage siempre sea un número
        currentPageNumber: {
            get() {
                return Number(this.currentPage) || 1;
            },
            set(value) {
                this.currentPage = Number(value) || 1;
            }
        },
        // Asegurar que perPage siempre sea un número
        perPageNumber: {
            get() {
                return Number(this.perPage) || 10;
            },
            set(value) {
                this.perPage = Number(value) || 10;
            }
        }
    },
    
    mounted() {
        // Inicializar con valores numéricos
        this.currentPage = 1;
        this.perPage = 10;
        this.obtenerProductos();
        this.verificarPermisos();
    },
    
    methods: {
        verificarPermisos() {
            // Usar AyudanteSesion para verificar si el usuario es administrador
            const datosUsuario = AyudanteSesion.obtenerDatosSesion();
            this.isAdmin = datosUsuario.rol === 'Admin';
            console.log("Rol del usuario:", datosUsuario.rol);
            console.log("Es administrador:", this.isAdmin);
        },
    
        cambiarTab(tab) {
            this.activeTab = tab
            if (tab === 'inventario') {
                // Resetear paginación al cambiar a inventario
                this.currentPage = 1;
                this.obtenerProductos()
            }
            // Los otros tabs tienen sus propios componentes que manejan su carga de datos
        },
    
        onPageChange(page) {
            // Asegurar que page sea un número
            this.currentPage = Number(page) || 1;
            this.obtenerProductos();
        },
    
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
                    // Asegurarse de que value sea un número
                    const cantidad = Number(value);
                    if (isNaN(cantidad) || cantidad <= 0) {
                        this.$buefy.toast.open({
                            message: 'Por favor ingresa una cantidad válida',
                            type: 'is-danger'
                        });
                        return;
                    }
                    
                    this.cargando = true
                    apiRequest({
                        method: 'PATCH', 
                        path: `products/${producto.id}/add-stock?quantity=${cantidad}`
                    })
                        .then(registrado => {
                            if (registrado) {
                                this.cargando = false
                                this.$buefy.toast.open(cantidad + ' Productos agregados a ' + producto.name)
                                this.obtenerProductos()
                            }
                        })
                        .catch(error => {
                            this.cargando = false;
                            console.error('Error al agregar existencia:', error);
                            this.$buefy.toast.open({
                                message: 'Error al agregar existencia',
                                type: 'is-danger'
                            });
                        });
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
                    // Asegurarse de que value sea un número
                    const cantidad = Number(value);
                    if (isNaN(cantidad) || cantidad <= 0) {
                        this.$buefy.toast.open({
                            message: 'Por favor ingresa una cantidad válida',
                            type: 'is-danger'
                        });
                        return;
                    }
                    
                    if (cantidad > producto.stock) {
                        this.$buefy.toast.open('No puedes quitar más de ' + producto.stock + ' productos')
                        return
                    }
                    this.cargando = true
                    
                    apiRequest({
                        method: 'PATCH', 
                        path: `products/${producto.id}/subtract-stock?quantity=${cantidad}`
                    })
                        .then(registrado => {
                            if (registrado) {
                                this.cargando = false
                                this.$buefy.toast.open(cantidad + ' Productos quitados a ' + producto.name)
                                this.obtenerProductos()
                            }
                        })
                        .catch(error => {
                            this.cargando = false;
                            console.error('Error al quitar existencia:', error);
                            this.$buefy.toast.open({
                                message: 'Error al quitar existencia',
                                type: 'is-danger'
                            });
                        });
                }
            })
        },
    
        marcarComoDanado(producto) {
            this.$buefy.dialog.prompt({
                title: 'Marcar como abollado',
                message: '¿Cuántas unidades de ' + producto.name + ' están abolladas?',
                cancelText: 'Cancelar',
                confirmText: 'Marcar como abollado',
                inputAttrs: {
                    type: 'number',
                    placeholder: 'Cantidad',
                    value: '1',
                    min: 1,
                    max: producto.stock
                },
                trapFocus: true,
                onConfirm: (value) => {
                    // Asegurarse de que cantidad sea un número
                    const cantidad = Number(value);
                    if (isNaN(cantidad) || cantidad <= 0) {
                        this.$buefy.toast.open({
                            message: 'Por favor ingresa una cantidad válida',
                            type: 'is-danger'
                        });
                        return;
                    }
                    
                    if (cantidad > producto.stock) {
                        this.$buefy.toast.open({
                            message: 'No puedes marcar más unidades de las disponibles',
                            type: 'is-danger'
                        })
                        return
                    }
    
                    this.$buefy.dialog.prompt({
                        title: 'Motivo del abollado',
                        message: 'Indica el motivo por el que el producto está abollado',
                        cancelText: 'Cancelar',
                        confirmText: 'Confirmar',
                        inputAttrs: {
                            type: 'text',
                            placeholder: 'Motivo del abollado',
                            maxlength: 200,
                            required: true
                        },
                        trapFocus: true,
                        onConfirm: (motivo) => {
                            this.cargando = true
                            
                            apiRequest({
                                method: 'POST',
                                path: 'damaged-products',
                                data: {
                                    productId: producto.id,
                                    quantity: cantidad,
                                    notes: motivo
                                }
                            })
                            .then(resultado => {
                                this.cargando = false
                                if (resultado) {
                                    this.$buefy.toast.open({
                                        message: 'Producto marcado como abollado correctamente',
                                        type: 'is-success'
                                    })
                                    this.obtenerProductos()
                                } else {
                                    this.$buefy.toast.open({
                                        message: 'Error al marcar el producto como abollado',
                                        type: 'is-danger'
                                    })
                                }
                            })
                            .catch(error => {
                                this.cargando = false
                                this.$buefy.toast.open({
                                    message: 'Error al marcar el producto como abollado: ' + (error.message || 'Error desconocido'),
                                    type: 'is-danger'
                                })
                            })
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
                        .catch(error => {
                            this.cargando = false;
                            console.error('Error al eliminar producto:', error);
                            this.$buefy.toast.open({
                                message: 'Error al eliminar el producto',
                                type: 'is-danger'
                            });
                        });
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
            
            // Asegurarse de que currentPage y perPage sean números válidos
            const page = Number(this.currentPage);
            const limit = Number(this.perPage);
            
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                console.error('Parámetros de paginación inválidos:', { page, limit });
                this.$buefy.toast.open({
                    message: 'Error en los parámetros de paginación',
                    type: 'is-danger'
                });
                // Resetear a valores por defecto
                this.currentPage = 1;
                this.perPage = 10;
                this.cargando = false;
                return;
            }
            
            apiRequest({
                method: "GET",
                path: `products?page=${page}&limit=${limit}`
            })
                .then(respuesta => {
                    if (respuesta && respuesta.data) {
                        this.productos = respuesta.data.data || [];
                        this.totalProductos = respuesta.data.total || 0;
                        this.totalPages = respuesta.data.totalPages || 1;
                        
                        apiRequest({
                            method: "GET",
                            path: 'products/inventory/total-value'
                        })
                        .then(respuesta => {
                            this.cartasTotales = [
                                { nombre: "Número Productos", total: this.totalProductos, icono: "package-variant-closed", clase: "has-text-danger" },
                                { nombre: "Total Inventario", total: `$ ${parseFloat(respuesta.data).toLocaleString('en-US',{
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits:2
                                })}`, icono: "chart-bar-stacked", clase: "has-text-primary" },
                            ]
                        })
                        .catch(error => {
                            console.error('Error al obtener valor total del inventario:', error);
                        });
                  
                        apiRequest({
                            method: "GET",
                            path: 'products/inventory/total-profit'
                        })
                        .then(respuesta => {
                            this.cartasTotales.push(
                                { nombre: "Ganancia a precio venta", total: `$ ${parseFloat(respuesta.data).toLocaleString('en-US',{
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}`, icono: "currency-usd", clase: "has-text-info" }
                            )
                        })
                        .catch(error => {
                            console.error('Error al obtener ganancia total:', error);
                        })
                        .finally(() => {
                            this.cargando = false;
                        });
                    } else {
                        this.productos = [];
                        this.totalProductos = 0;
                        this.totalPages = 1;
                        this.cartasTotales = [];
                        this.cargando = false;
                    }
                })
                .catch(error => {
                    console.error('Error al obtener productos:', error);
                    this.$buefy.toast.open({
                        message: 'Error al cargar los productos',
                        type: 'is-danger'
                    });
                    this.productos = [];
                    this.totalProductos = 0;
                    this.totalPages = 1;
                    this.cartasTotales = [];
                    this.cargando = false;
                });
        },
    
        resetPagination() {
            this.currentPage = 1;
            this.obtenerProductos();
        }
    }
    }
    </script>