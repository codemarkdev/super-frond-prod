<template>
  <b-modal :active.sync="mostrar" :width="800" scroll="keep" aria-role="dialog">
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ titulo }}</p>
        <button class="delete" @click="cerrar"></button>
      </header>
      
      <section class="modal-card-body">
        <div v-if="cargando" class="loading-container">
          <b-loading :active="true"></b-loading>
          <p>Cargando documento...</p>
        </div>
        
        <div v-if="error" class="error-container">
          <div class="notification is-danger">
            {{ mensajeError }}
          </div>
        </div>
        
        <iframe
          v-show="pdfCargado"
          :src="pdfUrl"
          ref="pdfIframe"
          @load="onCargado"
          @error="onError"
        ></iframe>
      </section>
      
      <footer class="modal-card-foot">
        <button class="button" @click="cerrar">Cerrar</button>
        <button class="button is-primary" 
                @click="imprimir"
                :disabled="!pdfCargado || imprimiendo">
          <i class="mdi mdi-printer"></i>
          <span>{{ imprimiendo ? 'Imprimiendo...' : 'Imprimir' }}</span>
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'VisorPDF',
  props: {
    titulo: { type: String, default: 'Comprobante de Venta' },
    urlBase: { type: String, required: true }
  },
  data() {
    return {
      mostrar: false,
      pdfUrl: null,
      cargando: false,
      pdfCargado: false,
      error: false,
      mensajeError: '',
      imprimiendo: false
    }
  },
  methods: {
    abrir(idDocumento) {
      this.resetEstados();
      this.cargando = true;
      this.cleanupPdfUrl();
      this.pdfUrl = `${this.urlBase}/${idDocumento}?t=${Date.now()}`;
      this.mostrar = true;
    },
    
    onCargado() {
      this.cargando = false;
      this.pdfCargado = true;
    },
    
    onError() {
      this.cargando = false;
      this.error = true;
      this.mensajeError = 'Error al cargar el documento';
    },
    
    cerrar() {
      this.mostrar = false;
      this.cleanupPdfUrl();
    },
    
    async imprimir() {
      if (!this.pdfCargado) return;
      
      this.imprimiendo = true;
      try {
        const iframe = this.$refs.pdfIframe;
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(this.cerrar, 1000);
      } catch {
        this.imprimirFallback();
      } finally {
        this.imprimiendo = false;
      }
    },
    
    imprimirFallback() {
      const printWindow = window.open(this.pdfUrl, '_blank');
      printWindow.onload = () => printWindow.print();
      setTimeout(this.cerrar, 1000);
    },
    
    cleanupPdfUrl() {
      if (this.pdfUrl) {
        URL.revokeObjectURL(this.pdfUrl);
        this.pdfUrl = null;
      }
    },
    
    resetEstados() {
      this.pdfCargado = this.error = false;
      this.mensajeError = '';
    }
  },
  beforeDestroy() {
    this.cleanupPdfUrl();
  }
}
</script>

<style scoped>
.modal-card {
  width: 90%;
  max-width: 800px;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-card-body {
  flex: 1;
  position: relative;
}

.loading-container,
.error-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

iframe {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
}

@media print {
  body * { visibility: hidden; }
  .modal-card, .modal-card * { visibility: visible; }
  .modal-card {
    position: absolute;
    inset: 0;
    margin: 0;
  }
  .modal-card-foot { display: none; }
}
</style>

