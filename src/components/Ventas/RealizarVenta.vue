```vue type="vue" project="POS System" file="RealizarVenta.vue"
[v0-no-op-code-block-prefix]<template>
  <section class="full-width-section">
    <!-- Barra superior con búsqueda y switch -->
    <div class="top-controls">
      <div class="search-container">
        <buscar-producto @seleccionado="onSeleccionado" class="full-width-search" />
        <b-switch v-model="usarPrecioTurista" type="is-info" class="tourist-switch">
          Aplicar precio de turista antes de agregar los productos!
        </b-switch>
      </div>
    </div>
    
    <!-- Contenido principal -->
    <div class="main-content">
      <!-- Estado vacío rediseñado - Alineado a la izquierda como en la imagen -->
      <div v-if="productos.length < 1" class="epic-empty-state">
        <div class="epic-empty-content">
          <!-- Texto alineado a la izquierda con icono de carrito -->
          <div class="empty-message">
            <i class="mdi mdi-cart-outline cart-icon"></i>
            <div class="empty-text">
              <h2 class="empty-title">No has agregado productos</h2>
              <p class="empty-subtitle">Agrega algunos productos a la lista para venderlos</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Contenido cuando hay productos -->
      <div v-if="productos.length > 0" class="columns is-multiline product-content">
        <!-- Columna izquierda: Lista de productos -->
        <div class="column is-8">
          <tabla-productos :listaProductos="productos" @quitar="onQuitar" @aumentar="onAumentar" />
        </div>
        
        <!-- Columna derecha: Resumen y acciones -->
        <div class="column is-4">
          <div class="card sticky-card">
            <div class="card-content">
              <!-- Resumen de venta -->
              <div class="notification is-primary-bg mb-3">
                <div v-if="descuentoTotal > 0" class="has-text-centered mb-2">
                  <p class="is-size-5">Subtotal: ${{ formatearNumero(subtotal) }}</p>
                  <p class="is-size-5 has-text-success">Descuento: -${{ formatearNumero(descuentoTotal) }}</p>
                </div>
                <p class="has-text-weight-bold has-text-centered" style="font-size:3em">
                  Total ${{ formatearNumero(total) }}
                </p>
              </div>
              
              <!-- Botones de acción principales -->
              <div class="buttons is-centered mb-4">
                <b-button class="button" type="is-success" icon-left="check" expanded
                  @click="abrirDialogo('venta')">
                  Terminar venta
                </b-button>
                <b-button class="button" type="is-danger" icon-left="cancel" expanded
                  @click="cancelarVenta">
                  Cancelar
                </b-button>
              </div>
              
              <!-- Botón de búsqueda de descuentos -->
              <div class="has-text-centered">
                <b-button type="is-info" @click="buscarDescuentosDisponibles" :loading="cargandoDescuentos" expanded>
                  <span class="icon"><i class="mdi mdi-tag-multiple"></i></span>
                  <span>Buscar descuentos disponibles</span>
                </b-button>
                
                <!-- Mensaje informativo - solo cuando no hay descuentos disponibles -->
                <div class="notification is-warning is-light mt-2 py-2 px-3" v-if="descuentosDisponibles.length === 0">
                  <p class="is-size-7 has-text-centered">
                    <span class="icon is-small mr-1"><i class="mdi mdi-information"></i></span>
                    ¡IMPORTANTE!

AGREGA LA CANTIDAD CORRECTA DE CADA PRODUCTO ANTES DE BUSCAR LOS DESCUENTOS

Los descuentos se calculan en base a la cantidad y precio de los productos seleccionados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sección de descuentos disponibles - Solo visible cuando hay descuentos -->
    <div v-if="descuentosDisponibles.length > 0" class="discounts-section">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            <span class="icon mr-2"><i class="mdi mdi-tag-multiple"></i></span>
            Descuentos Disponibles
          </p>
        </header>
        <div class="card-content">
          <div class="columns is-multiline">
            <div class="column is-6" 
                v-for="(descuento, index) in descuentosDisponibles" 
                :key="index">
              <div class="card mb-2">
                <div class="card-content p-3">
                  <div class="level mb-0">
                    <div class="level-left">
                      <div class="level-item">
                        <div>
                          <p class="is-size-6 has-text-weight-bold">{{ descuento.discount.name }}</p>
                          <p class="is-size-7">
                            <b-tag 
                              :type="descuento.discount.type === 'PERCENTAGE' ? 'is-info' : 
                                    descuento.discount.type === 'FIXED_AMOUNT' ? 'is-success' : 
                                    descuento.discount.type === 'BUY_X_GET_Y' ? 'is-warning' : 
                                    descuento.discount.type === 'BUNDLE' ? 'is-primary' : 
                                    descuento.discount.type === 'SEASONAL' ? 'is-link' : 'is-dark'"
                              size="is-small">
                              {{ descuento.discount.type === 'PERCENTAGE' ? `${descuento.discount.value}%` :
                                descuento.discount.type === 'FIXED_AMOUNT' ? `$${descuento.discount.value}` :
                                descuento.discount.type === 'BUY_X_GET_Y' ? `${descuento.discount.name}` :
                                descuento.discount.type === 'BUNDLE' ? `Paquete ${descuento.discount.value}` :
                                descuento.discount.type === 'SEASONAL' ? `Descuento ${descuento.discount.value}` : 'N/A' }}
                            </b-tag>
                            <span class="ml-2 has-text-grey">Producto: {{ descuento.productoNombre }}</span>
                          </p>
                          <p class="is-size-7 has-text-success">
                            Ahorro: ${{ formatearNumero(descuento.discountAmount) }}
                          </p>
                          <p v-if="descuento.finalPrice <= 0" class="is-size-7 has-text-danger">
                            Este descuento no puede aplicarse (precio final inválido).
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="level-right">
                      <div class="level-item">
                        <b-checkbox 
                          v-model="descuento.aplicado" 
                          @input="actualizarTotalConDescuentos"
                          :disabled="descuento.finalPrice <= 0">
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

    <visorPDF ref="visorPDF" :urlBase="apiBaseUrl + 'print/viewThermal'" titulo="Comprobante de Venta" />
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
    apiBaseUrl: process.env.VUE_APP_API,
    // Mapa para evitar aplicar múltiples descuentos al mismo producto
    descuentosAplicadosPorProducto: {}
  }),

  methods: {
    // Método para formatear números con 2 decimales y separador de miles
    formatearNumero(valor) {
      return parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

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
        nombreCliente: venta.cliente.name || '',
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
            this.descuentosAplicadosPorProducto = {};
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
          this.descuentosAplicadosPorProducto = {}
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

      // Eliminar del mapa de descuentos aplicados
      delete this.descuentosAplicadosPorProducto[id];

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
        total += parseFloat(producto.cantidad * producto.precio)
      })
      return total
    },

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
                aplicado: false, // Por defecto, el descuento no está aplicado
                // Asegurar que discountAmount sea un número válido
                discountAmount: parseFloat(d.discountAmount) || 0,
                // Asegurar que finalPrice sea un número válido
                finalPrice: parseFloat(d.finalPrice) || 0
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

          // Filtrar solo descuentos válidos y aplicar lógica según el tipo y cantidad mínima
          const descuentosValidos = resultados.filter(d => {
            const descuento = d.discount;

            // Validar si el descuento está activo y dentro del rango de fechas
            const ahora = new Date();
            const inicio = new Date(descuento.startDate);
            const fin = new Date(descuento.endDate);

            if (!descuento.isActive || ahora < inicio || ahora > fin) {
              return false;
            }

            // Validar cantidad mínima
            if (producto.cantidad < descuento.minQuantity) {
              return false;
            }

            // Calcular el monto de descuento según el tipo
            switch (descuento.type) {
              case 'FIXED_AMOUNT': {
                // Asegurar que el valor del descuento sea un número
                const valorFijo = parseFloat(descuento.value) || 0;
                // Calcular el descuento por unidad
                d.discountAmount = valorFijo * producto.cantidad;
                // Calcular el precio final
                d.finalPrice = (producto.precio * producto.cantidad) - d.discountAmount;
                
                // Validar que el precio final no sea negativo o cero
                if (d.finalPrice <= 0) {
                  d.discountAmount = 0;
                  d.finalPrice = producto.precio * producto.cantidad;
                  return false;
                }
                break;
              }

              case 'PERCENTAGE': {
                // Asegurar que el valor del porcentaje sea un número
                const porcentaje = parseFloat(descuento.value) || 0;
                // Calcular el descuento total (precio * cantidad * porcentaje / 100)
                d.discountAmount = (producto.precio * producto.cantidad * porcentaje) / 100;
                // Calcular el precio final
                d.finalPrice = (producto.precio * producto.cantidad) - d.discountAmount;
                
                // Validar que el precio final no sea negativo o cero
                if (d.finalPrice <= 0) {
                  d.discountAmount = 0;
                  d.finalPrice = producto.precio * producto.cantidad;
                  return false;
                }
                break;
              }

              case 'BUNDLE': {
                if (producto.cantidad >= descuento.minQuantity) {
                  // Calcular cuántos paquetes completos hay
                  const bundles = Math.floor(producto.cantidad / descuento.value);
                  // El descuento es el precio de los productos gratuitos
                  d.discountAmount = bundles * producto.precio;
                  // El precio final es el precio de los productos que se pagan
                  d.finalPrice = producto.precio * (producto.cantidad - bundles);
                  
                  // Validar que el precio final no sea negativo o cero
                  if (d.finalPrice <= 0) {
                    d.discountAmount = 0;
                    d.finalPrice = producto.precio * producto.cantidad;
                    return false;
                  }
                } else {
                  return false;
                }
                break;
              }

              case 'BUY_X_GET_Y': {
                if (producto.cantidad >= descuento.minQuantity) {
                  // Calcular cuántos productos gratuitos hay (compra X, lleva Y gratis)
                  const gratis = Math.floor(producto.cantidad / (descuento.value + 1));
                  // El descuento es el precio de los productos gratuitos
                  d.discountAmount = gratis * producto.precio;
                  // El precio final es el precio de los productos que se pagan
                  d.finalPrice = producto.precio * (producto.cantidad - gratis);
                  
                  // Validar que el precio final no sea negativo o cero
                  if (d.finalPrice <= 0) {
                    d.discountAmount = 0;
                    d.finalPrice = producto.precio * producto.cantidad;
                    return false;
                  }
                } else {
                  return false;
                }
                break;
              }

              case 'SEASONAL': {
                // Similar al porcentaje pero puede tener lógica adicional
                const valorEstacional = parseFloat(descuento.value) || 0;
                d.discountAmount = (producto.precio * producto.cantidad * valorEstacional) / 100;
                d.finalPrice = (producto.precio * producto.cantidad) - d.discountAmount;
                
                // Validar que el precio final no sea negativo o cero
                if (d.finalPrice <= 0) {
                  d.discountAmount = 0;
                  d.finalPrice = producto.precio * producto.cantidad;
                  return false;
                }
                break;
              }

              default:
                return false;
            }

            // Redondear los valores a 2 decimales para evitar problemas de precisión
            d.discountAmount = parseFloat(d.discountAmount.toFixed(2));
            d.finalPrice = parseFloat(d.finalPrice.toFixed(2));
            
            return true;
          });

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

      // Reiniciar el mapa de descuentos aplicados por producto
      this.descuentosAplicadosPorProducto = {};
      
      // Calcular el total de descuentos aplicados
      this.descuentoTotal = 0;

      // Agrupar descuentos por producto para evitar aplicar múltiples descuentos al mismo producto
      const descuentosPorProducto = {};
      
      // Primero, agrupar todos los descuentos por producto
      this.descuentosDisponibles.forEach(descuento => {
        if (descuento.aplicado) {
          if (!descuentosPorProducto[descuento.productId]) {
            descuentosPorProducto[descuento.productId] = [];
          }
          descuentosPorProducto[descuento.productId].push(descuento);
        }
      });
      
      // Luego, para cada producto, aplicar solo el descuento más beneficioso
      Object.keys(descuentosPorProducto).forEach(productoId => {
        const descuentosProducto = descuentosPorProducto[productoId];
        
        if (descuentosProducto.length > 0) {
          // Ordenar descuentos por monto de descuento (de mayor a menor)
          descuentosProducto.sort((a, b) => b.discountAmount - a.discountAmount);
          
          // Aplicar solo el descuento más beneficioso
          const mejorDescuento = descuentosProducto[0];
          this.descuentoTotal += mejorDescuento.discountAmount;
          
          // Marcar este producto como que ya tiene un descuento aplicado
          this.descuentosAplicadosPorProducto[productoId] = mejorDescuento.discount.id;
          
          // Desactivar los demás descuentos para este producto
          descuentosProducto.slice(1).forEach(d => {
            d.aplicado = false;
          });
        }
      });

      // Asegurar que el descuento total no exceda el subtotal
      if (this.descuentoTotal > this.subtotal) {
        this.descuentoTotal = this.subtotal;
      }

      // Calcular el total final (subtotal - descuentos)
      this.total = Math.max(0, this.subtotal - this.descuentoTotal);
      
      // Redondear a 2 decimales para evitar problemas de precisión
      this.total = parseFloat(this.total.toFixed(2));
      this.subtotal = parseFloat(this.subtotal.toFixed(2));
      this.descuentoTotal = parseFloat(this.descuentoTotal.toFixed(2));
    }
  }
};
</script>

<style scoped>
/* Estilos para la sección principal */
.full-width-section {
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  overflow: hidden; /* Evitar scroll */
}

.top-controls {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  background-color: white;
  width: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.full-width-search {
  flex: 1;
  min-width: 300px;
  margin-right: 2rem;
}

.tourist-switch {
  white-space: nowrap;
  font-size: 1.1rem;
}

.main-content {
  width: 100%;
  position: relative;
}

.notification.is-primary-bg {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 1.25rem;
}

.level-item .button {
  margin: 0 0.5rem;
}

.sticky-card {
  position: sticky;
  top: 20px;
}

/* Estilos para el estado vacío alineado a la izquierda como en la imagen */
.epic-empty-state {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: calc(100vh - 120px); /* Altura ajustada para evitar scroll */
  width: 100%;
  background: #0077c2;
  overflow: hidden;
}

.epic-empty-content {
  padding: 3rem;
  width: 100%;
}

.empty-message {
  display: flex;
  align-items: center;
  padding-left: 2rem;
}

.cart-icon {
  font-size: 4rem;
  margin-right: 2rem;
  color: white;
}

.empty-text {
  color: white;
}

.empty-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.empty-subtitle {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}

/* Estilos para el contenido de productos */
.product-content {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* Estilos para la sección de descuentos */
.discounts-section {
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

@media screen and (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .tourist-switch {
    margin-left: 0;
    margin-top: 0.75rem;
  }

  .level-item .button {
    font-size: 0.8rem;
    padding: 0.5em 0.75em;
  }

  .level-item .button .icon {
    margin-right: 0.25em;
  }

  p[style="font-size:3em"] {
    font-size: 2em !important;
  }
  
  .sticky-card {
    position: relative;
    top: 0;
  }
  
  .cart-icon {
    font-size: 2.5rem;
    margin-right: 1rem;
  }
  
  .empty-title {
    font-size: 2rem;
  }
  
  .empty-subtitle {
    font-size: 1.2rem;
  }
}
</style>