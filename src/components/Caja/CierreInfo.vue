<template>
    <div v-if="cierreInfo" class="card mt-6">
      <header class="card-header">
        <p class="card-header-title">
          Resumen del Cierre de Caja
        </p>
      </header>
      <div class="card-content">
        <div class="content">
          <div class="columns is-multiline">
            <div class="column is-half">
              <p><strong>Fecha:</strong> {{ formatDate(cierreInfo.date) }}</p>
            </div>
            <div class="column is-half">
              <p><strong>Efectivo en Mano:</strong> {{ formatNumber(cierreInfo.cashInHand) }}</p>
            </div>
            <div class="column is-half">
              <p><strong>Total Ventas:</strong> {{ formatNumber(cierreInfo.totalSales) }}</p>
            </div>
            <!-- <div class="column is-half">
              <p><strong>Total Pagos:</strong> {{ formatNumber(cierreInfo.totalPayments) }}</p>
            </div> -->
            <div class="column is-half">
              <p><strong>Efectivo Esperado:</strong> {{ formatNumber(cierreInfo.expectedCash) }}</p>
            </div>
            <div class="column is-half">
              <p><strong>Discrepancia:</strong> 
                <span :class="{'has-text-danger': cierreInfo.discrepancy < 0, 'has-text-success': cierreInfo.discrepancy > 0}">
                  {{ formatNumber(cierreInfo.discrepancy) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      cierreInfo: Object
    },
    methods: {
      formatNumber(value) {
        return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
      },
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-MX', options);
      }
    }
  }
  </script>
  