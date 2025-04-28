<template>
    <div class="ordenes-eliminadas-container">
      <div class="section">
        <div class="section-header">
          <div class="header-left">
            <i class="fas fa-trash-restore section-icon"></i>
            <h3>Pedidos Eliminados</h3>
          </div>
        </div>
  
        <div class="section-content">
          <!-- Mensaje de éxito -->
          <div v-if="mensajeExito" class="success-message">
            <i class="fas fa-check-circle"></i> {{ mensajeExito }}
          </div>
  
          <!-- Mensaje de carga -->
          <div v-if="cargando" class="loading-message">
            <i class="fas fa-spinner fa-spin"></i> Cargando pedidos eliminados...
          </div>
  
          <!-- Tabla de órdenes eliminadas -->
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número de Factura</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <!-- Corregido: v-for en cada elemento con su propia key -->
                <tr v-for="orden in ordenes" :key="`orden-${orden.id}`">
                  <td>{{ orden.id }}</td>
                  <td>{{ orden.invoiceNumber }}</td>
                  <td>{{ formatearFecha(orden.orderDate || orden.createdAt) }}</td>
                  <td>{{ orden.provider ? orden.provider.name : 'No especificado' }}</td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <b-tooltip label="Ver detalles" position="is-top">
                        <b-button class="btn-primary" @click="toggleDetalles(orden)">
                          <b-icon :icon="orden.mostrarDetalles ? 'chevron-up' : 'eye'" />
                        </b-button>
                      </b-tooltip>
                      <b-tooltip label="Restaurar" position="is-top">
                        <b-button class="btn-primary" @click="confirmarRestaurar(orden)" :disabled="restaurando === orden.id">
                          <b-icon icon="refresh" />
                        </b-button>
                      </b-tooltip>
                    </div>
                  </td>
                </tr>
                
                <!-- Fila de detalles (expandible) para cada orden -->
                <tr 
                  v-for="orden in ordenes" 
                  :key="`detalles-${orden.id}`" 
                  v-show="orden.mostrarDetalles" 
                  class="detalles-row"
                >
                  <td colspan="5" class="detalles-container">
                    <div class="detalles-content">
                      <h4>Detalles del Pedido #{{ orden.id }}</h4>
                      
                      <!-- Información del pedido -->
                      <div class="detalles-seccion">
                        <h5>Información del Pedido</h5>
                        <div class="detalles-grid">
                          <div class="detalles-item">
                            <span class="detalles-label">ID:</span>
                            <span class="detalles-valor">{{ orden.id }}</span>
                          </div>
                          <div class="detalles-item">
                            <span class="detalles-label">Número de Factura:</span>
                            <span class="detalles-valor">{{ orden.invoiceNumber }}</span>
                          </div>
                          <div class="detalles-item">
                            <span class="detalles-label">Fecha:</span>
                            <span class="detalles-valor">{{ formatearFecha(orden.orderDate || orden.createdAt) }}</span>
                          </div>
                          <div class="detalles-item">
                          
                            <span class="detalles-valor estado-inactivo">Inactivo</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Información del proveedor -->
                      <div class="detalles-seccion" v-if="orden.provider">
                        <h5>Información del Proveedor</h5>
                        <div class="detalles-grid">
                          <div class="detalles-item">
                            <span class="detalles-label">Nombre:</span>
                            <span class="detalles-valor">{{ orden.provider.name }}</span>
                          </div>
                          <div class="detalles-item">
                            <span class="detalles-label">ID Fiscal:</span>
                            <span class="detalles-valor">{{ orden.provider.taxId }}</span>
                          </div>
                          <div class="detalles-item">
                            <span class="detalles-label">Dirección:</span>
                            <span class="detalles-valor">{{ orden.provider.address }}</span>
                          </div>
                          <div class="detalles-item">
                            <span class="detalles-label">Teléfono:</span>
                            <span class="detalles-valor">{{ orden.provider.phone }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Detalles de la orden -->
                      <div class="detalles-seccion">
                        <h5>Detalles de Productos</h5>
                        <div class="detalles-table-container">
                          <table class="detalles-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Impuesto Unitario</th>
                                <th>Total sin Impuesto</th>
                                <th>Total con Impuesto</th>
                    
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="detalle in orden.orderDetails" :key="detalle.id">
                                <td>{{ detalle.id }}</td>
                                <td>{{ detalle.quantity }}</td>
                                <td>{{ formatearMoneda(detalle.purchasePriceUnit) }}</td>
                                <td>{{ formatearMoneda(detalle.calculatedTaxUnit) }}</td>
                                <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithouthTax) }}</td>
                                <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithTax) }}</td>
                                <td>
                                 
                                </td>
                              </tr>
                              <tr v-if="!orden.orderDetails || orden.orderDetails.length === 0">
                                <td colspan="7" class="empty-message">
                                  <i class="fas fa-info-circle"></i> No hay detalles disponibles para este pedido.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <!-- Resumen -->
                      <div class="detalles-seccion resumen" v-if="orden.orderDetails && orden.orderDetails.length > 0">
                        <h5>Resumen</h5>
                        <div class="resumen-grid">
                          <div class="resumen-item">
                            <span class="resumen-label">Total sin Impuestos:</span>
                            <span class="resumen-valor">{{ calcularTotalSinImpuestos(orden) }}</span>
                          </div>
                          <div class="resumen-item">
                            <span class="resumen-label">Total Impuestos:</span>
                            <span class="resumen-valor">{{ calcularTotalImpuestos(orden) }}</span>
                          </div>
                          <div class="resumen-item total">
                            <span class="resumen-label">Total con Impuestos:</span>
                            <span class="resumen-valor">{{ calcularTotalConImpuestos(orden) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <tr v-if="ordenes.length === 0">
                  <td colspan="5" class="empty-message">
                    <i class="fas fa-info-circle"></i> No se encontraron pedidos eliminados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- Modal de confirmación para restaurar -->
      <div class="modal" :class="{ 'is-active': modalRestaurarActivo }">
        <div class="modal-background" @click="cerrarModalRestaurar"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Confirmar Restauración</p>
            <button class="delete" aria-label="close" @click="cerrarModalRestaurar"></button>
          </header>
          <section class="modal-card-body">
            <p>
              ¿Está seguro que desea restaurar el pedido con número de factura
              <strong>{{ ordenRestaurar && ordenRestaurar.invoiceNumber }}</strong>?
            </p>
            <p class="info-text">
              <i class="fas fa-info-circle"></i> El pedido volverá a estar activo en el sistema.
            </p>
          </section>
          <footer class="modal-card-foot">
            <button class="button is-primary" @click="restaurarOrden" :disabled="restaurando">
              <i class="fas" :class="restaurando ? 'fa-spinner fa-spin' : 'fa-trash-restore'"></i>
              {{ restaurando ? 'Restaurando...' : 'Restaurar' }}
            </button>
            <button class="button" @click="cerrarModalRestaurar">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </footer>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import apiRequest from '@/Servicios/HttpService';
  
  export default {
    name: 'OrderDelets',
    data() {
      return {
        ordenes: [],
        cargando: false,
        restaurando: false,
        modalRestaurarActivo: false,
        ordenRestaurar: null,
        mensajeExito: null,
        tiempoMensaje: null
      };
    },
    
    created() {
      this.cargarOrdenesEliminadas();
    },
    
    methods: {
      async cargarOrdenesEliminadas() {
        this.cargando = true;
        
        try {
          const response = await apiRequest({
            method: 'GET',
            path: 'orders/findDeleted'
          });
          
          if (response.status === 200) {
            // Agregar propiedad para controlar la visualización de detalles
            this.ordenes = response.data.map(orden => ({
              ...orden,
              mostrarDetalles: false
            }));
          } else {
            this.$buefy.toast.open({
              message: `Error al cargar pedidos eliminados: ${response.status}`,
              type: 'is-danger'
            });
          }
        } catch (error) {
          console.error('Error al cargar pedidos eliminados:', error);
          this.$buefy.toast.open({
            message: 'Error al cargar pedidos eliminados',
            type: 'is-danger'
          });
        } finally {
          this.cargando = false;
        }
      },
      
      toggleDetalles(orden) {
        // Cambiar el estado de mostrarDetalles para la orden seleccionada
        orden.mostrarDetalles = !orden.mostrarDetalles;
      },
      
      confirmarRestaurar(orden) {
        this.ordenRestaurar = orden;
        this.modalRestaurarActivo = true;
      },
      
      cerrarModalRestaurar() {
        this.modalRestaurarActivo = false;
        this.ordenRestaurar = null;
      },
      
      async restaurarOrden() {
        if (!this.ordenRestaurar) return;
        
        this.restaurando = true;
        
        try {
          const response = await apiRequest({
            method: 'POST',
            path: `orders/active/${this.ordenRestaurar.id}`
          });
          
          // Consideramos exitoso incluso si el código es 201 (que parece ser un error pero funciona)
          if (response.status === 200 || response.status === 204 || response.status === 201) {
            // Mostrar mensaje de éxito
            this.mostrarMensajeExito(`Pedido #${this.ordenRestaurar.id} restaurado correctamente`);
            
            // Emitir evento para notificar al componente padre
            this.$emit('orden-restaurada');
            
            // Cerrar el modal
            this.cerrarModalRestaurar();
            
            // Recargar la lista de pedidos eliminados
            this.cargarOrdenesEliminadas();
          } else {
            this.$buefy.toast.open({
              message: `Error al restaurar el pedido: ${response.status}`,
              type: 'is-danger'
            });
          }
        } catch (error) {
          console.error('Error al restaurar el pedido:', error);
          
          // Si el error es 201, consideramos que fue exitoso
          if (error.response && error.response.status === 201) {
            this.mostrarMensajeExito(`Pedido #${this.ordenRestaurar.id} restaurado correctamente`);
            this.$emit('orden-restaurada');
            this.cerrarModalRestaurar();
            this.cargarOrdenesEliminadas();
          } else {
            this.$buefy.toast.open({
              message: 'Error al restaurar el pedido',
              type: 'is-danger'
            });
          }
        } finally {
          this.restaurando = false;
        }
      },
      
      mostrarMensajeExito(mensaje) {
        // Limpiar cualquier temporizador existente
        if (this.tiempoMensaje) {
          clearTimeout(this.tiempoMensaje);
        }
        
        // Mostrar el mensaje
        this.mensajeExito = mensaje;
        
        // Configurar temporizador para ocultar el mensaje después de 5 segundos
        this.tiempoMensaje = setTimeout(() => {
          this.mensajeExito = null;
        }, 5000);
      },
      
      formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        
        const date = new Date(fecha);
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(date);
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
      },
      
      calcularTotalSinImpuestos(orden) {
        if (!orden.orderDetails || orden.orderDetails.length === 0) return this.formatearMoneda(0);
        
        const total = orden.orderDetails.reduce((sum, detalle) => {
          return sum + (detalle.calculatedTotalPriceWithouthTax || 0);
        }, 0);
        
        return this.formatearMoneda(total);
      },
      
      calcularTotalImpuestos(orden) {
        if (!orden.orderDetails || orden.orderDetails.length === 0) return this.formatearMoneda(0);
        
        const total = orden.orderDetails.reduce((sum, detalle) => {
          return sum + (detalle.calculatedTotalTax || 0);
        }, 0);
        
        return this.formatearMoneda(total);
      },
      
      calcularTotalConImpuestos(orden) {
        if (!orden.orderDetails || orden.orderDetails.length === 0) return this.formatearMoneda(0);
        
        const total = orden.orderDetails.reduce((sum, detalle) => {
          return sum + (detalle.calculatedTotalPriceWithTax || 0);
        }, 0);
        
        return this.formatearMoneda(total);
      }
    }
  };
  </script>
  
  <style scoped>
  .ordenes-eliminadas-container {
    padding: 20px;
  }
  
  .section {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .section-icon {
    font-size: 1.5rem;
    color: #3273dc;
    margin-right: 10px;
  }
  
  .section-content {
    padding: 20px;
  }
  
  /* Mensaje de carga */
  .loading-message {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    font-size: 16px;
    color: #666;
  }
  
  .loading-message i {
    margin-right: 10px;
    color: #3273dc;
    font-size: 20px;
  }
  
  /* Mensaje de éxito */
  .success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 12px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
  
  .success-message i {
    margin-right: 10px;
    font-size: 18px;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th, .data-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .data-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .data-table tbody tr:hover {
    background-color: #f9f9f9;
  }
  
  .empty-message {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .empty-message i {
    margin-right: 5px;
    color: #3273dc;
  }
  
  /* Estilos para los botones de acción */
  .actions-cell {
    text-align: center;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 5px;
  }
  
  /* Estilos para la fila de detalles */
  .detalles-row {
    background-color: #f9f9f9;
  }
  
  .detalles-container {
    padding: 0;
  }
  
  .detalles-content {
    padding: 20px;
    border-top: 1px solid #eee;
  }
  
  .detalles-content h4 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    color: #333;
    border-bottom: 2px solid #3273dc;
    padding-bottom: 8px;
  }
  
  .detalles-seccion {
    margin-bottom: 25px;
  }
  
  .detalles-seccion h5 {
    font-size: 16px;
    color: #3273dc;
    margin-bottom: 12px;
    font-weight: 600;
  }
  
  .detalles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .detalles-item {
    display: flex;
    flex-direction: column;
  }
  
  .detalles-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .detalles-valor {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }
  
  .estado-activo {
    color: #28a745;
    font-weight: 600;
  }
  
  .estado-inactivo {
    color: #dc3545;
    font-weight: 600;
  }
  
  .detalles-table-container {
    overflow-x: auto;
    margin-top: 10px;
  }
  
  .detalles-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .detalles-table th, .detalles-table td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  .detalles-table th {
    background-color: #f0f0f0;
    font-weight: 600;
  }
  
  /* Estilos para el resumen */
  .resumen {
    background-color: #f5f5f5;
    border-radius: 6px;
    padding: 15px;
    margin-top: 20px;
  }
  
  .resumen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .resumen-item {
    display: flex;
    flex-direction: column;
  }
  
  .resumen-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .resumen-valor {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .resumen-item.total {
    grid-column: 1 / -1;
    border-top: 1px solid #ddd;
    padding-top: 10px;
    margin-top: 5px;
  }
  
  .resumen-item.total .resumen-label {
    font-size: 15px;
    color: #333;
  }
  
  .resumen-item.total .resumen-valor {
    font-size: 18px;
    color: #3273dc;
  }
  
  /* Estilos para los modales */
  .modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .modal.is-active {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .modal-card {
    position: relative;
    width: 100%;
    max-width: 500px;
    background-color: white;
    border-radius: 6px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
  }
  
  .modal-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-card-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  .delete {
    background-color: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .modal-card-body {
    padding: 20px;
  }
  
  .modal-card-foot {
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #eee;
  }
  
  .info-text {
    color: #3273dc;
    margin-top: 10px;
  }
  
  .info-text i {
    margin-right: 5px;
  }
  
  /* Estilos para los botones de Buefy */
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
  </style>
  
  