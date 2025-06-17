<template>
  <div class="layout-container">
    <div class="full-column">
      <div class="section">
        <div class="section-header">
          <div class="header-left">
            <i class="fas fa-plus-circle section-icon"></i>
            <h3>Registrar Detalle de Orden</h3>
          </div>
        </div>

        <div class="section-content">
          <form @submit.prevent="registrarDetalle" class="form">
            <!-- Número de factura -->
            <div class="form-group">
              <label for="invoiceNumber">
                <i class="fas fa-file-invoice label-icon"></i> Número de factura:
              </label>
              <div class="input-wrapper">
                <select id="invoiceNumber" v-model="ordenActual.invoiceNumber" class="form-control" required>
                  <option value="" disabled>Seleccione una factura</option>
                  <option v-for="orden in ordenesDisponibles" :key="orden.id" :value="orden.invoiceNumber">
                    {{ orden.invoiceNumber }}
                  </option>
                </select>
              </div>
            </div>

           

            <!-- Lista de productos -->
            <div class="products-list-section">
              <div class="section-subheader">
                <h4><i class="fas fa-list"></i> Productos en esta orden</h4>
                <button type="button" @click="agregarProductoALista" class="btn btn-add">
                  <i class="fas fa-plus"></i> Agregar producto 
                </button>
              </div>

              <div v-if="ordenActual.products.length === 0" class="message">
                <i class="fas fa-info-circle message-icon"></i>
                <span>No hay productos agregados. Use el buscador o agregue manualmente.</span>
              </div>

              <div v-else class="products-list">
                <producto-item 
                  v-for="(producto, index) in ordenActual.products" 
                  :key="index"
                  :producto="producto"
                  :index="index"
                  :productos-disponibles="productosDisponibles"
                  :categorias="categorias"
                  :marcas="marcas"
                  @eliminar-producto="eliminarProducto"
                  @buscar-producto="buscarProducto"
                  @update-producto="actualizarProducto"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" class="btn btn-secondary" :disabled="enviando || !ordenValida">
                <i class="fas fa-save"></i> {{ enviando ? 'Registrando...' : 'Registrar Orden' }}
              </button>
            </div>

            <div v-if="error" class="message error">
              <i class="fas fa-exclamation-circle message-icon"></i>
              <span>{{ error }}</span>
            </div>

            <div v-if="exitoso" class="message success">
              <i class="fas fa-check-circle message-icon"></i>
              <span>Orden registrada exitosamente.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';
import ProductoItem from './ProductoItem.vue';

export default {
  name: 'RegistrarOrdenForm',
  components: { ProductoItem },
  props: {
    ordenesDisponibles: Array,
    productosDisponibles: Array,
    categorias: Array,
    marcas: Array,
    cargandoOrdenes: Boolean
  },
  data() {
    return {
      ordenActual: {
        invoiceNumber: '',
        products: []
      },
      enviando: false,
      error: null,
      exitoso: false,
      // NUEVO:
      productoBuscado: null,
      productosFiltrados: [],
      buscandoProducto: false
    };
  },
  computed: {
    ordenValida() {
      if (this.ordenActual.products.length === 0) return false;
      return this.ordenActual.invoiceNumber &&
        this.ordenActual.products.every(p => {
          if (p.esExistente) {
            return p.productId && p.quantity && p.purchasePrice;
          } else {
            return p.code && p.name && p.purchasePrice && p.salePrice &&
              p.touristPrice && p.quantity && p.brandId && p.categoryId;
          }
        });
    }
  },
  methods: {
    agregarProductoALista() {
      this.ordenActual.products.push({
        esExistente: false,
        productId: null,
        code: '',
        name: '',
        purchasePrice: null,
        salePrice: null,
        touristPrice: null,
        quantity: null,
        reservedStock: 0,
        brandId: null,
        categoryId: null,
        wholesaleSale: false,
        wholesalePrice: null,
        wholesaleQuantity: null,
        cargando: false,
        error: null,
        encontrado: false,
        activeTab: 'info'
      });
    },
    eliminarProducto(index) {
      this.ordenActual.products.splice(index, 1);
    },
    actualizarProducto({ index, producto }) {
      this.ordenActual.products.splice(index, 1, producto);
    },
    async buscarProducto(index) {
      const producto = this.ordenActual.products[index];
      if (!producto.productId) return;

      const productoActualizado = { ...producto, cargando: true, error: null };
      this.ordenActual.products.splice(index, 1, productoActualizado);

      try {
        const response = await apiRequest({ method: 'GET', path: `products/${producto.productId}` });
        if (response.status === 200) {
          const data = response.data;
          const actualizado = {
            ...productoActualizado,
            code: data.code,
            name: data.name,
            purchasePrice: parseFloat(data.purchasePrice),
            salePrice: parseFloat(data.salePrice),
            touristPrice: parseFloat(data.touristPrice),
            stock: data.stock,
            reservedStock: data.reservedStock || 0,
            brand: data.brand,
            category: data.category,
            brandId: data.brand.id,
            categoryId: data.category.id,
            wholesaleSale: data.wholesaleSale || false,
            wholesalePrice: parseFloat(data.wholesalePrice) || 0,
            wholesaleQuantity: parseInt(data.wholesaleQuantity) || 10,
            encontrado: true,
            cargando: false
          };
          this.ordenActual.products.splice(index, 1, actualizado);
        } else {
          this.ordenActual.products[index].error = 'No se encontró el producto';
        }
      } catch (err) {
        this.ordenActual.products[index].error = 'Error al buscar el producto';
      }
    },
    async registrarDetalle() {
      this.enviando = true;
      this.error = null;
      this.exitoso = false;

      try {
        const invoiceNumber = this.ordenActual.invoiceNumber.trim();
        if (!invoiceNumber) {
          this.error = "Debe seleccionar una factura válida";
          this.enviando = false;
          return;
        }

        if (this.ordenActual.products.length === 0) {
          this.error = "Debe agregar al menos un producto";
          this.enviando = false;
          return;
        }

        for (let i = 0; i < this.ordenActual.products.length; i++) {
          const p = this.ordenActual.products[i];
          const productoData = p.esExistente ? {
            productId: parseInt(p.productId),
            quantity: parseInt(p.quantity),
            purchasePrice: parseFloat(p.purchasePrice)
          } : {
            code: p.code,
            name: p.name,
            purchasePrice: parseFloat(p.purchasePrice),
            salePrice: parseFloat(p.salePrice),
            touristPrice: parseFloat(p.touristPrice),
            quantity: parseInt(p.quantity),
            brandId: parseInt(p.brandId),
            categoryId: parseInt(p.categoryId),
            wholesaleSale: p.wholesaleSale,
            wholesalePrice: parseFloat(p.wholesalePrice || 0),
            wholesaleQuantity: parseInt(p.wholesaleQuantity || 10)
          };

          const ordenData = {
            invoiceNumber,
            isActive: true,
            products: [productoData]
          };

          const response = await apiRequest({
            method: 'POST',
            path: 'order-details',
            data: ordenData
          });

          if (![200, 201].includes(response.status)) {
            throw new Error(`Error ${response.status} al registrar producto ${i + 1}`);
          }
        }

        this.exitoso = true;
        this.$emit('recargar-ordenes');
        setTimeout(() => this.limpiarFormulario(), 2000);

      } catch (err) {
        this.error = err.message || 'Error al conectar con el servidor';
      } finally {
        this.enviando = false;
      }
    },
    limpiarFormulario() {
      this.ordenActual = { invoiceNumber: '', products: [] };
      this.error = null;
      this.exitoso = false;
    },
    async buscarProductoPorNombre(term) {
      if (term.length < 2) {
        this.productosFiltrados = []
        return
      }

      this.buscandoProducto = true
      try {
        const res = await apiRequest({
          method: 'GET',
          path: `products/search/${encodeURIComponent(term)}`
        })
        if (res.status === 200) {
          this.productosFiltrados = res.data
        }
      } catch (e) {
        this.productosFiltrados = []
      }
      this.buscandoProducto = false
    },
    onSelectProductoBuscado(producto) {
      const nuevo = {
        esExistente: true,
        productId: producto.id,
        code: producto.code,
        name: producto.name,
        purchasePrice: producto.purchasePrice,
        salePrice: producto.salePrice,
        touristPrice: producto.touristPrice,
        quantity: 1,
        reservedStock: producto.reservedStock || 0,
        brandId: producto.brand?.id,
        categoryId: producto.category?.id,
        wholesaleSale: producto.wholesaleSale || false,
        wholesalePrice: producto.wholesalePrice || 0,
        wholesaleQuantity: producto.wholesaleQuantity || 10,
        cargando: false,
        error: null,
        encontrado: true,
        activeTab: 'info'
      }
      this.ordenActual.products.push(nuevo)
    }
  }
}
</script>
