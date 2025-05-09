<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <span class="icon mr-2"><i class="mdi mdi-tag-plus"></i></span>
        {{ modoEdicion ? 'Editar Descuento' : 'Nuevo Descuento' }}
      </p>
    </header>
    <div class="card-content">
      <form @submit.prevent="guardarDescuento">
        <div class="columns is-multiline">
          <!-- Nombre del descuento -->
          <div class="column is-6">
            <b-field label="Nombre del descuento" :type="{ 'is-danger': errores.name }" :message="errores.name">
              <b-input v-model="nuevoDescuento.name" placeholder="Ej: Descuento de Verano" required></b-input>
            </b-field>
          </div>

          <!-- Tipo de descuento -->
          <div class="column is-6">
            <b-field label="Tipo de descuento" :type="{ 'is-danger': errores.type }" :message="errores.type">
              <b-select v-model="nuevoDescuento.type" placeholder="Seleccione tipo" expanded required>
                <option value="PERCENTAGE">Descuento porcentual</option>
                <option value="FIXED_AMOUNT">Descuento por monto fijo</option>
                <option value="BUY_X_GET_Y">Promoción 2x1, 2x3</option>
              </b-select>
            </b-field>
          </div>

          <!-- Valor del descuento -->
          <div class="column is-6">
            <b-field :label="nuevoDescuento.type === 'PERCENTAGE'
              ? 'Porcentaje de descuento'
              : nuevoDescuento.type === 'FIXED_AMOUNT'
                ? 'Monto de descuento'
                : nuevoDescuento.type === 'BUY_X_GET_Y'
                  ? 'Promoción'
                  : 'Otro tipo de descuento'">
              <b-input v-model.number="nuevoDescuento.value" type="number"
                :placeholder="nuevoDescuento.type === 'PERCENTAGE' ? 'Ej: 15' : 'Ej: 100'" :min="0"
                :max="nuevoDescuento.type === 'PERCENTAGE' ? 100 : null" step="0.01" required></b-input>
            </b-field>
          </div>

          <!-- Cantidad mínima -->
          <div class="column is-6">
            <b-field label="Cantidad mínima" :type="{ 'is-danger': errores.minQuantity }"
              :message="errores.minQuantity">
              <b-input v-model.number="nuevoDescuento.minQuantity" type="number" placeholder="Ej: 2" min="1"
                required></b-input>
            </b-field>
          </div>

          <!-- Producto -->
          <div class="column is-6">
            <b-field label="Producto" :type="{ 'is-danger': errores.productId }" :message="errores.productId">
              <b-autocomplete v-model="productoSeleccionado" :data="productos" placeholder="Seleccione un producto"
                field="name" :loading="cargando.productos" @select="productoSeleccionadoHandler"
                @input="buscarProductos" :open-on-focus="true" :keep-first="true" icon="magnify" required>
                <template #empty>No se encontraron productos</template>
              </b-autocomplete>
            </b-field>
          </div>

          <!-- Fecha de inicio -->
          <div class="column is-6">
            <b-field label="Fecha de inicio" :type="{ 'is-danger': errores.startDate }" :message="errores.startDate">
              <calendario-selector v-model="nuevoDescuento.startDate" placeholder="dd/mm/aaaa" />
            </b-field>
          </div>

          <!-- Fecha de fin -->
          <div class="column is-6">
            <b-field label="Fecha de fin" :type="{ 'is-danger': errores.endDate }" :message="errores.endDate">
              <calendario-selector v-model="nuevoDescuento.endDate" placeholder="dd/mm/aaaa" />
            </b-field>
          </div>

          <!-- Estado activo -->
          <div class="column is-6">
            <b-field label="Estado del descuento">
              <b-switch v-model="nuevoDescuento.isActive" type="is-info">
                {{ nuevoDescuento.isActive ? 'Activo' : 'Inactivo' }}
              </b-switch>
            </b-field>
          </div>
        </div>

        <div class="field mt-5">
          <div class="control">
            <div class="buttons">
              <b-button type="is-primary" native-type="submit" :loading="cargando.guardando" expanded>
                {{ modoEdicion ? 'Actualizar Descuento' : 'Crear Descuento' }}
              </b-button>
              <b-button v-if="modoEdicion" type="is-light" @click="cancelarEdicion" expanded>
                Cancelar
              </b-button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';
import CalendarioSelector from './CalendarioSelector.vue';

export default {
  name: 'NuevoDescuento',
  components: {
    CalendarioSelector
  },
  props: {
    modoEdicion: {
      type: Boolean,
      default: false
    },
    descuentoEditandoId: {
      type: [Number, String, null],
      default: null
    },
    descuentoParaEditar: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      nuevoDescuento: {
        name: '',
        type: 'PERCENTAGE',
        value: null,
        minQuantity: 1,
        productId: null,
        categoryId: null,
        startDate: null,
        endDate: null,
        isActive: true
      },
      errores: {
        name: '',
        type: '',
        value: '',
        minQuantity: '',
        startDate: '',
        endDate: '',
        productId: ''
      },
      cargando: {
        guardando: false,
        productos: false
      },
      productoSeleccionado: '',
      productos: []
    };
  },
  watch: {
    descuentoParaEditar: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.cargarDatosParaEdicion(newVal);
        }
      },
      immediate: true
    }
  },
  methods: {
    cargarDatosParaEdicion(descuento) {
      // Copiar los datos del descuento al formulario
      this.nuevoDescuento = {
        name: descuento.name || '',
        type: descuento.type || 'PERCENTAGE',
        value: descuento.value !== undefined ? Number(descuento.value) : null,
        minQuantity: descuento.minQuantity !== undefined ? Number(descuento.minQuantity) : 1,
        productId: descuento.product ? descuento.product.id : (descuento.productId || null),
        categoryId: descuento.category ? descuento.category.id : (descuento.categoryId || null),
        startDate: descuento.startDate ? new Date(descuento.startDate) : null,
        endDate: descuento.endDate ? new Date(descuento.endDate) : null,
        isActive: Boolean(descuento.isActive)
      };

      // Actualizar el campo de producto seleccionado
      if (descuento.product) {
        this.productoSeleccionado = descuento.product.name;
      }
    },
    
    async buscarProductos(termino) {
      if (!termino || termino.trim() === '') {
        this.productos = []; // Limpiar la lista si no hay término
        return;
      }

      this.cargando.productos = true;
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `products/search/${termino}`, // Ajusta la ruta según sea necesario
        });

        if (response && response.data) {
          // Filtrar y mapear los productos
          this.productos = response.data.filter(producto => !producto.isDeleted).map(producto => ({
            id: producto.id,
            name: `${producto.name} (${producto.brand?.brandName || 'Sin Marca'}) - ${producto.category?.categoryName || 'Sin Categoría'}`,
            code: producto.code,
            stock: producto.stock,
            category: producto.category?.id
          }));
        } else {
          this.productos = [];
        }
      } catch (error) {
        console.error('Error al buscar productos:', error);
      } finally {
        this.cargando.productos = false;
      }
    },

    productoSeleccionadoHandler(producto) {
      if (producto) {
        console.log('Producto seleccionado:', producto);
        this.nuevoDescuento.productId = producto.id; // Asignar el ID del producto seleccionado
        this.nuevoDescuento.categoryId = producto.category || null; // Asignar el ID de la categoría del producto
        this.productoSeleccionado = producto.name; // Guardar el nombre del producto seleccionado
      } else {
        this.nuevoDescuento.productId = null; // Limpiar el ID del producto si no hay selección
        this.nuevoDescuento.categoryId = null; // Limpiar el ID de la categoría si no hay selección
      }
    },

    validarFormulario() {
      let esValido = true;
      this.errores = {
        name: '',
        type: '',
        value: '',
        minQuantity: '',
        startDate: '',
        endDate: '',
        productId: ''
      };

      if (!this.nuevoDescuento.name.trim()) {
        this.errores.name = 'El nombre del descuento es requerido';
        esValido = false;
      }

      if (!this.nuevoDescuento.type) {
        this.errores.type = 'El tipo de descuento es requerido';
        esValido = false;
      }

      if (this.nuevoDescuento.value === null || this.nuevoDescuento.value === undefined || this.nuevoDescuento.value <= 0) {
        this.errores.value = 'El valor del descuento debe ser mayor a 0';
        esValido = false;
      } else if (this.nuevoDescuento.type === 'PERCENTAGE' && this.nuevoDescuento.value > 100) {
        this.errores.value = 'El porcentaje no puede ser mayor a 100%';
        esValido = false;
      }

      if (!this.nuevoDescuento.minQuantity || this.nuevoDescuento.minQuantity < 1) {
        this.errores.minQuantity = 'La cantidad mínima debe ser al menos 1';
        esValido = false;
      }

      if (!this.nuevoDescuento.productId) {
        this.errores.productId = 'Debe seleccionar un producto válido';
        esValido = false;
      }

      if (!this.nuevoDescuento.startDate) {
        this.errores.startDate = 'La fecha de inicio es requerida';
        esValido = false;
      }

      if (!this.nuevoDescuento.endDate) {
        this.errores.endDate = 'La fecha de fin es requerida';
        esValido = false;
      } else if (this.nuevoDescuento.startDate && this.nuevoDescuento.endDate &&
        new Date(this.nuevoDescuento.endDate) <= new Date(this.nuevoDescuento.startDate)) {
        this.errores.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
        esValido = false;
      }

      return esValido;
    },

    prepararDatosParaEnvio() {
      // Crear una copia del objeto para no modificar el original
      const datos = { ...this.nuevoDescuento };

      // Formatear fechas a ISO string
      if (datos.startDate instanceof Date) {
        datos.startDate = datos.startDate.toISOString();
      }

      if (datos.endDate instanceof Date) {
        datos.endDate = datos.endDate.toISOString();
      }

      // Asegurarse de que los valores sean del tipo correcto
      datos.value = Number(datos.value);
      datos.minQuantity = Number(datos.minQuantity);

      // Asegurarse de que los IDs sean null cuando corresponda
      datos.productId = datos.productId || null;
      datos.categoryId = datos.categoryId || null; // Incluir el categoryId

      // Asegurarse de que isActive sea booleano
      datos.isActive = Boolean(datos.isActive);

      console.log('Datos preparados para enviar:', datos);
      return datos;
    },
    
    async guardarDescuento() {
      if (!this.validarFormulario()) {
        return;
      }

      this.cargando.guardando = true;

      try {
        // Preparar los datos para enviar
        const datos = this.prepararDatosParaEnvio();
        console.log('Datos a enviar:', datos); // Para depuración

        let response;
        if (this.modoEdicion) {
          response = await apiRequest({
            method: 'PATCH',
            path: `discounts/${this.descuentoEditandoId}`,
            data: datos
          });
        } else {
          response = await apiRequest({
            method: 'POST',
            path: 'discounts',
            data: datos
          });
        }

        if (response) {
          this.$emit('descuento-guardado', {
            exito: true,
            mensaje: this.modoEdicion ? 'Descuento actualizado exitosamente' : 'Descuento creado exitosamente',
            datos: response.data
          });
          this.resetearFormulario();
        }
      } catch (error) {
        console.error('Error al guardar descuento:', error);

        let mensajeError = `Error al ${this.modoEdicion ? 'actualizar' : 'crear'} el descuento`;

        // Verificar si hay errores de validación específicos
        if (error.response && error.response.data && error.response.data.errors) {
          const errores = error.response.data.errors;

          // Mapear los errores del backend a los campos del formulario
          Object.keys(errores).forEach(campo => {
            if (Object.prototype.hasOwnProperty.call(this.errores, campo)) {
              this.errores[campo] = Array.isArray(errores[campo])
                ? errores[campo][0]
                : errores[campo];
            }
          });

          mensajeError += ': Por favor, corrija los errores en el formulario';
        } else if (error.message) {
          mensajeError += `: ${error.message}`;
        }

        this.$emit('descuento-guardado', {
          exito: false,
          mensaje: mensajeError
        });
      } finally {
        this.cargando.guardando = false;
      }
    },

    cancelarEdicion() {
      this.resetearFormulario();
      this.$emit('cancelar-edicion');
    },

    resetearFormulario() {
      this.nuevoDescuento = {
        name: '',
        type: 'PERCENTAGE',
        value: null,
        minQuantity: 1,
        productId: null,
        categoryId: null,
        startDate: null,
        endDate: null,
        isActive: true
      };

      this.productoSeleccionado = '';

      this.errores = {
        name: '',
        type: '',
        value: '',
        minQuantity: '',
        startDate: '',
        endDate: '',
        productId: ''
      };
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