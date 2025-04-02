<template>
  <div class="modal is-active" v-if="cierreInfo">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Resumen del Cierre de Caja</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <section class="modal-card-body">
        <div class="content">
          <!-- Información general del cierre -->
          <div class="box mb-4">
            <h4 class="has-text-centered mb-4">Información General</h4>
            <div class="columns is-multiline">
              <div class="column is-6">
                <p><strong>Fecha y hora:</strong> {{ formatDate(cierreInfo.date) }}</p>
              </div>
              <div class="column is-6">
                <p><strong>Usuario:</strong> {{ cierreInfo.user && cierreInfo.user.name ? cierreInfo.user.name : (userData ? userData.name : '-') }}</p>
              </div>
              <div class="column is-6">
                <p><strong>Estado:</strong> 
                  <span class="tag is-success">{{ cierreInfo.state === 'closed' ? 'Cerrado' : 'Abierto' }}</span>
                </p>
              </div>
            </div>
          </div>
  
          <!-- Desglose detallado del efectivo -->
          <div class="box mb-4">
            <h4 class="has-text-centered mb-4">Desglose Detallado</h4>
            
            <!-- Si es el primer cierre del día -->
            <div v-if="!hayTurnoPrevio">
              <div class="columns is-multiline">
                <div class="column is-8">
                  <p><strong>Ventas realizadas por {{ userData.name }} en este turno:</strong></p>
                </div>
                <div class="column is-4 has-text-right">
                  <p>{{ formatNumber(ventasTurno || cierreInfo.totalSales) }}</p>
                </div>
                <div class="column is-12">
                  <div class="notification is-info is-light">
                    <p>Este fue el primer cierre del día para este usuario. El efectivo esperado corresponde únicamente a las ventas realizadas en su turno.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Si hay un turno previo del mismo usuario -->
            <div v-else-if="esTurnoPrevioMismoUsuario">
              <div class="columns is-multiline">
                <div class="column is-8">
                  <p><strong>Efectivo del cierre anterior ({{ formatHora(turnoPrevioInfo.date) }}):</strong></p>
                </div>
                <div class="column is-4 has-text-right">
                  <p>{{ formatNumber(turnoPrevioInfo.cashInHand) }}</p>
                </div>
                <div class="column is-8">
                  <p><strong>Ventas realizadas por {{ userData.name }} desde el cierre anterior:</strong></p>
                </div>
                <div class="column is-4 has-text-right">
                  <p>{{ formatNumber(ventasTurno || (cierreInfo.totalSales - (turnoPrevioInfo.totalSales || 0))) }}</p>
                </div>
                <div class="column is-12">
                  <div class="notification is-info is-light">
                    <p>Este cierre incluye el efectivo del cierre anterior más las ventas realizadas por este usuario desde ese momento.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Si hay un turno previo de otro usuario -->
            <div v-else>
              <div class="columns is-multiline">
                <div class="column is-8">
                  <p><strong>Efectivo del cierre anterior (otro usuario):</strong></p>
                </div>
                <div class="column is-4 has-text-right">
                  <p>{{ formatNumber(turnoPrevioInfo.cashInHand) }}</p>
                </div>
                <div class="column is-8">
                  <p><strong>Ventas realizadas por {{ userData.name }} en su turno:</strong></p>
                </div>
                <div class="column is-4 has-text-right">
                  <p>{{ formatNumber(ventasTurno || cierreInfo.totalSales) }}</p>
                </div>
                <div class="column is-12">
                  <div class="notification is-info is-light">
                    <p>Este fue el primer cierre del día para {{ userData.name }}, pero hubo cierres previos de otros usuarios. El efectivo esperado incluye el último cierre más las ventas de este usuario.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="is-divider"></div>
            
            <!-- Totales -->
            <div class="columns is-multiline">
              <div class="column is-8">
                <p class="has-text-weight-bold">EFECTIVO ESPERADO EN CAJA:</p>
              </div>
              <div class="column is-4 has-text-right">
                <p class="has-text-weight-bold">{{ formatNumber(cierreInfo.expectedCash) }}</p>
              </div>
              <div class="column is-8">
                <p class="has-text-weight-bold">EFECTIVO INGRESADO:</p>
              </div>
              <div class="column is-4 has-text-right">
                <p class="has-text-weight-bold">{{ formatNumber(cierreInfo.cashInHand) }}</p>
              </div>
              <div class="column is-8">
                <p class="has-text-weight-bold">DISCREPANCIA:</p>
              </div>
              <div class="column is-4 has-text-right">
                <p class="has-text-weight-bold" :class="{'has-text-danger': cierreInfo.discrepancy < 0, 'has-text-success': cierreInfo.discrepancy > 0, 'has-text-info': cierreInfo.discrepancy === 0}">
                  {{ formatNumber(cierreInfo.discrepancy) }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Mensaje de discrepancia -->
          <div v-if="cierreInfo.discrepancy !== 0" class="notification" :class="{'is-danger': cierreInfo.discrepancy < 0, 'is-warning': cierreInfo.discrepancy > 0}">
            <p class="has-text-centered">
              <span class="icon">
                <i class="mdi" :class="{'mdi-alert': cierreInfo.discrepancy < 0, 'mdi-information': cierreInfo.discrepancy > 0}"></i>
              </span>
              <span v-if="cierreInfo.discrepancy < 0">
                <strong>¡Atención!</strong> Hay una discrepancia negativa de {{ formatNumber(Math.abs(cierreInfo.discrepancy)) }}. 
                Esto significa que hay menos efectivo del esperado.
              </span>
              <span v-else>
                <strong>¡Atención!</strong> Hay una discrepancia positiva de {{ formatNumber(cierreInfo.discrepancy) }}. 
                Esto significa que hay más efectivo del esperado.
              </span>
            </p>
          </div>
          
          <div v-else class="notification is-success">
            <p class="has-text-centered">
              <span class="icon">
                <i class="mdi mdi-check-circle"></i>
              </span>
              <strong>¡Excelente!</strong> No hay discrepancias. El efectivo ingresado coincide exactamente con el esperado.
            </p>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="cerrarModal">Aceptar</button>
      </footer>
    </div>
  </div>
  </template>
  
  <script>
  export default {
  props: {
    cierreInfo: Object,
    userData: {
      type: Object,
      default: () => ({
        name: '-',
        username: '-',
        phone: '-'
      })
    },
    hayTurnoPrevio: {
      type: Boolean,
      default: false
    },
    esTurnoPrevioMismoUsuario: {
      type: Boolean,
      default: false
    },
    turnoPrevioInfo: {
      type: Object,
      default: () => ({})
    },
    ventasTurno: {
      type: Number,
      default: 0
    }
  },
  methods: {
    formatNumber(value) {
      if (value === null || value === undefined) return '-';
      return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-MX', options);
    },
    formatHora(fechaString) {
      if (!fechaString) return '-';
      const fecha = new Date(fechaString);
      return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    },
    cerrarModal() {
      console.log('Cerrando modal de resumen');
      this.$emit('update:cierreInfo', null);
    }
  }
  }
  </script>
  
  <style scoped>
  .modal-card {
  max-width: 650px;
  width: 100%;
  }
  
  .modal-card-body {
  padding: 1.5rem;
  }
  
  .is-divider {
  height: 1px;
  background-color: #dbdbdb;
  margin: 1rem 0;
  }
  
  .mb-4 {
  margin-bottom: 1rem;
  }
  
  @media print {
  .modal-background, .modal-card-head, .modal-card-foot {
    display: none;
  }
  
  .modal {
    position: relative;
    display: block;
  }
  
  .modal-card {
    max-width: 100%;
    margin: 0;
    box-shadow: none;
  }
  
  .modal-card-body {
    padding: 0;
  }
  }
  </style>
  
  