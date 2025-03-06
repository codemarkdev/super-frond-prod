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
            <b-field label="Cliente">
              <b-autocomplete
                v-model="nombreCliente"
                :data="clientesFiltrados"
                placeholder="Buscar cliente"
                field="name"
                @select="seleccionarCliente">
                <template #empty>No se encontraron clientes</template>
              </b-autocomplete>
            </b-field>
          </div>

          <div v-if="clienteSeleccionado" class="field">
            <b-field label="Cuenta por Cobrar">
              <b-select v-model="cuentaSeleccionada" expanded>
                <option
                  v-for="cuenta in cuentasClienteSeleccionado"
                  :key="cuenta.id"
                  :value="cuenta">
                  ID: {{ cuenta.id }} - Por Pagar: ${{ formatNumber(cuenta.toPay) }}
                </option>
              </b-select>
            </b-field>
          </div>

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
            <div class="control">
              <b-button
                type="is-primary"
                native-type="submit"
                :loading="cargando.creando"
                :disabled="!cuentaSeleccionada"
                expanded>
                Registrar Pago
              </b-button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Cuentas por Cobrar -->
    <div class="card mb-6">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="account-cash" type="is-warning"></b-icon>
          Cuentas por Cobrar
        </p>
      </header>
      <div class="card-content">
        <!-- Filtros -->
        <div class="field is-grouped mb-4">
          <div class="control is-expanded">
            <b-input v-model="busquedaCliente" placeholder="Buscar por nombre de cliente" expanded></b-input>
          </div>
          <div class="control">
            <b-select v-model="filtroEstado">
              <option value="">Todos los estados</option>
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
            </b-select>
          </div>
        </div>

        <b-table
          :data="cuentasAgrupadasPaginadas"
          :loading="cargando.cuentas"
          :striped="true"
          :hoverable="true"
          detailed
          detail-key="id"
          :show-detail-icon="true">
          
          <b-table-column field="customer.name" label="Cliente" v-slot="props">
            {{ props.row.customer.name }}
          </b-table-column>

          <b-table-column field="customer.phone" label="Teléfono" v-slot="props">
            {{ props.row.customer.phone }}
          </b-table-column>
          
          <b-table-column field="totalAmount" label="Total" numeric v-slot="props">
            ${{ formatNumber(props.row.totalAmount) }}
          </b-table-column>
          
          <b-table-column field="totalPaid" label="Pagado" numeric v-slot="props">
            ${{ formatNumber(props.row.totalPaid) }}
          </b-table-column>
          
          <b-table-column field="totalToPay" label="Por Pagar" numeric v-slot="props">
            ${{ formatNumber(props.row.totalToPay) }}
          </b-table-column>

          <b-table-column field="estado" label="Estado" v-slot="props">
            <b-tag :type="obtenerColorEstado(props.row)">
              {{ obtenerEstadoCuenta(props.row) }}
            </b-tag>
          </b-table-column>

          <template #detail="props">
            <div class="content">
              <p><strong>Detalles de las cuentas:</strong></p>
              <b-table :data="props.row.cuentas" :striped="true" :hoverable="true">
                <b-table-column field="id" label="ID Cuenta" v-slot="props">
                  {{ props.row.id }}
                </b-table-column>
                <b-table-column field="total" label="Total" numeric v-slot="props">
                  ${{ formatNumber(props.row.total) }}
                </b-table-column>
                <b-table-column field="paid" label="Pagado" numeric v-slot="props">
                  ${{ formatNumber(props.row.paid) }}
                </b-table-column>
                <b-table-column field="toPay" label="Por Pagar" numeric v-slot="props">
                  ${{ formatNumber(props.row.toPay) }}
                </b-table-column>
                <b-table-column field="date" label="Fecha" v-slot="props">
                  {{ formatDate(props.row.date) }}
                </b-table-column>
              </b-table>
            </div>
          </template>

          <template #empty>
            <div class="has-text-centered">No hay cuentas por cobrar registradas</div>
          </template>
        </b-table>

        <b-pagination
          v-model="paginaActualCuentas"
          :total="cuentasPaginacion.total"
          :per-page="cuentasPorPagina"
          :range-before="3"
          :range-after="3"
          order="is-centered"
          aria-next-label="Página siguiente"
          aria-previous-label="Página anterior"
          aria-page-label="Página"
          aria-current-label="Página actual"
          @change="obtenerCuentasPorCobrar">
        </b-pagination>
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
      nuevoPago: {
        amount: '',
        accountHoldingId: '',
        customerId: '',
        date: new Date().toISOString()
      },
      cargando: {
        lista: false,
        creando: false,
        filtrando: false,
        cuentas: false
      },
      errores: {
        amount: '',
      },
      cuentasPorCobrar: [],
      cuentasPaginacion: {
        total: 0,
        currentPage: 1,
        perPage: 10,
        totalPages: 0
      },
      nombreCliente: '',
      clienteSeleccionado: null,
      cuentaSeleccionada: null,
      paginaActualCuentas: 1,
      cuentasPorPagina: 10,
      busquedaCliente: '',
      filtroEstado: '',
    }
  },

  computed: {
    clientesFiltrados() {
      return this.cuentasAgrupadasPorCliente
        .map(cuenta => cuenta.customer)
        .filter(customer =>
          customer.name.toLowerCase().includes(this.nombreCliente.toLowerCase())
        )
    },
    cuentasClienteSeleccionado() {
      if (!this.clienteSeleccionado) return []
      const clienteAgrupado = this.cuentasAgrupadasPorCliente.find(c => c.customer.id === this.clienteSeleccionado.id)
      return clienteAgrupado ? clienteAgrupado.cuentas.filter(cuenta => parseFloat(cuenta.toPay) > 0) : []
    },
    cuentasAgrupadasPorCliente() {
      const cuentasAgrupadas = this.cuentasPorCobrar.reduce((acc, cuenta) => {
        const clienteId = cuenta.customer.id
        if (!acc[clienteId]) {
          acc[clienteId] = {
            id: clienteId,
            customer: cuenta.customer,
            cuentas: [],
            totalAmount: 0,
            totalPaid: 0,
            totalToPay: 0
          }
        }
        acc[clienteId].cuentas.push(cuenta)
        acc[clienteId].totalAmount += parseFloat(cuenta.total)
        acc[clienteId].totalPaid += parseFloat(cuenta.paid)
        acc[clienteId].totalToPay += parseFloat(cuenta.toPay)
        return acc
      }, {})

      return Object.values(cuentasAgrupadas)
    },
    cuentasAgrupadasFiltradas() {
      return this.cuentasAgrupadasPorCliente.filter(cuenta => {
        const nombreCoincide = !this.busquedaCliente || 
          cuenta.customer.name.toLowerCase().includes(this.busquedaCliente.toLowerCase());
        const estadoCoincide = !this.filtroEstado || 
          this.obtenerEstadoCuenta(cuenta) === this.filtroEstado;
        return nombreCoincide && estadoCoincide;
      });
    },
    cuentasAgrupadasPaginadas() {
      const inicio = (this.paginaActualCuentas - 1) * this.cuentasPorPagina;
      const fin = inicio + this.cuentasPorPagina;
      return this.cuentasAgrupadasFiltradas.slice(inicio, fin);
    },
  },

  watch: {
    busquedaCliente() {
      this.paginaActualCuentas = 1;
    },
    filtroEstado() {
      this.paginaActualCuentas = 1;
    },
  },

  mounted() {
    this.obtenerCuentasPorCobrar()
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

    obtenerEstadoCuenta(cuenta) {
      if (parseFloat(cuenta.totalToPay) === 0) {
        return 'Pagada'
      } else {
        return 'Pendiente'
      }
    },

    obtenerColorEstado(cuenta) {
      const estado = this.obtenerEstadoCuenta(cuenta)
      switch (estado) {
        case 'Pagada':
          return 'is-success'
        case 'Pendiente':
          return 'is-danger'
        default:
          return 'is-info'
      }
    },

    async obtenerCuentasPorCobrar() {
      this.cargando.cuentas = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: `accountsholdings?page=${this.paginaActualCuentas}&limit=${this.cuentasPorPagina}`
        })
        
        if (response?.data) {
          this.cuentasPorCobrar = response.data.data || []
          this.cuentasPaginacion = {
            total: response.data.total,
            currentPage: response.data.page,
            perPage: response.data.limit,
            totalPages: response.data.totalPages
          }
        }
      } catch (error) {
        console.error('Error al cargar cuentas por cobrar:', error)
        this.mostrarError('Error al cargar las cuentas por cobrar')
      } finally {
        this.cargando.cuentas = false
      }
    },

    seleccionarCliente(cliente) {
      this.clienteSeleccionado = cliente
      this.cuentaSeleccionada = null
      this.nuevoPago.customerId = cliente ? cliente.id : ''
    },

    async crearPago() {
      // Resetear errores
      this.errores = {
        amount: '',
      }

      // Validaciones básicas
      if (!this.nuevoPago.amount || this.nuevoPago.amount <= 0) {
        this.errores.amount = 'El monto debe ser mayor a 0'
        return
      }

      if (!this.cuentaSeleccionada) {
        this.mostrarError('Por favor, seleccione una cuenta por cobrar')
        return
      }

      this.cargando.creando = true
      try {
        await apiRequest({
          method: 'POST',
          path: 'payments',
          data: {
            amount: this.nuevoPago.amount,
            accountHoldingId: this.cuentaSeleccionada.id,
            customerId: this.clienteSeleccionado.id,
            date: new Date().toISOString()
          }
        })

        // Limpiar formulario
        this.nuevoPago.amount = ''
        this.nombreCliente = ''
        this.clienteSeleccionado = null
        this.cuentaSeleccionada = null

        // Mostrar mensaje de éxito
        this.$buefy.toast.open({
          message: 'Pago registrado exitosamente',
          type: 'is-success'
        })

        // Recargar lista de pagos y cuentas por cobrar
        await this.obtenerCuentasPorCobrar()
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

