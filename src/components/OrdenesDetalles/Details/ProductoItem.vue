<template>
  <div class="product-item">
    <div class="product-item-header">
      <h5>
        <i class="fas fa-box"></i>
        {{ productoLocal.name || (productoLocal.productId ? `Producto ID: ${productoLocal.productId}` : `Producto #${index + 1}`) }}
      </h5>
      <button type="button" @click="$emit('eliminar-producto', index)" class="btn-remove">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="product-item-body">
      <!-- Si es producto existente o nuevo -->
      <div class="form-group checkbox-group">
        <label class="switch-label">Tipo de producto:</label>
        <div class="switch-options">
          <label class="switch-option" :class="{ 'active': productoLocal.esExistente }">
            <input type="radio" :name="`tipoProducto_${index}`" :value="true" 
                  @change="updateProducto('esExistente', true)">
            <i class="fas fa-database"></i> Existente
          </label>
          <label class="switch-option" :class="{ 'active': !productoLocal.esExistente }">
            <input type="radio" :name="`tipoProducto_${index}`" :value="false" 
                  @change="updateProducto('esExistente', false)">
            <i class="fas fa-plus-circle"></i> Nuevo
          </label>
        </div>
      </div>

      <!-- Si es producto existente -->
      <div v-if="productoLocal.esExistente" class="form-row">
        <div class="form-group product-id-group">
          <label :for="`productId_${index}`">
            <i class="fas fa-hashtag label-icon"></i> Producto:
          </label>
          <div class="input-wrapper product-id-wrapper">
            <select :id="`productId_${index}`" 
                   :value="productoLocal.productId"
                   @change="updateProducto('productId', $event.target.value)" 
                   class="form-control" required>
              <option value="" disabled>Seleccione un producto</option>
              <option v-for="prod in productosDisponibles" :key="prod.id" :value="prod.id">
                {{ prod.name }} ({{ prod.code }})
              </option>
            </select>
            <button 
              type="button" 
              @click="$emit('buscar-producto', index)" 
              class="btn btn-search"
              :disabled="!productoLocal.productId || productoLocal.cargando"
            >
              <i class="fas" :class="productoLocal.cargando ? 'fa-spinner fa-spin' : 'fa-search'"></i>
              {{ productoLocal.cargando ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Mensaje de error si no se encuentra el producto -->
      <div v-if="productoLocal.error" class="message error product-error">
        <i class="fas fa-exclamation-circle message-icon"></i>
        <span>{{ productoLocal.error }}</span>
      </div>

      <!-- Si es producto nuevo o si se encontró el producto existente -->
      <div v-if="!productoLocal.esExistente || (productoLocal.esExistente && productoLocal.encontrado)">
        <!-- Información del producto encontrado -->
        <div v-if="productoLocal.esExistente && productoLocal.encontrado" class="product-found-info">
          <div class="product-info-header">
            <i class="fas fa-info-circle"></i> Información del producto encontrado
          </div>
          <div class="product-info-content">
            <div class="info-row">
              <span class="info-label">Código:</span>
              <span class="info-value">{{ productoLocal.code }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ productoLocal.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Categoría:</span>
              <span class="info-value">
                {{ productoLocal.category ? productoLocal.category.categoryName : 'No especificada' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Marca:</span>
              <span class="info-value">
                {{ productoLocal.brand ? productoLocal.brand.brandName : 'No especificada' }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Stock actual:</span>
              <span class="info-value">{{ productoLocal.stock }} unidades</span>
            </div>
            <div class="info-row">
              <span class="info-label">Precio de venta:</span>
              <span class="info-value">{{ formatearMoneda(productoLocal.salePrice) }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs para organizar la información del producto -->
        <div class="product-tabs">
          <div class="tab-headers">
            <div 
              class="tab-header" 
              :class="{ 'active': productoLocal.activeTab === 'info' }"
              @click="updateProducto('activeTab', 'info')"
            >
              <i class="fas fa-info-circle"></i> Información
            </div>
            <div 
              class="tab-header" 
              :class="{ 'active': productoLocal.activeTab === 'prices' }"
              @click="updateProducto('activeTab', 'prices')"
            >
              <i class="fas fa-tag"></i> Precios
            </div>
            <div 
              class="tab-header" 
              :class="{ 'active': productoLocal.activeTab === 'wholesale' }"
              @click="updateProducto('activeTab', 'wholesale')"
            >
              <i class="fas fa-truck"></i> Mayoreo
            </div>
            <div 
              class="tab-header" 
              :class="{ 'active': productoLocal.activeTab === 'tax' }"
              @click="updateProducto('activeTab', 'tax')"
            >
              <i class="fas fa-percentage"></i> Impuestos
            </div>
          </div>

          <div class="tab-content">
            <!-- Tab: Información Básica -->
            <div v-show="productoLocal.activeTab === 'info'" class="tab-pane">
              <div v-if="!productoLocal.esExistente" class="form-row">
                <div class="form-group half">
                  <label :for="`code_${index}`">
                    <i class="fas fa-barcode label-icon"></i> Código:
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="text" 
                      :id="`code_${index}`" 
                      :value="productoLocal.code"
                      @input="updateProducto('code', $event.target.value)"
                      class="form-control" 
                      placeholder="Ej: PROD123" 
                      required 
                    />
                  </div>
                </div>
                <div class="form-group half">
                  <label :for="`name_${index}`">
                    <i class="fas fa-tag label-icon"></i> Nombre:
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="text" 
                      :id="`name_${index}`" 
                      :value="productoLocal.name"
                      @input="updateProducto('name', $event.target.value)"
                      class="form-control" 
                      placeholder="Ej: Laptop Gamer" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div v-if="!productoLocal.esExistente" class="form-row">
                <div class="form-group half">
                  <label :for="`brandId_${index}`">
                    <i class="fas fa-copyright label-icon"></i> Marca:
                  </label>
                  <div class="input-wrapper">
                    <select 
                      :id="`brandId_${index}`" 
                      :value="productoLocal.brandId"
                      @change="updateProducto('brandId', $event.target.value)" 
                      class="form-control" 
                      required
                    >
                      <option value="" disabled>Seleccione una marca</option>
                      <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                        {{ marca.brandName }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="form-group half">
                  <label :for="`categoryId_${index}`">
                    <i class="fas fa-folder label-icon"></i> Categoría:
                  </label>
                  <div class="input-wrapper">
                    <select 
                      :id="`categoryId_${index}`" 
                      :value="productoLocal.categoryId"
                      @change="updateProducto('categoryId', $event.target.value)" 
                      class="form-control" 
                      required
                    >
                      <option value="" disabled>Seleccione una categoría</option>
                      <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                        {{ categoria.categoryName }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label :for="`quantity_${index}`">
                  <i class="fas fa-sort-numeric-up label-icon"></i> Cantidad:
                </label>
                <div class="input-wrapper">
                  <input 
                    type="number" 
                    :id="`quantity_${index}`" 
                    :value="productoLocal.quantity"
                    @input="updateProducto('quantity', $event.target.value)"
                    class="form-control" 
                    placeholder="Ej: 10" 
                    min="1" 
                    required 
                  />
                </div>
              </div>
            </div>

            <!-- Tab: Precios -->
            <div v-show="productoLocal.activeTab === 'prices'" class="tab-pane">
              <div class="form-row">
                <div class="form-group half">
                  <label :for="`purchasePrice_${index}`">
                    <i class="fas fa-shopping-cart label-icon"></i> Precio de compra:
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="number" 
                      :id="`purchasePrice_${index}`"
                      :value="productoLocal.purchasePrice"
                      @input="updateProducto('purchasePrice', $event.target.value)"
                      class="form-control" 
                      placeholder="Ej: 1200"
                      step="0.01" 
                      min="0" 
                      required 
                    />
                  </div>
                </div>
                <div v-if="!productoLocal.esExistente" class="form-group half">
                  <label :for="`salePrice_${index}`">
                    <i class="fas fa-tag label-icon"></i> Precio de venta:
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="number" 
                      :id="`salePrice_${index}`" 
                      :value="productoLocal.salePrice"
                      @input="updateProducto('salePrice', $event.target.value)"
                      class="form-control" 
                      placeholder="Ej: 1500" 
                      step="0.01" 
                      min="0" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div v-if="!productoLocal.esExistente" class="form-row">
                <div class="form-group">
                  <label :for="`touristPrice_${index}`">
                    <i class="fas fa-plane label-icon"></i> Precio turista:
                  </label>
                  <div class="input-wrapper">
                    <input 
                      type="number" 
                      :id="`touristPrice_${index}`" 
                      :value="productoLocal.touristPrice"
                      @input="updateProducto('touristPrice', $event.target.value)"
                      class="form-control" 
                      placeholder="Ej: 1500" 
                      step="0.01" 
                      min="0" 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Mayoreo -->
            <div v-show="productoLocal.activeTab === 'wholesale'" class="tab-pane">
              <div class="form-group checkbox-group">
                <label class="switch-label">
                  <i class="fas fa-truck label-icon"></i> Esta opción permite al usuario poner los productos con precio para mayorista:
                </label>
                <div class="orden-switch-wrapper">
                  <label class="orden-switch">
                    <input 
                      type="checkbox" 
                      :checked="productoLocal.wholesaleSale"
                      @change="updateProducto('wholesaleSale', $event.target.checked)"
                    >
                    <span class="orden-slider round"></span>
                  </label>
                  <span class="switch-text">{{ productoLocal.wholesaleSale ? 'Habilitado' : 'Deshabilitado' }}</span>
                </div>
              </div>

              <!-- Información de mayoreo -->
              <div class="wholesale-section" v-if="productoLocal.wholesaleSale">
                <div class="form-row">
                  <div class="form-group half">
                    <label :for="`wholesalePrice_${index}`">
                      <i class="fas fa-money-bill-wave label-icon"></i> Precio mayorista:
                    </label>
                    <div class="input-wrapper">
                      <input 
                        type="number" 
                        :id="`wholesalePrice_${index}`"
                        :value="productoLocal.wholesalePrice"
                        @input="updateProducto('wholesalePrice', $event.target.value)"
                        class="form-control" 
                        placeholder="Ej: 1100"
                        step="0.01" 
                        min="0" 
                        required 
                      />
                    </div>
                  </div>
                  <div class="form-group half">
                    <label :for="`wholesaleQuantity_${index}`">
                      <i class="fas fa-sort-amount-up label-icon"></i> Cantidad mínima:
                    </label>
                    <div class="input-wrapper">
                      <input 
                        type="number" 
                        :id="`wholesaleQuantity_${index}`"
                        :value="productoLocal.wholesaleQuantity"
                        @input="updateProducto('wholesaleQuantity', $event.target.value)"
                        class="form-control" 
                        placeholder="Ej: 10"
                        min="1" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje cuando está deshabilitado -->
              <div class="wholesale-info" v-if="!productoLocal.wholesaleSale">
                <i class="fas fa-info-circle"></i>
                <span>La venta al por mayor está deshabilitada para este producto.</span>
              </div>
            </div>

            <!-- Tab: Impuestos -->
            <div v-show="productoLocal.activeTab === 'tax'" class="tab-pane">
              <div class="tax-info">
                <div class="tax-header">
                  <i class="fas fa-info-circle"></i> Información de impuestos
                </div>
                <div class="tax-content">
                  <p>Los impuestos se calcularán automáticamente en el servidor basados en el precio de compra.</p>

                  <div class="tax-preview">
                    <div class="tax-preview-row">
                      <span class="tax-label">Precio unitario:</span>
                      <span class="tax-value">{{ formatearMoneda(productoLocal.purchasePrice) }}</span>
                    </div>
                    <div class="tax-preview-row">
                      <span class="tax-label">IVA estimado (13%):</span>
                      <span class="tax-value">{{ formatearMoneda(calcularIVAEstimado(productoLocal.purchasePrice)) }}</span>
                    </div>
                    <div class="tax-preview-row">
                      <span class="tax-label">Cantidad:</span>
                      <span class="tax-value">{{ productoLocal.quantity || 0 }}</span>
                    </div>
                    <div class="tax-preview-row total-row">
                      <span class="tax-label">Total estimado con IVA:</span>
                      <span class="tax-value total-value">{{ formatearMoneda(calcularTotalConIVA(productoLocal)) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductoItem',
  
  props: {
    producto: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    productosDisponibles: {
      type: Array,
      default: () => []
    },
    categorias: {
      type: Array,
      default: () => []
    },
    marcas: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      productoLocal: { ...this.producto }
    };
  },
  
  watch: {
    producto: {
      handler(newVal) {
        this.productoLocal = { ...newVal };
      },
      deep: true
    }
  },
  
  methods: {
    updateProducto(key, value) {
      // Crear una copia del objeto local
      const productoActualizado = { ...this.productoLocal };
      
      // Actualizar la propiedad específica
      productoActualizado[key] = value;
      
      // Emitir el evento con el objeto actualizado
      this.$emit('update-producto', { index: this.index, producto: productoActualizado });
      
      // Actualizar el objeto local
      this.productoLocal = productoActualizado;
    },
    
    formatearMoneda(valor) {
      if (!valor || isNaN(valor)) return '$0.00';
      return new Intl.NumberFormat('es-SV', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(valor);
    },
    
    calcularIVAEstimado(precio) {
      if (!precio || isNaN(precio)) return 0;
      return parseFloat(precio) * 0.13;
    },
    
    calcularTotalConIVA(producto) {
      const precio = parseFloat(producto.purchasePrice) || 0;
      const cantidad = parseInt(producto.quantity) || 0;
      const iva = this.calcularIVAEstimado(precio);
      return (precio + iva) * cantidad;
    }
  }
};
</script>

