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
                            <span>Cerrar Caja</span>
                        </span>
                    </h1>
                    <user-info :cargando="cargando" :userData="userData" />
                    <date-info :fecha="fecha" :hora="hora" />
                    
                    <!-- Alerta para usuarios administradores -->
                    <div v-if="esAdmin" class="notification is-warning mt-4">
                        <p class="has-text-centered has-text-weight-bold">
                            <span class="icon">
                                <i class="mdi mdi-alert"></i>
                            </span>
                            El usuario admin NO CIERRA CAJAS
                        </p>
                    </div>
                    
                    <!-- Resumen de ventas del turno actual (solo visible cuando la caja está abierta y no es admin) -->
                    <div class="card mt-4 mb-4" v-if="cajaAbierta && !esAdmin">
                        <header class="card-header">
                            <p class="card-header-title">
                                Resumen del Turno Actual
                            </p>
                        </header>
                        <div class="card-content">
                            <div class="content">
                                <div class="columns is-multiline">
                                    <div class="column is-full">
                                        <div class="box p-3">
                                            <div class="columns is-mobile">
                                                <div class="column is-8">
                                                    <p>
                                                        <span class="icon">
                                                            <i class="mdi mdi-cart"></i>
                                                        </span>
                                                        <span>Ventas de {{ userData.name }} en este turno:</span>
                                                    </p>
                                                </div>
                                                <div class="column is-4 has-text-right">
                                                    <p class="has-text-weight-bold">{{ formatNumber(totalVentasHoy) }}</p>
                                                </div>
                                            </div>
                                            
                                            <div class="is-divider" style="margin: 0.5rem 0;"></div>
                                            
                                            <div class="columns is-mobile">
                                                <div class="column is-8">
                                                    <p class="has-text-weight-bold">
                                                        <span class="icon">
                                                            <i class="mdi mdi-cash-register"></i>
                                                        </span>
                                                        <span>EFECTIVO ESPERADO EN CAJA:</span>
                                                    </p>
                                                </div>
                                                <div class="column is-4 has-text-right">
                                                    <p class="has-text-weight-bold is-size-5">{{ formatNumber(totalVentasHoy) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="notification is-info is-light mt-2">
                                    <p class="has-text-centered">
                                        <span class="icon">
                                            <i class="mdi mdi-information"></i>
                                        </span>
                                        Este es el primer cierre del día. El efectivo esperado corresponde a las ventas realizadas por {{ userData.name }} en su turno.
                                        <br>
                                        <strong>Debe ingresar exactamente {{ formatNumber(totalVentasHoy) }} para evitar discrepancias.</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Solo mostrar los campos de entrada y botones si no es admin -->
                    <template v-if="!esAdmin">
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
                    </template>
                    
                    <!-- Si es admin, mostrar botón para volver -->
                    <div v-else class="mt-4">
                        <button class="button is-fullwidth is-primary" @click="volverAtras">
                            <span class="icon">
                                <i class="mdi mdi-arrow-left"></i>
                            </span>
                            <span>Volver</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <confir-modal 
            :cashInHand="cashInHand" 
            :cargando="cargando"
            :showConfirmModal.sync="showConfirmModal" 
            :ventasTurno="totalVentasHoy"
            :efectivoEsperado="totalVentasHoy"
            @confirmar-cierre="confirmarCierreCaja" 
        />
        <cierre-info 
            v-if="cierreInfo" 
            :cierreInfo.sync="cierreInfo" 
            :userData="userData"
            :hayTurnoPrevio="false"
            :esTurnoPrevioMismoUsuario="false"
            :turnoPrevioInfo="{}"
            :ventasTurno="totalVentasHoy"
        />
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
            cajaAbierta: true, // Always set to true since we only want to close the register
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
            date: this.formatDateToYYYYMMDD(),
            esAdmin: false // Nueva propiedad para verificar si el usuario es administrador
        };
    },

    mounted() {
        this.dataUser();
        this.formatDateToYYYYMMDD();
        this.obtenerTotalVentasHoy();
        this.validCashRegister();
        setInterval(this.actualizarFecha, 60000);
        
        // Verificar si el usuario es administrador
        const sesion = AyudanteSesion.obtenerDatosSesion();
        this.esAdmin = sesion && sesion.rol === 'Admin';
        
        // Si es admin, mostrar alerta
        if (this.esAdmin) {
            this.$buefy.toast.open({
                message: 'El usuario admin NO CIERRA CAJAS',
                type: 'is-warning',
                duration: 5000,
                position: 'is-top'
            });
        }
    },
    computed: {
        isValidAmount() {
            return this.cashInHand !== null &&
                this.cashInHand >= 0 &&
                !isNaN(this.cashInHand)
        },
        isButtonDisabled() {
            return this.disableBtn || !this.isValidAmount || this.cargando || this.esAdmin;
        }
    },

    methods: {
        formatNumber(value) {
            if (value === null || value === undefined) return '-';
            return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
        },
        
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
                // Always set cajaAbierta to true since we only want to close the register
                this.cajaAbierta = true;
                const hasClosedState = data.some(item => item.state === 'closed');
                hasClosedState ? this.disableBtn = true : this.disableBtn = false;
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
        actualizarFecha() {
            this.fecha = this.getFormattedDate();
            this.hora = this.getFormattedTime();
        },
        handleCashAction() {
            // Si es admin, mostrar alerta y no permitir cerrar caja
            if (this.esAdmin) {
                this.$buefy.toast.open({
                    message: 'El usuario admin NO CIERRA CAJAS',
                    type: 'is-warning',
                    duration: 5000,
                    position: 'is-top'
                });
                return;
            }
            
            // Prevent multiple clicks
            if (this.cargando || this.showConfirmModal) return;
            
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
                
                // Guardar si el usuario es administrador
                this.esAdmin = sesion.rol === 'Admin';
                
                const { data, status } = await apiRequest({
                    method: 'GET',
                    path: `users/${sesion.id}`
                })
                if (status === 200) {
                    this.userData = {
                        id: sesion.id,
                        name: data.name ?? '-',
                        username: data.username ?? '-',
                        phone: data.phone || '-'
                    };
                } else {
                    this.mostrarError('Error al cargar datos del usuario');
                }
            } catch (error) {
                this.mostrarError('Error al cargar datos del usuario');
                this.userData = { id: '', name: '-', username: '-', phone: '-' };
            } finally {
                this.cargando = false;
            }
        },

        volverAtras() {
            this.$router.go(-1);
        },

        async confirmarCierre() {
            // Si es admin, no permitir cerrar caja
            if (this.esAdmin) {
                this.$buefy.toast.open({
                    message: 'El usuario admin NO CIERRA CAJAS',
                    type: 'is-warning',
                    duration: 5000,
                    position: 'is-top'
                });
                this.showConfirmModal = false;
                return;
            }
            
            // Prevent multiple submissions
            if (this.cargando) return;
            
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
                        cashInHand: Number(this.cashInHand), 
                        expectedCash: Number(this.totalVentasHoy), // Add this line to include the expected cash
                        state: "closed",
                        totalPayments: 0
                    }
                })

                if (status === 201) {
                    this.cierreInfo = data
                    this.$buefy.toast.open({
                        message: 'Caja cerrada exitosamente',
                        type: 'is-success',
                        duration: 5000
                    })
                    this.validCashRegister()
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
            // Si es admin, no permitir cerrar caja
            if (this.esAdmin) {
                this.$buefy.toast.open({
                    message: 'El usuario admin NO CIERRA CAJAS',
                    type: 'is-warning',
                    duration: 5000,
                    position: 'is-top'
                });
                this.showConfirmModal = false;
                return;
            }
            
            // Prevent multiple submissions
            if (this.cargando) return;
            this.confirmarCierre();
        },
        async obtenerTotalVentasHoy() {
            try {
                const sesion = AyudanteSesion.obtenerDatosSesion();
                if (!sesion) return;
                
                const userId = sesion.id;
                
                // Usar el endpoint para obtener las ventas específicas del usuario actual
                const response = await apiRequest({
                    method: 'GET',
                    path: `users/${userId}/today-income`
                }).catch(() => ({ data: null }));
                
                if (response && response.data !== null && response.data !== undefined) {
                    // Si tenemos datos específicos del usuario
                    this.totalVentasHoy = Number(response.data.totalIncome || 0);
                } else {
                    // Intentar con el endpoint general
                    const generalResponse = await apiRequest({
                        method: 'GET',
                        path: 'sales/today-income'
                    });
                    this.totalVentasHoy = generalResponse.data ?? 0;
                }
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
        obtenerTotalCuentasPorPagar() {
            // Keeping this empty method as it was in your original code
        }
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

.mt-4 {
    margin-top: 1rem;
}

.mb-4 {
    margin-bottom: 1rem;
}

.mt-6 {
    margin-top: 1.5rem;
}

.p-3 {
    padding: 0.75rem;
}

.is-divider {
    height: 1px;
    background-color: #dbdbdb;
    margin: 1rem 0;
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