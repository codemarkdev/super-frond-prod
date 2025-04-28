<template>
    <div class="buscar-details">
      <div class="section">
        <div class="section-header">
          <div class="header-left">
            <i class="fas fa-search section-icon"></i>
            <h3>Buscar Detalles por Número de Factura</h3>
          </div>
        </div>
  
        <div class="section-content">
          <div class="search-container">
            <div class="form-group">
              <label for="invoiceNumber">
                <i class="fas fa-file-invoice label-icon"></i> Número de factura:
              </label>
              <div class="input-wrapper search-input-wrapper">
                <input 
                  type="text" 
                  id="invoiceNumber" 
                  v-model="invoiceNumber" 
                  class="form-control" 
                  placeholder="Ej: INV-20240315" 
                  @keyup.enter="buscarDetalles"
                />
                <button 
                  type="button" 
                  @click="buscarDetalles" 
                  class="btn btn-primary search-btn" 
                  :disabled="buscando || !invoiceNumber.trim()"
                >
                  <i class="fas" :class="buscando ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                  {{ buscando ? 'Buscando...' : 'Buscar' }}
                </button>
              </div>
            </div>
          </div>
  
          <!-- Mensaje de error -->
          <div v-if="error" class="message error">
            <i class="fas fa-exclamation-circle message-icon"></i>
            <span>{{ error }}</span>
          </div>
  
          <!-- Mensaje cuando no hay resultados -->
          <div v-if="noResultados" class="message warning">
            <i class="fas fa-exclamation-triangle message-icon"></i>
            <span>No se encontraron detalles para el número de factura ingresado.</span>
          </div>
  
          <!-- Resultados de la búsqueda -->
          <div v-if="ordenDetalle && !buscando" class="order-results">
            <div class="order-header">
              <div class="order-header-item">
                <i class="fas fa-file-invoice"></i>
                <span class="label">Factura:</span>
                <span class="value">{{ ordenDetalle.invoiceNumber }}</span>
              </div>
              <div class="order-header-item">
                <i class="fas fa-calendar-alt"></i>
                <span class="label">Fecha:</span>
                <span class="value">{{ formatearFecha(ordenDetalle.orderDate) }}</span>
              </div>
            </div>
  
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Impuesto Unitario</th>
                    <th>Subtotal</th>
                    <th>Total Impuesto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in ordenDetalle.details" :key="detalle.id">
                    <td>{{ detalle.id }}</td>
                    <td>{{ detalle.product.code }}</td>
                    <td>{{ detalle.product.name }}</td>
                    <td>{{ detalle.quantity }}</td>
                    <td>{{ formatearMoneda(detalle.purchasePriceUnit) }}</td>
                    <td>{{ formatearMoneda(detalle.calculatedTaxUnit) }}</td>
                    <td>{{ formatearMoneda(detalle.calculatedTotalPriceWithouthTax) }}</td>
                    <td>{{ formatearMoneda(detalle.calculatedTotalTax) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="6" class="text-right"><strong>Total:</strong></td>
                    <td>{{ formatearMoneda(calcularSubtotal()) }}</td>
                    <td>{{ formatearMoneda(calcularTotalImpuesto()) }}</td>
                  </tr>
                  <tr>
                    <td colspan="6" class="text-right"><strong>Total con Impuesto:</strong></td>
                    <td colspan="2">{{ formatearMoneda(calcularTotal()) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import apiRequest from '@/Servicios/HttpService';
  
  export default {
    name: 'BuscarDetails',
    data() {
      return {
        invoiceNumber: '',
        ordenDetalle: null,
        buscando: false,
        error: null,
        noResultados: false
      };
    },
    methods: {
      async buscarDetalles() {
        if (!this.invoiceNumber.trim()) {
          this.error = 'Por favor ingrese un número de factura';
          return;
        }
  
        this.buscando = true;
        this.error = null;
        this.noResultados = false;
        this.ordenDetalle = null;
  
        try {
          const response = await apiRequest({
            method: 'GET',
            path: `order-details/orderDetail/${this.invoiceNumber}`
          });
          
          if (response && response.status === 200 && response.data) {
            this.ordenDetalle = response.data;
            this.noResultados = false;
          } else {
            this.noResultados = true;
          }
        } catch (err) {
          console.error('Error al buscar detalles:', err);
          if (err.response && err.response.status === 404) {
            this.noResultados = true;
          } else {
            this.error = 'Error al buscar detalles. Por favor intente nuevamente.';
          }
        } finally {
          this.buscando = false;
        }
      },
      
      formatearFecha(fechaString) {
        if (!fechaString) return 'N/A';
        
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      },
      
      formatearMoneda(valor) {
        if (valor === undefined || valor === null) return 'N/A';
        
        return new Intl.NumberFormat('es-SV', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(valor);
      },
      
      calcularSubtotal() {
        if (!this.ordenDetalle || !this.ordenDetalle.details) return 0;
        
        return this.ordenDetalle.details.reduce((sum, detalle) => 
          sum + detalle.calculatedTotalPriceWithouthTax, 0);
      },
      
      calcularTotalImpuesto() {
        if (!this.ordenDetalle || !this.ordenDetalle.details) return 0;
        
        return this.ordenDetalle.details.reduce((sum, detalle) => 
          sum + detalle.calculatedTotalTax, 0);
      },
      
      calcularTotal() {
        return this.calcularSubtotal() + this.calcularTotalImpuesto();
      }
    }
  };
  </script>
  
 