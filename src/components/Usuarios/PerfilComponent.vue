<template>
  <section class="section">
    <div class="container">
      <div class="card">
        <div class="card-content">
          <h1 class="title has-text-centered">
            <span class="icon-text">
              <span class="icon">
                <i class="mdi mdi-cash-register"></i>
              </span>
              <span>Cierre de Caja</span>
            </span>
          </h1>
          
          <div class="box has-background-light">
            <div class="columns is-multiline">
              <div class="column is-full">
                <div class="level">
                  <div class="level-left">
                    <div class="level-item">
                      <div class="user-info" v-if="!cargando">
                        <div class="columns is-mobile is-multiline">
                          <div class="column is-full">
                            <p class="title is-4">
                              <span class="icon-text">
                                <span class="icon">
                                  <i class="mdi mdi-account-circle"></i>
                                </span>
                                <span>{{ userData.name }}</span>
                              </span>
                            </p>
                          </div>
                          <div class="column is-half">
                            <p class="subtitle is-6">
                              <span class="icon-text">
                                <span class="icon">
                                  <i class="mdi mdi-at"></i>
                                </span>
                                <span>{{ userData.username }}</span>
                              </span>
                            </p>
                          </div>
                          <div class="column is-half">
                            <p class="subtitle is-6">
                              <span class="icon-text">
                                <span class="icon">
                                  <i class="mdi mdi-phone"></i>
                                </span>
                                <span>{{ userData.phone }}</span>
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <p v-else class="is-loading">Cargando datos del usuario...</p>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="column is-full mt-3">
                <div class="date-info">
                  <p class="is-6">
                    <span class="icon-text">
                      <span class="icon">
                        <i class="mdi mdi-calendar"></i>
                      </span>
                      <span class="has-text-weight-bold">{{ fechaActual.fecha }}</span>
                    </span>
                  </p>
                  <p class="is-6">
                    <span class="icon-text">
                      <span class="icon">
                        <i class="mdi mdi-clock-outline"></i>
                      </span>
                      <span>{{ fechaActual.hora }}</span>
                    </span>
                  </p>
                </div>
              </div>
  
        
  
              <div class="column is-full">
                <div class="field">
                  <label class="label">{{ cajaAbierta ? 'Efectivo en Mano' : 'Monto Inicial' }}</label>
                  <div class="control has-icons-left has-icons-right">
                    <input 
                      class="input is-medium"
                      :class="{ 'is-danger': !isValidAmount && cashInHand !== null }"
                      type="number" 
                      v-model.number="cashInHand"
                      placeholder="Ingrese el monto en efectivo"
                      min="0"
                      step="0.01"
                    >
                    <span class="icon is-small is-left">
                      <i class="mdi mdi-cash"></i>
                    </span>
                    <span class="icon is-small is-right" v-if="isValidAmount">
                      <i class="mdi mdi-check"></i>
                    </span>
                  </div>
                  <p class="help is-danger" v-if="!isValidAmount && cashInHand !== null">
                    Por favor, ingrese un monto válido
                  </p>
                </div>
              </div>
              
              <div class="column is-full">
                <div class="field">
                  <div class="control">
                    <button 
                      v-if="!cajaAbierta"
                      class="button is-primary is-fullwidth is-medium"
                      :class="{ 'is-loading': cargando }"
                      @click="abrirCaja"
                      :disabled="!isValidAmount || cargando"
                    >
                      <span class="icon">
                        <i class="mdi mdi-cash-register"></i>
                      </span>
                      <span>Abrir Caja</span>
                    </button>
                    <button 
                      v-else
                      class="button is-danger is-fullwidth is-medium"
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
            </div>
          </div>
  
          <div class="notification is-info is-light mt-4">
            <p class="has-text-centered">
              <span class="icon">
                <i class="mdi mdi-information"></i>
              </span>
              Asegúrese de contar correctamente el efectivo antes de cerrar la caja.
            </p>
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
          <header class="modal-card-head has-background-primary">
            <p class="modal-card-title has-text-white">Confirmar Cierre de Caja</p>
          </header>
          <section class="modal-card-body">
            <div class="content">
              <h3>Resumen del Cierre:</h3>
              <p><strong>Efectivo en Mano:</strong> {{ formatNumber(cashInHand) }}</p>
              <p class="has-text-danger has-text-weight-bold">Esta acción no se puede deshacer.</p>
            </div>
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
              <div class="column is-half">
                <p><strong>Total Pagos:</strong> {{ formatNumber(cierreInfo.totalPayments) }}</p>
              </div>
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
    </div>
  </section>
  </template>
  
  <script>
  import HttpService from '@/Servicios/HttpService'
  import AyudanteSesion from '@/Servicios/AyudanteSesion'
  
  export default {
    name: "PerfilComponent",
  
    data() {
      return {
        cashInHand: null,
        cargando: false,
        showConfirmModal: false,
        cierreInfo: null,
        userData: {
          username: '',
          name: '',
          phone: ''
        },
        fechaActual: {
          fecha: '',
          hora: ''
        },
        totalVentasHoy: 0,
        totalCuentasPorPagar: 0,
        cajaAbierta: false,
      }
    },
  
    computed: {
      isValidAmount() {
        return this.cashInHand !== null && 
               this.cashInHand >= 0 && 
               !isNaN(this.cashInHand)
      }
    },
  
    mounted() {
      this.cargarDatosUsuario();
      this.actualizarFecha();
      this.obtenerTotalVentasHoy();
      this.obtenerTotalCuentasPorPagar();
      setInterval(this.actualizarFecha, 60000); // Actualizar cada minuto
    },
  
    methods: {
      formatNumber(value) {
        if (value === null || value === undefined) return '0.00'
        return Number(value).toLocaleString('es-MX', {
          style: 'currency',
          currency: 'MXN'
        })
      },
  
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-MX', options);
      },
  
      async cargarDatosUsuario() {
        this.cargando = true;
        try {
          const sesion = AyudanteSesion.obtenerDatosSesion();
          if (!sesion || !sesion.id) {
            throw new Error('ID de usuario no encontrado');
          }
  
          const response = await HttpService({
            method: 'GET',
            path: `users/${sesion.id}`
          });
  
          if (response.status === 200) {
            const userData = response.data;
            this.userData = {
              name: userData.name || 'N/A',
              username: userData.username || 'N/A',
              phone: userData.phone || 'N/A'
            };
          } else {
            throw new Error('Error al obtener datos del usuario');
          }
        } catch (error) {
          console.error('Error al cargar datos del usuario:', error);
          this.mostrarError('Error al cargar datos del usuario');
          this.userData = { name: 'N/A', username: 'N/A', phone: 'N/A' };
        } finally {
          this.cargando = false;
        }
      },
  
      actualizarFecha() {
        const ahora = new Date();
        this.fechaActual.fecha = ahora.toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        });
        this.fechaActual.hora = ahora.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit'
        });
      },
  
      async obtenerTotalVentasHoy() {
        try {
          const response = await HttpService({
            method: 'GET',
            path: 'sales/today-total'
          });
          if (response.status === 200 && response.data && typeof response.data.total === 'number') {
            this.totalVentasHoy = response.data.total;
          } else {
            console.warn('Respuesta inesperada al obtener el total de ventas:', response);
            this.totalVentasHoy = 0;
          }
        } catch (error) {
          console.error('Error al obtener el total de ventas de hoy:', error);
          // Mostrar mensaje más amigable cuando el endpoint no existe
          if (error.response?.status === 404) {
            console.warn('El endpoint de ventas no está disponible');
          } else {
            this.mostrarError('No se pudo cargar el total de ventas de hoy');
          }
          this.totalVentasHoy = 0;
        }
      },
  
      async obtenerTotalCuentasPorPagar() {
        try {
          const response = await HttpService({
            method: 'GET',
            path: 'accounts-payable/total'
          });
          if (response.status === 200 && response.data && typeof response.data.total === 'number') {
            this.totalCuentasPorPagar = response.data.total;
          } else {
            console.warn('Respuesta inesperada al obtener el total de cuentas por pagar:', response);
            this.totalCuentasPorPagar = 0;
          }
        } catch (error) {
          console.error('Error al obtener el total de cuentas por pagar:', error);
          // Mostrar mensaje más amigable cuando el endpoint no existe
          if (error.response?.status === 404) {
            console.warn('El endpoint de cuentas por pagar no está disponible');
          } else {
            this.mostrarError('No se pudo cargar el total de cuentas por pagar');
          }
          this.totalCuentasPorPagar = 0;
        }
      },
  
      cerrarCaja() {
        if (!this.cajaAbierta) {
          this.$buefy.toast.open({
            message: 'La caja no está abierta',
            type: 'is-warning'
          });
          return;
        }
        if (!this.isValidAmount) {
          this.$buefy.toast.open({
            message: 'Por favor ingrese un monto válido',
            type: 'is-warning'
          });
          return;
        }
        this.showConfirmModal = true;
      },
  
      async confirmarCierre() {
        this.cargando = true
        try {
          const { id: userId } = AyudanteSesion.obtenerDatosSesion()
          
          if (!userId) {
            throw new Error('ID de usuario no encontrado')
          }
  
          const response = await HttpService({
            method: 'POST',
            path: `cash-register/close/${userId}`,
            data: {
              cashInHand: Number(this.cashInHand)
            }
          })
  
          if (response.status === 201) {
            this.cierreInfo = response.data
            this.$buefy.toast.open({
              message: 'Caja cerrada exitosamente',
              type: 'is-success',
              duration: 5000
            })
            this.cashInHand = null
            this.showConfirmModal = false
            this.cajaAbierta = false
          } else {
            throw new Error('Error al cerrar la caja')
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
      },
  
      mostrarError(mensaje) {
        this.$buefy.toast.open({
          message: mensaje,
          type: 'is-danger',
          duration: 5000
        });
      },
  
      async abrirCaja() {
        if (!this.isValidAmount) {
          this.mostrarError('Por favor ingrese un monto válido');
          return;
        }
  
        this.cargando = true;
        try {
          const { id: userId } = AyudanteSesion.obtenerDatosSesion();
          
          if (!userId) {
            throw new Error('ID de usuario no encontrado');
          }
  
          const response = await HttpService({
            method: 'POST',
            path: `cash-register/open/${userId}`,
            data: {
              initialCash: this.cashInHand
            }
          });
  
          if (response.status === 201) {
            this.$buefy.toast.open({
              message: 'Caja abierta exitosamente',
              type: 'is-success',
              duration: 5000
            });
            this.cajaAbierta = true;
            
            // Intentar obtener los totales, pero no bloquear si fallan
            try {
              await Promise.all([
                this.obtenerTotalVentasHoy(),
                this.obtenerTotalCuentasPorPagar()
              ]);
            } catch (error) {
              console.warn('No se pudieron actualizar los totales:', error);
            }
          } else {
            throw new Error('Error al abrir la caja');
          }
        } catch (error) {
          console.error('Error al abrir la caja:', error);
          this.mostrarError(error.response?.data?.message || 'Error al abrir la caja. Por favor intente nuevamente.');
        } finally {
          this.cargando = false;
          this.cashInHand = null;
        }
      },
    }
  }
  </script>
  
  <style scoped>
  .card {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02);
  }
  
  .card-content {
    padding: 2rem;
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
  
  .notification {
    margin-top: 1.5rem;
  }
  
  .user-info {
    text-align: left;
  }
  
  .date-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .date-info p {
    margin-bottom: 0;
  }
  
  .icon-text .icon {
    margin-right: 0.5rem;
  }
  
  @media screen and (max-width: 768px) {
    .card-content {
      padding: 1.5rem;
    }
  
    .level-left,
    .level-right {
      flex-basis: 100%;
    }
  
    .date-info {
      text-align: left;
      margin-top: 1rem;
    }
  }
  
  .mt-2 {
    margin-top: 0.5rem;
  }
  
  .mt-3 {
    margin-top: 0.75rem;
  }
  
  .mt-6 {
    margin-top: 1.5rem;
  }
  
  .is-loading {
    color: #7a7a7a;
    font-style: italic;
  }
  
  .user-info .icon-text {
    align-items: center;
  }
  
  .user-info .icon-text .icon {
    margin-right: 0.5rem;
  }
  
  .user-info .title,
  .user-info .subtitle {
    margin-bottom: 0.5rem;
  }
  </style>
  
  