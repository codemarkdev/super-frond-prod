<template>
  <div class="employees-management">
    <!-- Tabs de navegación -->
    <div class="tabs is-boxed mb-4">
      <ul>
        
        <li :class="{ 'is-active': activeTab === 'nuevo' }">
          <a @click="activeTab = 'nuevo'">
            <span class="icon is-small"><b-icon icon="account-plus"></b-icon></span>
            <span>Registrar Nuevo Empleado</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'pago' }">
          <a @click="activeTab = 'pago'">
            <span class="icon is-small"><b-icon icon="cash"></b-icon></span>
            <span>Registrar Pago</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'historial' }">
          <a @click="activeTab = 'historial'">
            <span class="icon is-small"><b-icon icon="cash-multiple"></b-icon></span>
            <span>Historial de Pagos</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'lista' }">
          <a @click="activeTab = 'lista'">
            <span class="icon is-small"><b-icon icon="account-group"></b-icon></span>
            <span>Lista de Empleados</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- Tab: Lista de Empleados -->
    <div v-if="activeTab === 'lista'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="account-group" class="is-primary-icon"></b-icon>
          Lista de Empleados
        </p>
      </header>
      <div class="card-content">
        <b-table :data="empleadosPaginados"
                 :loading="cargando.lista"
                 :striped="true"
                 :hoverable="true">

          <b-table-column field="user.name" label="Nombre" v-slot="props">
            {{ props.row.user ? props.row.user.name : 'N/A' }}
          </b-table-column>

          <b-table-column field="position" label="Cargo" v-slot="props">
            {{ props.row.position }}
          </b-table-column>

          <b-table-column field="salary" label="Salario" numeric v-slot="props">
            ${{ formatNumber(props.row.salary) }}
          </b-table-column>

          <template #empty>
            <div class="has-text-centered">No hay empleados registrados</div>
          </template>
        </b-table>

        <b-pagination
          v-model="paginaActual"
          :total="empleados.length"
          :per-page="porPagina"
          :range-before="3"
          :range-after="3"
          order="is-centered"
          aria-next-label="Página siguiente"
          aria-previous-label="Página anterior"
          aria-page-label="Página"
          aria-current-label="Página actual">
        </b-pagination>
      </div>
    </div>

    <!-- Tab: Registrar Nuevo Empleado -->
    <div v-if="activeTab === 'nuevo'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="account-plus" class="is-primary-icon"></b-icon>
          Registrar Nuevo Empleado
        </p>
      </header>
      <div class="card-content">
        <form @submit.prevent="registrarEmpleado">
          <div class="field">
            <b-field label="Usuario">
              <b-select v-model="nuevoEmpleado.userId" 
                        placeholder="Seleccione un usuario"
                        expanded
                        required>
                <option v-for="usuario in usuarios" 
                        :key="usuario.id" 
                        :value="usuario.id">
                  {{ usuario.name }}
                </option>
              </b-select>
            </b-field>
          </div>

          <div class="field">
            <b-field label="Cargo"
                     :type="{ 'is-danger': errores.position }"
                     :message="errores.position">
              <b-input v-model="nuevoEmpleado.position"
                       placeholder="Ej: Desarrollador"
                       required>
              </b-input>
            </b-field>
          </div>

          <div class="field">
            <b-field label="Salario"
                     :type="{ 'is-danger': errores.salary }"
                     :message="errores.salary">
              <b-input v-model.number="nuevoEmpleado.salary"
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
              <b-button type="is-primary"
                        native-type="submit"
                        :loading="cargando.creando"
                        expanded>
                Registrar Empleado
              </b-button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Tab: Registrar Pago a Empleado -->
    <div v-if="activeTab === 'pago'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="cash" class="is-primary-icon"></b-icon>
          Registrar Pago a Empleado
        </p>
      </header>
      <div class="card-content">
        <form @submit.prevent="registrarPago">
          <div class="field">
            <b-field label="Empleado">
              <b-select v-model="nuevoPago.employeeId" 
                       placeholder="Seleccione un empleado"
                       expanded
                       required>
                <option v-for="empleado in empleados" 
                        :key="empleado.id" 
                        :value="empleado.id">
                  {{ empleado.user ? empleado.user.name : 'N/A' }} - {{ empleado.position }}
                </option>
              </b-select>
            </b-field>
        </div>

          <div class="field">
            <b-field label="Monto"
                     :type="{ 'is-danger': errores.amount_pago }"
                     :message="errores.amount_pago">
              <b-input v-model.number="nuevoPago.amount"
                       type="number"
                       step="0.01"
                       min="0"
                       placeholder="0.00"
                       required>
              </b-input>
            </b-field>
          </div>

          <div v-if="pagoRealizadoEsteMes" class="notification is-warning mb-4">
            Se ha alcanzado o superado el salario completo para este empleado en el mes actual.
          </div>
          <div class="field">
            <div class="control">
              <b-button type="is-primary"
                        native-type="submit"
                        :loading="cargando.pagando"
                        expanded>
                Registrar Pago
              </b-button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Tab: Historial de Pagos -->
    <div v-if="activeTab === 'historial'" class="card">
      <header class="card-header">
        <p class="card-header-title">
          <b-icon icon="cash-multiple" class="is-primary-icon"></b-icon>
          Historial de Pagos
        </p>
      </header>
      <div class="card-content">
        <div class="is-flex is-align-items-end" :style="{ gap: '1rem' }">
          <div class="control">
            <b-field label="Empleado">
              <b-select v-model="filtroPagos.employeeId" 
                       placeholder="Seleccione un empleado"
                       expanded>
                <option v-for="empleado in empleados" 
                        :key="empleado.id" 
                        :value="empleado.id">
                  {{ empleado.user ? empleado.user.name : 'N/A' }} - {{ empleado.position }}
                </option>
              </b-select>
            </b-field>
          </div>

          <div class="control">
            <b-field label="Mes">
              <b-select v-model="filtroPagos.month" expanded>
                <option value="">Todos los meses</option>
                <option v-for="(mes, index) in [
                  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ]" :key="index" :value="index + 1">
                  {{ mes }}
                </option>
              </b-select>
            </b-field>
          </div>

          <div class="control">
            <b-field label="Año">
              <b-input v-model="filtroPagos.year" 
                       type="number" 
                       min="2000"
                       :max="new Date().getFullYear() + 1">
              </b-input>
            </b-field>
          </div>

          <b-button type="is-primary"
                    @click="consultarPagos"
                    :loading="cargandoPagos">
            Consultar
          </b-button>
        </div>

        <div v-if="historialPagos.payments.length > 0" class="mb-4">
          <div class="notification is-info">
            <strong>Total de pagos:</strong> ${{ formatNumber(historialPagos.totalPayments) }}
          </div>

          <b-table :data="pagosPaginados"
                   :loading="cargandoPagos"
                   :striped="true"
                   :hoverable="true">
            
            <b-table-column field="id" label="ID" v-slot="props">
              {{ props.row.id }}
            </b-table-column>

            <b-table-column field="amount" label="Monto" numeric v-slot="props">
              ${{ formatNumber(props.row.amount) }}
            </b-table-column>

            <b-table-column field="paymentDate" label="Fecha" v-slot="props">
              {{ formatDate(props.row.paymentDate) }}
            </b-table-column>

            <template #empty>
              <div class="has-text-centered">No hay pagos registrados</div>
            </template>
          </b-table>

          <b-pagination
            v-model="paginaActualPagos"
            :total="historialPagos.payments.length"
            :per-page="pagosPorPagina"
            :range-before="3"
            :range-after="3"
            order="is-centered"
            aria-next-label="Página siguiente"
            aria-previous-label="Página anterior"
            aria-page-label="Página"
            aria-current-label="Página actual">
          </b-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService'

export default {
  name: 'GestionEmpleados',

  data() {
    return {
      activeTab: 'lista', // Tab activo por defecto
      empleados: [],
      usuarios: [],
      nuevoEmpleado: {
        userId: '',
        position: '',
        salary: null
      },
      nuevoPago: {
        employeeId: '',
        amount: null
      },
      cargando: {
        lista: false,
        creando: false,
        pagando: false
      },
      errores: {
        position: '',
        salary: '',
        amount_pago: ''
      },
      paginaActual: 1,
      porPagina: 5,
      historialPagos: {
        payments: [],
        totalPayments: 0
      },
      filtroPagos: {
        employeeId: '',
        month: '',
        year: new Date().getFullYear()
      },
      cargandoPagos: false,
      paginaActualPagos: 1,
      pagosPorPagina: 5,
    }
  },

  computed: {
    empleadosPaginados() {
      const inicio = (this.paginaActual - 1) * this.porPagina
      const fin = inicio + this.porPagina
      return this.empleados.slice(inicio, fin)
    },
    pagosPaginados() {
      const inicio = (this.paginaActualPagos - 1) * this.pagosPorPagina;
      const fin = inicio + this.pagosPorPagina;
      return this.historialPagos.payments.slice(inicio, fin);
    },
    pagoRealizadoEsteMes() {
      if (!this.nuevoPago.employeeId || !this.historialPagos.payments.length) return false;
      const empleadoSeleccionado = this.empleados.find(emp => emp.id === this.nuevoPago.employeeId);
      if (!empleadoSeleccionado) return false;

      const hoy = new Date();
      const mesActual = hoy.getMonth() + 1;
      const anioActual = hoy.getFullYear();
      
      const pagosMesActual = this.historialPagos.payments.filter(pago => {
        const fechaPago = new Date(pago.paymentDate);
        return fechaPago.getMonth() + 1 === mesActual && fechaPago.getFullYear() === anioActual;
      });

      const totalPagadoMesActual = pagosMesActual.reduce((total, pago) => total + parseFloat(pago.amount), 0);
      
      return totalPagadoMesActual >= empleadoSeleccionado.salary;
    }
  },

  mounted() {
    this.cargarEmpleados()
    this.cargarUsuarios()
  },

  watch: {
    'nuevoPago.employeeId': function(newVal) {
      if (newVal) {
        this.filtroPagos.employeeId = newVal;
        this.consultarPagos();
      }
    },
    // Añadimos un watcher para el cambio de tab
    activeTab: function(newTab) {
      // Si cambiamos al tab de historial y hay un empleado seleccionado, consultamos sus pagos
      if (newTab === 'historial' && this.filtroPagos.employeeId) {
        this.consultarPagos();
      }
      // Si cambiamos al tab de lista, nos aseguramos de tener la lista actualizada
      if (newTab === 'lista') {
        this.cargarEmpleados();
      }
    }
  },

  methods: {
    formatNumber(value) {
      if (value === null || value === undefined) return '0.00'
      const num = typeof value === 'string' ? parseFloat(value) : Number(value)
      return isNaN(num) ? '0.00' : num.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    async cargarEmpleados() {
      this.cargando.lista = true
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'employees'
        })
        
        if (response?.data) {
          this.empleados = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('Error al cargar empleados:', error)
        this.mostrarError('Error al cargar la lista de empleados')
      } finally {
        this.cargando.lista = false
      }
    },

    async cargarUsuarios() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'users'
        })
        
        if (response?.data) {
          this.usuarios = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error)
        this.mostrarError('Error al cargar la lista de usuarios')
      }
    },

    async registrarEmpleado() {
      // Resetear errores
      this.errores = {
        position: '',
        salary: ''
      }

      // Validaciones básicas
      if (!this.nuevoEmpleado.position.trim()) {
        this.errores.position = 'El cargo es requerido'
        return
      }

      if (!this.nuevoEmpleado.salary || this.nuevoEmpleado.salary <= 0) {
        this.errores.salary = 'El salario debe ser mayor a 0'
        return
      }

      this.cargando.creando = true
      try {
        await apiRequest({
          method: 'POST',
          path: 'employees',
          data: this.nuevoEmpleado
        })

        // Limpiar formulario
        this.nuevoEmpleado = {
          userId: '',
          position: '',
          salary: null
        }

        // Mostrar mensaje de éxito
        this.$buefy.toast.open({
          message: 'Empleado registrado exitosamente',
          type: 'is-success'
        })

        // Recargar lista de empleados
        await this.cargarEmpleados()
        
        // Cambiar al tab de lista para mostrar el nuevo empleado
        this.activeTab = 'lista'
      } catch (error) {
        console.error('Error al registrar empleado:', error)
        
        if (error.response?.status === 400) {
          this.mostrarError('Datos inválidos. Por favor, verifique la información')
        } else {
          this.mostrarError('Error al registrar el empleado')
        }
      } finally {
        this.cargando.creando = false
      }
    },

    async registrarPago() {
      // Resetear errores
      this.errores.amount_pago = ''

      // Validaciones básicas
      if (!this.nuevoPago.amount || this.nuevoPago.amount <= 0) {
        this.errores.amount_pago = 'El monto debe ser mayor a 0'
        return
      }

      // Obtener el empleado seleccionado
      const empleadoSeleccionado = this.empleados.find(emp => emp.id === this.nuevoPago.employeeId)
      if (!empleadoSeleccionado) {
        this.errores.amount_pago = 'Empleado no encontrado'
        return
      }

      // Calcular el total de pagos del mes actual
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const anioActual = fechaActual.getFullYear();
      
      const pagosMesActual = this.historialPagos.payments.filter(pago => {
        const fechaPago = new Date(pago.paymentDate);
        return fechaPago.getMonth() + 1 === mesActual && fechaPago.getFullYear() === anioActual;
      });

      const totalPagadoMesActual = pagosMesActual.reduce((total, pago) => total + parseFloat(pago.amount), 0);
      const nuevoTotalPagado = totalPagadoMesActual + parseFloat(this.nuevoPago.amount);

      // Verificar si el nuevo pago excede el salario mensual
      if (nuevoTotalPagado > empleadoSeleccionado.salary) {
        this.errores.amount_pago = `El pago total del mes no puede superar el salario de $${empleadoSeleccionado.salary}. Actualmente ya ha recibido $${totalPagadoMesActual}.`
        return
      }

      this.cargando.pagando = true
      try {
        await apiRequest({
          method: 'POST',
          path: 'employee-payments',
          data: this.nuevoPago
        })

        // Limpiar formulario
        this.nuevoPago = {
          employeeId: '',
          amount: null
        }

        // Mostrar mensaje de éxito
        this.$buefy.toast.open({
          message: 'Pago registrado exitosamente',
          type: 'is-success'
        })

        // Recargar lista de empleados para actualizar datos
        await this.cargarEmpleados()
        // Actualizar el historial de pagos
        await this.consultarPagos()
        
        // Cambiar al tab de historial para mostrar el nuevo pago
        this.activeTab = 'historial'
      } catch (error) {
        console.error('Error al registrar pago:', error)
        
        if (error.response?.status === 400) {
          this.errores.amount_pago = error.response.data.message || 'El pago no puede ser mayor al salario restante del mes'
        } else if (error.response?.status === 404) {
          this.mostrarError('Empleado no encontrado')
        } else {
          this.mostrarError('Error al registrar el pago')
        }
      } finally {
        this.cargando.pagando = false
      }
    },
    
    async consultarPagos() {
      if (!this.filtroPagos.employeeId) {
        this.mostrarError('Seleccione un empleado');
        return;
      }

      this.cargandoPagos = true;
      try {
        let url = `employee-payments/${this.filtroPagos.employeeId}`;
        const queryParams = [];
        
        if (this.filtroPagos.month) {
          queryParams.push(`month=${this.filtroPagos.month}`);
        }
        if (this.filtroPagos.year) {
          queryParams.push(`year=${this.filtroPagos.year}`);
        }
        
        if (queryParams.length > 0) {
          url += `?${queryParams.join('&')}`;
        }

        const response = await apiRequest({
          method: 'GET',
          path: url
        });
        
        this.historialPagos = response?.data || { payments: [], totalPayments: 0 };
      } catch (error) {
        console.error('Error al consultar pagos:', error);
        if (error.response?.status === 404) {
          this.mostrarError('Empleado no encontrado');
        } else {
          this.mostrarError('Error al consultar los pagos');
        }
        this.historialPagos = { payments: [], totalPayments: 0 };
      } finally {
        this.cargandoPagos = false;
      }
    },

    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: 'is-danger',
        duration: 5000
      })
    },
    
    actualizarHistorialPagosEmpleadoSeleccionado() {
      if (this.nuevoPago.employeeId) {
        this.consultarPagos();
      }
    },
  }
}
</script>

<style scoped>
.employees-management {
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

.tabs {
  margin-bottom: 1.5rem;
}
</style>