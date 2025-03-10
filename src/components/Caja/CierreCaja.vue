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
                                <span>{{ cajaAbierta ? 'Cerrar' : 'Abrir' }} Caja </span>
                            </span>
                        </h1>
                        <user-info :cargando="cargando" :userData="userData" />
                        <date-info :fecha="fecha" :hora="hora" />
                        <cash-input :cajaAbierta="cajaAbierta" @inputData="updateData" />
                        <action-btn :cajaAbierta="cajaAbierta" :isValidAmount="isValidAmount" :cargando="cargando"
                            :actionCash="handleCashAction" :isButtonDisabled="isButtonDisabled" />
                        <div class="notification is-info is-light mt-4">
                            <p class="has-text-centered">
                                <span class="icon">
                                    <i class="mdi mdi-information"></i>
                                </span>
                                Asegúrese de contar correctamente el efectivo antes de cerrar la caja.
                            </p>
                        </div>
                        <confir-modal :cashInHand="cashInHand" :cargando="cargando"
                            :showConfirmModal.sync="showConfirmModal" @confirmar-cierre="confirmarCierreCaja" />
                        <cierre-info v-if="cierreInfo" :cierreInfo="cierreInfo" />
                    </div>
                </div>
            </div>
    </section>
</template>

<script>
import UserInfo from './UserInfo.vue';
import DateInfo from './DateInfo.vue';
import CashInput from './CashInput.vue';
import CierreInfo from './CierreInfo.vue';
import ActionBtn from './ActionBtn.vue';
import ConfirModal from './ConfirModal.vue';
import AyudanteSesion from '@/Servicios/AyudanteSesion';
import apiRequest from '@/Servicios/HttpService';
export default {
    components: {
        UserInfo,
        DateInfo,
        CashInput,
        ActionBtn,
        ConfirModal,
        CierreInfo
    },
    data() {
        return {
            cargando: false,
            cajaAbierta: false,
            cashInHand: null,
            disableBtn: false,
            userData: {
                id: '',
                name: '',
                username: '',
                phone: ''
            },
            fecha: this.getFormattedDate(),
            hora: this.getFormattedTime(),
            totalVentasHoy: 0,
            totalCuentasPorPagar: 0,
            showConfirmModal: false,
            cierreInfo: null,
            date: this.formatDateToYYYYMMDD()
        };
    },

    mounted() {
        this.dataUser();
        this.formatDateToYYYYMMDD();
        this.obtenerTotalVentasHoy();
        this.obtenerTotalCuentasPorPagar();
        this.validCashRegister();
        setInterval(this.actualizarFecha, 60000);
    },
    computed: {
        isValidAmount() {
            return this.cashInHand !== null &&
                this.cashInHand >= 0 &&
                !isNaN(this.cashInHand)
        },
        isButtonDisabled() {
            return this.disableBtn || !this.isValidAmount || this.cargando;
        }
    },

    methods: {
        mostrarError(mensaje) {
        this.$buefy.toast.open({
          message: mensaje,
          type: 'is-danger',
          duration: 5000
        });
      },

        formatDateToYYYYMMDD() {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

      async validCashRegister() {
            const sesion = AyudanteSesion.obtenerDatosSesion();
            if (!sesion) {
                throw new Error('ID de usuario no encontrado');
            }
            const {data, status} = await apiRequest({
                method: 'GET',
                path: `cash-register/details/${sesion.id}/${this.date}`
            })

            console.log(data)

            if (status == 200) {
                data.length > 0 ? this.cajaAbierta = true : this.cajaAbierta = false
                const hasClosedState = data.some(item => item.state === 'closed');
                hasClosedState ? this.disableBtn = true : this.disableBtn = false

            }

        },
        updateData(newData) {
            this.cashInHand = newData;
        },
        getFormattedDate() {
            const today = new Date();
            return today.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        },
        getFormattedTime() {
            const now = new Date();
            return now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        },
        handleCashAction() {
            if (this.cajaAbierta) {
                this.showConfirmModal = true;
            } else {
                this.abrirCaja();
            }
        },
        async dataUser() {
            this.cargando = true;
            try {
                const sesion = AyudanteSesion.obtenerDatosSesion();
                if (!sesion) {
                    throw new Error('ID de usuario no encontrado');
                }
                const { data, status } = await apiRequest({
                    method: 'GET',
                    path: `users/${sesion.id}`
                })
                if (status === 200) {
                    this.userData = {
                        name: data.name ?? '-',
                        username: data.username ?? '-',
                        phone: data.phone || '-'
                    };
                } else {
                    this.mostrarError('Error al cargar datos del usuario');
                }
            } catch (error) {
                this.mostrarError('Error al cargar datos del usuario');
                this.userData = { name: '-', username: '-', phone: '-' };
            } finally {
                this.cargando = false;
            }
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

                const { status } = await apiRequest({
                    method: 'POST',
                    path: `cash-register/open/${userId}`,
                    data: {
                        initialCash: this.cashInHand
                    }
                });

                if (status === 201) {
                    this.$buefy.toast.open({
                        message: 'Caja abierta exitosamente',
                        type: 'is-success',
                        duration: 5000
                    });
                    this.cajaAbierta = true;

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

        async confirmarCierre() {
            this.cargando = true
            try {
                const { id: userId } = AyudanteSesion.obtenerDatosSesion()

                if (!userId) {
                    throw new Error('ID de usuario no encontrado')
                }
                const { status, data } = await apiRequest({
                    method: 'POST',
                    path: `cash-register/close/${userId}`,
                    data: {
                        cashInHand: Number(this.cashInHand)
                    }
                })

                if (status === 201) {
                    this.cierreInfo = data
                    this.$buefy.toast.open({
                        message: 'Caja cerrada exitosamente',
                        type: 'is-success',
                        duration: 5000
                    })
                    this.cashInHand = null
                    this.showConfirmModal = false
                    // this.cajaAbierta = false
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
        confirmarCierreCaja() {
            this.confirmarCierre();
        },
        async obtenerTotalVentasHoy() {
            try {
                const { data } = await apiRequest({
                    method: 'GET',
                    path: 'sales/today-income'
                });
                this.totalVentasHoy = data ?? 0

            } catch (error) {
                console.error('Error al obtener el total de ventas de hoy:', error);
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
                const { data } = await apiRequest({
                    method: 'GET',
                    path: 'sales/pending-income'
                });
                this.totalCuentasPorPagar = data ?? 0

            } catch (error) {
                console.error('Error al obtener el total de cuentas por pagar:', error);
                if (error.response?.status === 404) {
                    console.warn('El endpoint de cuentas por pagar no está disponible');
                } else {
                    this.mostrarError('No se pudo cargar el total de cuentas por pagar');
                }
                this.totalCuentasPorPagar = 0;
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