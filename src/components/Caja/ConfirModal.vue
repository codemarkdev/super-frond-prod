<template>
<b-modal v-model="localShowConfirmModal" has-modal-card trap-focus aria-role="dialog" @close="handleClose">
  <div class="modal-card">
    <header class="modal-card-head has-background-primary">
      <p class="modal-card-title has-text-white">Confirmar Cierre de Caja</p>
    </header>
    <section class="modal-card-body">
      <div class="content">
        <h3>Resumen del Cierre:</h3>
        
        <div class="box mb-4">
          <div class="columns is-multiline">
            <div class="column is-6">
              <p>
                <strong>Ventas del Turno:</strong> 
                <span class="has-tooltip-multiline" data-tooltip="Total de ventas realizadas durante su turno actual, desde el último cierre de caja.">
                  {{ formatNumber(ventasTurno) }}
                  <span class="icon is-small has-text-info">
                    <i class="mdi mdi-information-outline"></i>
                  </span>
                </span>
              </p>
            </div>
            <div class="column is-6">
              <p>
                <strong>Efectivo Esperado:</strong> 
                <span class="has-tooltip-multiline" data-tooltip="Cantidad de efectivo que debería tener en caja según los registros del sistema. Corresponde únicamente a las ventas en efectivo de este turno.">
                  {{ formatNumber(efectivoEsperado) }}
                  <span class="icon is-small has-text-info">
                    <i class="mdi mdi-information-outline"></i>
                  </span>
                </span>
              </p>
            </div>
            <div class="column is-6">
              <p>
                <strong>Efectivo en Mano:</strong> 
                <span class="has-tooltip-multiline" data-tooltip="Cantidad de efectivo que usted ha contado físicamente y ha ingresado en el sistema.">
                  {{ formatNumber(cashInHand) }}
                  <span class="icon is-small has-text-info">
                    <i class="mdi mdi-information-outline"></i>
                  </span>
                </span>
              </p>
            </div>
            <div class="column is-6">
              <p>
                <strong>Discrepancia:</strong> 
                <span class="has-tooltip-multiline" :class="{'has-text-danger': discrepancia < 0, 'has-text-success': discrepancia > 0, 'has-text-info': discrepancia === 0}" data-tooltip="Diferencia entre el efectivo en mano y el efectivo esperado. Si es positiva, hay más dinero del esperado. Si es negativa, falta dinero.">
                  {{ formatNumber(discrepancia) }}
                  <span class="icon is-small" :class="{'has-text-danger': discrepancia < 0, 'has-text-success': discrepancia > 0, 'has-text-info': discrepancia === 0}">
                    <i class="mdi" :class="{'mdi-alert': discrepancia < 0, 'mdi-check-circle': discrepancia === 0, 'mdi-plus-circle': discrepancia > 0}"></i>
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Explicación detallada del Efectivo Esperado -->
        <div class="notification is-primary is-light mb-4">
          <p class="has-text-centered has-text-weight-bold">
            <span class="icon">
              <i class="mdi mdi-cash-register"></i>
            </span>
            ¿Cómo se calcula el Efectivo Esperado?
          </p>
          
          <div class="content">
            <p>El <strong>Efectivo Esperado</strong> ({{ formatNumber(efectivoEsperado) }}) corresponde únicamente a las ventas realizadas en su turno:</p>
            
            <div class="box has-background-white-ter p-3">
              <p class="mb-2"><strong>Ventas del Turno:</strong> {{ formatNumber(ventasTurno) }}</p>
              <p class="has-text-weight-bold">Total Efectivo Esperado: {{ formatNumber(efectivoEsperado) }}</p>
            </div>
            
            <p class="has-text-centered has-text-weight-bold mt-3">
              <span class="icon">
                <i class="mdi mdi-information"></i>
              </span>
              Para evitar discrepancias, el Efectivo en Mano debe ser igual al Efectivo Esperado.
            </p>
          </div>
        </div>
        
        <div class="notification is-warning is-light" v-if="Math.abs(discrepancia) > 0">
          <p class="has-text-centered">
            <span class="icon">
              <i class="mdi mdi-alert"></i>
            </span>
            <span v-if="discrepancia < 0">
              <strong>¡Atención!</strong> Hay una discrepancia negativa de {{ formatNumber(Math.abs(discrepancia)) }}. 
              Esto significa que hay menos efectivo del esperado. Verifique si hubo algún error en el conteo o si falta dinero.
            </span>
            <span v-else>
              <strong>¡Atención!</strong> Hay una discrepancia positiva de {{ formatNumber(discrepancia) }}. 
              Esto significa que hay más efectivo del esperado. Verifique si hubo algún error en el registro de ventas o en el conteo.
            </span>
          </p>
        </div>
        
        <p class="has-text-danger has-text-weight-bold">
          <span class="icon">
            <i class="mdi mdi-alert-circle"></i>
          </span>
          Esta acción no se puede deshacer. Al confirmar, se registrará el cierre con los valores mostrados.
        </p>
      </div>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-primary" :class="{ 'is-loading': cargando }" @click="confirmarCierre" :disabled="cargando">
        <span class="icon">
          <i class="mdi mdi-check"></i>
        </span>
        <span>Confirmar</span>
      </button>
      <button class="button" @click="handleClose" :disabled="cargando">
        <span class="icon">
          <i class="mdi mdi-close"></i>
        </span>
        <span>Cancelar</span>
      </button>
    </footer>
  </div>
</b-modal>
</template>

<script>
export default {
props: {
  showConfirmModal: Boolean,
  cashInHand: Number,
  cargando: Boolean,
  ventasTurno: {
    type: Number,
    default: 0
  },
  efectivoEsperado: {
    type: Number,
    default: 0
  },
  actionModal: {
    type: Function,
    default: null
  },
  // Nuevas props para explicar el efectivo esperado
  esPrimerCierreDia: {
    type: Boolean,
    default: true
  },
  hayOtrosCierresHoy: {
    type: Boolean,
    default: false
  },
  efectivoUltimoCierre: {
    type: Number,
    default: 0
  },
  efectivoTurnoAnteriorUsuario: {
    type: Number,
    default: 0
  }
},
data() {
  return {
    localShowConfirmModal: this.showConfirmModal,
    procesando: false
  };
},
computed: {
  discrepancia() {
    return this.cashInHand - this.efectivoEsperado;
  }
},
watch: {
  showConfirmModal(newVal) {
    this.localShowConfirmModal = newVal;
  }
},
methods: {
  formatNumber(value) {
    if (value === null || value === undefined) return '-';
    return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  },
  confirmarCierre() {
    // Evitar múltiples clics
    if (this.procesando) return;
    
    this.procesando = true;
    this.$emit('confirmar-cierre');
    this.procesando = false;
  },
  handleClose() {
    this.$emit('update:showConfirmModal', false);
  }
}
}
</script>

<style scoped>
.mb-2 {
margin-bottom: 0.5rem;
}

.mb-4 {
margin-bottom: 1rem;
}

.mt-3 {
margin-top: 0.75rem;
}

.p-3 {
padding: 0.75rem;
}

.has-tooltip-multiline {
position: relative;
cursor: help;
}

.modal-card {
max-width: 600px;
width: 100%;
}

.notification ul {
margin-left: 1.5rem;
margin-top: 0.5rem;
}

.notification ul li {
margin-bottom: 0.25rem;
}

.icon {
margin-right: 0.25rem;
vertical-align: middle;
}

.is-divider {
height: 1px;
background-color: #dbdbdb;
margin: 1rem 0;
}
</style>

