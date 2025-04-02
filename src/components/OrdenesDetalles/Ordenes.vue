<template>
  <div class="ordenes-component">
    <div class="section">
      <div class="section-header">
        <div class="header-left">
          <i class="fas fa-clipboard-list section-icon"></i>
          <h3>Listado de Órdenes</h3>
        </div>
        <div class="header-right">
          <div class="search-box">
            <input 
              type="text" 
              v-model="busqueda" 
              placeholder="Buscar por número de factura..." 
              class="search-input"
              @input="filtrarOrdenes"
            >
            <i class="fas fa-search search-icon"></i>
          </div>
          <button @click="cargarOrdenes" class="btn btn-refresh" :disabled="cargando">
            <i class="fas" :class="cargando ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
            {{ cargando ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div class="section-content">
        <!-- Mensaje de carga -->
        <div v-if="cargando && !ordenes.length" class="message info">
          <i class="fas fa-spinner fa-spin message-icon"></i>
          <span>Cargando órdenes, por favor espere...</span>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="message error">
          <i class="fas fa-exclamation-circle message-icon"></i>
          <span>{{ error }}</span>
          <button @click="cargarOrdenes" class="btn-retry">
            <i class="fas fa-redo"></i> Reintentar
          </button>
        </div>

        <!-- Mensaje de no hay órdenes -->
        <div v-if="!cargando && !error && !ordenes.length" class="message info">
          <i class="fas fa-info-circle message-icon"></i>
          <span>No hay órdenes registradas en el sistema.</span>
        </div>

        <!-- Tabla de órdenes -->
        <div v-if="!cargando && !error && ordenes.length > 0" class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Número de Factura</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="orden in ordenesPaginadas" :key="orden.id" :class="{ 'inactive-row': !orden.isActive }">
                <td>{{ orden.id }}</td>
                <td>{{ orden.invoiceNumber }}</td>
                <td>{{ formatearFecha(orden.orderDate) }}</td>
                <td>
                  <div class="provider-info">
                    <span class="provider-name">{{ orden.provider.name }}</span>
                    <span class="provider-details">{{ orden.provider.taxId }}</span>
                  </div>
                </td>
                <td>
                  <div v-if="orden.orderDetails && orden.orderDetails.length > 0" class="productos-lista">
                    <div v-for="(detalle, index) in orden.orderDetails.slice(0, 3)" :key="index" class="producto-item">
                      <span class="producto-nombre">{{ obtenerNombreProducto(detalle) }}</span>
                      <span class="producto-cantidad">({{ detalle.quantity }})</span>
                    </div>
                    <div v-if="orden.orderDetails.length > 3" class="ver-mas">
                      <a @click="verDetalles(orden)">Ver todos ({{ orden.orderDetails.length }})</a>
                    </div>
                  </div>
                  <span v-else class="badge">
                    Sin productos
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="orden.isActive ? 'active' : 'inactive'">
                    {{ orden.isActive ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <b-tooltip label="Editar" position="is-top">
                      <b-button class="btn-primary" @click="abrirModalEditar(orden)" :disabled="!esAdmin">
                        <b-icon icon="pencil" />
                      </b-button>
                    </b-tooltip>
                    <b-tooltip label="Eliminar" position="is-top">
                      <b-button class="btn-primary" @click="confirmarEliminar(orden)" :disabled="!esAdmin">
                        <b-icon icon="delete" />
                      </b-button>
                    </b-tooltip>
                    <b-tooltip label="Ver detalles" position="is-top">
                      <b-button class="btn-primary" @click="verDetalles(orden)">
                        <b-icon icon="eye" />
                      </b-button>
                    </b-tooltip>
                    <b-tooltip label="Resumen Financiero" position="is-top">
                      <b-button class="btn-primary" @click="verResumenFinanciero(orden)">
                        <b-icon icon="calculator" />
                      </b-button>
                    </b-tooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Paginación -->
          <div class="pagination-container">
            <div class="pagination-info">
              Mostrando {{ paginaInicio }} - {{ paginaFin }} de {{ ordenesFiltradas.length }} órdenes
            </div>
            <b-pagination
              :total="ordenesFiltradas.length"
              v-model="paginaActual"
              :per-page="elementosPorPagina"
              :range-before="2"
              :range-after="2"
              :simple="false"
              :rounded="true"
              :size="'is-small'"
              aria-next-label="Siguiente página"
              aria-previous-label="Página anterior"
              aria-page-label="Página"
              aria-current-label="Página actual"
              @change="cambiarPagina"
            >
            </b-pagination>
            <div class="per-page-selector">
              <span>Mostrar:</span>
              <b-select v-model="elementosPorPagina" size="is-small" @input="cambiarElementosPorPagina">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </b-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div class="modal" :class="{ 'is-active': modalEditarActivo }">
      <div class="modal-background" @click="cerrarModalEditar"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-edit mr-2"></i> Editar Orden
          </p>
          <button class="delete" aria-label="close" @click="cerrarModalEditar"></button>
        </header>
        <section class="modal-card-body">
          <form @submit.prevent="actualizarOrden">
            <!-- Número de factura -->
            <div class="field">
              <label class="label">
                <i class="fas fa-file-invoice mr-2"></i> Número de Factura:
              </label>
              <div class="control">
                <input 
                  type="text" 
                  class="input" 
                  v-model="ordenEditando.invoiceNumber" 
                  placeholder="Ej: INV-12345"
                  required
                  :disabled="tieneProductosRegistrados"
                >
                <p v-if="tieneProductosRegistrados" class="help is-warning">
                  <i class="fas fa-exclamation-triangle mr-1"></i>
                  No se puede editar el número de factura porque ya tiene productos registrados.
                </p>
              </div>
            </div>

            <!-- Fecha de orden -->
            <div class="field">
              <label class="label">
                <i class="fas fa-calendar-alt mr-2"></i> Fecha de Orden:
              </label>
              <div class="control">
                <input 
                  type="date" 
                  class="input" 
                  v-model="ordenEditando.orderDate" 
                  required
                >
              </div>
            </div>

            <!-- Información del proveedor (solo lectura) -->
            <div class="field">
              <label class="label">
                <i class="fas fa-truck mr-2"></i> Proveedor:
              </label>
              <div class="control">
                <input 
                  type="text" 
                  class="input" 
                  :value="ordenEditando.provider ? ordenEditando.provider.name : ''" 
                  readonly
                  disabled
                >
                <p class="help">El proveedor no se puede cambiar una vez creada la orden.</p>
              </div>
            </div>
          </form>
        </section>
        <footer class="modal-card-foot">
          <button 
            class="button is-primary" 
            @click="actualizarOrden" 
            :disabled="actualizando"
          >
            <i class="fas" :class="actualizando ? 'fa-spinner fa-spin' : 'fa-save'"></i>
            {{ actualizando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
          <button class="button" @click="cerrarModalEditar">Cancelar</button>
        </footer>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div class="modal" :class="{ 'is-active': modalEliminarActivo }">
      <div class="modal-background" @click="cerrarModalEliminar"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-danger">
          <p class="modal-card-title has-text-white">
            <i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación
          </p>
          <button  class="delete" aria-label="close" @click="cerrarModalEliminar"></button>
        </header>
        <section class="modal-card-body">
          <p>
            ¿Está seguro que desea eliminar la orden con número de factura 
            <strong>{{ ordenEliminar ? ordenEliminar.invoiceNumber : '' }}</strong>?
          </p>
          <p class="has-text-danger mt-3">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Esta acción no se puede deshacer y eliminará todos los detalles asociados a esta orden.
          </p>
        </section>
        <footer class="modal-card-foot">
          <button 
            class="button is-danger" 
            @click="eliminarOrden" 
            :disabled="eliminando"
          >
            <i class="fas" :class="eliminando ? 'fa-spinner fa-spin' : 'fa-trash-alt'"></i>
            {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button class="button" @click="cerrarModalEliminar">Cancelar</button>
        </footer>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div class="modal" :class="{ 'is-active': modalDetallesActivo }">
      <div class="modal-background" @click="cerrarModalDetalles"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-info-circle mr-2"></i> Detalles de la Orden
          </p>
          <button class="delete" aria-label="close" @click="cerrarModalDetalles"></button>
        </header>
        <section class="modal-card-body">
          <div v-if="ordenDetalle">
            <div class="order-detail-header">
              <div class="order-info">
                <h4 class="title is-5">Orden #{{ ordenDetalle.id }}</h4>
                <p class="subtitle is-6">
                  {{ ordenDetalle.invoiceNumber }}
                </p>
              </div>
              <div class="order-status">
                <span class="status-badge" :class="ordenDetalle.isActive ? 'active' : 'inactive'">
                  {{ ordenDetalle.isActive ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
            </div>
        
            <div class="info-box">
              <h5 class="title is-6">Información del Proveedor</h5>
              <div class="columns is-multiline">
                <div class="column is-6">
                  <p><strong>Nombre:</strong> {{ ordenDetalle.provider.name }}</p>
                </div>
                <div class="column is-6">
                  <p><strong>ID Fiscal:</strong> {{ ordenDetalle.provider.taxId }}</p>
                </div>
                <div class="column is-6">
                  <p><strong>Teléfono:</strong> {{ ordenDetalle.provider.phone }}</p>
                </div>
                <div class="column is-6">
                  <p><strong>Dirección:</strong> {{ ordenDetalle.provider.address }}</p>
                </div>
              </div>
            </div>
        
            <div class="order-details-section">
              <h5 class="title is-6">Detalles de Productos</h5>
              
              <div v-if="!ordenDetalle.orderDetails || ordenDetalle.orderDetails.length === 0" class="message info">
                <i class="fas fa-info-circle message-icon"></i>
                <span>No hay productos registrados en esta orden.</span>
              </div>
              
              <div v-else>
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Impuesto Unitario</th>
                      <th>Total sin Impuesto</th>
                      <th>Total con Impuesto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detalle in ordenDetalle.orderDetails" :key="detalle.id" 
                      :class="{ 'inactive-row': !detalle.isActive }">
                      <td>{{ obtenerNombreProducto(detalle) }}</td>
                      <td>{{ detalle.quantity }}</td>
                      <td>{{ formatearMoneda(detalle.purchasePriceUnit) }}</td>
                      <td>{{ formatearMoneda(detalle.calculatedTaxUnit) }}</td>
                      <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithouthTax) }}</td>
                      <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithTax) }}</td>
                      <td>
                        <span class="status-badge" :class="detalle.isActive ? 'active' : 'inactive'">
                          {{ detalle.isActive ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="totals-row">
                  <span>Totales:</span>
                  <span>{{ calcularTotalSinImpuesto() }}</span>
                  <span>{{ calcularTotalConImpuesto() }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="cerrarModalDetalles">Cerrar</button>
        </footer>
      </div>
    </div>

    <!-- Modal de resumen financiero -->
    <div class="modal" :class="{ 'is-active': modalResumenActivo }">
      <div class="modal-background" @click="cerrarModalResumen"></div>
      <div class="modal-card" style="width: auto; max-width: 80vw;">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <i class="fas fa-calculator mr-2"></i> Resumen Financiero: 
            {{ resumenFinanciero && resumenFinanciero.summary && resumenFinanciero.summary.invoice ? resumenFinanciero.summary.invoice.number : 'Factura' }}
          </p>
          <button class="delete" aria-label="close" @click="cerrarModalResumen"></button>
        </header>
        <section class="modal-card-body">
          <!-- Mensaje cuando no hay datos disponibles -->
          <div v-if="!resumenFinanciero || !resumenFinanciero.summary" class="no-data-message">
            <div class="message is-warning">
              <div class="message-body">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span>No hay información de resumen financiero disponible para esta orden.</span>
              </div>
            </div>
            <div class="no-data-details mt-4">
              <p>Posibles razones:</p>
              <ul>
                <li>La orden no tiene productos asociados</li>
                <li>La orden está en proceso de creación</li>
           
              </ul>
              <p class="mt-3">Por favor, verifique que la orden tenga productos asociados y esté correctamente configurada.</p>
            </div>
          </div>

          <!-- Contenido del resumen cuando hay datos -->
          <div v-else class="box p-5">
            <!-- Información de la factura -->
            <div class="invoice-info mb-5">
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Número de Factura</label>
                    <div class="control">
                      <input class="input" type="text" readonly 
                        :value="resumenFinanciero.summary.invoice.number">
                    </div>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">Fecha</label>
                    <div class="control">
                      <input class="input" type="text" readonly 
                        :value="formatDate(resumenFinanciero.summary.invoice.date)">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detalles de la orden -->
            <h4 class="title is-5 mb-3">Detalles de la Orden</h4>
            <b-table :data="resumenFinanciero.details" :striped="true" :hoverable="true">
              <b-table-column field="productName" label="Producto" v-slot="props">
                {{ props.row.productName || 'N/A' }}
              </b-table-column>
              <b-table-column field="productId" label="ID Producto" numeric v-slot="props">
                {{ props.row.productId }}
              </b-table-column>
              <b-table-column field="quantity" label="Cantidad" numeric v-slot="props">
                {{ props.row.quantity }}
              </b-table-column>
              <b-table-column field="unitPriceWithoutVAT" label="Precio sin IVA" numeric v-slot="props">
                {{ formatearMoneda(props.row.unitPriceWithoutVAT) }}
              </b-table-column>
              <b-table-column field="unitPriceWithVAT" label="Precio con IVA" numeric v-slot="props">
                {{ formatearMoneda(props.row.unitPriceWithVAT) }}
              </b-table-column>
              <b-table-column field="totalPriceWithoutVAT" label="Total sin IVA" numeric v-slot="props">
                {{ formatearMoneda(props.row.totalPriceWithoutVAT) }}
              </b-table-column>
              <b-table-column field="totalPriceWithVAT" label="Total con IVA" numeric v-slot="props">
                {{ formatearMoneda(props.row.totalPriceWithVAT) }}
              </b-table-column>
            </b-table>

            <!-- Resumen financiero -->
            <div class="financial-summary mt-5">
              <h4 class="title is-5 mb-3">Resumen Financiero</h4>
              <div class="box has-background-light p-4">
                <div class="columns is-multiline">
                  <div class="column is-6">
                    <div class="field">
                      <label class="label">Total sin IVA</label>
                      <div class="control">
                        <input class="input" type="text" readonly 
                          :value="formatearMoneda(resumenFinanciero.summary.totalWithoutVAT)">
                      </div>
                    </div>
                  </div>
                  <div class="column is-6">
                    <div class="field">
                      <label class="label">Total IVA</label>
                      <div class="control">
                        <input class="input" type="text" readonly 
                          :value="formatearMoneda(resumenFinanciero.summary.totalVAT)">
                      </div>
                    </div>
                  </div>
                  <div class="column is-12">
                    <div class="field">
                      <label class="label">Total con IVA</label>
                      <div class="control">
                        <input class="input is-primary has-text-weight-bold" type="text" readonly 
                          :value="formatearMoneda(resumenFinanciero.summary.totalWithVAT)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="cerrarModalResumen">Cerrar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';
import AyudanteSesion from '@/Servicios/AyudanteSesion';

export default {
  name: 'OrdenesComponent',
  
  data() {
    return {
      // Lista de órdenes
      ordenes: [],
      ordenesFiltradas: [],
      busqueda: '',
      
      // Paginación
      paginaActual: 1,
      elementosPorPagina: 10,
      
      // Estados de carga
      cargando: false,
      error: null,
      
      // Modal de edición
      modalEditarActivo: false,
      ordenEditando: {
        id: null,
        invoiceNumber: '',
        orderDate: '',
        isActive: true,
        provider: null,
        orderDetails: []
      },
      actualizando: false,
      
      // Modal de eliminación
      modalEliminarActivo: false,
      ordenEliminar: null,
      eliminando: false,
      
      // Modal de detalles
      modalDetallesActivo: false,
      ordenDetalle: null,
      
      // Modal de resumen financiero
      modalResumenActivo: false,
      resumenFinanciero: null,
      cargandoResumen: false,
      
      // Estado de administrador
      esAdmin: false,
      
      // Caché de productos
      productosCache: {}
    };
  },
  
  computed: {
    // Obtener las órdenes para la página actual
    ordenesPaginadas() {
      const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
      const fin = inicio + this.elementosPorPagina;
      return this.ordenesFiltradas.slice(inicio, fin);
    },
    
    // Calcular el índice del primer elemento mostrado
    paginaInicio() {
      if (this.ordenesFiltradas.length === 0) return 0;
      return (this.paginaActual - 1) * this.elementosPorPagina + 1;
    },
    
    // Calcular el índice del último elemento mostrado
    paginaFin() {
      const fin = this.paginaActual * this.elementosPorPagina;
      return fin > this.ordenesFiltradas.length ? this.ordenesFiltradas.length : fin;
    },
    
    // Verificar si la orden tiene productos registrados
    tieneProductosRegistrados() {
      return this.ordenEditando && 
             this.ordenEditando.orderDetails && 
             this.ordenEditando.orderDetails.length > 0;
    }
  },
  
  created() {
    this.verificarAdmin();
    this.cargarOrdenes();
    this.cargarProductos();
  },
  
  methods: {
    // Cambiar de página
    cambiarPagina(pagina) {
      this.paginaActual = pagina;
    },
    
    // Cambiar elementos por página
    cambiarElementosPorPagina() {
      this.paginaActual = 1; // Volver a la primera página al cambiar elementos por página
    },
    
    // Verificar si el usuario es administrador
    verificarAdmin() {
      const datosUsuario = AyudanteSesion.obtenerDatosSesion();
      this.esAdmin = datosUsuario.rol === 'Admin';
    },
    
    // Cargar todas las órdenes
    async cargarOrdenes() {
      this.cargando = true;
      this.error = null;
      
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'orders'
        });
        
        if (response.status === 200) {
          this.ordenes = response.data;
          
          // Enriquecer las órdenes con nombres de productos
          await this.enriquecerOrdenesConProductos(this.ordenes);
          
          this.ordenesFiltradas = [...this.ordenes];
          this.paginaActual = 1; // Volver a la primera página al cargar nuevos datos
        } else {
          this.error = `Error ${response.status}: No se pudieron cargar las órdenes`;
        }
      } catch (err) {
        console.error('Error al cargar órdenes:', err);
        this.error = err.message || 'Error al cargar las órdenes. Por favor, intente nuevamente.';
      } finally {
        this.cargando = false;
      }
    },
    
    // Enriquecer órdenes con nombres de productos
    async enriquecerOrdenesConProductos(ordenes) {
      // Si no tenemos productos en caché, los cargamos
      if (Object.keys(this.productosCache).length === 0) {
        await this.cargarProductos();
      }
      
      try {
        // Obtener todos los detalles de productos
        const response = await apiRequest({
          method: 'GET',
          path: 'order-details'
        });
        
        if (response && response.data) {
          // Crear un mapa de productos para acceso rápido
          const productosMap = {};
          response.data.forEach(detalle => {
            if (detalle.product) {
              productosMap[detalle.product.id] = detalle.product;
            }
          });
          
          // Actualizar el caché global con cualquier producto nuevo
          Object.assign(this.productosCache, productosMap);
          
          // Enriquecer cada orden con nombres de productos
          ordenes.forEach(orden => {
            if (orden.orderDetails && orden.orderDetails.length > 0) {
              orden.orderDetails.forEach(detalle => {
                // Buscar el detalle correspondiente en los detalles con productos
                const detalleCompleto = response.data.find(d => d.id === detalle.id);
                
                if (detalleCompleto && detalleCompleto.product) {
                  // Si encontramos el detalle con su producto, usamos ese nombre
                  detalle.productName = detalleCompleto.product.name;
                  detalle.productId = detalleCompleto.product.id;
                } else if (detalle.product && detalle.product.id) {
                  // Si el detalle ya tiene un producto con ID
                  const productId = detalle.product.id;
                  if (productosMap[productId]) {
                    detalle.productName = productosMap[productId].name;
                  } else if (this.productosCache[productId]) {
                    detalle.productName = this.productosCache[productId].name;
                  } else {
                    detalle.productName = detalle.product.name || `Producto #${productId}`;
                  }
                } else {
                  // Si no podemos encontrar el producto, mostramos un mensaje genérico
                  detalle.productName = "Producto sin información";
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Error al enriquecer órdenes con productos:", error);
      }
    },
    
    // Obtener nombre de producto para un detalle
    obtenerNombreProducto(detalle) {
      if (detalle.productName) {
        return detalle.productName;
      }
      
      if (detalle.product && detalle.product.name) {
        return detalle.product.name;
      }
      
      if (detalle.product && detalle.product.id && this.productosCache[detalle.product.id]) {
        return this.productosCache[detalle.product.id].name;
      }
      
      if (detalle.productId && this.productosCache[detalle.productId]) {
        return this.productosCache[detalle.productId].name;
      }
      
      return "Producto sin información";
    },
    
    // Cargar productos para tener un caché
    async cargarProductos() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'order-details'
        });
        
        if (response.status === 200 && Array.isArray(response.data)) {
          // Crear un mapa de productos para acceso rápido
          response.data.forEach(detalle => {
            if (detalle.product && detalle.product.id) {
              this.productosCache[detalle.product.id] = detalle.product;
            }
          });
          
          console.log('Caché de productos cargado:', Object.keys(this.productosCache).length, 'productos');
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    },
    
    // Filtrar órdenes según la búsqueda
    filtrarOrdenes() {
      if (!this.busqueda.trim()) {
        this.ordenesFiltradas = [...this.ordenes];
        this.paginaActual = 1; // Volver a la primera página al limpiar la búsqueda
        return;
      }
      
      const busquedaLower = this.busqueda.toLowerCase().trim();
      
      this.ordenesFiltradas = this.ordenes.filter(orden => {
        // Buscar en los datos básicos de la orden
        const coincideBasicos = orden.invoiceNumber.toLowerCase().includes(busquedaLower) ||
                               orden.provider.name.toLowerCase().includes(busquedaLower) ||
                               orden.id.toString().includes(busquedaLower);
        
        // Buscar en los nombres de productos
        let coincideProductos = false;
        if (orden.orderDetails && orden.orderDetails.length > 0) {
          coincideProductos = orden.orderDetails.some(detalle => {
            const nombreProducto = this.obtenerNombreProducto(detalle);
            return nombreProducto.toLowerCase().includes(busquedaLower);
          });
        }
        
        return coincideBasicos || coincideProductos;
      });
      
      this.paginaActual = 1; // Volver a la primera página al filtrar
    },
    
    // Formatear fecha
    formatearFecha(fecha) {
      if (!fecha) return 'N/A';
      
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(fecha).toLocaleDateString('es-ES', options);
    },
    
    // Formatear fecha para el resumen financiero
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    },
    
    // Formatear moneda
    formatearMoneda(valor) {
      if (valor === undefined || valor === null) return '$0.00';
      
      return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(valor);
    },
    
    // Calcular total sin impuesto
    calcularTotalSinImpuesto() {
      if (!this.ordenDetalle || !this.ordenDetalle.orderDetails) return this.formatearMoneda(0);
      
      const total = this.ordenDetalle.orderDetails.reduce((sum, detalle) => {
        return sum + (detalle.calculatedTotalPriceWithouthTax || 0);
      }, 0);
      
      return this.formatearMoneda(total);
    },
    
    // Calcular total con impuesto
    calcularTotalConImpuesto() {
      if (!this.ordenDetalle || !this.ordenDetalle.orderDetails) return this.formatearMoneda(0);
      
      const total = this.ordenDetalle.orderDetails.reduce((sum, detalle) => {
        return sum + (detalle.calculatedTotalPriceWithTax || 0);
      }, 0);
      
      return this.formatearMoneda(total);
    },
    
    // Abrir modal de edición
    async abrirModalEditar(orden) {
      // Hacer una copia profunda de la orden para editar
      this.ordenEditando = JSON.parse(JSON.stringify({
        id: orden.id,
        invoiceNumber: orden.invoiceNumber,
        orderDate: orden.orderDate,
        isActive: orden.isActive,
        provider: orden.provider,
        orderDetails: orden.orderDetails || []
      }));
      
      // Si no tenemos los detalles de la orden, los obtenemos
      if (!orden.orderDetails || !Array.isArray(orden.orderDetails)) {
        try {
          const response = await apiRequest({
            method: 'GET',
            path: `orders/${orden.id}`
          });
          
          if (response.status === 200 && response.data) {
            this.ordenEditando.orderDetails = response.data.orderDetails || [];
          }
        } catch (error) {
          console.error("Error al obtener detalles de la orden:", error);
          this.ordenEditando.orderDetails = [];
        }
      }
      
      this.modalEditarActivo = true;
    },
    
    // Cerrar modal de edición
    cerrarModalEditar() {
      this.modalEditarActivo = false;
      this.ordenEditando = {
        id: null,
        invoiceNumber: '',
        orderDate: '',
        isActive: true,
        provider: null,
        orderDetails: []
      };
    },
    
    // Actualizar orden
    async actualizarOrden() {
      if (!this.ordenEditando.id) return;
      
      this.actualizando = true;
      
      try {
        // Si tiene productos registrados, no permitimos cambiar el número de factura
        const datosActualizacion = {
          orderDate: this.ordenEditando.orderDate
        };
        
        // Solo incluimos el invoiceNumber si no tiene productos registrados
        if (!this.tieneProductosRegistrados) {
          datosActualizacion.invoiceNumber = this.ordenEditando.invoiceNumber;
        }
        
        const response = await apiRequest({
          method: 'PATCH',
          path: `orders/${this.ordenEditando.id}`,
          data: datosActualizacion
        });
        
        if (response.status === 200) {
          // Mostrar mensaje de éxito
          this.$buefy.toast.open({
            message: 'Orden actualizada correctamente',
            type: 'is-success'
          });
          
          // Cerrar el modal
          this.cerrarModalEditar();
          
          // Recargar los datos para asegurar que todo esté actualizado
          await this.cargarOrdenes();
        } else {
          throw new Error(`Error ${response.status}: No se pudo actualizar la orden`);
        }
      } catch (err) {
        console.error('Error al actualizar orden:', err);
        
        this.$buefy.toast.open({
          message: err.message || 'Error al actualizar la orden',
          type: 'is-danger'
        });
      } finally {
        this.actualizando = false;
      }
    },
    
    // Confirmar eliminación
    confirmarEliminar(orden) {
      this.ordenEliminar = orden;
      this.modalEliminarActivo = true;
    },
    
    // Cerrar modal de eliminación
    cerrarModalEliminar() {
      this.modalEliminarActivo = false;
      this.ordenEliminar = null;
    },
    
    // Eliminar orden
    async eliminarOrden() {
      if (!this.ordenEliminar || !this.ordenEliminar.id) return;
      
      this.eliminando = true;
      
      try {
        const response = await apiRequest({
          method: 'DELETE',
          path: `orders/${this.ordenEliminar.id}`
        });
        
        if (response.status === 200 || response.status === 204) {
          // Eliminar la orden de la lista local
          this.ordenes = this.ordenes.filter(o => o.id !== this.ordenEliminar.id);
          this.ordenesFiltradas = this.ordenesFiltradas.filter(o => o.id !== this.ordenEliminar.id);
          
          // Mostrar mensaje de éxito
          this.$buefy.toast.open({
            message: 'Orden eliminada correctamente',
            type: 'is-success'
          });
          
          // Cerrar el modal
          this.cerrarModalEliminar();
        } else {
          throw new Error(`Error ${response.status}: No se pudo eliminar la orden`);
        }
      } catch (err) {
        console.error('Error al eliminar orden:', err);
        
        this.$buefy.toast.open({
          message: err.message || 'Error al eliminar la orden',
          type: 'is-danger'
        });
      } finally {
        this.eliminando = false;
      }
    },
    
    // Ver detalles de la orden
    async verDetalles(orden) {
      this.ordenDetalle = JSON.parse(JSON.stringify(orden)); // Copia profunda
      this.modalDetallesActivo = true;
    },
    
    // Cerrar modal de detalles
    cerrarModalDetalles() {
      this.modalDetallesActivo = false;
      this.ordenDetalle = null;
    },
    
    // Ver resumen financiero
    async verResumenFinanciero(orden) {
      if (!orden || !orden.invoiceNumber) {
        this.$buefy.toast.open({
          message: 'No se pudo obtener el número de factura para esta orden',
          type: 'is-danger'
        });
        return;
      }
      
      this.cargando = true;
      this.resumenFinanciero = null; // Reiniciar el resumen financiero
      
      try {
        console.log(`Obteniendo resumen financiero para factura: ${orden.invoiceNumber}`);
        
        // Si no tenemos productos en caché, los cargamos
        if (Object.keys(this.productosCache).length === 0) {
          await this.cargarProductos();
        }
        
        const response = await apiRequest({
          method: 'GET',
          path: `order-details/summary/${orden.invoiceNumber}`
        });
        
        if (response && response.data && response.data.summary) {
          this.resumenFinanciero = response.data;
          
          // Enriquecer los detalles del resumen con nombres de productos
          if (this.resumenFinanciero.details) {
            // Primero, intentemos obtener los detalles completos de los productos para esta orden
            try {
              const detallesResponse = await apiRequest({
                method: 'GET',
                path: 'order-details'
              });
              
              if (detallesResponse && detallesResponse.data) {
                // Crear un mapa de productos para acceso rápido
                const productosMap = {};
                detallesResponse.data.forEach(detalle => {
                  if (detalle.product) {
                    productosMap[detalle.product.id] = detalle.product;
                  }
                });
                
                // Actualizar el caché global con cualquier producto nuevo
                Object.assign(this.productosCache, productosMap);
                
                // Ahora enriquecer los detalles del resumen
                this.resumenFinanciero.details.forEach(detalle => {
                  if (detalle.productId && productosMap[detalle.productId]) {
                    detalle.productName = productosMap[detalle.productId].name;
                  } else if (detalle.productId && this.productosCache[detalle.productId]) {
                    detalle.productName = this.productosCache[detalle.productId].name;
                  } else {
                    detalle.productName = `Producto ID: ${detalle.productId || 'No disponible'}`;
                  }
                });
              }
            } catch (error) {
              console.error("Error al obtener detalles de productos para el resumen:", error);
              // Si hay un error, usamos solo el caché
              this.resumenFinanciero.details.forEach(detalle => {
                if (detalle.productId && this.productosCache[detalle.productId]) {
                  detalle.productName = this.productosCache[detalle.productId].name;
                } else {
                  detalle.productName = `Producto ID: ${detalle.productId || 'No disponible'}`;
                }
              });
            }
          }
        } else {
          console.warn('Respuesta de resumen financiero incompleta o vacía');
          // Crear un objeto resumenFinanciero vacío para mostrar el mensaje de no disponible
          this.resumenFinanciero = { details: [] };
        }
      } catch (error) {
        console.error("Error al obtener resumen financiero:", error);
        
        // Crear un objeto resumenFinanciero vacío para mostrar el mensaje de no disponible
        this.resumenFinanciero = { details: [] };
        
        // Registrar el error en la consola pero no mostrar toast, ya que mostraremos el modal con mensaje
        console.error("Detalles del error:", error);
      } finally {
        this.cargando = false;
        // Siempre mostrar el modal, incluso si no hay datos
        this.modalResumenActivo = true;
      }
    },
    
    // Cerrar modal de resumen financiero
    cerrarModalResumen() {
      this.modalResumenActivo = false;
      this.resumenFinanciero = null;
    }
  }
};
</script>

<style scoped>
.ordenes-component {
  padding: 1rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  display: flex;
  align-items: center;
}

.section-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
  color: #3273dc;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-box {
  position: relative;
  margin-right: 1rem;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  width: 250px;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7a7a7a;
}

.btn-refresh {
  background-color: #f5f5f5;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.btn-refresh:hover {
  background-color: #e8e8e8;
}

.btn-refresh i {
  margin-right: 0.5rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.table th, .table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.provider-info {
  display: flex;
  flex-direction: column;
}

.provider-name {
  font-weight: 500;
}

.provider-details {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.badge {
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #555;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #23d160;
  color: white;
}

.status-badge.inactive {
  background-color: #ff3860;
  color: white;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action.edit {
  color: #3273dc;
}

.btn-action.delete {
  color: #ff3860;
}

.btn-action.view {
  color: #209cee;
}

.btn-action:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.message {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.message.info {
  background-color: #f6f9fe;
  border-left: 4px solid #3273dc;
}

.message.error {
  background-color: #fff5f7;
  border-left: 4px solid #ff3860;
}

.message-icon {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.message.info .message-icon {
  color: #3273dc;
}

.message.error .message-icon {
  color: #ff3860;
}

.btn-retry {
  margin-left: auto;
  background: none;
  border: 1px solid #ff3860;
  color: #ff3860;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-retry:hover {
  background-color: #ff3860;
  color: white;
}

.inactive-row {
  background-color: #fff5f7;
  opacity: 0.8;
}

/* Estilos para el modal de detalles */
.order-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.provider-box {
  background-color: #f8f9fa;
  margin-bottom: 1.5rem;
}

.order-details-section {
  margin-top: 1.5rem;
}

/* Estilos para el modal de resumen financiero */
.invoice-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.financial-summary {
  margin-top: 25px;
}

/* Estilos para la lista de productos en la tabla principal */
.productos-lista {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 150px;
  overflow-y: auto;
}

.producto-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.producto-nombre {
  font-weight: 500;
  font-size: 0.9rem;
}

.producto-cantidad {
  font-size: 0.8rem;
  color: #666;
}

.ver-mas {
  margin-top: 0.25rem;
  font-size: 0.8rem;
}

.ver-mas a {
  color: #3273dc;
  cursor: pointer;
  text-decoration: underline;
}

.ver-mas a:hover {
  color: #2160c4;
}

/* Estilos para la paginación */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.pagination-info {
  font-size: 0.9rem;
  color: #666;
}

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.per-page-selector span {
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-right {
    margin-top: 1rem;
    width: 100%;
  }
  
  .search-box {
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .btn-refresh {
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .actions {
    flex-wrap: nowrap;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .pagination-info {
    text-align: center;
  }
}

.btn-primary {
  background-color: #0074b8;
  color: white;
  border: none;
  border-radius: 4px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
}

.btn-primary:hover {
  background-color: #005a8f;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para el modal de detalles mejorado */
.info-box {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.order-details-section {
  margin-top: 20px;
}

.order-details-section .table {
  margin-bottom: 0;
  border: 1px solid #e0e0e0;
}

.totals-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background-color: #f0f0f0;
  padding: 10px 15px;
  font-weight: bold;
  text-align: right;
  border: 1px solid #e0e0e0;
  border-top: none;
}

.totals-row span:first-child {
  grid-column: 1 / 2;
}

.modal-card {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-card-body {
  overflow-y: auto;
  max-height: none;
}

/* Estilos para mensaje de no disponible */
.no-data-message {
  padding: 2rem;
  text-align: center;
}

.no-data-message .message {
  margin-bottom: 1.5rem;
}

.no-data-details {
  max-width: 500px;
  margin: 0 auto;
  text-align: left;
}

.no-data-details ul {
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  list-style-type: disc;
}

.no-data-details li {
  margin-bottom: 0.5rem;
}
</style>