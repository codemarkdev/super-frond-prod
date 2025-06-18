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
      <div class="form-group checkbox-group">
        <label class="switch-label">Tipo de producto:</label>
        <div class="switch-options">
          <label class="switch-option" :class="{ 'active': productoLocal.esExistente }">
            <input type="radio" :name="`tipoProducto_${index}`" :value="true" @change="updateProducto('esExistente', true)">
            <i class="fas fa-database"></i> Existente
          </label>
          <label class="switch-option" :class="{ 'active': !productoLocal.esExistente }">
            <input type="radio" :name="`tipoProducto_${index}`" :value="false" @change="updateProducto('esExistente', false)">
            <i class="fas fa-plus-circle"></i> Nuevo
          </label>
        </div>
      </div>

      <div v-if="productoLocal.esExistente" class="form-row">
        <b-field label="Buscar producto existente por nombre o código">
          <b-autocomplete
            v-model="productoBuscado"
            :data="productosFiltrados"
            :loading="buscandoProducto"
            field="name"
            placeholder="Escriba el nombre o código del producto..."
            @typing="buscarProductoPorNombre"
            @select="onSelectProductoBuscado"
            clearable
          >
            <template #empty>No se encontraron productos</template>
            <template #default="props">
              <div class="dropdown-item">
                {{ props.option.code }} - {{ props.option.name }}
              </div>
            </template>
          </b-autocomplete>
        </b-field>
      </div>

      <div v-if="productoLocal.error" class="message error product-error">
        <i class="fas fa-exclamation-circle message-icon"></i>
        <span>{{ productoLocal.error }}</span>
      </div>

      <!-- Formulario producto nuevo -->
      <div v-if="!productoLocal.esExistente" class="form-row">
        <div class="form-group half">
          <label><i class="fas fa-barcode label-icon"></i> Código del producto:</label>
          <input type="text" v-model="productoLocal.code" @input="updateProducto('code', $event.target.value)" class="form-control" placeholder="Ingrese el código" required />
        </div>
        <div class="form-group half">
          <label><i class="fas fa-font label-icon"></i> Nombre del producto:</label>
          <input type="text" v-model="productoLocal.name" @input="updateProducto('name', $event.target.value)" class="form-control" placeholder="Ingrese el nombre" required />
        </div>
      </div>

      <div v-if="!productoLocal.esExistente" class="form-row">
        <div class="form-group half">
          <label><i class="fas fa-tags label-icon"></i> Categoría:</label>
          <div class="select">
            <select v-model="productoLocal.categoryId" @change="updateProducto('categoryId', $event.target.value)">
              <option disabled value="">Seleccione una categoría</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.categoryName }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group half">
          <label><i class="fas fa-industry label-icon"></i> Marca:</label>
          <div class="select">
            <select v-model="productoLocal.brandId" @change="updateProducto('brandId', $event.target.value)">
              <option disabled value="">Seleccione una marca</option>
              <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                {{ marca.brandName }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="!productoLocal.esExistente || (productoLocal.esExistente && productoLocal.encontrado)">
        <div v-if="productoLocal.esExistente && productoLocal.encontrado || !productoLocal.esExistente" class="product-found-info">
          <div class="product-info-header">
            <i class="fas fa-info-circle"></i> Información del producto encontrado
          </div>
          <div class="product-info-content">
            <div class="info-row"><span class="info-label">Código:</span> <span class="info-value">{{ productoLocal.code }}</span></div>
            <div class="info-row"><span class="info-label">Nombre:</span> <span class="info-value">{{ productoLocal.name }}</span></div>
            <div class="info-row"><span class="info-label">Categoría:</span> <span class="info-value">{{ categorias.find(cat => cat.id == productoLocal.categoryId)?.categoryName || 'No especificada' }}</span></div>
            <div class="info-row"><span class="info-label">Marca:</span> <span class="info-value">{{ marcas.find(m => m.id == productoLocal.brandId)?.brandName || 'No especificada' }}</span></div>
            <div class="info-row"><span class="info-label">Stock actual:</span> <span class="info-value">{{ productoLocal.stock }} unidades</span></div>
            <div class="info-row"><span class="info-label">Precio de venta:</span> <span class="info-value">{{ formatearMoneda(productoLocal.salePrice) }}</span></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label><i class="fas fa-shopping-cart label-icon"></i> Precio de compra:</label>
            <input type="number" :value="productoLocal.purchasePrice" @input="updateProducto('purchasePrice', $event.target.value)" class="form-control" step="0.01" min="0" required />
          </div>
          <div class="form-group half">
            <label><i class="fas fa-tag label-icon"></i> Precio de venta:</label>
            <input type="number" :value="productoLocal.salePrice" @input="updateProducto('salePrice', $event.target.value)" class="form-control" step="0.01" min="0" :required="!productoLocal.esExistente" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label><i class="fas fa-plane label-icon"></i> Precio turista:</label>
            <input type="number" :value="productoLocal.touristPrice" @input="updateProducto('touristPrice', $event.target.value)" class="form-control" step="0.01" min="0" :required="!productoLocal.esExistente" />
          </div>
          <div class="form-group half">
            <label><i class="fas fa-sort-numeric-up label-icon"></i> Cantidad:</label>
            <input type="number" :value="productoLocal.quantity" @input="updateProducto('quantity', $event.target.value)" class="form-control" step="1" min="1" required />
          </div>
        </div>

        <div class="tax-info">
          <div class="tax-header">
            <i class="fas fa-info-circle"></i> Información de impuestos
          </div>
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

        <div class="form-group checkbox-group">
          <label class="switch-label">
            <i class="fas fa-truck label-icon"></i> Venta al por mayor:
          </label>
          <div class="orden-switch-wrapper">
            <label class="orden-switch">
              <input type="checkbox" :checked="productoLocal.wholesaleSale" @change="updateProducto('wholesaleSale', $event.target.checked)" />
              <span class="orden-slider round"></span>
            </label>
            <span class="switch-text">{{ productoLocal.wholesaleSale ? 'Habilitado' : 'Deshabilitado' }}</span>
          </div>
        </div>

        <div v-if="productoLocal.wholesaleSale" class="form-row">
          <div class="form-group half">
            <label><i class="fas fa-money-bill-wave label-icon"></i> Precio mayorista:</label>
            <input type="number" :value="productoLocal.wholesalePrice" @input="updateProducto('wholesalePrice', $event.target.value)" class="form-control" step="0.01" min="0" required />
          </div>
          <div class="form-group half">
            <label><i class="fas fa-sort-amount-up label-icon"></i> Cantidad mínima:</label>
            <input type="number" :value="productoLocal.wholesaleQuantity" @input="updateProducto('wholesaleQuantity', $event.target.value)" class="form-control" min="1" required />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService'

export default {
  name: 'ProductoItem',
  props: {
    producto: Object,
    index: Number,
    productosDisponibles: Array,
    categorias: Array,
    marcas: Array
  },
  data() {
    return {
      productoLocal: { ...this.producto },
      productoBuscado: null,
      productosFiltrados: [],
      buscandoProducto: false
    }
  },
  watch: {
    producto: {
      handler(newVal) {
        this.productoLocal = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    updateProducto(key, value) {
      const actualizado = { ...this.productoLocal, [key]: value }
      this.productoLocal = actualizado
      this.$emit('update-producto', { index: this.index, producto: actualizado })
    },
    formatearMoneda(valor) {
      if (!valor || isNaN(valor)) return '$0.00'
      return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(valor)
    },
    calcularIVAEstimado(precio) {
      return (!precio || isNaN(precio)) ? 0 : parseFloat(precio) * 0.13
    },
    calcularTotalConIVA(producto) {
      const precio = parseFloat(producto.purchasePrice) || 0
      const cantidad = parseInt(producto.quantity) || 0
      return (precio + this.calcularIVAEstimado(precio)) * cantidad
    },
    async buscarProductoPorNombre(term) {
      if (term.length < 2) {
        this.productosFiltrados = []
        return
      }

      this.buscandoProducto = true
      try {
        const res = await apiRequest({ method: 'GET', path: `products/search/${encodeURIComponent(term)}` })
        const resultados = Array.isArray(res?.data) ? res.data : []

        const filtro = term.toLowerCase()
        this.productosFiltrados = resultados
          .filter(p =>
            p.name?.toLowerCase().includes(filtro) ||
            p.code?.toLowerCase().includes(filtro)
          )
          .slice(0, 20)
      } catch (error) {
        console.error('Error al buscar productos:', error)
        this.productosFiltrados = []
      } finally {
        this.buscandoProducto = false
      }
    },
    onSelectProductoBuscado(producto) {
      const actualizado = {
        ...this.productoLocal,
        esExistente: true,
        productId: producto.id,
        code: producto.code,
        name: producto.name,
        purchasePrice: producto.purchasePrice,
        salePrice: producto.salePrice,
        touristPrice: producto.touristPrice,
        quantity: 1,
        stock: producto.stock || 0,
        reservedStock: producto.reservedStock || 0,
        brand: producto.brand || null,
        category: producto.category || null,
        brandId: producto.brand?.id || null,
        categoryId: producto.category?.id || null,
        wholesaleSale: producto.wholesaleSale || false,
        wholesalePrice: producto.wholesalePrice || 0,
        wholesaleQuantity: producto.wholesaleQuantity || 10,
        cargando: false,
        error: null,
        encontrado: true,
        activeTab: 'info'
      }
      this.productoLocal = actualizado
      this.$emit('update-producto', { index: this.index, producto: actualizado })
    }
  }
}
</script>
