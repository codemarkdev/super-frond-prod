<template>
  <div>
    <!-- Estadísticas de pérdidas -->
    <div class="box mb-4" v-if="productosAbollados && productosAbollados.length > 0">
      <h3 class="title is-5 mb-3">Estadísticas de Pérdidas</h3>
      <div class="is-flex" style="gap: 10.5rem; flex-wrap: wrap;">
        <cartas-totales :totales="cartasEstadisticasPerdidas" class="mb-4" />
      </div>
      
      <!-- Pérdidas por marca -->
      <div v-if="estadisticasPerdidas && estadisticasPerdidas.byBrand && estadisticasPerdidas.byBrand.length > 0">
        <h4 class="subtitle is-6 mt-4 mb-2">Pérdidas por Marca</h4>
        <b-table 
          :data="estadisticasPerdidas.byBrand"
          :columns="columnasPorMarca"
          :striped="true"
          :narrowed="true"
          :hoverable="true">
        </b-table>
      </div>
      
      <!-- Filtro por nombre de proveedor -->
      <div class="field mt-4">
        <label class="label">Filtrar por Proveedor</label>
        <div class="control">
          <div class="is-flex">
            <b-input v-model="nombreProveedor" placeholder="Nombre del proveedor" expanded class="mr-2"></b-input>
            <b-button @click="filtrarPorNombreProveedor" type="is-primary">Filtrar</b-button>
            <b-button @click="limpiarFiltro" type="is-light" class="ml-2" v-if="filtroProveedor">Limpiar</b-button>
          </div>
        </div>
      </div>
    </div>

    <mensaje-inicial 
      :titulo="'No se han encontrado productos abollados'" 
      :subtitulo="'Los productos marcados como abollados aparecerán aquí'" 
      v-if="productosAbollados.length < 1" 
    />

    <div v-if="productosAbollados.length > 0">
      <div class="box">
        <b-table 
          :data="productosAbollados" 
          :per-page="perPage"
          :current-page.sync="currentPage" 
          :pagination-simple="isPaginationSimple"
          :pagination-position="paginationPosition" 
          :pagination-rounded="isPaginationRounded"
          :sort-icon="sortIcon" 
          :sort-icon-size="sortIconSize"
          default-sort="dateReported" 
          default-sort-direction="desc"
          aria-next-label="Next page" 
          aria-previous-label="Previous page"
          aria-page-label="Page" 
          aria-current-label="Current page"
        >
          <b-table-column field="id" label="ID" sortable v-slot="props">
            {{ props.row.id }}
          </b-table-column>

          <b-table-column field="product.code" label="Código" sortable searchable v-slot="props">
            {{ props.row.product.code }}
          </b-table-column>

          <b-table-column field="product.name" label="Producto" sortable searchable v-slot="props">
            {{ props.row.product.name }}
          </b-table-column>

          <b-table-column field="brand.brandName" label="Marca" sortable searchable v-slot="props">
            {{ props.row.brand.brandName }}
          </b-table-column>

          <b-table-column field="quantity" label="Cantidad" sortable v-slot="props">
            {{ props.row.quantity }}
          </b-table-column>

          <b-table-column field="dateReported" label="Fecha reporte" sortable v-slot="props">
            {{ formatDate(props.row.dateReported) }}
          </b-table-column>

          <b-table-column field="notes" label="Notas" v-slot="props">
            <b-tooltip :label="props.row.notes" position="is-top" multilined>
              <span>{{ truncateText(props.row.notes, 20) }}</span>
            </b-tooltip>
          </b-table-column>

          <b-table-column field="replaced" label="Estado" v-slot="props">
            <b-tag type="is-danger" v-if="!props.row.replaced">Pendiente</b-tag>
            <b-tag type="is-success" v-else>Reemplazado</b-tag>
          </b-table-column>

          <b-table-column field="replacementRequested" label="Reposición" v-slot="props">
            <b-tag 
              :type="getReplacementTagType(props.row)"
            >
              {{ getReplacementStatus(props.row) }}
            </b-tag>
          </b-table-column>

          <b-table-column field="acciones" label="Acciones" centered v-slot="props">
            <div class="buttons is-centered">
              <b-tooltip label="Ver detalles" position="is-top">
                <b-button class="btn-primary" @click="verDetalles(props.row)">
                  <b-icon icon="eye" />
                </b-button>
              </b-tooltip>
              
              <b-tooltip label="Solicitar reposición" position="is-top" v-if="!props.row.replacementRequested && !props.row.replaced && isAdmin">
                <b-button class="btn-warning" @click="solicitarReemplazo(props.row)">
                  <b-icon icon="refresh" />
                </b-button>
              </b-tooltip>
              
              <b-tooltip label="Aprobar reposición" position="is-top" v-if="props.row.replacementRequested && !props.row.replacementApproved && !props.row.replaced && isAdmin">
                <b-button class="btn-info" @click="aprobarReposicion(props.row)">
                  <b-icon icon="check" />
                </b-button>
              </b-tooltip>
              
              <b-tooltip label="Procesar reposición" position="is-top" v-if="props.row.replacementApproved && !props.row.replaced && isAdmin">
                <b-button class="btn-success" @click="procesarReposicion(props.row)">
                  <b-icon icon="package-variant-closed" />
                </b-button>
              </b-tooltip>
              
              
            </div>
          </b-table-column>
        </b-table>
        
        <b-pagination
          v-if="totalPages > 1"
          :total="totalProductosAbollados"
          :current.sync="currentPage"
          :per-page="perPage"
          :rounded="isPaginationRounded"
          :simple="isPaginationSimple"
          :position="paginationPosition"
          @change="obtenerProductosAbollados"
        ></b-pagination>
      </div>
    </div>

    <!-- Modal de detalles -->
    <b-modal :active.sync="isDetallesModalActive" has-modal-card>
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Detalles del producto abollado</p>
        </header>
        <section class="modal-card-body">
          <div v-if="productoSeleccionado">
            <div class="columns">
              <div class="column">
                <h4 class="subtitle is-5">Información del producto</h4>
                <div class="content">
                  <p><strong>Nombre:</strong> {{ productoSeleccionado.product.name }}</p>
                  <p><strong>Código:</strong> {{ productoSeleccionado.product.code }}</p>
                  <p><strong>Marca:</strong> {{ productoSeleccionado.brand.brandName }}</p>
                  <p><strong>Proveedor:</strong> {{ productoSeleccionado.brand.provider.name }}</p>
                  <p><strong>Precio de compra:</strong> ${{ productoSeleccionado.product.purchasePrice }}</p>
                  <p><strong>Precio de venta:</strong> ${{ productoSeleccionado.product.salePrice }}</p>
                </div>
              </div>
              <div class="column">
                <h4 class="subtitle is-5">Información del daño</h4>
                <div class="content">
                  <p><strong>Cantidad:</strong> {{ productoSeleccionado.quantity }}</p>
                  <p><strong>Fecha de reporte:</strong> {{ formatDate(productoSeleccionado.dateReported) }}</p>
                  <p><strong>Notas:</strong> {{ productoSeleccionado.notes }}</p>
                  <p><strong>Estado:</strong> 
                    <b-tag type="is-danger" v-if="!productoSeleccionado.replaced">Pendiente</b-tag>
                    <b-tag type="is-success" v-else>Reemplazado</b-tag>
                  </p>
                  <p><strong>Reposición:</strong> 
                    <b-tag :type="getReplacementTagType(productoSeleccionado)">
                      {{ getReplacementStatus(productoSeleccionado) }}
                    </b-tag>
                  </p>
                  <p v-if="productoSeleccionado.replaced">
                    <strong>Cantidad reemplazada:</strong> {{ productoSeleccionado.replacedQuantity }}
                  </p>
                  <p v-if="productoSeleccionado.replaced">
                    <strong>Fecha de reemplazo:</strong> {{ formatDate(productoSeleccionado.dateReplaced) }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="isDetallesModalActive = false">Cerrar</button>
          <button 
            class="button is-warning" 
            v-if="productoSeleccionado && !productoSeleccionado.replacementRequested && !productoSeleccionado.replaced && isAdmin"
            @click="solicitarReemplazo(productoSeleccionado)"
          >
            Solicitar reposición
          </button>
          <button 
            class="button is-info" 
            v-if="productoSeleccionado && productoSeleccionado.replacementRequested && !productoSeleccionado.replacementApproved && !productoSeleccionado.replaced && isAdmin"
            @click="aprobarReposicion(productoSeleccionado)"
          >
            Aprobar reposición
          </button>
          <button 
            class="button is-success" 
            v-if="productoSeleccionado && productoSeleccionado.replacementApproved && !productoSeleccionado.replaced && isAdmin"
            @click="procesarReposicion(productoSeleccionado)"
          >
            Procesar reposición
          </button>
          <button 
            class="button is-success" 
            v-if="productoSeleccionado && !productoSeleccionado.replaced && isAdmin"
            @click="restaurarProducto(productoSeleccionado)"
          >
            Restaurar al inventario
          </button>
        </footer>
      </div>
    </b-modal>

    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
  </div>
</template>

<script>
import MensajeInicial from '../Extras/MensajeInicial'
import CartasTotales from '../Extras/CartasTotales'
import apiRequest from '../../Servicios/HttpService'
import AyudanteSesion from '../../Servicios/AyudanteSesion'

export default {
  name: 'ProductosAbollados',
  components: {
    MensajeInicial,
    CartasTotales
  },
  
  data: () => ({
    productosAbollados: [],
    cargando: false,
    isPaginationSimple: false,
    isPaginationRounded: true,
    paginationPosition: 'bottom',
    sortIcon: 'arrow-up',
    sortIconSize: 'is-medium',
    currentPage: 1,
    perPage: 10,
    totalProductosAbollados: 0,
    totalPages: 1,
    isAdmin: false,
    isDetallesModalActive: false,
    productoSeleccionado: null,
    
    // PROPIEDADES PARA ESTADÍSTICAS
    estadisticasPerdidas: null,
    cartasEstadisticasPerdidas: [],
    filtroProveedor: null,
    nombreProveedor: '',
    columnasPorMarca: [
      {
        field: 'brandName',
        label: 'Marca',
        sortable: true
      },
      {
        field: 'totalLoss',
        label: 'Pérdida Total ($)',
        numeric: true,
        sortable: true,
        formatter: value => `$${parseFloat(value).toFixed(2)}`
      },
      {
        field: 'replacedLoss',
        label: 'Pérdida Reemplazada ($)',
        numeric: true,
        sortable: true,
        formatter: value => `$${parseFloat(value).toFixed(2)}`
      },
      {
        field: 'netLoss',
        label: 'Pérdida Neta ($)',
        numeric: true,
        sortable: true,
        formatter: value => {
          const netLoss = parseFloat(value) || 0;
          return `$${netLoss.toFixed(2)}`;
        }
      }
    ],
    // PROPIEDAD PARA PROVEEDORES
    proveedores: [],
  }),
  
  mounted() {
    this.obtenerProductosAbollados()
    this.verificarPermisos()
    this.cargarEstadisticasPerdidas()
    this.cargarProveedores()
  },
  
  methods: {
    verificarPermisos() {
      // Usar AyudanteSesion para verificar si el usuario es administrador
      const datosUsuario = AyudanteSesion.obtenerDatosSesion()
      this.isAdmin = datosUsuario.rol === 'Admin'
      console.log("Rol del usuario:", datosUsuario.rol)
      console.log("Es administrador:", this.isAdmin)
    },
    
    obtenerProductosAbollados() {
      this.cargando = true
      
      // Agregar console.log para depuración
      console.log("Obteniendo productos abollados...")
      
      apiRequest({
        method: 'GET',
        path: 'damaged-products'
      })
      .then(respuesta => {
        // Agregar console.log para ver la respuesta
        console.log("Respuesta de damaged-products:", respuesta)
        
        // Verificar si la respuesta tiene una estructura diferente
        if (respuesta && respuesta.data) {
          this.productosAbollados = respuesta.data
        } else {
          this.productosAbollados = respuesta || []
        }
        
        this.totalProductosAbollados = this.productosAbollados.length
        this.totalPages = Math.ceil(this.totalProductosAbollados / this.perPage)
        this.cargando = false
        
        // Agregar console.log para verificar los datos procesados
        console.log("Productos abollados procesados:", this.productosAbollados)
        console.log("Total productos abollados:", this.totalProductosAbollados)
        
        // Si no hay datos, agregar datos de prueba para verificar que el componente funciona
        if (this.productosAbollados.length === 0) {
          console.log("No hay productos abollados, agregando datos de prueba...")
          this.productosAbollados = [
            {
              id: 1,
              quantity: 12,
              dateReported: "2025-03-29T02:16:10.000Z",
              replaced: false,
              dateReplaced: null,
              replacedQuantity: null,
              notes: "Producto de prueba",
              replacementRequested: true,
              replacementApproved: true,
              product: {
                id: 1,
                code: "PROD123",
                name: "Producto de prueba",
                purchasePrice: 1200,
                salePrice: 1500,
                touristPrice: 1500,
                stock: 88
              },
              brand: {
                id: 1,
                brandName: "Marca de prueba",
                provider: {
                  id: 1,
                  name: "Proveedor de prueba"
                }
              }
            }
          ];
          this.totalProductosAbollados = this.productosAbollados.length;
          this.totalPages = Math.ceil(this.totalProductosAbollados / this.perPage);
        }
      })
      .catch(error => {
        console.error('Error al obtener productos abollados:', error)
        this.$buefy.toast.open({
          message: 'Error al cargar los productos abollados: ' + (error.message || 'Error desconocido'),
          type: 'is-danger'
        })
        this.cargando = false
      })
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },
    
    getReplacementStatus(producto) {
      if (producto.replaced) {
        return 'Reemplazado'
      } else if (producto.replacementRequested) {
        return producto.replacementApproved ? 'Aprobado' : 'Pendiente de aprobación'
      }
      return 'No solicitado'
    },
    
    getReplacementTagType(producto) {
      if (producto.replaced) {
        return 'is-success'
      } else if (producto.replacementRequested) {
        return producto.replacementApproved ? 'is-info' : 'is-warning'
      }
      return 'is-light'
    },
    
    verDetalles(producto) {
      this.productoSeleccionado = producto
      this.isDetallesModalActive = true
    },
    
    solicitarReemplazo(producto) {
      // Verificar si el usuario es administrador
      if (!this.isAdmin) {
        this.$buefy.toast.open({
          message: 'No tienes permisos para realizar esta acción',
          type: 'is-danger'
        })
        return
      }
      
      this.$buefy.dialog.confirm({
        title: 'Solicitar reposición',
        message: `¿Deseas solicitar la reposición de ${producto.quantity} unidades de ${producto.product.name} al proveedor ${producto.brand.provider.name}?`,
        confirmText: 'Sí, solicitar',
        cancelText: 'Cancelar',
        type: 'is-warning',
        hasIcon: true,
        onConfirm: () => {
          this.cargando = true
          
          console.log(`Solicitando reposición para el producto dañado ID: ${producto.id}`)
          
          apiRequest({
            method: 'PATCH',
            path: `damaged-products/${producto.id}/request-replacement`
          })
          .then(resultado => {
            this.cargando = false
            console.log("Resultado de la solicitud de reposición:", resultado)
            
            if (resultado) {
              this.$buefy.toast.open({
                message: 'Reposición solicitada correctamente al proveedor',
                type: 'is-success'
              })
              this.obtenerProductosAbollados()
              this.cargarEstadisticasPerdidas() // ACTUALIZAR ESTADÍSTICAS
              this.isDetallesModalActive = false
            } else {
              this.$buefy.toast.open({
                message: 'Error al solicitar la reposición',
                type: 'is-danger'
              })
            }
          })
          .catch(error => {
            this.cargando = false
            console.error('Error al solicitar reposición:', error)
            this.$buefy.toast.open({
              message: 'Error al solicitar la reposición: ' + (error.message || 'Error desconocido'),
              type: 'is-danger'
            })
          })
        }
      })
    },
    
    aprobarReposicion(producto) {
      // Verificar si el usuario es administrador
      if (!this.isAdmin) {
        this.$buefy.toast.open({
          message: 'No tienes permisos para realizar esta acción',
          type: 'is-danger'
        })
        return
      }
      
      this.$buefy.dialog.prompt({
        title: 'Aprobar reposición',
        message: `¿Cuántas unidades de ${producto.product.name} apruebas para reposición? (Máximo: ${producto.quantity})`,
        inputAttrs: {
          type: 'number',
          placeholder: 'Cantidad a aprobar',
          min: 1,
          max: producto.quantity,
          value: producto.quantity
        },
        confirmText: 'Aprobar',
        cancelText: 'Cancelar',
        type: 'is-info',
        hasIcon: true,
        onConfirm: (cantidad) => {
          if (cantidad > producto.quantity) {
            this.$buefy.toast.open({
              message: `No puedes aprobar más de ${producto.quantity} unidades`,
              type: 'is-danger'
            })
            return
          }
          
          this.cargando = true
          
          console.log(`Aprobando reposición para el producto dañado ID: ${producto.id}, cantidad: ${cantidad}`)
          
          apiRequest({
            method: 'PATCH',
            path: `damaged-products/${producto.id}/approve-replacement`,
            data: {
              approvedQuantity: Number(cantidad)
            }
          })
          .then(resultado => {
            this.cargando = false
            console.log("Resultado de la aprobación de reposición:", resultado)
            
            if (resultado) {
              this.$buefy.toast.open({
                message: `Reposición de ${cantidad} unidades aprobada correctamente`,
                type: 'is-success'
              })
              this.obtenerProductosAbollados()
              this.cargarEstadisticasPerdidas() // ACTUALIZAR ESTADÍSTICAS
              this.isDetallesModalActive = false
            } else {
              this.$buefy.toast.open({
                message: 'Error al aprobar la reposición',
                type: 'is-danger'
              })
            }
          })
          .catch(error => {
            this.cargando = false
            console.error('Error al aprobar reposición:', error)
            this.$buefy.toast.open({
              message: 'Error al aprobar la reposición: ' + (error.message || 'Error desconocido'),
              type: 'is-danger'
            })
          })
        }
      })
    },
    
    procesarReposicion(producto) {
      // Verificar si el usuario es administrador
      if (!this.isAdmin) {
        this.$buefy.toast.open({
          message: 'No tienes permisos para realizar esta acción',
          type: 'is-danger'
        })
        return
      }
      
      this.$buefy.dialog.prompt({
        title: 'Procesar reposición recibida',
        message: `¿Cuántas unidades de ${producto.product.name} has recibido como reposición?`,
        inputAttrs: {
          type: 'number',
          placeholder: 'Cantidad recibida',
          min: 1,
          value: producto.quantity
        },
        confirmText: 'Procesar',
        cancelText: 'Cancelar',
        type: 'is-success',
        hasIcon: true,
        onConfirm: (cantidad) => {
          this.cargando = true
          
          console.log(`Procesando reposición para el producto dañado ID: ${producto.id}, cantidad recibida: ${cantidad}`)
          
          apiRequest({
            method: 'PATCH',
            path: `damaged-products/${producto.id}/process-replacement`,
            data: {
              actualReplacedQuantity: Number(cantidad)
            }
          })
          .then(resultado => {
            this.cargando = false
            console.log("Resultado del procesamiento de reposición:", resultado)
            
            if (resultado) {
              this.$buefy.toast.open({
                message: `Reposición de ${cantidad} unidades procesada correctamente`,
                type: 'is-success'
              })
              this.obtenerProductosAbollados()
              this.cargarEstadisticasPerdidas() // ACTUALIZAR ESTADÍSTICAS
              this.isDetallesModalActive = false
            } else {
              this.$buefy.toast.open({
                message: 'Error al procesar la reposición',
                type: 'is-danger'
              })
            }
          })
          .catch(error => {
            this.cargando = false
            console.error('Error al procesar reposición:', error)
            
            let errorMessage = 'Error al procesar la reposición';
            
            // Manejar códigos de error específicos
            if (error.status === 400) {
              errorMessage = 'La cantidad recibida es mayor que la cantidad aprobada';
            } else if (error.status === 404) {
              errorMessage = 'Producto dañado no encontrado';
            } else if (error.status === 409) {
              errorMessage = 'La reposición no ha sido aprobada previamente';
            }
            
            this.$buefy.toast.open({
              message: errorMessage,
              type: 'is-danger'
            })
          })
        }
      })
    },
    
    restaurarProducto(producto) {
      // Verificar si el usuario es administrador
      if (!this.isAdmin) {
        this.$buefy.toast.open({
          message: 'No tienes permisos para realizar esta acción',
          type: 'is-danger'
        })
        return
      }
      
      this.$buefy.dialog.prompt({
        title: 'Restaurar producto',
        message: `¿Cuántas unidades de ${producto.product.name} deseas restaurar al inventario? (Máximo: ${producto.quantity})`,
        inputAttrs: {
          type: 'number',
          placeholder: 'Cantidad a restaurar',
          min: 1,
          max: producto.quantity,
          value: producto.quantity
        },
        confirmText: 'Restaurar',
        cancelText: 'Cancelar',
        type: 'is-success',
        hasIcon: true,
        onConfirm: (cantidad) => {
          if (cantidad > producto.quantity) {
            this.$buefy.toast.open({
              message: `No puedes restaurar más de ${producto.quantity} unidades`,
              type: 'is-danger'
            })
            return
          }
          
          this.cargando = true
          
          apiRequest({
            method: 'PATCH',
            path: `damaged-products/${producto.id}/restore`,
            data: {
              quantity: Number(cantidad)
            }
          })
          .then(resultado => {
            this.cargando = false
            if (resultado) {
              this.$buefy.toast.open({
                message: `${cantidad} unidades restauradas al inventario correctamente`,
                type: 'is-success'
              })
              this.obtenerProductosAbollados()
              this.cargarEstadisticasPerdidas() // ACTUALIZAR ESTADÍSTICAS
              this.isDetallesModalActive = false
              this.$emit('producto-restaurado')
            } else {
              this.$buefy.toast.open({
                message: 'Error al restaurar el producto',
                type: 'is-danger'
              })
            }
          })
          .catch(error => {
            this.cargando = false
            this.$buefy.toast.open({
              message: 'Error al restaurar el producto: ' + (error.message || 'Error desconocido'),
              type: 'is-danger'
            })
          })
        }
      })
    },
    
    // MÉTODOS PARA ESTADÍSTICAS DE PÉRDIDAS
    
    // Método para cargar estadísticas de pérdidas
    cargarEstadisticasPerdidas() {
      this.cargando = true;
      
      // Construir la ruta con el filtro de proveedor si existe
      let path = 'damaged-products/statistics';
      if (this.filtroProveedor) {
        path += `?providerId=${this.filtroProveedor}`;
      }
      
      console.log("Cargando estadísticas de pérdidas...");
      
      apiRequest({
        method: "GET",
        path: path
      })
      .then(respuesta => {
        console.log("Respuesta de estadísticas:", respuesta);
        
        if (respuesta && respuesta.data) {
          this.estadisticasPerdidas = respuesta.data;
          
          // Calcular pérdida neta para cada marca si no viene en la respuesta
          if (this.estadisticasPerdidas.byBrand && this.estadisticasPerdidas.byBrand.length > 0) {
            this.estadisticasPerdidas.byBrand.forEach(marca => {
              if (!marca.netLoss) {
                marca.netLoss = (parseFloat(marca.totalLoss) - parseFloat(marca.replacedLoss)).toFixed(2);
              }
            });
          }
          
          // Actualizar las cartas de estadísticas con formato de miles
          this.cartasEstadisticasPerdidas = [
            { 
              nombre: "Pérdida Total", 
              total: `$ ${parseFloat(this.estadisticasPerdidas.totalLoss).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 
              icono: "alert-circle", 
              clase: "has-text-danger" 
            },
            { 
              nombre: "Pérdida Reemplazada", 
              total: `$ ${parseFloat(this.estadisticasPerdidas.replacedLoss).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 
              icono: "refresh", 
              clase: "has-text-info" 
            },
            { 
              nombre: "Pérdida Neta", 
              total: `$ ${parseFloat(this.estadisticasPerdidas.netLoss).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 
              icono: "calculator", 
              clase: "has-text-warning" 
            }
          ];
        } else {
          // Si no hay datos, inicializar con valores por defecto
          this.estadisticasPerdidas = {
            totalLoss: 0,
            replacedLoss: 0,
            netLoss: 0,
            byBrand: []
          };
          
          this.cartasEstadisticasPerdidas = [
            { 
              nombre: "Pérdida Total", 
              total: `$ ${parseFloat(0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 
              icono: "alert-circle", 
              clase: "has-text-danger" 
            },
            { 
              nombre: "Pérdida Reemplazada", 
              total: `$ ${parseFloat(0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 
              icono: "refresh", 
              clase: "has-text-info" 
            },
            { 
              nombre: "Pérdida Neta", 
              total: `$ ${parseFloat(0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`, 
              icono: "calculator", 
              clase: "has-text-warning" 
            }
          ];
        }
        
        this.cargando = false;
      })
      .catch(error => {
        console.error("Error al obtener estadísticas de pérdidas:", error);
        this.cargando = false;
        
        this.estadisticasPerdidas = {
          totalLoss: 0,
          replacedLoss: 0,
          netLoss: 0,
          byBrand: []
        };
        
        this.cartasEstadisticasPerdidas = [
          { 
            nombre: "Pérdida Total", 
            total: `$ ${parseFloat(0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`, 
            icono: "alert-circle", 
            clase: "has-text-danger" 
          },
          { 
            nombre: "Pérdida Reemplazada", 
            total: `$ ${parseFloat(0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`, 
            icono: "refresh", 
            clase: "has-text-info" 
          },
          { 
            nombre: "Pérdida Neta", 
            total: `$ ${parseFloat(0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`, 
            icono: "calculator", 
            clase: "has-text-warning" 
          }
        ];
        
        this.$buefy.toast.open({
          message: 'Error al cargar las estadísticas de pérdidas',
          type: 'is-danger'
        });
      });
    },

    // MÉTODO PARA CARGAR PROVEEDORES
    cargarProveedores() {
      apiRequest({
        method: 'GET',
        path: 'providers'
      })
      .then(respuesta => {
        console.log("Respuesta de proveedores:", respuesta);
        
        if (respuesta && respuesta.data) {
          this.proveedores = respuesta.data;
        } else if (Array.isArray(respuesta)) {
          this.proveedores = respuesta;
        } else {
          this.proveedores = [];
          console.error("Formato de respuesta de proveedores inesperado:", respuesta);
        }
      })
      .catch(error => {
        console.error("Error al cargar proveedores:", error);
        this.$buefy.toast.open({
          message: 'Error al cargar la lista de proveedores',
          type: 'is-danger'
        });
        this.proveedores = [];
      });
    },
    
    // Método para filtrar por nombre de proveedor
    filtrarPorNombreProveedor() {
      // Si el campo está vacío, limpiar el filtro
      if (!this.nombreProveedor.trim()) {
        this.limpiarFiltro();
        return;
      }
      
      // Buscar el proveedor por nombre
      const proveedorEncontrado = this.proveedores.find(
        proveedor => proveedor.name.toLowerCase().includes(this.nombreProveedor.toLowerCase())
      );
      
      if (proveedorEncontrado) {
        this.filtroProveedor = proveedorEncontrado.id;
        this.cargarEstadisticasPerdidas();
      } else {
        this.$buefy.toast.open({
          message: 'No se encontró ningún proveedor con ese nombre',
          type: 'is-warning'
        });
      }
    },

    // Método para limpiar el filtro de proveedor
    limpiarFiltro() {
      this.filtroProveedor = null;
      this.nombreProveedor = '';
      this.cargarEstadisticasPerdidas();
    }
  }
}
</script>

<style scoped>
.box {
  margin-bottom: 1.5rem;
}
</style>