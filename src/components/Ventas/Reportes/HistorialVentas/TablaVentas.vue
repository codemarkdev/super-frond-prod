<template>
  <div>
    <b-table :data="ventas" :loading="cargando" :striped="true" :hoverable="true"
      :empty="mensajeTablaVacia">
      <b-table-column field="date" label="Fecha" v-slot="props">
        {{ formatearFecha(props.row.date) }}
      </b-table-column>
      <b-table-column field="totalWithIVA" label="Total con IVA" numeric v-slot="props">
        ${{ formatNumber(props.row.totalWithIVA) }}
      </b-table-column>
      <b-table-column field="totalWithoutIVA" label="Total sin IVA" numeric v-slot="props">
        ${{ formatNumber(props.row.totalWithoutIVA) }}
      </b-table-column>
      <b-table-column field="totalIVA" label="IVA" numeric v-slot="props">
        ${{ formatNumber(props.row.totalIVA) }}
      </b-table-column>
      <b-table-column field="paid" label="Pagado" numeric v-slot="props">
        ${{ formatNumber(props.row.paid) }}
      </b-table-column>
      <b-table-column field="actions" label="Acciones" v-slot="props" width="420">
        <div class="action-buttons">
          <!-- Ver productos -->
          <b-button size="is-small" type="is-info" icon-left="eye" @click="verDetalles(props.row)">
            Ver productos
          </b-button>
          
          <!-- Dropdown para opciones de PDF -->
          <b-dropdown aria-role="list" position="is-bottom-left" append-to-body>
            <template #trigger>
              <b-button size="is-small" type="is-primary" icon-left="file-pdf">
                PDF
                <b-icon icon="menu-down"></b-icon>
              </b-button>
            </template>
            
            <b-dropdown-item aria-role="listitem" @click="descargarPDF(props.row)" 
              :disabled="cargando === props.row.id">
              <b-icon icon="download"></b-icon>
              Descargar PDF
            </b-dropdown-item>
            
            <b-dropdown-item aria-role="listitem" @click="descargarPDFThermal(props.row)" 
              :disabled="cargandoThermal === props.row.id">
              <b-icon icon="printer"></b-icon>
              Descargar Térmico
            </b-dropdown-item>
            
            <b-dropdown-item aria-role="listitem" @click="verPDF(props.row)">
              <b-icon icon="eye"></b-icon>
              Ver PDF
            </b-dropdown-item>
            
            <b-dropdown-item aria-role="listitem" @click="verPDFThermal(props.row)">
              <b-icon icon="eye"></b-icon>
              Ver Térmico
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
export default {
  name: "TablaVentas",
  
  props: {
    ventas: {
      type: Array,
      default: () => []
    },
    cargando: {
      type: Boolean,
      default: false
    },
    mensajeTablaVacia: {
      type: String,
      default: "No hay datos disponibles"
    }
  },
  
  data() {
    return {
      cargandoPDF: null,
      cargandoThermal: null
    };
  },
  
  methods: {
    formatNumber(value) {
      if (value === null || value === undefined) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num)
        ? "0.00"
        : num.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    },
    
    formatearFecha(fecha) {
      if (!fecha) return "";
      return new Date(fecha).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    
    verDetalles(venta) {
      this.$emit('ver-detalles', venta);
    },
    
    async descargarPDF(venta) {
      if (!venta || !venta.id) {
        this.mostrarError("ID de venta no válido");
        return;
      }

      this.cargandoPDF = venta.id;

      try {
        // Crear un enlace temporal y hacer clic en él para descargar
        const link = document.createElement('a');
        link.href = `${process.env.VUE_APP_API}print/download-pdf/${venta.id}`;
        link.setAttribute('download', `venta-${venta.id}.pdf`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        this.$buefy.toast.open({
          message: "PDF descargado correctamente",
          type: "is-success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error al descargar el PDF:", error);
        this.mostrarError("Error al descargar el PDF. Por favor, intente nuevamente.");
      } finally {
        this.cargandoPDF = null;
      }
    },

    async descargarPDFThermal(venta) {
      if (!venta || !venta.id) {
        this.mostrarError("ID de venta no válido");
        return;
      }

      this.cargandoThermal = venta.id;

      try {
        // Crear un enlace temporal y hacer clic en él para descargar
        const link = document.createElement('a');
        link.href = `${process.env.VUE_APP_API}print/download-pdf-thermal/${venta.id}`;
        link.setAttribute('download', `venta-termica-${venta.id}.pdf`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        this.$buefy.toast.open({
          message: "PDF térmico descargado correctamente",
          type: "is-success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error al descargar el PDF térmico:", error);
        this.mostrarError("Error al descargar el PDF térmico. Por favor, intente nuevamente.");
      } finally {
        this.cargandoThermal = null;
      }
    },

    verPDF(venta) {
      if (!venta || !venta.id) {
        this.mostrarError("ID de venta no válido");
        return;
      }

      // Usar la variable de entorno para construir la URL correctamente
      const url = `${process.env.VUE_APP_API}print/view/${venta.id}`;
      
      // Abrir en nueva pestaña y forzar recarga para evitar caché
      const newWindow = window.open(url + '?t=' + new Date().getTime(), '_blank');
      
      // Verificar si la ventana se abrió correctamente
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        this.mostrarError("El navegador bloqueó la apertura de la ventana. Por favor, permita ventanas emergentes.");
      }
    },

    verPDFThermal(venta) {
      if (!venta || !venta.id) {
        this.mostrarError("ID de venta no válido");
        return;
      }

      // Usar la variable de entorno para construir la URL correctamente
      const url = `${process.env.VUE_APP_API}print/viewThermal/${venta.id}`;
      
      // Abrir en nueva pestaña y forzar recarga para evitar caché
      const newWindow = window.open(url + '?t=' + new Date().getTime(), '_blank');
      
      // Verificar si la ventana se abrió correctamente
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        this.mostrarError("El navegador bloqueó la apertura de la ventana. Por favor, permita ventanas emergentes.");
      }
    },
    
    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: "is-danger",
        duration: 5000,
      });
    }
  }
};
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .button {
    width: 100%;
  }
}
</style>