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
            <!-- Número de factura (como select) -->
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

            <!-- Lista de productos en la orden -->
            <div class="products-list-section">
              <div class="section-subheader">
                <h4><i class="fas fa-list"></i> Productos en esta orden</h4>
                <button type="button" @click="agregarProductoALista" class="btn btn-add">
                  <i class="fas fa-plus"></i> Agregar producto
                </button>
              </div>

              <!-- Mensaje si no hay productos -->
              <div v-if="ordenActual.products.length === 0" class="message">
                <i class="fas fa-info-circle message-icon"></i>
                <span>No hay productos agregados a esta orden. Haga clic en "Agregar producto" para comenzar.</span>
              </div>

              <!-- Lista de productos agregados -->
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

            <!-- Botones de acción -->
            <div class="form-actions">
              <button type="button" @click="limpiarFormulario" class="btn btn-secondary">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" class="btn btn-secondary" :disabled="enviando || !ordenValida">
                <i class="fas fa-save"></i> {{ enviando ? 'Registrando...' : 'Registrar Orden' }}
              </button>
            </div>

            <!-- Mensajes de error y éxito -->
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
  components: {
    ProductoItem
  },
  
  props: {
    ordenesDisponibles: {
      type: Array,
      default: () => []
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
    },
    cargandoOrdenes: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      ordenActual: {
        invoiceNumber: '',
        products: []
      },
      enviando: false,
      error: null,
      exitoso: false
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
        esExistente: true,
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
      // Actualizar el producto en el array
      this.ordenActual.products.splice(index, 1, producto);
    },
    
    async buscarProducto(index) {
      const producto = this.ordenActual.products[index];
      if (!producto.productId) return;
      
      // Crear una copia actualizada del producto con cargando=true y error=null
      const productoActualizado = { 
        ...producto, 
        cargando: true, 
        error: null 
      };
      
      // Actualizar el producto en el array
      this.ordenActual.products.splice(index, 1, productoActualizado);

      try {
        const response = await apiRequest({
          method: 'GET',
          path: `products/${producto.productId}`
        });

        if (response.status === 200) {
          const productoData = response.data;
          
          // Crear un nuevo objeto con los datos actualizados
          const productoEncontrado = {
            ...productoActualizado,
            code: productoData.code,
            name: productoData.name,
            purchasePrice: parseFloat(productoData.purchasePrice),
            salePrice: parseFloat(productoData.salePrice),
            touristPrice: parseFloat(productoData.touristPrice),
            stock: productoData.stock,
            reservedStock: productoData.reservedStock || 0,
            brand: productoData.brand,
            category: productoData.category,
            brandId: productoData.brand.id,
            categoryId: productoData.category.id,
            wholesaleSale: productoData.wholesaleSale || false,
            wholesalePrice: parseFloat(productoData.wholesalePrice) || 0,
            wholesaleQuantity: parseInt(productoData.wholesaleQuantity) || 10,
            encontrado: true,
            cargando: false
          };
          
          // Actualizar el producto en el array
          this.ordenActual.products.splice(index, 1, productoEncontrado);
        } else {
          // Actualizar con error
          const productoError = {
            ...productoActualizado,
            error: `Error ${response.status}: No se pudo encontrar el producto`,
            encontrado: false,
            cargando: false
          };
          
          this.ordenActual.products.splice(index, 1, productoError);
        }
      } catch (err) {
        // Actualizar con error
        const productoError = {
          ...productoActualizado,
          error: err.message || 'Error al buscar el producto',
          encontrado: false,
          cargando: false
        };
        
        this.ordenActual.products.splice(index, 1, productoError);
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
          this.error = "Debe agregar al menos un producto a la orden";
          this.enviando = false;
          return;
        }

        const productos = [...this.ordenActual.products];
        const respuestas = [];
        let hayError = false;

        for (let i = 0; i < productos.length; i++) {
          const p = productos[i];
          let productoData;

          if (p.esExistente) {
            productoData = {
              productId: parseInt(p.productId),
              quantity: parseInt(p.quantity),
              purchasePrice: parseFloat(p.purchasePrice)
            };
          } else {
            productoData = {
              code: p.code,
              name: p.name,
              purchasePrice: parseFloat(p.purchasePrice),
              salePrice: parseFloat(p.salePrice),
              touristPrice: parseFloat(p.touristPrice),
              quantity: parseInt(p.quantity),
              brandId: parseInt(p.brandId),
              categoryId: parseInt(p.categoryId),
              wholesaleSale: p.wholesaleSale
            };
            if (p.wholesaleSale) {
              productoData.wholesalePrice = parseFloat(p.wholesalePrice) || parseFloat(p.salePrice) * 0.9;
              productoData.wholesaleQuantity = parseInt(p.wholesaleQuantity) || 10;
            }
          }

          const ordenData = {
            invoiceNumber,
            isActive: true,
            products: [productoData]
          };

          try {
            const response = await apiRequest({
              method: 'POST',
              path: 'order-details',
              data: ordenData
            });

            if (response.status === 201 || response.status === 200) {
              respuestas.push(response.data[0]);
            } else {
              hayError = true;
              this.error = `Error ${response.status} en producto ${i + 1}`;
              break;
            }
          } catch (err) {
            hayError = true;
            this.error = `Error en producto ${i + 1}: ${err.message || 'Error al conectar con el servidor'}`;
            break;
          }
        }

        if (!hayError) {
          this.exitoso = true;
          this.$emit('recargar-ordenes');
          setTimeout(() => this.limpiarFormulario(), 2000);
        }
      } catch (err) {
        this.error = err.message || 'Error al conectar con el servidor';
      } finally {
        this.enviando = false;
      }
    },
    
    limpiarFormulario() {
      this.ordenActual = {
        invoiceNumber: '',
        products: []
      };
      this.error = null;
      this.exitoso = false;
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

