<template>
    <section class="section">
      <div class="container">
        <h1 class="title">Cierre de Caja</h1>
        
        <div class="box">
          <div class="field">
            <label class="label">Efectivo en Mano</label>
            <div class="control has-icons-left">
              <input 
                class="input" 
                type="number" 
                v-model.number="cashInHand"
                placeholder="Ingrese el monto en efectivo"
                min="0"
                step="0.01"
              >
              <span class="icon is-small is-left">
                <i class="mdi mdi-cash"></i>
              </span>
            </div>
          </div>
          
          <div class="field">
            <div class="control">
              <button 
                class="button is-primary"
                :class="{ 'is-loading': cargando }"
                @click="cerrarCaja"
                :disabled="!isValidAmount || cargando"
              >
                <span class="icon">
                  <i class="mdi mdi-cash-register"></i>
                </span>
                <span>Cerrar Caja</span>
              </button>
            </div>
          </div>
        </div>
  
        <b-modal v-model="showConfirmModal" 
                 has-modal-card
                 trap-focus
                 :destroy-on-hide="false"
                 aria-role="dialog"
                 aria-modal>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Confirmar Cierre de Caja</p>
            </header>
            <section class="modal-card-body">
              <p>¿Está seguro que desea cerrar la caja con un monto de <strong>${{ formatNumber(cashInHand) }}</strong>?</p>
              <p class="has-text-grey is-size-7 mt-2">Esta acción no se puede deshacer.</p>
            </section>
            <footer class="modal-card-foot">
              <button class="button is-primary" 
                      :class="{ 'is-loading': cargando }"
                      @click="confirmarCierre">
                Confirmar
              </button>
              <button class="button" 
                      @click="showConfirmModal = false"
                      :disabled="cargando">
                Cancelar
              </button>
            </footer>
          </div>
        </b-modal>
      </div>
    </section>
  </template>
  
  <script>
  import HttpService from '@/Servicios/HttpService'
  import AyudanteSesion from '@/Servicios/AyudanteSesion'
  
  export default {
    name: "CloseCashRegister",
  
    data: () => ({
      cashInHand: null,
      cargando: false,
      showConfirmModal: false
    }),
  
    computed: {
      isValidAmount() {
        return this.cashInHand !== null && 
               this.cashInHand >= 0 && 
               !isNaN(this.cashInHand)
      }
    },
  
    methods: {
      formatNumber(value) {
        if (value === null || value === undefined) return '0.00'
        return Number(value).toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      },
  
      cerrarCaja() {
        if (!this.isValidAmount) {
          this.$buefy.toast.open({
            message: 'Por favor ingrese un monto válido',
            type: 'is-warning'
          })
          return
        }
        this.showConfirmModal = true
      },
  
      async confirmarCierre() {
        this.cargando = true
        try {
          const sesion = AyudanteSesion.obtenerDatosSesion()
          
          if (!sesion || !sesion.id) {
            throw new Error('ID de usuario no encontrado')
          }
  
          const userId = sesion.id;
  
          const response = await HttpService({
            method: 'POST',
            path: `Cash-Register/close/${userId}`,
            data: {
              cashInHand: Number(this.cashInHand)
            }
          })
  
          if (response.status === 201) {
            this.$buefy.toast.open({
              message: 'Caja cerrada exitosamente',
              type: 'is-success',
              duration: 5000
            })
            this.cashInHand = null
            this.showConfirmModal = false
          } else {
            throw new Error(`Error al cerrar la caja (Código: ${response.status})`)
          }
        } catch (error) {
          console.error('Error al cerrar la caja:', error)
          this.$buefy.toast.open({
            message: error.response?.data?.message || 'Error al cerrar la caja. Por favor intente nuevamente.',
            type: 'is-danger',
            duration: 5000
          })
        } finally {
          this.cargando = false
          this.showConfirmModal = false
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .box {
    max-width: 400px;
    margin: 2rem auto;
  }
  
  .button .icon {
    margin-right: 0.5rem;
  }
  
  .modal-card-body {
    padding: 1.5rem;
  }
  
  .modal-card-foot {
    justify-content: flex-end;
    padding: 1rem;
  }
  </style>
  