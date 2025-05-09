<template>
  <div class="card">
    <header class="card-header">
      <p class="card-header-title">
        <span class="icon mr-2"><i class="mdi mdi-check-circle"></i></span>
        Verificar Validez de Descuento
      </p>
    </header>
    <div class="card-content">
      <div class="columns">
        <div class="column is-6">
          <b-field label="Nombre del Descuento" :type="{ 'is-danger': errores.verificarNombre }">
            <b-autocomplete v-model="verificarDescuentoNombre" :data="descuentosFiltrados"
              placeholder="Ingrese el nombre del descuento" field="name" :loading="cargando.verificando"
              @select="opcionSeleccionada" :open-on-focus="true" :clear-on-select="true" :keep-first="true"
              icon="magnify" required>
              <template #empty>No se encontraron descuentos con ese nombre</template>
            </b-autocomplete>
          </b-field>
          <div class="field mt-4">
            <div class="control">
              <b-button type="is-primary" @click="verificarValidezDescuentoPorNombre" :loading="cargando.verificando"
                :disabled="!verificarDescuentoNombre" expanded>
                Verificar Validez
              </b-button>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div v-if="resultadoVerificacion" class="box">
            <div class="has-text-centered mb-4">
              <b-icon :icon="resultadoVerificacion.isValid ? 'check-circle' : 'alert-circle'"
                :type="resultadoVerificacion.isValid ? 'is-success' : 'is-danger'" size="is-large"></b-icon>
              <p class="is-size-5 mt-2"
                :class="resultadoVerificacion.isValid ? 'has-text-success' : 'has-text-danger'">
                {{ resultadoVerificacion.message }}
              </p>
            </div>

            <div v-if="resultadoVerificacion.discount" class="content">
              <h5 class="title is-5 mb-3">Detalles del Descuento</h5>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Nombre:</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <p class="control">
                      <span>{{ resultadoVerificacion.discount.name }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Tipo:</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <p class="control">
                      <b-tag :type="getTipoTagType(resultadoVerificacion.discount.type)">
                        {{ getTipoDescuento(resultadoVerificacion.discount.type) }}
                      </b-tag>
                    </p>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Valor:</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <p class="control">
                      <span>{{ formatearValorDescuento(resultadoVerificacion.discount) }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Cantidad Mínima:</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <p class="control">
                      <span>{{ resultadoVerificacion.discount.minQuantity }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Vigencia:</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <p class="control">
                      <span>{{ formatDate(resultadoVerificacion.discount.startDate) }} - {{
                        formatDate(resultadoVerificacion.discount.endDate) }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Estado:</label>
                </div>
                <div class="field-body">
                  <div class="field">
                    <p class="control">
                      <b-tag :type="resultadoVerificacion.discount.isActive ? 'is-success' : 'is-danger'">
                        {{ resultadoVerificacion.discount.isActive ? 'Activo' : 'Inactivo' }}
                      </b-tag>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="errores.verificar" class="notification is-danger">
            {{ errores.verificar }}
          </div>

          <div v-else-if="!cargando.verificando" class="notification is-light">
            Ingrese el nombre de un descuento y haga clic en "Verificar Validez" para comprobar si el descuento está
            vigente.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';

export default {
  name: 'VerificarValidez',
  props: {
    descuentos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      verificarDescuentoNombre: '',
      verificarDescuentoSeleccionado: null,
      resultadoVerificacion: null,
      errores: {
        verificarNombre: '',
        verificar: ''
      },
      cargando: {
        verificando: false
      }
    };
  },
  computed: {
    descuentosFiltrados() {
      if (!this.verificarDescuentoNombre) {
        return this.descuentos;
      }

      const nombreBusqueda = this.verificarDescuentoNombre.toLowerCase();
      return this.descuentos.filter(descuento =>
        descuento.name.toLowerCase().includes(nombreBusqueda)
      );
    }
  },
  methods: {
    // Método para formatear fechas
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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

    opcionSeleccionada(descuento) {
      if (descuento) {
        this.verificarDescuentoSeleccionado = descuento;
        this.verificarDescuentoNombre = descuento.name;
      }
    },

    async verificarValidezDescuentoPorNombre() {
      // Limpiar errores previos
      this.errores.verificarNombre = '';
      this.errores.verificar = '';
      this.resultadoVerificacion = null;

      // Validar que se haya ingresado un nombre
      if (!this.verificarDescuentoNombre.trim()) {
        this.errores.verificarNombre = 'Debe ingresar un nombre de descuento';
        return;
      }

      // Si no se seleccionó un descuento del autocompletado, buscar por nombre
      if (!this.verificarDescuentoSeleccionado) {
        const descuentoEncontrado = this.descuentos.find(
          d => d.name.toLowerCase() === this.verificarDescuentoNombre.toLowerCase()
        );

        if (!descuentoEncontrado) {
          this.errores.verificar = 'No se encontró ningún descuento con ese nombre exacto';
          return;
        }

        this.verificarDescuentoSeleccionado = descuentoEncontrado;
      }

      this.cargando.verificando = true;

      try {
        const response = await apiRequest({
          method: 'GET',
          path: `discounts/${this.verificarDescuentoSeleccionado.id}/check-validity`
        });

        if (response && response.data) {
          this.resultadoVerificacion = response.data;
          console.log('Resultado de verificación:', this.resultadoVerificacion);
        } else {
          this.errores.verificar = 'No se pudo obtener información sobre la validez del descuento';
        }
      } catch (error) {
        console.error('Error al verificar validez del descuento:', error);

        if (error.response && error.response.status === 404) {
          this.errores.verificar = 'El descuento no existe en el sistema';
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errores.verificar = error.response.data.message;
        } else {
          this.errores.verificar = 'Error al verificar la validez del descuento';
        }
      } finally {
        this.cargando.verificando = false;
        // Limpiar la selección después de verificar
        this.verificarDescuentoSeleccionado = null;
      }
    }
  }
};
</script>