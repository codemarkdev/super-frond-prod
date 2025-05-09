<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <span class="icon mr-2"><i class="mdi mdi-calculator"></i></span>
        Calcular Descuentos para un Producto
      </p>
    </header>
    <div class="card-content">
      <form @submit.prevent="calcularDescuentosProducto">
        <div class="columns is-multiline">
          <!-- Producto -->
          <div class="column is-6">
            <b-field label="Producto" :type="{ 'is-danger': errores.calcularProductId }"
              :message="errores.calcularProductId">
              <b-autocomplete v-model="calcularProductoSeleccionado" :data="productosCalculo" 
                placeholder="Buscar producto" field="name" :loading="cargando.productosCalculo" 
                @select="calcularProductoSeleccionadoHandler" @input="buscarProductosCalculo" 
                :open-on-focus="true" :keep-first="true" icon="magnify" required>
                <template #empty>No se encontraron productos</template>
              </b-autocomplete>
            </b-field>
          </div>

          <!-- Cantidad -->
          <div class="column is-6">
            <b-field label="Cantidad" :type="{ 'is-danger': errores.calcularCantidad }"
              :message="errores.calcularCantidad">
              <b-input v-model.number="calcularDatos.cantidad" type="number" placeholder="Ej: 2" min="1"
                required></b-input>
            </b-field>
          </div>

          <!-- Precio Unitario -->
          <div class="column is-6">
            <b-field label="Precio Unitario" :type="{ 'is-danger': errores.calcularPrecio }"
              :message="errores.calcularPrecio">
              <b-input v-model.number="calcularDatos.precioUnitario" type="number" placeholder="Ej: 1500" min="0.01"
                step="0.01" required></b-input>
            </b-field>
          </div>

          <!-- Fecha específica  -->
          <div class="column is-6">
            <b-field label="Fecha específica" :type="{ 'is-danger': errores.calcularFecha }"
              :message="errores.calcularFecha">
              <calendario-selector v-model="calcularDatos.fecha" placeholder="dd/mm/aaaa" />
            </b-field>
          </div>
        </div>

        <div class="field mt-4">
          <div class="control">
            <b-button type="is-primary" native-type="submit" :loading="cargando.calculando"
              :disabled="!calcularDatos.productId || !calcularDatos.cantidad || !calcularDatos.precioUnitario"
              expanded>
              Calcular Descuentos
            </b-button>
          </div>
        </div>
      </form>

      <!-- Resultados del cálculo -->
      <div v-if="resultadosCalculo.length > 0" class="mt-5">
        <h5 class="title is-5 mb-3">Descuentos Aplicables</h5>

        <div v-if="resultadosCalculo.length === 0 && !cargando.calculando" class="notification is-warning">
          No se encontraron descuentos aplicables para este producto con los parámetros especificados.
        </div>

        <div v-else class="descuentos-aplicables">
          <div v-for="(resultado, index) in resultadosCalculo" :key="index" class="card mb-4">
            <div class="card-content">
              <div class="columns is-multiline">
                <div class="column is-12">
                  <div class="level">
                    <div class="level-left">
                      <div class="level-item">
                        <h6 class="title is-6">{{ resultado.discount && resultado.discount.name ?
                          resultado.discount.name
                          : 'Descuento sin nombre' }}</h6>
                      </div>
                    </div>
                    <div class="level-right">
                      <div class="level-item">
                        <b-tag :type="resultado.valid ? 'is-success' : 'is-danger'" size="is-medium">
                          {{ resultado.valid ? 'Válido' : 'No Válido' }}
                        </b-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="column is-6">
                  <div class="field">
                    <label class="label">Tipo de Descuento:</label>
                    <p>
                      <b-tag :type="getTipoTagType(resultado.discount?.type)">
                        {{ getTipoDescuento(resultado.discount?.type) }}
                      </b-tag>
                      <span class="ml-2">{{ formatearValorDescuento(resultado.discount) }}</span>
                    </p>
                  </div>
                </div>

                <div class="column is-6">
                  <div class="field">
                    <label class="label">Cantidad Mínima:</label>
                    <p>{{ resultado.discount ? (resultado.discount.minQuantity || 0) : 0 }}</p>
                  </div>
                </div>

                <div class="column is-6">
                  <div class="field">
                    <label class="label">Monto del Descuento:</label>
                    <p class="has-text-weight-bold has-text-success">${{ formatearNumero(resultado.discountAmount || 0) }}
                    </p>
                  </div>
                </div>

                <div class="column is-6">
                  <div class="field">
                    <label class="label">Precio Final:</label>
                    <p class="has-text-weight-bold">
                      <template v-if="getPrecioFinalAjustado(resultado) <= 0">
                        <span class="has-text-success">Gratis</span>
                      </template>
                      <template v-else>
                        ${{ formatearNumero(getPrecioFinalAjustado(resultado)) }}
                      </template>
                    </p>
                    <p v-if="resultado.finalPrice < 0" class="is-size-7 has-text-grey">
                      (Descuento limitado al precio total)
                    </p>
                  </div>
                </div>

                <div class="column is-12">
                  <div class="field">
                    <label class="label">Vigencia:</label>
                    <p>{{ resultado.validFrom || 'N/A' }} - {{ resultado.validTo || 'N/A' }}</p>
                    <p class="is-size-7 has-text-grey">Zona horaria: {{ resultado.timezone || 'UTC' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de precios -->
        <div v-if="resultadosCalculo.length > 0" class="card mt-4 has-background-light">
          <div class="card-content">
            <div class="columns">
              <div class="column is-4">
                <div class="field">
                  <label class="label">Precio Original:</label>
                  <p class="is-size-5">${{ formatearNumero(calcularDatos.precioUnitario * calcularDatos.cantidad) }}</p>
                </div>
              </div>
              <div class="column is-4">
                <div class="field">
                  <label class="label">Mejor Descuento:</label>
                  <p class="is-size-5 has-text-success">${{ formatearNumero(mejorDescuento) }}</p>
                </div>
              </div>
              <div class="column is-4">
                <div class="field">
                  <label class="label">Mejor Precio Final:</label>
                  <p class="is-size-5 has-text-weight-bold">
                    <template v-if="mejorPrecioFinal <= 0">
                      <span class="has-text-success">Gratis</span>
                    </template>
                    <template v-else>
                      ${{ formatearNumero(mejorPrecioFinal) }}
                    </template>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="errores.calcular" class="notification is-danger mt-4">
        {{ errores.calcular }}
      </div>

      <div v-else-if="!cargando.calculando" class="notification is-light mt-4">
        Complete el formulario y haga clic en "Calcular Descuentos" para ver los descuentos aplicables al producto.
      </div>
    </div>
  </div>
</template>

<script>
// Eliminada la importación de axios que no se utiliza
import apiRequest from '../../Servicios/HttpService';
import CalendarioSelector from '../Extras/CalendarioSelector.vue';

export default {
  name: 'CalcularDescuentos',
  components: {
    CalendarioSelector
  },
  data() {
    return {
      calcularProductoSeleccionado: '',
      productosCalculo: [],
      calcularDatos: {
        productId: null,
        cantidad: 1,
        precioUnitario: null,
        fecha: null
      },
      resultadosCalculo: [],
      errores: {
        calcularProductId: '',
        calcularCantidad: '',
        calcularPrecio: '',
        calcularFecha: '',
        calcular: ''
      },
      cargando: {
        calculando: false,
        productosCalculo: false
      }
    };
  },
  computed: {
    mejorDescuento() {
      if (!this.resultadosCalculo.length) return 0;

      // Encontrar el descuento con el monto más alto
      const precioTotal = this.calcularDatos.precioUnitario * this.calcularDatos.cantidad;
      return Math.min(
        Math.max(...this.resultadosCalculo
          .filter(r => r.valid)
          .map(r => r.discountAmount || 0)),
        precioTotal // Limitar el descuento al precio total
      );
    },
    mejorPrecioFinal() {
      if (!this.resultadosCalculo.length) return 0;

      // Encontrar el precio final más bajo, pero nunca menor que cero
      const precios = this.resultadosCalculo
        .filter(r => r.valid)
        .map(r => this.getPrecioFinalAjustado(r));

      return precios.length ? Math.min(...precios) : (this.calcularDatos.precioUnitario * this.calcularDatos.cantidad);
    }
  },
  methods: {
    // Método para obtener el precio final ajustado (nunca negativo)
    getPrecioFinalAjustado(resultado) {
      return Math.max(resultado.finalPrice || 0, 0);
    },

    // Método para formatear números con 2 decimales y separador de miles
    formatearNumero(valor) {
      return parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Método para obtener el tipo de tag según el tipo de descuento
    getTipoTagType(tipo) {
      switch (tipo) {
        case 'PERCENTAGE':
          return 'is-info';
        case 'FIXED_AMOUNT':
          return 'is-success';
        case 'BUY_X_GET_Y':
          return 'is-warning';
        case 'BUNDLE':
          return 'is-primary';
        case 'SEASONAL':
          return 'is-link';
        default:
          return 'is-dark';
      }
    },

    // Método para obtener el nombre del tipo de descuento
    getTipoDescuento(tipo) {
      switch (tipo) {
        case 'PERCENTAGE':
          return 'Porcentaje';
        case 'FIXED_AMOUNT':
          return 'Monto Fijo';
        case 'BUY_X_GET_Y':
          return 'Promoción';
        case 'BUNDLE':
          return 'Paquete';
        case 'SEASONAL':
          return 'Temporal';
        default:
          return 'Otro';
      }
    },

    // Método para formatear el valor del descuento según su tipo
    formatearValorDescuento(descuento) {
      if (!descuento) return 'N/A';
      
      switch (descuento.type) {
        case 'PERCENTAGE':
          return `${descuento.value}%`;
        case 'FIXED_AMOUNT':
          return `$${descuento.value}`;
        case 'BUY_X_GET_Y':
          return `${descuento.name}`;
        case 'BUNDLE':
          return `Paquete ${descuento.value}`;
        case 'SEASONAL':
          return `Descuento ${descuento.value}`;
        default:
          return 'N/A';
      }
    },

    async buscarProductosCalculo(termino) {
      if (!termino || termino.trim() === '') {
        this.productosCalculo = []; // Limpiar la lista si no hay término
        return;
      }

      this.cargando.productosCalculo = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `products/search/${termino}`, // Ajusta la ruta según sea necesario
        });

        if (response && response.data) {
          // Filtrar y mapear los productos
          this.productosCalculo = response.data.filter(producto => !producto.isDeleted).map(producto => ({
            id: producto.id,
            name: `${producto.name} (${producto.brand?.brandName || 'Sin Marca'}) - ${producto.category?.categoryName || 'Sin Categoría'}`,
            code: producto.code,
            stock: producto.stock,
            price: producto.salePrice
          }));
        } else {
          this.productosCalculo = [];
        }
      } catch (error) {
        console.error('Error al buscar productos para cálculo:', error);
      } finally {
        this.cargando.productosCalculo = false;
      }
    },

    calcularProductoSeleccionadoHandler(producto) {
      if (producto) {
        console.log('Producto seleccionado para cálculo:', producto);
        this.calcularDatos.productId = producto.id; // Asignar el ID del producto seleccionado
        this.calcularProductoSeleccionado = producto.name; // Guardar el nombre del producto seleccionado
        
        // Si el producto tiene precio, asignarlo automáticamente
        if (producto.price) {
          this.calcularDatos.precioUnitario = producto.price;
        }
      } else {
        this.calcularDatos.productId = null; // Limpiar el ID del producto si no hay selección
      }
    },

    validarFormularioCalculo() {
      let esValido = true;
      this.errores.calcularProductId = '';
      this.errores.calcularCantidad = '';
      this.errores.calcularPrecio = '';
      this.errores.calcularFecha = '';
      this.errores.calcular = '';

      if (!this.calcularDatos.productId || this.calcularDatos.productId <= 0) {
        this.errores.calcularProductId = 'El ID del producto es requerido y debe ser un número positivo';
        esValido = false;
      }

      if (!this.calcularDatos.cantidad || this.calcularDatos.cantidad <= 0) {
        this.errores.calcularCantidad = 'La cantidad es requerida y debe ser mayor a 0';
        esValido = false;
      }

      if (!this.calcularDatos.precioUnitario || this.calcularDatos.precioUnitario <= 0) {
        this.errores.calcularPrecio = 'El precio unitario es requerido y debe ser mayor a 0';
        esValido = false;
      }

      // La fecha es opcional, pero si se proporciona debe ser válida
      if (this.calcularDatos.fecha && !(this.calcularDatos.fecha instanceof Date && !isNaN(this.calcularDatos.fecha))) {
        this.errores.calcularFecha = 'La fecha proporcionada no es válida';
        esValido = false;
      }

      return esValido;
    },

    async calcularDescuentosProducto() {
      // Validar el formulario
      if (!this.validarFormularioCalculo()) {
        return;
      }

      this.cargando.calculando = true;
      this.resultadosCalculo = [];
      this.errores.calcular = '';

      try {
        let url = `discounts/product/${this.calcularDatos.productId}/calculate?quantity=${this.calcularDatos.cantidad}&unitPrice=${this.calcularDatos.precioUnitario}`;

        // Añadir fecha si está presente
        if (this.calcularDatos.fecha) {
          url += `&date=${this.formatDateForApi(this.calcularDatos.fecha)}`;
        }

        console.log('URL completa:', url);

        const response = await apiRequest({
          method: 'GET',
          path: url
        });

        console.log('Respuesta completa:', response);

        if (response && response.data) {
          let resultados = response.data;

          // Si no es un array, convertirlo en uno
          if (!Array.isArray(resultados)) {
            resultados = [resultados];
          }

          this.resultadosCalculo = resultados;
          console.log('Resultados de cálculo:', this.resultadosCalculo);

          if (this.resultadosCalculo.length === 0) {
            this.$buefy.toast.open({
              message: 'No se encontraron descuentos aplicables para este producto',
              type: 'is-warning',
              duration: 3000
            });
          } else {
            this.$buefy.toast.open({
              message: `Se encontraron ${this.resultadosCalculo.length} descuento(s) aplicable(s)`,
              type: 'is-success',
              duration: 3000
            });
          }
        } else {
          this.resultadosCalculo = [];
          this.errores.calcular = 'No se pudo obtener información sobre los descuentos aplicables';
        }
      } catch (error) {
        console.error('Error al calcular descuentos:', error);

        if (error.response && error.response.status === 404) {
          this.errores.calcular = 'El producto especificado no existe';
        } else if (error.response && error.response.status === 400) {
          this.errores.calcular = 'Parámetros incorrectos. Verifique los valores ingresados.';

          // Mostrar detalles del error si están disponibles
          if (error.response.data && error.response.data.message) {
            this.errores.calcular += ` Detalle: ${error.response.data.message}`;
          }
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errores.calcular = error.response.data.message;
        } else {
          this.errores.calcular = 'Error al calcular los descuentos aplicables';
        }
      } finally {
        this.cargando.calculando = false;
      }
    },

    formatDateForApi(date) {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 1.5rem;
}

.descuentos-aplicables .card {
  transition: all 0.3s ease;
}

.descuentos-aplicables .card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.notification {
  margin-top: 1rem;
}

.has-text-success {
  color: #48c774 !important;
}

/* Estilos para los tags de tipo de descuento */
.tag.is-info {
  background-color: #3298dc;
  color: #fff;
}

.tag.is-success {
  background-color: #48c774;
  color: #fff;
}

.tag.is-warning {
  background-color: #ffdd57;
  color: rgba(0, 0, 0, 0.7);
}

.tag.is-primary {
  background-color: #00d1b2;
  color: #fff;
}

.tag.is-link {
  background-color: #3273dc;
  color: #fff;
}

.tag.is-dark {
  background-color: #363636;
  color: #fff;
}
</style>