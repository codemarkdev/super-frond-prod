<template>
    <div class="payments-management">
      <!-- Formulario de Nuevo Pago -->
      <div class="card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="cash-plus" type="is-success"></b-icon>
            Registrar Nuevo Pago
          </p>
        </header>
        <div class="card-content">
          <form @submit.prevent="crearPago">
            <div class="field">
              <b-field label="Monto" 
                      :type="{ 'is-danger': errores.amount }" 
                      :message="errores.amount">
                <b-input
                  v-model="nuevoPago.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required>
                </b-input>
              </b-field>
            </div>
  
            <div class="field">
              <b-field label="ID de Cuenta por Cobrar"
                      :type="{ 'is-danger': errores.accountHoldingId }"
                      :message="errores.accountHoldingId">
                <b-input
                  v-model="nuevoPago.accountHoldingId"
                  type="number"
                  min="1"
                  placeholder="ID de la cuenta"
                  required>
                </b-input>
              </b-field>
            </div>
  
            <div class="field">
              <b-field label="ID de Cliente"
                      :type="{ 'is-danger': errores.customerId }"
                      :message="errores.customerId">
                <b-input
                  v-model="nuevoPago.customerId"
                  type="number"
                  min="1"
                  placeholder="ID del cliente"
                  required>
                </b-input>
              </b-field>
            </div>
  
            <div class="field">
              <div class="control">
                <b-button
                  type="is-primary"
                  native-type="submit"
                  :loading="cargando.creando"
                  expanded>
                  Registrar Pago
                </b-button>
              </div>
            </div>
          </form>
        </div>
      </div>
  
      <!-- Filtros -->
      <div class="card mb-6">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="filter" type="is-info"></b-icon>
            Filtrar Pagos
          </p>
        </header>
        <div class="card-content">
          <div class="field is-grouped">
            <div class="control">
              <b-field label="ID de Cuenta por Cobrar">
                <b-input
                  v-model="filtro.accountHoldingId"
                  type="number"
                  min="1"
                  placeholder="Filtrar por cuenta">
                </b-input>
              </b-field>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-info"
                :loading="cargando.filtrando"
                @click="filtrarPagos">
                Buscar
              </b-button>
            </div>
            <div class="control align-self-flex-end">
              <b-button
                type="is-light"
                @click="limpiarFiltros"
                :disabled="!filtro.accountHoldingId">
                Limpiar
              </b-button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Lista de Pagos -->
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            <b-icon icon="cash-multiple" type="is-primary"></b-icon>
            Historial de Pagos
          </p>
        </header>
        <div class="card-content">
          <b-table
            :data="pagos"
            :loading="cargando.lista"
            :striped="true"
            :hoverable="true">
            
            <b-table-column field="id" label="ID" v-slot="props">
              {{ props.row.id }}
            </b-table-column>
            
            <b-table-column field="date" label="Fecha" v-slot="props">
              {{ formatDate(props.row.date) }}
            </b-table-column>
            
            <b-table-column field="amount" label="Monto" numeric v-slot="props">
              ${{ formatNumber(props.row.amount) }}
            </b-table-column>
            
            <b-table-column field="accountHoldingId" label="ID Cuenta" v-slot="props">
              {{ props.row.accountHoldingId }}
            </b-table-column>
  
            <template #empty>
              <div class="has-text-centered">No hay pagos registrados</div>
            </template>
          </b-table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import apiRequest from '@/Servicios/HttpService'
  
  export default {
    name: 'GestionPagos',
  
    data() {
      return {
        pagos: [],
        nuevoPago: {
          amount: '',
          accountHoldingId: '',
          customerId: '',
          date: new Date().toISOString()
        },
        filtro: {
          accountHoldingId: ''
        },
        cargando: {
          lista: false,
          creando: false,
          filtrando: false
        },
        errores: {
          amount: '',
          accountHoldingId: '',
          customerId: ''
        }
      }
    },
  
    mounted() {
      this.cargarPagos()
    },
  
    methods: {
      formatNumber(value) {
        if (!value) return '0.00'
        const num = typeof value === 'string' ? parseFloat(value) : Number(value)
        return isNaN(num) ? '0.00' : num.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      },
  
      formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
  
      async cargarPagos() {
        this.cargando.lista = true
        try {
          const response = await apiRequest({
            method: 'GET',
            path: 'payments'
          })
          
          if (response?.data) {
            this.pagos = Array.isArray(response.data) ? response.data : []
          }
        } catch (error) {
          console.error('Error al cargar pagos:', error)
          this.mostrarError('Error al cargar el historial de pagos')
        } finally {
          this.cargando.lista = false
        }
      },
  
      async crearPago() {
        // Resetear errores
        this.errores = {
          amount: '',
          accountHoldingId: '',
          customerId: ''
        }
  
        // Validaciones básicas
        if (!this.nuevoPago.amount || this.nuevoPago.amount <= 0) {
          this.errores.amount = 'El monto debe ser mayor a 0'
          return
        }
  
        if (!this.nuevoPago.accountHoldingId) {
          this.errores.accountHoldingId = 'El ID de cuenta es requerido'
          return
        }
  
        if (!this.nuevoPago.customerId) {
          this.errores.customerId = 'El ID de cliente es requerido'
          return
        }
  
        this.cargando.creando = true
        try {
          await apiRequest({
            method: 'POST',
            path: 'payments',
            data: this.nuevoPago
          })
  
          // Limpiar formulario
          this.nuevoPago = {
            amount: '',
            accountHoldingId: '',
            customerId: '',
            date: new Date().toISOString()
          }
  
          // Mostrar mensaje de éxito
          this.$buefy.toast.open({
            message: 'Pago registrado exitosamente',
            type: 'is-success'
          })
  
          // Recargar lista de pagos
          await this.cargarPagos()
        } catch (error) {
          console.error('Error al crear pago:', error)
          
          if (error.response?.status === 400) {
            this.mostrarError('El monto excede el saldo pendiente')
          } else if (error.response?.status === 404) {
            this.mostrarError('La cuenta especificada no existe')
          } else {
            this.mostrarError('Error al registrar el pago')
          }
        } finally {
          this.cargando.creando = false
        }
      },
  
      async filtrarPagos() {
        if (!this.filtro.accountHoldingId) {
          await this.cargarPagos()
          return
        }
  
        this.cargando.filtrando = true
        try {
          const response = await apiRequest({
            method: 'GET',
            path: `payments/account-holding/${this.filtro.accountHoldingId}`
          })
          
          if (response?.data) {
            this.pagos = Array.isArray(response.data) ? response.data : []
          }
        } catch (error) {
          console.error('Error al filtrar pagos:', error)
          this.mostrarError('Error al filtrar los pagos')
        } finally {
          this.cargando.filtrando = false
        }
      },
  
      limpiarFiltros() {
        this.filtro.accountHoldingId = ''
        this.cargarPagos()
      },
  
      mostrarError(mensaje) {
        this.$buefy.toast.open({
          message: mensaje,
          type: 'is-danger',
          duration: 5000
        })
      }
    }
  }
  </script>
  
  <style scoped>
  .payments-management {
    padding: 1.5rem;
  }
  
  .card {
    margin-bottom: 1.5rem;
  }
  
  .card-header-title {
    display: flex;
    align-items: center;
  }
  
  .card-header-title .icon {
    margin-right: 0.5rem;
  }
  
  .align-self-flex-end {
    align-self: flex-end;
  }
  </style>
  
  