<template>
    <div class="create-orden">
        <div class="section">
            <div class="section-header">
                <div class="header-left">
                    <i class="fas fa-plus-circle section-icon"></i>
                    <h3>Crear Nueva Orden</h3>
                </div>
            </div>

            <div class="section-content">
                <form @submit.prevent="crearOrden" class="form">
                    <!-- Selección de proveedor -->
                    <div class="field">
                        <label class="label">
                            <i class="fas fa-truck label-icon"></i> Proveedor:
                        </label>
                        <div class="control is-expanded">
                            <div class="select is-fullwidth">
                                <select v-model="nuevaOrden.providerId" required @change="actualizarProveedor">
                                    <option value="" disabled>Seleccione un proveedor</option>
                                    <option v-for="proveedor in proveedores" :key="proveedor.id" :value="proveedor.id">
                                        {{ proveedor.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Información del proveedor seleccionado -->
                    <div v-if="proveedorSeleccionado" class="box provider-info mb-4">
                        <h4 class="title is-5 mb-3">
                            <i class="fas fa-info-circle mr-2"></i> Información del Proveedor
                        </h4>
                        <div class="columns is-multiline">
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Nombre:</label>
                                    <p>{{ proveedorSeleccionado.name }}</p>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">ID Fiscal:</label>
                                    <p>{{ proveedorSeleccionado.taxId }}</p>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Teléfono:</label>
                                    <p>{{ proveedorSeleccionado.phone }}</p>
                                </div>
                            </div>
                            <div class="column is-6">
                                <div class="field">
                                    <label class="label">Dirección:</label>
                                    <p>{{ proveedorSeleccionado.address }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Fecha de la orden -->
                    <div class="field">
                        <label class="label">
                            <i class="fas fa-calendar-alt label-icon"></i> Fecha de la Orden:
                        </label>
                        <div class="control">
                            <input type="date" class="input" v-model="nuevaOrden.orderDate" required>
                        </div>
                    </div>

                    <!-- Número de factura -->
                    <div class="field">
                        <label class="label">
                            <i class="fas fa-file-invoice label-icon"></i> Número de Factura:
                        </label>
                        <div class="control">
                            <input type="text" class="input" v-model="nuevaOrden.invoiceNumber" 
                                placeholder="Ej: INV-12345" required>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="field is-grouped mt-5">
                        <div class="control">
                            <button type="submit" class="button is-primary" :disabled="enviando || !ordenValida">
                                <i class="fas fa-save mr-2"></i>
                                {{ enviando ? 'Creando...' : 'Crear Orden' }}
                            </button>
                        </div>
                        <div class="control">
                            <button type="button" class="button is-light" @click="limpiarFormulario">
                                <i class="fas fa-times mr-2"></i> Cancelar
                            </button>
                        </div>
                    </div>

                    <!-- Mensajes de error y éxito -->
                    <div v-if="error" class="notification is-danger mt-4">
                        <button class="delete" @click="error = null"></button>
                        <i class="fas fa-exclamation-circle mr-2"></i> {{ error }}
                    </div>

                    <div v-if="exitoso" class="notification is-success mt-4">
                        <button class="delete" @click="exitoso = false"></button>
                        <i class="fas fa-check-circle mr-2"></i> Orden creada exitosamente.
                    </div>
                </form>
            </div>
        </div>

        <b-loading :is-full-page="false" v-model="cargando" :can-cancel="false"></b-loading>
    </div>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';
import AyudanteSesion from '../../Servicios/AyudanteSesion';

export default {
    name: 'CreateOrden',
    
    data() {
        return {
            // Lista de proveedores
            proveedores: [],
            cargandoProveedores: false,
            
            // Datos de la nueva orden
            nuevaOrden: {
                providerId: '',
                orderDate: this.obtenerFechaActual(),
                invoiceNumber: '',
                isActive: true
            },
            
            // Proveedor seleccionado
            proveedorSeleccionado: null,
            
            // Estado del formulario
            enviando: false,
            cargando: false,
            error: null,
            exitoso: false,
            
            // Estado de administrador
            esAdmin: false
        };
    },
    
    computed: {
        ordenValida() {
            return this.nuevaOrden.providerId && 
                   this.nuevaOrden.orderDate && 
                   this.nuevaOrden.invoiceNumber;
        }
    },
    
    created() {
        // Verificar si el usuario es administrador
        this.verificarAdmin();
        
        // Cargar proveedores
        this.cargarProveedores();
    },
    
    methods: {
        // Método para verificar si el usuario es administrador
        verificarAdmin() {
            // Obtener el rol del usuario desde AyudanteSesion
            const datosUsuario = AyudanteSesion.obtenerDatosSesion();
            this.esAdmin = datosUsuario.rol === 'Admin';
        },
        
        // Obtener la fecha actual en formato YYYY-MM-DD
        obtenerFechaActual() {
            const fecha = new Date();
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        
        // Cargar la lista de proveedores
        async cargarProveedores() {
            this.cargandoProveedores = true;
            this.cargando = true;
            
            try {
                const respuesta = await apiRequest({
                    method: 'GET',
                    path: 'providers'
                });
                
                if (respuesta && Array.isArray(respuesta.data)) {
                    this.proveedores = respuesta.data;
                } else {
                    console.error('Formato de respuesta inesperado:', respuesta);
                    this.error = 'Error al cargar los proveedores. Formato de respuesta inesperado.';
                }
            } catch (error) {
                console.error('Error al cargar proveedores:', error);
                this.error = 'Error al cargar los proveedores. Por favor, intente nuevamente.';
            } finally {
                this.cargandoProveedores = false;
                this.cargando = false;
            }
        },
        
        // Actualizar el proveedor seleccionado cuando cambia el select
        actualizarProveedor() {
            if (!this.nuevaOrden.providerId) {
                this.proveedorSeleccionado = null;
                return;
            }
            
            const proveedorId = parseInt(this.nuevaOrden.providerId);
            this.proveedorSeleccionado = this.proveedores.find(p => p.id === proveedorId) || null;
        },
        
        // Crear una nueva orden
        async crearOrden() {
            if (!this.ordenValida) return;
            
            this.enviando = true;
            this.cargando = true;
            this.error = null;
            this.exitoso = false;
            
            try {
                const respuesta = await apiRequest({
                    method: 'POST',
                    path: 'orders',
                    data: {
                        providerId: parseInt(this.nuevaOrden.providerId),
                        orderDate: this.nuevaOrden.orderDate,
                        invoiceNumber: this.nuevaOrden.invoiceNumber,
                        isActive: this.nuevaOrden.isActive
                    }
                });
                
                if (respuesta && respuesta.status === 201) {
                    this.exitoso = true;
                    
                    // Mostrar mensaje de éxito
                    this.$buefy.toast.open({
                        message: 'Orden creada exitosamente',
                        type: 'is-success'
                    });
                    
                    // Limpiar formulario después de 2 segundos
                    setTimeout(() => {
                        this.limpiarFormulario();
                    }, 2000);
                } else {
                    this.error = `Error ${respuesta.status}: No se pudo crear la orden`;
                }
            } catch (error) {
                console.error('Error al crear orden:', error);
                this.error = error.message || 'Error al crear la orden. Por favor, intente nuevamente.';
            } finally {
                this.enviando = false;
                this.cargando = false;
            }
        },
        
        // Limpiar el formulario
        limpiarFormulario() {
            this.nuevaOrden = {
                providerId: '',
                orderDate: this.obtenerFechaActual(),
                invoiceNumber: '',
                isActive: true
            };
            this.proveedorSeleccionado = null;
            this.error = null;
            this.exitoso = false;
        }
    }
};
</script>

