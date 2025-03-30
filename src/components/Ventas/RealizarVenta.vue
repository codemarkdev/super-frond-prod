<template>
  <section>
    <!-- Add a switch to toggle between salePrice and touristPrice -->

    <buscar-producto @seleccionado="onSeleccionado" />
    <b-switch v-model="usarPrecioTurista" type="is-info" class="mb-3">
      Aplicar precio de turista
    </b-switch>
    <mensaje-inicial :titulo="'No has agregado productos'"
      :subtitulo="'Agrega algunos productos a la lista para venderlos'" v-if="productos.length < 1" />
    <div v-if="productos.length > 0">
      <tabla-productos :listaProductos="productos" @quitar="onQuitar" @aumentar="onAumentar" />
      
      <!-- Sección de descuentos disponibles -->
      <div class="box mt-3" v-if="descuentosDisponibles.length > 0">
        <h4 class="title is-5 mb-3">Descuentos Disponibles</h4>
        <div class="columns is-multiline">
          <div class="column is-12" v-for="(descuento, index) in descuentosDisponibles" :key="index">
            <div class="card mb-2">
              <div class="card-content p-3">
                <div class="level mb-0">
                  <div class="level-left">
                    <div class="level-item">
                      <div>
                        <p class="is-size-6 has-text-weight-bold">{{ descuento.discount.name }}</p>
                        <p class="is-size-7">
                          <b-tag :type="descuento.discount.type === 'PERCENTAGE' ? 'is-info' : 'is-success'" size="is-small">
                            {{ descuento.discount.type === 'PERCENTAGE' ? 'Porcentaje' : 'Monto Fijo' }}
                          </b-tag>
                          <span class="ml-1">
                            {{ descuento.discount.type === 'PERCENTAGE' ? 
                              `${descuento.discount.value}%` : 
                              `$${descuento.discount.value}` }}
                          </span>
                        </p>
                        <p class="is-size-7 has-text-grey">
                          Ahorro: ${{ descuento.discountAmount.toFixed(2) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="level-right">
                    <div class="level-item">
                      <b-checkbox v-model="descuento.aplicado" 
                                  @input="actualizarTotalConDescuentos">
                        Aplicar
                      </b-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="notification is-primary-bg mt-3">
        <div v-if="descuentoTotal > 0" class="has-text-centered mb-2">
          <p class="is-size-5">Subtotal: ${{ subtotal.toFixed(2) }}</p>
          <p class="is-size-5 has-text-success">Descuento: -${{ descuentoTotal.toFixed(2) }}</p>
        </div>
        <p class="has-text-weight-bold has-text-centered" style="font-size:5em">
          Total ${{ total.toFixed(2) }}
        </p>
        <nav class="level mt-2">
          <div class="level-item has-text-centered">
            <b-button class="button is-responsive" type="is-success" inverted icon-left="check" size="is-large"
              @click="abrirDialogo('venta')">
              Terminar venta
            </b-button>
          </div>
         
          <!-- <div class="level-item has-text-centered">
            <b-button class="button is-responsive" type="is-info" inverted icon-left="wallet-plus" size="is-large"
              @click=" abrirDialogo('cuenta')">
              Agregar a cuenta
            </b-button>
          </div> -->
          <!-- <div class="level-item has-text-centered">
            <b-button class="button is-responsive" type="is-dark" inverted icon-left="wallet-travel" size="is-large"
              @click=" abrirDialogo('apartado')">
              Realizar apartado
            </b-button>
          </div> -->
          <div class="level-item has-text-centered">
            <b-button class="button is-responsive" type="is-danger" inverted icon-left="cancel" size="is-large"
              @click="cancelarVenta">
              Cancelar
            </b-button>
          </div>
          <!-- <div class="level-item has-text-centered">
            <b-button class="button is-responsive" type="is-warning" inverted icon-left="ticket-outline" size="is-large"
              @click="abrirDialogo('cotiza')">
              Cotizar
            </b-button>
          </div> -->
        </nav>
      </div>
      
      <!-- Botón para buscar descuentos -->
      <div class="has-text-centered mt-3" v-if="productos.length > 0 && descuentosDisponibles.length === 0">
        <b-button type="is-info" 
                  @click="buscarDescuentosDisponibles" 
                  :loading="cargandoDescuentos">
          Buscar descuentos disponibles
        </b-button>
      </div>
    </div>
    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    <b-modal v-model="mostrarDialogo" has-modal-card trap-focus :destroy-on-hide="false" aria-role="dialog"
      aria-label="Modal Terminar Venta" close-button-aria-label="Close" aria-modal>
      <dialogo-terminar-venta :totalVenta="total" @close="onCerrar" @terminar="onTerminar"
        v-if="mostrarTerminarVenta"></dialogo-terminar-venta>
      <dialogo-agregar-cuenta :totalVenta="total" @close="onCerrar" @terminar="onTerminar"
        v-if="mostrarAgregarCuenta"></dialogo-agregar-cuenta>
      <dialogo-agregar-apartado :totalVenta="total" @close="onCerrar" @terminar="onTerminar"
        v-if="mostrarAgregarApartado"></dialogo-agregar-apartado>
      <dialogo-cotizar :totalVenta="total" @close="onCerrar" @terminar="onTerminar"
        v-if="mostrarRegistrarCotizacion"></dialogo-cotizar>
    </b-modal>
    
    <visorPDF ref="visorPDF" 
               :urlBase="apiBaseUrl + 'print/viewThermal'"
               titulo="Comprobante de Venta"
               />
    <comprobante-compra :venta="this.ventaRealizada" :tipo="tipoVenta" @impreso="onImpreso" v-if="mostrarComprobante" />
  </section>
</template>
<script>
import BuscarProducto from '../Inventario/BuscarProducto.vue'
import TablaProductos from './TablaProductos.vue'
import DialogoTerminarVenta from './DialogoTerminarVenta'
import DialogoAgregarCuenta from './DialogoAgregarCuenta'
import DialogoAgregarApartado from './DialogoAgregarApartado'
import DialogoCotizar from './DialogoCotizar'
import ComprobanteCompra from './ComprobanteCompra'
import MensajeInicial from '../Extras/MensajeInicial'
import AyudanteSesion from '../../Servicios/AyudanteSesion'
import apiRequest from '@/Servicios/HttpService'
import { formatLocalDateTime } from '@/helpers/formatDate'
import VisorPDF from './VisorPDF.vue'




export default {
  name: "RealizarVenta",
  components: {
    BuscarProducto,
    TablaProductos,
    DialogoTerminarVenta,
    DialogoAgregarCuenta,
    DialogoAgregarApartado,
    DialogoCotizar,
    MensajeInicial,
    ComprobanteCompra,
    VisorPDF
  },

  data: () => ({
    cargando: false,
    cargandoDescuentos: false,
    productos: [],
    total: 0,
    subtotal: 0,
    descuentoTotal: 0,
    descuentosDisponibles: [],
    pdfUrl: '',
    mostrarPDF: false,
    mostrarDialogo: false,
    mostrarTerminarVenta: false,
    mostrarAgregarCuenta: false,
    mostrarAgregarApartado: false,
    mostrarRegistrarCotizacion: false,
    ventaRealizada: null,
    mostrarComprobante: false,
    tipoVenta: "",
    usarPrecioTurista: false,
    apiBaseUrl: process.env.VUE_APP_API
  }),

  methods: {
    onImpreso(resultado) {
      this.mostrarComprobante = resultado
    },

    onTerminar(venta) {
      console.log('venta', venta)
      console.log('user', AyudanteSesion.obtenerDatosSesion())
      
      // Obtener los descuentos aplicados por producto
      const descuentosPorProducto = {};
      
      this.descuentosDisponibles
        .filter(d => d.aplicado)
        .forEach(d => {
          if (!descuentosPorProducto[d.productId]) {
            descuentosPorProducto[d.productId] = [];
          }
          descuentosPorProducto[d.productId].push({
            discountId: d.discount.id,
            quantity: this.productos.find(p => p.id === d.productId)?.cantidad || 1
          });
        });
      
      this.ventaRealizada = {
        total: this.total,
        products: this.productos.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad,
          priceType: producto.priceType,
          appliedDiscounts: descuentosPorProducto[producto.id] || []
        })),
        cliente: venta.cliente.id,
        usuario: AyudanteSesion.obtenerDatosSesion().id,
        nombreCliente: (venta.cliente.name) ? venta.cliente.name : 'Anónimo',
        nombreUsuario: AyudanteSesion.obtenerDatosSesion().nombre,
        fecha: formatLocalDateTime()
      }

      let tipo = venta.tipo

      switch (tipo) {
        case 'venta':
          this.ventaRealizada.tipo = 'venta'
          this.ventaRealizada.pagado = venta.pagado
          this.ventaRealizada.cambio = venta.cambio
          console.log(this.ventaRealizada)
          break
        case 'cuenta':
          this.ventaRealizada.tipo = 'cuenta'
          this.ventaRealizada.pagado = venta.pagado
          this.ventaRealizada.porPagar = venta.porPagar
          console.log(this.ventaRealizada)
          break
        case 'apartado':
          this.ventaRealizada.tipo = 'apartado'
          this.ventaRealizada.pagado = venta.pagado
          this.ventaRealizada.porPagar = venta.porPagar
          console.log(this.ventaRealizada)
          break
        case 'cotiza':
          this.ventaRealizada.tipo = 'cotiza'
          console.log(this.ventaRealizada)
          break
      }

      this.tipoVenta = venta.tipo
      this.cargando = true

      console.log(this.ventaRealizada, 'venta realizada')

      // Función para preparar los datos de productos con sus descuentos aplicados
      const getProductsData = (products, includePriceType = false) => {
        return products.map(product => ({
          productId: product.id,
          quantity: product.cantidad,
          ...(includePriceType && { priceType: product.priceType }),
          // Incluir appliedDiscounts si existen para este producto
          ...(product.appliedDiscounts && product.appliedDiscounts.length > 0 && { 
            appliedDiscounts: product.appliedDiscounts 
          })
        }));
      };

      const baseData = {
        customerId: this.ventaRealizada.cliente,
        userId: this.ventaRealizada.usuario,
        date: this.ventaRealizada.fecha,
        products: getProductsData(this.ventaRealizada.products, true)
      };

      const dataOptions = {
        cotiza: {
          ...baseData,
          priceType: this.usarPrecioTurista ? 'tourist' : 'sale',
          products: getProductsData(this.ventaRealizada.products)
        },
        venta: {
          ...baseData,
          paid: this.ventaRealizada.pagado
        },
        cuenta: {
          date: this.ventaRealizada.fecha,
          type: "account",
          customerId: this.ventaRealizada.cliente,
          userId: this.ventaRealizada.usuario,
          products: getProductsData(this.ventaRealizada.products, true)
        }
      };

      const optionData = dataOptions[this.tipoVenta] || null;
      const endpointMap = {
        cotiza: 'quotations',
        venta: 'sales',
        cuenta: 'accountsholdings'
      };
      const endpoint = endpointMap[this.tipoVenta] || '';

      const handlePayment = (accountId) => {
        if (this.ventaRealizada.pagado > 0) {
          const paymentData = {
            amount: this.ventaRealizada.pagado,
            date: new Date().toISOString(),
            accountHoldingId: accountId
          };
          apiRequest({
            method: 'POST',
            path: 'payments',
            data: paymentData
          }).then(paymentResponse => {
            console.log('Payment registered:', paymentResponse);
          }).catch(paymentError => {
            console.error('Error registering payment:', paymentError);
          });
        }
      };

      if (optionData && endpoint) {
        apiRequest({
          method: 'POST',
          path: endpoint,
          data: optionData
        }).then(registrado => {
          console.log(registrado);
          if (registrado) {
            if (this.tipoVenta === 'cuenta') {
              handlePayment(registrado.data.id);
            }
            
            // Mostrar notificación de éxito
            this.$buefy.toast.open({
              type: 'is-info',
              message: tipo.toUpperCase() + ' registrado con éxito'
            });
            
            // Mostrar el PDF de la venta
            this.mostrarPDFVenta(registrado.data.id);
            
            // Limpiar el estado
            this.productos = [];
            this.total = 0;
            this.subtotal = 0;
            this.descuentoTotal = 0;
            this.descuentosDisponibles = [];
            this.cargando = false;
            this.mostrarTerminarVenta = this.mostrarAgregarCuenta = this.mostrarAgregarApartado = this.mostrarRegistrarCotizacion = false;
            this.mostrarDialogo = false;
          }
        }).catch(error => {
          console.log(error);
          this.cargando = false;
          this.$buefy.toast.open({
            type: 'is-danger',
            message: 'Ocurrió un error al registrar la ' + tipo
          });
        });
      }
    },

    cancelarVenta() {
      this.$buefy.dialog.confirm({
        title: 'Cancelar venta',
        message: '¿Seguro que deseas cancelar la venta?',
        confirmText: 'Sí, cancelar',
        cancelText: 'No, continuar',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          this.productos = []
          this.total = 0
          this.subtotal = 0
          this.descuentoTotal = 0
          this.descuentosDisponibles = []
          this.$buefy.toast.open('Venta cancelada')
        }
      })
    },


    abrirDialogo(opcion) {
      this.mostrarDialogo = true
      switch (opcion) {
        case "venta":
          this.mostrarTerminarVenta = true
          this.mostrarAgregarCuenta = this.mostrarAgregarApartado = this.mostrarRegistrarCotizacion = false
          break
        case "cuenta":
          this.mostrarAgregarCuenta = true
          this.mostrarTerminarVenta = this.mostrarAgregarApartado = this.mostrarRegistrarCotizacion = false
          break
        case "apartado":
          this.mostrarAgregarApartado = true
          this.mostrarAgregarCuenta = this.mostrarTerminarVenta = this.mostrarRegistrarCotizacion = false
          break
        case "cotiza":
          this.mostrarRegistrarCotizacion = true
          this.mostrarAgregarCuenta = this.mostrarTerminarVenta = this.mostrarAgregarApartado = false
          break
      }
    },

    onCerrar(opcion) {
      this.mostrarDialogo = false
      if (opcion === 'venta' || opcion === 'cuenta' || opcion === 'apartado' || opcion === 'cotiza')
        this.mostrarTerminarVenta = this.mostrarAgregarCuenta = this.mostrarAgregarApartado = this.mostrarRegistrarCotizacion = false
    },

    onQuitar(id) {
      let indice = this.productos.findIndex(producto => producto.id === id)
      this.productos.splice(indice, 1)
      
      // Actualizar descuentos disponibles al quitar un producto
      this.descuentosDisponibles = this.descuentosDisponibles.filter(
        descuento => descuento.productId !== id
      );
      
      this.actualizarTotalConDescuentos();
    },

    onAumentar(producto) {
      let verificaExistencia = this.verificarExistenciaAlcanzada(producto.existencia, producto.id)

      if (verificaExistencia) return

      if (producto.vendidoMayoreo) {
        this.verificarMayoreo(producto.cantidadMayoreo, producto.id, producto.precioMayoreo)
      }
      
      // Actualizar descuentos si cambia la cantidad
      this.actualizarDescuentosPorCantidad(producto.id);
      this.actualizarTotalConDescuentos();
    },

    onSeleccionado(producto) {
      let verificaExistencia = this.verificarExistenciaAlcanzada(producto.existencia, producto.id)

      if (verificaExistencia) return
      if (producto.vendidoMayoreo) {
        this.verificarMayoreo(producto.cantidadMayoreo, producto.id, producto.precioMayoreo)
      }

      let existeEnLista = this.verificarSiEstaEnLista(producto.id)

      if (existeEnLista >= 0) {
        this.aumentarCantidad(existeEnLista)
        this.actualizarTotalConDescuentos();
        return
      }

      this.agregarALista(producto)
      this.actualizarTotalConDescuentos();
    },

    agregarALista(producto) {
      if (producto.stock === 0) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'El producto ' + producto.name + ' no tiene stock disponible.'
        });
        return;
      }
      this.productos.push(
        {
          id: producto.id,
          codigo: producto.code,
          nombre: producto.name,
          precio: this.usarPrecioTurista ? producto.touristPrice : producto.salePrice,
          cantidad: 1,
          existencia: producto.stock,
          vendidoMayoreo: producto.wholesaleSale,
          cantidadMayoreo: producto.wholesaleQuantity,
          precioMayoreo: producto.wholesalePrice,
          mayoreoAplicado: false,
          priceType: this.usarPrecioTurista ? 'tourist' : 'sale'
        }
      );
    },

    verificarExistenciaAlcanzada(existencia, id) {
      let resultado = false
      this.productos.forEach(producto => {
        if (producto.id === id) {
          if (parseInt(producto.cantidad) >= parseInt(existencia)) {
            this.$buefy.toast.open({
              type: 'is-danger',
              message: 'El producto ' + producto.nombre + ' ha alcanzado la existencia máxima. Solo tienes ' + producto.existencia
            })
            producto.cantidad = existencia
            resultado = true
          }
        }

      })
      return resultado
    },

    verificarMayoreo(cantidadMayoreo, id, precioMayoreo) {

      this.productos.forEach(producto => {
        if (producto.mayoreoAplicado) return
        if (producto.id === id) {
          if (producto.cantidad >= parseInt(cantidadMayoreo)) {
            this.$buefy.dialog.confirm({
              confirmText: 'Sí, aplicar',
              cancelText: 'No aplicar',
              message: 'El producto ' + producto.nombre + ' tiene mayoreo a partir de ' + cantidadMayoreo + ' piezas, ¿Desea aplicar el mayoreo?',
              onConfirm: () => {
                producto.precio = precioMayoreo
                producto.mayoreoAplicado = true
                this.$buefy.toast.open('Mayoreo aplicado correctamente a ' + producto.nombre)
                this.actualizarTotalConDescuentos();
              }
            })
          }
        }
      })
    },

    verificarSiEstaEnLista(id) {
      return this.productos.findIndex(producto => producto.id === id)
    },

    aumentarCantidad(indice) {
      let lista = this.productos
      let producto = lista[indice]
      producto.cantidad++
      this.productos = lista
    },
    
    // Método optimizado para mostrar el PDF de la venta
    mostrarPDFVenta(ventaId) {
      if (!ventaId) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'ID de venta no válido'
        });
        return;
      }
      
      // Mostrar notificación de que se está generando el PDF
      this.$buefy.toast.open({
        message: 'Generando comprobante...',
        type: 'is-info',
        duration: 2000
      });
      
      // Esperar un breve momento para que el backend tenga tiempo de generar el PDF
      setTimeout(() => {
        // Abrir el visor de PDF con el ID de la venta
        this.$refs.visorPDF.abrir(ventaId);
      }, 500);
    },
    
    // Método para calcular el total sin descuentos
    calcularTotal() {
      let total = 0
      this.productos.forEach(producto => {
        total = parseFloat(producto.cantidad * producto.precio) + parseFloat(total)
      })
      return total
    },
    
    // Método para buscar descuentos disponibles para los productos en la venta
    async buscarDescuentosDisponibles() {
      if (this.productos.length === 0) return;
      
      this.cargandoDescuentos = true;
      this.descuentosDisponibles = [];
      
      try {
        // Para cada producto en la venta, buscar descuentos aplicables
        for (const producto of this.productos) {
          // Construir la URL con los parámetros para el cálculo de descuentos
          const url = `discounts/product/${producto.id}/calculate?quantity=${producto.cantidad}&unitPrice=${producto.precio}`;
          
          const response = await apiRequest({
            method: 'GET',
            path: url
          });
          
          if (response && response.data) {
            // Normalizar la respuesta para asegurar que siempre sea un array
            let resultados = response.data;
            if (!Array.isArray(resultados)) {
              resultados = [resultados];
            }
            
            // Filtrar solo descuentos válidos y añadir información adicional
            const descuentosValidos = resultados
              .filter(d => d.valid)
              .map(d => ({
                ...d,
                productId: producto.id,
                productoNombre: producto.nombre,
                aplicado: false // Por defecto, el descuento no está aplicado
              }));
            
            // Añadir a la lista de descuentos disponibles
            this.descuentosDisponibles = [...this.descuentosDisponibles, ...descuentosValidos];
          }
        }
        
        if (this.descuentosDisponibles.length === 0) {
          this.$buefy.toast.open({
            message: 'No se encontraron descuentos aplicables para los productos seleccionados',
            type: 'is-warning'
          });
        } else {
          this.$buefy.toast.open({
            message: `Se encontraron ${this.descuentosDisponibles.length} descuentos aplicables`,
            type: 'is-success'
          });
        }
      } catch (error) {
        console.error('Error al buscar descuentos:', error);
        this.$buefy.toast.open({
          message: 'Error al buscar descuentos disponibles',
          type: 'is-danger'
        });
      } finally {
        this.cargandoDescuentos = false;
      }
    },
    
    // Método para actualizar los descuentos cuando cambia la cantidad de un producto
    async actualizarDescuentosPorCantidad(productoId) {
      // Obtener el producto actualizado
      const producto = this.productos.find(p => p.id === productoId);
      if (!producto) return;
      
      // Filtrar los descuentos existentes para este producto
      const descuentosExistentes = this.descuentosDisponibles.filter(
        d => d.productId === productoId
      );
      
      // Si no hay descuentos para este producto, no hacer nada
      if (descuentosExistentes.length === 0) return;
      
      try {
        // Construir la URL con los parámetros actualizados
        const url = `discounts/product/${producto.id}/calculate?quantity=${producto.cantidad}&unitPrice=${producto.precio}`;
        
        const response = await apiRequest({
          method: 'GET',
          path: url
        });
        
        if (response && response.data) {
          // Normalizar la respuesta
          let resultados = response.data;
          if (!Array.isArray(resultados)) {
            resultados = [resultados];
          }
          
          // Filtrar solo descuentos válidos
          const descuentosValidos = resultados.filter(d => d.valid);
          
          // Actualizar los descuentos existentes
          const descuentosActualizados = this.descuentosDisponibles.map(d => {
            if (d.productId !== productoId) return d;
            
            // Buscar el descuento actualizado correspondiente
            const descuentoActualizado = descuentosValidos.find(
              nuevo => nuevo.discount.id === d.discount.id
            );
            
            if (descuentoActualizado) {
              return {
                ...descuentoActualizado,
                productId: productoId,
                productoNombre: producto.nombre,
                aplicado: d.aplicado // Mantener el estado de aplicación
              };
            } else {
              // Si el descuento ya no es válido, desactivarlo
              return {
                ...d,
                valid: false,
                aplicado: false
              };
            }
          });
          
          // Filtrar descuentos que ya no son válidos
          this.descuentosDisponibles = descuentosActualizados.filter(
            d => d.valid || d.productId !== productoId
          );
        }
      } catch (error) {
        console.error('Error al actualizar descuentos:', error);
      }
    },
    
    // Método para actualizar el total con los descuentos aplicados
    actualizarTotalConDescuentos() {
      // Calcular el subtotal (sin descuentos)
      this.subtotal = this.calcularTotal();
      
      // Calcular el total de descuentos aplicados
      this.descuentoTotal = 0;
      
      // Sumar todos los descuentos aplicados
      this.descuentosDisponibles.forEach(descuento => {
        if (descuento.aplicado) {
          this.descuentoTotal += descuento.discountAmount;
        }
      });
      
      // Calcular el total final (subtotal - descuentos)
      this.total = this.subtotal - this.descuentoTotal;
    }
  }
};
</script>

<style scoped>
.notification.is-primary-bg {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 1.25rem;
}

.level-item .button {
  margin: 0 0.5rem;
}

@media screen and (max-width: 768px) {
  .level-item .button {
    font-size: 0.8rem;
    padding: 0.5em 0.75em;
  }
  
  .level-item .button .icon {
    margin-right: 0.25em;
  }
  
  p[style="font-size:5em"] {
    font-size: 3em !important;
  }
}
</style>

