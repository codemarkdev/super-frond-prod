<template>
  <!-- El template completo se mantiene igual que en la versión anterior -->
  <div class="detalles-pedido">
    <div class="page-header">
      <i class="fas fa-clipboard-list header-icon"></i>
      <h2>Ordenes</h2>
    </div>
    
    <!-- Sección desplegable de proveedores -->
    <div class="section">
      <div class="section-header" @click="toggleProveedores">
        <div class="header-left">
          <i class="fas fa-building section-icon"></i>
          <h3>Proveedores</h3>
        </div>
        <div class="badge">{{ proveedores.length || 0 }}</div>
        <i class="fas fa-chevron-down toggle-icon" :class="{ 'rotate': isProveedoresOpen }"></i>
      </div>
      
      <div v-show="isProveedoresOpen" class="section-content">
        <!-- Buscador -->
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por nombre..." 
            class="search-input"
          />
        </div>
        
        <!-- Estados de carga y error -->
        <div v-if="loading" class="message loading">
          <div class="spinner"></div>
          <span>Cargando proveedores...</span>
        </div>
        
        <div v-else-if="error" class="message error">
          <i class="fas fa-exclamation-circle message-icon"></i>
          <div>
            <p>{{ error }}</p>
            <button @click="fetchProveedores" class="btn">
              <i class="fas fa-sync-alt"></i> Reintentar
            </button>
          </div>
        </div>
        
        <div v-else-if="filteredProveedores.length === 0" class="message">
          <i class="fas fa-info-circle message-icon"></i>
          <span>No se encontraron proveedores{{ searchQuery ? ' con ese nombre' : '' }}.</span>
        </div>
        
        <!-- Tarjetas de proveedores -->
        <div v-else class="cards-container">
          <div v-for="proveedor in filteredProveedores" :key="proveedor.id" class="card">
            <div class="card-header">
              <h4>{{ proveedor.name }}</h4>
              <span class="card-badge">ID: {{ proveedor.id }}</span>
            </div>
            <div class="card-body">
              <div class="card-item">
                <i class="fas fa-id-card item-icon"></i>
                <span>{{ proveedor.taxId }}</span>
              </div>
              <div class="card-item">
                <i class="fas fa-map-marker-alt item-icon"></i>
                <span>{{ proveedor.address }}</span>
              </div>
              <div class="card-item">
                <i class="fas fa-phone item-icon"></i>
                <span>{{ proveedor.phone }}</span>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn-select" @click="seleccionarProveedor(proveedor.id)">
                <i class="fas fa-check"></i> Seleccionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sección para crear nuevo pedido -->
    <div class="section">
      <div class="section-header" @click="toggleNuevoPedido">
        <div class="header-left">
          <i class="fas fa-plus-circle section-icon"></i>
          <h3>Crear Nuevo Pedido</h3>
        </div>
        <i class="fas fa-chevron-down toggle-icon" :class="{ 'rotate': isNuevoPedidoOpen }"></i>
      </div>
      
      <div v-show="isNuevoPedidoOpen" class="section-content">
        <form @submit.prevent="crearPedido" class="form">
          <!-- Selección de proveedor -->
          <div class="form-group">
            <label for="providerId">
              <i class="fas fa-building label-icon"></i> Proveedor:
            </label>
            <div class="select-wrapper">
              <select 
                id="providerId" 
                v-model="nuevoPedido.providerId" 
                class="form-control"
                required
              >
                <option value="" disabled>Seleccione un proveedor</option>
                <option 
                  v-for="proveedor in proveedores" 
                  :key="proveedor.id" 
                  :value="proveedor.id"
                >
                  {{ proveedor.name }}
                </option>
              </select>
              <i class="fas fa-chevron-down select-icon"></i>
            </div>
            <button 
              v-if="proveedores.length === 0" 
              type="button" 
              @click="fetchProveedores" 
              class="btn btn-small"
            >
              <i class="fas fa-sync-alt"></i> Cargar proveedores
            </button>
          </div>
          
          <!-- Fecha del pedido -->
          <div class="form-group">
            <label for="orderDate">
              <i class="fas fa-calendar-alt label-icon"></i> Fecha del pedido:
            </label>
            <div class="input-wrapper">
              <input 
                type="date" 
                id="orderDate" 
                v-model="nuevoPedido.orderDate" 
                class="form-control"
                required
              />
            </div>
          </div>
          
          <!-- Número de factura -->
          <div class="form-group">
            <label for="invoiceNumber">
              <i class="fas fa-file-invoice label-icon"></i> Número de factura:
            </label>
            <div class="input-wrapper">
              <input 
                type="text" 
                id="invoiceNumber" 
                v-model="nuevoPedido.invoiceNumber" 
                class="form-control"
                placeholder="Ej: INV-12345"
                required
              />
            </div>
          </div>
          
          <!-- Mensaje de error -->
          <div v-if="pedidoError" class="message error">
            <i class="fas fa-exclamation-circle message-icon"></i>
            <span>{{ pedidoError }}</span>
          </div>
          
          <!-- Mensaje de éxito -->
          <div v-if="pedidoExitoso" class="message success">
            <i class="fas fa-check-circle message-icon"></i>
            <span>Pedido creado exitosamente.</span>
          </div>
          
          <!-- Botones -->
          <div class="form-actions">
            <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="enviandoPedido">
              <i class="fas fa-save"></i> {{ enviandoPedido ? 'Creando...' : 'Crear Pedido' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Sección de lista de pedidos -->
    <div class="section">
      <div class="section-header" @click="togglePedidos">
        <div class="header-left">
          <i class="fas fa-shopping-cart section-icon"></i>
          <h3>Pedidos Realizados</h3>
        </div>
        <div class="badge">{{ pedidos.length || 0 }}</div>
        <i class="fas fa-chevron-down toggle-icon" :class="{ 'rotate': isPedidosOpen }"></i>
      </div>
      
      <div v-show="isPedidosOpen" class="section-content">
        <!-- Buscador -->
        
<div class="search-container">
  <i class="fas fa-search search-icon"></i>
  <input 
    type="text" 
    v-model="searchPedidoQuery" 
    placeholder="Buscar por número de factura..." 
    class="search-input"
  />
  
  <div class="filter-container">
    <label class="filter-label">
      <i class="fas fa-calendar-alt"></i> Filtrar por fecha:
    </label>
    <input 
      type="date" 
      v-model="fechaFiltro" 
      class="date-filter"
      aria-label="Filtrar por fecha"
    />
    <button 
      v-if="fechaFiltro" 
      @click="limpiarFiltros" 
      class="btn-clear-filter" 
      aria-label="Limpiar filtro de fecha"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</div>
        
        <!-- Estados de carga y error -->
        <div v-if="loadingPedidos" class="message loading">
          <div class="spinner"></div>
          <span>Cargando pedidos...</span>
        </div>
        
        <div v-else-if="errorPedidos" class="message error">
          <i class="fas fa-exclamation-circle message-icon"></i>
          <div>
            <p>{{ errorPedidos }}</p>
            <button @click="fetchPedidos" class="btn">
              <i class="fas fa-sync-alt"></i> Reintentar
            </button>
          </div>
        </div>
        
        <div v-else-if="filteredPedidos.length === 0" class="message">
          <i class="fas fa-info-circle message-icon"></i>
          <span>No se encontraron pedidos{{ searchPedidoQuery || fechaFiltro ? ' con los filtros aplicados' : '' }}.</span>
        </div>
        
        <!-- Lista de pedidos -->
        <div v-else class="pedidos-container">
          <div v-for="pedido in filteredPedidos" :key="pedido.id" class="pedido-card" :class="{ 'expanded': expandedCards[pedido.id] }">
            <div class="pedido-header" @click="toggleCardExpansion(pedido.id)">
              <div class="pedido-title">
                <h4>Pedido #{{ pedido.id }}</h4>
                <span class="pedido-date">
                  <i class="fas fa-calendar-day"></i> {{ formatearFecha(pedido.orderDate) }}
                </span>
              </div>
              <div class="pedido-badge">
                <i class="fas fa-file-invoice"></i> {{ pedido.invoiceNumber }}
              </div>
              <i class="fas fa-chevron-down toggle-card-icon" :class="{ 'rotate': expandedCards[pedido.id] }"></i>
            </div>
            
            <div v-show="expandedCards[pedido.id]" class="pedido-body">
              <div class="provider-info">
                <h5>
                  <i class="fas fa-building"></i> Proveedor
                </h5>
                <div class="provider-details">
                  <p class="provider-name">{{ pedido.provider ? pedido.provider.name : 'No disponible' }}</p>
                  <div v-if="pedido.provider" class="provider-item">
                    <i class="fas fa-id-card item-icon"></i>
                    <span>{{ pedido.provider.taxId }}</span>
                  </div>
                  <div v-if="pedido.provider" class="provider-item">
                    <i class="fas fa-map-marker-alt item-icon"></i>
                    <span>{{ pedido.provider.address }}</span>
                  </div>
                  <div v-if="pedido.provider" class="provider-item">
                    <i class="fas fa-phone item-icon"></i>
                    <span>{{ pedido.provider.phone }}</span>
                  </div>
                </div>
              </div>
              
              <div class="order-details" v-if="pedido.orderDetails && pedido.orderDetails.length > 0">
                <h5>
                  <i class="fas fa-box"></i> Detalles del Pedido
                </h5>
                <div class="details-container">
                  <div v-for="(detalle, index) in pedido.orderDetails" :key="detalle.id || index" class="detail-item">
                    <div class="detail-header">
                      <span class="detail-title">Detalle #{{ detalle.id }}</span>
                      <span class="detail-quantity">
                        <i class="fas fa-cubes"></i> {{ detalle.quantity }} unidades
                      </span>
                    </div>
                    <div class="detail-body">
                      <div class="price-row">
                        <div class="price-item">
                          <div class="price-label">Precio unitario:</div>
                          <div class="price-value">{{ formatearMoneda(detalle.purchasePriceUnit) }}</div>
                        </div>
                        <div class="price-item">
                          <div class="price-label">Impuesto por unidad:</div>
                          <div class="price-value">{{ formatearMoneda(detalle.calculatedTaxUnit) }}</div>
                        </div>
                      </div>
                      <div class="price-row">
                        <div class="price-item">
                          <div class="price-label">Subtotal sin impuesto:</div>
                          <div class="price-value">{{ formatearMoneda(detalle.calculatedTotalPriceWithouthTax) }}</div>
                        </div>
                        <div class="price-item">
                          <div class="price-label">Total impuesto:</div>
                          <div class="price-value">{{ formatearMoneda(detalle.calculatedTotalTax) }}</div>
                        </div>
                      </div>
                      <div class="total-row">
                        <div class="total-label">Total:</div>
                        <div class="total-value">{{ formatearMoneda(calcularTotalDetalle(detalle)) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="no-details">
                <i class="fas fa-info-circle"></i> No hay detalles disponibles para este pedido.
              </div>
            </div>
            
            <div v-show="expandedCards[pedido.id]" class="pedido-footer">
              <div class="pedido-actions">
                <button 
                  class="btn-action btn-view" 
                  @click="verDetallesPedido(pedido)"
                  :disabled="!tieneDetalles(pedido)"
                  :title="!tieneDetalles(pedido) ? 'No hay detalles disponibles para este pedido' : 'Ver detalles del pedido'"
                >
                  <i class="fas fa-eye"></i> Ver Detalles
                </button>
                <button 
                  class="btn-action btn-edit" 
                  @click="openEditModal(pedido)" 
                  :disabled="tieneDetalles(pedido)"
                  :title="tieneDetalles(pedido) ? 'No se puede editar un pedido con detalles' : 'Editar pedido'"
                >
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action btn-delete" @click="openDeleteModal(pedido)">
                  <i class="fas fa-trash-alt"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para ver detalles completos del pedido -->
    <div v-if="showDetailsModal" class="modal-overlay">
      <div class="modal-container details-modal">
        <div class="modal-header">
          <h3>
            <i class="fas fa-clipboard-list"></i> Detalles del Pedido #{{ pedidoDetallado.id }}
          </h3>
          <button @click="closeDetailsModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingDetails" class="message loading">
            <div class="spinner"></div>
            <span>Cargando detalles...</span>
          </div>
          
          <div v-else-if="detailsError" class="message error">
            <i class="fas fa-exclamation-circle message-icon"></i>
            <span>{{ detailsError }}</span>
          </div>
          
          <div v-else class="pedido-details-container">
            <!-- Información general del pedido -->
            <div class="details-section">
              <h4 class="details-section-title">Información General</h4>
              <div class="details-grid">
                <div class="details-item">
                  <div class="details-label">Número de factura:</div>
                  <div class="details-value">{{ pedidoDetallado.invoiceNumber }}</div>
                </div>
                <div class="details-item">
                  <div class="details-label">Fecha:</div>
                  <div class="details-value">{{ formatearFecha(pedidoDetallado.orderDate) }}</div>
                </div>
              </div>
            </div>
            
            <!-- Información del proveedor -->
            <div class="details-section" v-if="pedidoDetallado.provider">
              <h4 class="details-section-title">Proveedor</h4>
              <div class="details-grid">
                <div class="details-item">
                  <div class="details-label">Nombre:</div>
                  <div class="details-value">{{ pedidoDetallado.provider.name }}</div>
                </div>
                <div class="details-item">
                  <div class="details-label">NIT:</div>
                  <div class="details-value">{{ pedidoDetallado.provider.taxId }}</div>
                </div>
                <div class="details-item">
                  <div class="details-label">Dirección:</div>
                  <div class="details-value">{{ pedidoDetallado.provider.address }}</div>
                </div>
                <div class="details-item">
                  <div class="details-label">Teléfono:</div>
                  <div class="details-value">{{ pedidoDetallado.provider.phone }}</div>
                </div>
              </div>
            </div>
            
            <!-- Detalles de productos -->
            <div class="details-section" v-if="pedidoDetallado.details && pedidoDetallado.details.length > 0">
              <h4 class="details-section-title">Productos</h4>
              <table class="details-table">
                <thead>
                  <tr class="details-table-header">
                    <th class="details-table-cell">ID</th>
                    <th class="details-table-cell">Producto</th>
                    <th class="details-table-cell">Código</th>
                    <th class="details-table-cell">Cantidad</th>
                    <th class="details-table-cell">Precio Unitario</th>
                    <th class="details-table-cell">Impuesto Unitario</th>
                    <th class="details-table-cell">Subtotal</th>
                    <th class="details-table-cell">Total Impuesto</th>
                    <th class="details-table-cell">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in pedidoDetallado.details" :key="detalle.id" class="details-table-row">
                    <td class="details-table-cell">{{ detalle.id }}</td>
                    <td class="details-table-cell">{{ detalle.product ? detalle.product.name : 'N/A' }}</td>
                    <td class="details-table-cell">{{ detalle.product ? detalle.product.code : 'N/A' }}</td>
                    <td class="details-table-cell">{{ detalle.quantity }}</td>
                    <td class="details-table-cell">{{ formatearMoneda(detalle.purchasePriceUnit) }}</td>
                    <td class="details-table-cell">{{ formatearMoneda(detalle.calculatedTaxUnit) }}</td>
                    <td class="details-table-cell">{{ formatearMoneda(detalle.calculatedTotalPriceWithouthTax) }}</td>
                    <td class="details-table-cell">{{ formatearMoneda(detalle.calculatedTotalTax) }}</td>
                    <td class="details-table-cell">{{ formatearMoneda(calcularTotalDetalleCompleto(detalle)) }}</td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Totales -->
              <div class="details-totals">
                <div class="details-total-row">
                  <div class="details-total-label">Subtotal:</div>
                  <div class="details-total-value">{{ formatearMoneda(calcularSubtotalPedidoCompleto(pedidoDetallado)) }}</div>
                </div>
                <div class="details-total-row">
                  <div class="details-total-label">Total Impuestos:</div>
                  <div class="details-total-value">{{ formatearMoneda(calcularTotalImpuestosPedidoCompleto(pedidoDetallado)) }}</div>
                </div>
                <div class="details-total-row grand-total">
                  <div class="details-total-label">Total General:</div>
                  <div class="details-total-value">{{ formatearMoneda(calcularTotalGeneralPedidoCompleto(pedidoDetallado)) }}</div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-details-message">
              <i class="fas fa-info-circle"></i>
              <span>No hay detalles de productos disponibles para este pedido.</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn btn-secondary">
            <i class="fas fa-times"></i> Cerrar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal para editar pedido -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            <i class="fas fa-edit"></i> Editar Pedido #{{ pedidoEditando.id }}
          </h3>
          <button @click="closeEditModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="actualizarPedido" class="form">
            <!-- Fecha del pedido -->
            <div class="form-group">
              <label for="editOrderDate">
                <i class="fas fa-calendar-alt label-icon"></i> Fecha del pedido:
              </label>
              <div class="input-wrapper">
                <input 
                  type="date" 
                  id="editOrderDate" 
                  v-model="pedidoEditando.orderDate" 
                  class="form-control"
                  required
                />
              </div>
            </div>
            
            <!-- Número de factura -->
            <div class="form-group">
              <label for="editInvoiceNumber">
                <i class="fas fa-file-invoice label-icon"></i> Número de factura:
              </label>
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="editInvoiceNumber" 
                  v-model="pedidoEditando.invoiceNumber" 
                  class="form-control"
                  placeholder="Ej: INV-12345"
                  required
                />
              </div>
            </div>
            
            <!-- Mensaje de error -->
            <div v-if="editError" class="message error">
              <i class="fas fa-exclamation-circle message-icon"></i>
              <span>{{ editError }}</span>
            </div>
            
            <!-- Botones -->
            <div class="form-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="actualizandoPedido">
                <i class="fas fa-save"></i> {{ actualizandoPedido ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal para eliminar pedido -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-container delete-modal">
        <div class="modal-header delete-header">
          <h3>
            <i class="fas fa-trash-alt"></i> Eliminar Pedido
          </h3>
          <button @click="closeDeleteModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="delete-warning">
            <i class="fas fa-exclamation-triangle warning-icon"></i>
            <p class="warning-text">¿Está seguro que desea eliminar el pedido #{{ pedidoEliminando.id }}?</p>
            <p class="warning-subtext">Esta acción no se puede deshacer.</p>
          </div>
          
          <div class="delete-details">
            <div class="delete-detail-item">
              <span class="detail-label">Número de factura:</span>
              <span class="detail-value">{{ pedidoEliminando.invoiceNumber }}</span>
            </div>
            <div class="delete-detail-item">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">{{ formatearFecha(pedidoEliminando.orderDate) }}</span>
            </div>
            <div class="delete-detail-item">
              <span class="detail-label">Proveedor:</span>
              <span class="detail-value">{{ pedidoEliminando.providerName }}</span>
            </div>
          </div>
          
          <!-- Mensaje de error -->
          <div v-if="deleteError" class="message error">
            <i class="fas fa-exclamation-circle message-icon"></i>
            <span>{{ deleteError }}</span>
          </div>
          
          <!-- Botones -->
          <div class="form-actions delete-actions">
            <button type="button" @click="closeDeleteModal" class="btn btn-secondary">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button 
              type="button" 
              @click="eliminarPedido" 
              class="btn btn-danger" 
              :disabled="eliminandoPedido"
            >
              <i class="fas fa-trash-alt"></i> {{ eliminandoPedido ? 'Eliminando...' : 'Eliminar Pedido' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';

// Importar los estilos desde el archivo CSS externo

import '@/components/stilos/detalles.css';

export default {
  name: 'DetallesPedido',
  
  data() {
    return {
      // Datos de pedidos
      pedidos: [],
      loadingPedidos: false,
      errorPedidos: null,
      searchPedidoQuery: '',
      fechaFiltro: '',
      isPedidosOpen: true, // Abierto por defecto
      
      // Datos de proveedores
      proveedores: [],
      loading: false,
      error: null,
      searchQuery: '',
      isProveedoresOpen: false,
      
      // Datos de nuevo pedido
      isNuevoPedidoOpen: false,
      nuevoPedido: {
        providerId: '',
        orderDate: this.obtenerFechaActual(),
        invoiceNumber: ''
      },
      enviandoPedido: false,
      pedidoError: null,
      pedidoExitoso: false,
      
      // Datos para ver detalles del pedido
      showDetailsModal: false,
      pedidoDetallado: {
        id: null,
        orderDate: '',
        invoiceNumber: '',
        provider: null,
        details: []
      },
      loadingDetails: false,
      detailsError: null,
      
      // Datos para edición de pedido
      showEditModal: false,
      pedidoEditando: {
        id: null,
        orderDate: '',
        invoiceNumber: ''
      },
      actualizandoPedido: false,
      editError: null,
      
      // Datos para eliminar pedido
      showDeleteModal: false,
      pedidoEliminando: {
        id: null,
        invoiceNumber: '',
        orderDate: '',
        providerName: ''
      },
      eliminandoPedido: false,
      deleteError: null,

      // Nuevo: para controlar qué tarjetas están expandidas
      expandedCards: {},
    };
  },
  
  computed: {
    filteredProveedores() {
      if (!this.searchQuery) return this.proveedores;
      
      const query = this.searchQuery.toLowerCase();
      return this.proveedores.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    },
    
    filteredPedidos() {
      let result = this.pedidos;
      
      // Filtrar por número de factura
      if (this.searchPedidoQuery) {
        const query = this.searchPedidoQuery.toLowerCase();
        result = result.filter(p => 
          p.invoiceNumber.toLowerCase().includes(query)
        );
      }
      
      // Filtrar por fecha
      if (this.fechaFiltro) {
        result = result.filter(p => p.orderDate === this.fechaFiltro);
      }
      
      return result;
    }
  },
  
  created() {
    // Cargar pedidos al iniciar el componente
    this.fetchPedidos();
  },
  
  methods: {
    // Método para verificar si un pedido tiene detalles
    tieneDetalles(pedido) {
      return pedido.orderDetails && pedido.orderDetails.length > 0;
    },
    
    // Métodos para pedidos
    togglePedidos() {
      this.isPedidosOpen = !this.isPedidosOpen;
      
      // Cargar datos solo la primera vez que se abre
      if (this.isPedidosOpen && this.pedidos.length === 0 && !this.loadingPedidos) {
        this.fetchPedidos();
      }
    },
    
    async fetchPedidos() {
      this.loadingPedidos = true;
      this.errorPedidos = null;
      
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'orders'
        });
        
        if (response.status === 200) {
          this.pedidos = response.data;
        } else {
          this.errorPedidos = `Error ${response.status}: ${response.data?.message || 'No se pudieron cargar los pedidos'}`;
        }
      } catch (err) {
        this.errorPedidos = err.message || 'Error al conectar con el servidor';
      } finally {
        this.loadingPedidos = false;
      }
    },
    
    formatearFecha(fecha) {
      if (!fecha) return '';
      
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    },
    
    limpiarFiltros() {
      this.searchPedidoQuery = '';
      this.fechaFiltro = '';
    },
    
    formatearMoneda(valor) {
      // Convertir a número si es string
      const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
      
      // Verificar si es un número válido
      if (isNaN(numero)) return '$0.00';
      
      // Formatear con 2 decimales y separador de miles
      return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(numero);
    },
    
    // Método actualizado para calcular el total de un detalle
    calcularTotalDetalle(detalle) {
      // Usar los campos calculados que vienen del API
      const subtotal = parseFloat(detalle.calculatedTotalPriceWithouthTax) || 0;
      const impuestos = parseFloat(detalle.calculatedTotalTax) || 0;
      
      return subtotal + impuestos;
    },
    
    // Método para calcular el total de un detalle en la vista detallada
    calcularTotalDetalleCompleto(detalle) {
      // Si existe calculatedTotalPriceWithTax, usarlo directamente
      if (detalle.calculatedTotalPriceWithTax) {
        return parseFloat(detalle.calculatedTotalPriceWithTax);
      }
      
      // De lo contrario, calcular como antes
      const subtotal = parseFloat(detalle.calculatedTotalPriceWithouthTax) || 0;
      const impuestos = parseFloat(detalle.calculatedTotalTax) || 0;
      
      return subtotal + impuestos;
    },
    
    // Nuevos métodos para calcular totales del pedido
    calcularSubtotalPedido(pedido) {
      if (!pedido.orderDetails || pedido.orderDetails.length === 0) return 0;
      
      return pedido.orderDetails.reduce((total, detalle) => {
        return total + parseFloat(detalle.calculatedTotalPriceWithouthTax || 0);
      }, 0);
    },
    
    calcularTotalImpuestosPedido(pedido) {
      if (!pedido.orderDetails || pedido.orderDetails.length === 0) return 0;
      
      return pedido.orderDetails.reduce((total, detalle) => {
        return total + parseFloat(detalle.calculatedTotalTax || 0);
      }, 0);
    },
    
    calcularTotalGeneralPedido(pedido) {
      return this.calcularSubtotalPedido(pedido) + this.calcularTotalImpuestosPedido(pedido);
    },
    
    // Métodos para calcular totales del pedido detallado (con la nueva estructura)
    calcularSubtotalPedidoCompleto(pedido) {
      if (!pedido.details || pedido.details.length === 0) return 0;
      
      return pedido.details.reduce((total, detalle) => {
        return total + parseFloat(detalle.calculatedTotalPriceWithouthTax || 0);
      }, 0);
    },
    
    calcularTotalImpuestosPedidoCompleto(pedido) {
      if (!pedido.details || pedido.details.length === 0) return 0;
      
      return pedido.details.reduce((total, detalle) => {
        return total + parseFloat(detalle.calculatedTotalTax || 0);
      }, 0);
    },
    
    calcularTotalGeneralPedidoCompleto(pedido) {
      return this.calcularSubtotalPedidoCompleto(pedido) + this.calcularTotalImpuestosPedidoCompleto(pedido);
    },
    
    // Método actualizado para ver detalles completos de un pedido
    async verDetallesPedido(pedido) {
      this.showDetailsModal = true;
      this.loadingDetails = true;
      this.detailsError = null;
      
      try {
        // Usar el nuevo endpoint con número de factura
        const response = await apiRequest({
          method: 'GET',
          path: `order-details/orderDetail/${pedido.invoiceNumber}`
        });
        
        if (response.status === 200) {
          // Asignar la respuesta al pedidoDetallado
          this.pedidoDetallado = {
            id: pedido.id,
            orderDate: response.data.orderDate,
            invoiceNumber: response.data.invoiceNumber,
            provider: pedido.provider, // Mantener el proveedor del pedido original
            details: response.data.details // Usar los detalles de la nueva respuesta
          };
          console.log('Detalles del pedido cargados:', this.pedidoDetallado);
        } else {
          this.detailsError = `Error ${response.status}: ${response.data?.message || 'No se pudieron cargar los detalles del pedido'}`;
        }
      } catch (err) {
        console.error('Error al cargar detalles del pedido:', err);
        this.detailsError = err.message || 'Error al conectar con el servidor';
      } finally {
        this.loadingDetails = false;
      }
    },
    
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.pedidoDetallado = {
        id: null,
        orderDate: '',
        invoiceNumber: '',
        provider: null,
        details: []
      };
      this.detailsError = null;
    },
    
    // Métodos para proveedores
    toggleProveedores() {
      this.isProveedoresOpen = !this.isProveedoresOpen;
      
      // Cargar datos solo la primera vez que se abre
      if (this.isProveedoresOpen && this.proveedores.length === 0 && !this.loading) {
        this.fetchProveedores();
      }
    },
    
    async fetchProveedores() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'providers'
        });
        
        if (response.status === 200) {
          this.proveedores = response.data;
        } else {
          this.error = `Error ${response.status}: ${response.data?.message || 'No se pudieron cargar los proveedores'}`;
        }
      } catch (err) {
        this.error = err.message || 'Error al conectar con el servidor';
      } finally {
        this.loading = false;
      }
    },
    
    seleccionarProveedor(id) {
      this.nuevoPedido.providerId = id;
      this.isProveedoresOpen = false;
      this.isNuevoPedidoOpen = true;
      
      // Hacer scroll al formulario
      this.$nextTick(() => {
        const formSection = document.querySelector('.section:nth-child(4)');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
    
    // Métodos para nuevo pedido
    toggleNuevoPedido() {
      this.isNuevoPedidoOpen = !this.isNuevoPedidoOpen;
      
      // Si no hay proveedores cargados, cargarlos
      if (this.isNuevoPedidoOpen && this.proveedores.length === 0 && !this.loading) {
        this.fetchProveedores();
      }
      
      // Resetear mensajes
      this.pedidoError = null;
      this.pedidoExitoso = false;
    },
    
    obtenerFechaActual() {
      const fecha = new Date();
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    },
    
    limpiarFormulario() {
      this.nuevoPedido = {
        providerId: '',
        orderDate: this.obtenerFechaActual(),
        invoiceNumber: ''
      };
      this.pedidoError = null;
      this.pedidoExitoso = false;
    },
    
    async crearPedido() {
      this.enviandoPedido = true;
      this.pedidoError = null;
      this.pedidoExitoso = false;
      
      try {
        // Convertir providerId a número
        const pedidoData = {
          ...this.nuevoPedido,
          providerId: parseInt(this.nuevoPedido.providerId)
        };
        
        const response = await apiRequest({
          method: 'POST',
          path: 'orders',
          data: pedidoData
        });
        
        if (response.status === 201 || response.status === 200) {
          // Éxito
          this.pedidoExitoso = true;
          
          // Resetear formulario
          this.nuevoPedido = {
            providerId: '',
            orderDate: this.obtenerFechaActual(),
            invoiceNumber: ''
          };
          
          // Recargar la lista de pedidos
          this.fetchPedidos();
        } else {
          this.pedidoError = `Error ${response.status}: ${response.data?.message || 'No se pudo crear el pedido'}`;
        }
      } catch (err) {
        this.pedidoError = err.message || 'Error al conectar con el servidor';
      } finally {
        this.enviandoPedido = false;
      }
    },
    
    // Métodos para editar pedido
    openEditModal(pedido) {
      this.pedidoEditando = {
        id: pedido.id,
        orderDate: pedido.orderDate,
        invoiceNumber: pedido.invoiceNumber,
        providerId: pedido.provider?.id || pedido.providerId
      };
      this.showEditModal = true;
      this.editError = null;
    },
    
    closeEditModal() {
      this.showEditModal = false;
      this.pedidoEditando = {
        id: null,
        orderDate: '',
        invoiceNumber: ''
      };
      this.editError = null;
    },
    
    async actualizarPedido() {
      this.actualizandoPedido = true;
      this.editError = null;
      
      try {
        // Crear objeto con solo los datos necesarios
        const datosActualizados = {
          orderDate: this.pedidoEditando.orderDate,
          invoiceNumber: this.pedidoEditando.invoiceNumber,
          providerId: this.pedidoEditando.providerId
        };
        
        const response = await apiRequest({
          method: 'PATCH',
          path: `orders/${this.pedidoEditando.id}`,
          data: datosActualizados
        });
        
        if (response.status === 200 || response.status === 201) {
          // Actualizar el pedido en la lista local
          const index = this.pedidos.findIndex(p => p.id === this.pedidoEditando.id);
          if (index !== -1) {
            this.pedidos[index].orderDate = this.pedidoEditando.orderDate;
            this.pedidos[index].invoiceNumber = this.pedidoEditando.invoiceNumber;
          }
          
          // Cerrar el modal
          this.closeEditModal();
          
          // Recargar todos los pedidos para asegurar datos actualizados
          this.fetchPedidos();
        } else {
          this.editError = `Error ${response.status}: ${response.data?.message || 'No se pudo actualizar el pedido'}`;
        }
      } catch (err) {
        this.editError = err.message || 'Error al conectar con el servidor';
        console.error('Error al actualizar pedido:', err);
      } finally {
        this.actualizandoPedido = false;
      }
    },
    
    // Métodos para eliminar pedido
    openDeleteModal(pedido) {
      this.pedidoEliminando = {
        id: pedido.id,
        invoiceNumber: pedido.invoiceNumber,
        orderDate: pedido.orderDate,
        providerName: pedido.provider?.name || 'No disponible'
      };
      this.showDeleteModal = true;
      this.deleteError = null;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.pedidoEliminando = {
        id: null,
        invoiceNumber: '',
        orderDate: '',
        providerName: ''
      };
      this.deleteError = null;
    },
    
    async eliminarPedido() {
      this.eliminandoPedido = true;
      this.deleteError = null;
      
      try {
        // Usar el método DELETE directamente como indica la documentación
        const response = await apiRequest({
          method: 'DELETE',
          path: `orders/${this.pedidoEliminando.id}`
        });
        
        if (response.status === 200) {
          // Eliminar el pedido de la lista local
          this.pedidos = this.pedidos.filter(p => p.id !== this.pedidoEliminando.id);
          
          // Cerrar el modal
          this.closeDeleteModal();
          
          // Mostrar notificación de éxito
          this.$nextTick(() => {
            const successMessage = document.createElement('div');
            successMessage.className = 'floating-message success';
            successMessage.innerHTML = `
              <i class="fas fa-check-circle"></i>
              <span>Pedido #${this.pedidoEliminando.id} eliminado correctamente</span>
            `;
            document.body.appendChild(successMessage);
            
            // Eliminar la notificación después de 3 segundos
            setTimeout(() => {
              document.body.removeChild(successMessage);
            }, 3000);
          });
        } else if (response.status === 404) {
          this.deleteError = 'El pedido no existe o ya ha sido eliminado';
        } else {
          this.deleteError = `Error ${response.status}: ${response.data?.message || 'No se pudo eliminar el pedido'}`;
        }
      } catch (err) {
        // Manejo detallado del error
        console.error('Error al eliminar pedido:', err);
        
        // Verificar si hay detalles específicos del error
        if (err.response) {
          this.deleteError = `Error ${err.response.status}: ${err.response.data?.message || 'Error en el servidor'}`;
        } else if (err.request) {
          this.deleteError = 'No se recibió respuesta del servidor. Verifique su conexión.';
        } else {
          this.deleteError = err.message || 'Error al conectar con el servidor';
        }
      } finally {
        this.eliminandoPedido = false;
      }
    },

    // Nuevo método para expandir/contraer tarjetas
    toggleCardExpansion(id) {
      this.$set(this.expandedCards, id, !this.expandedCards[id]);
    },
  }
};
</script>