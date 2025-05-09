<template>
  <section class="full-width-section">
    <!-- Barra superior con búsqueda y switch -->
    <buscador-productos-venta
      ref="buscador"
      :search-by-barcode="searchByBarcode"
      :usar-precio-turista="usarPrecioTurista"
      @seleccionado="onSeleccionado"
      @toggle-search-mode="searchByBarcode = !searchByBarcode"
      @toggle-tourist-price="usarPrecioTurista = !usarPrecioTurista"
    />
    
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
          <resumen-venta
            :total="total"
            :subtotal="subtotal"
            :descuento-total="descuentoTotal"
            :cargando-descuentos="cargandoDescuentos"
            @cancelar-venta="cancelarVenta"
            @abrir-dialogo="abrirDialogo"
            @buscar-descuentos="buscarDescuentosDisponibles"
          />
        </div>
      </div>
    </div>
    
    <!-- Sección de descuentos disponibles - Solo visible cuando hay descuentos -->
    <seccion-descuentos
      v-if="descuentosDisponibles.length > 0"
      :descuentos-disponibles="descuentosDisponibles"
      @actualizar-descuentos="actualizarTotalConDescuentos"
    />

    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
    
    <gestor-dialogos
      :mostrar-dialogo="mostrarDialogo"
      :mostrar-terminar-venta="mostrarTerminarVenta"
      :mostrar-agregar-cuenta="mostrarAgregarCuenta"
      :mostrar-agregar-apartado="mostrarAgregarApartado"
      :mostrar-registrar-cotizacion="mostrarRegistrarCotizacion"
      :total-venta="total"
      @close="onCerrar"
      @terminar="onTerminar"
    />

    <visorPDF ref="visorPDF" :urlBase="apiBaseUrl + 'print/viewThermal'" titulo="Comprobante de Venta" />
    <comprobante-compra :venta="ventaRealizada" :tipo="tipoVenta" @impreso="onImpreso" v-if="mostrarComprobante" />
  </section>
</template>

<script>
import TablaProductos from './TablaProductos.vue'
import BuscadorProductosVenta from './RealizarVentas/BuscadorProductosVenta.vue'
import ResumenVenta from './RealizarVentas/ResumenVenta.vue'
import SeccionDescuentos from './RealizarVentas/SeccionDescuentos.vue'
import GestorDialogos from './RealizarVentas/GestorDialogos.vue'
import ComprobanteCompra from './ComprobanteCompra.vue'
import AyudanteSesion from '../../Servicios/AyudanteSesion'
import apiRequest from '@/Servicios/HttpService'
import { formatLocalDateTime } from '@/helpers/formatDate'
import VisorPDF from './VisorPDF.vue'

export default {
  name: "RealizarVenta",
  components: {
    TablaProductos,
    BuscadorProductosVenta,
    ResumenVenta,
    SeccionDescuentos,
    GestorDialogos,
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
    searchByBarcode: true,
    descuentosAplicadosPorProducto: {}
  }),

  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.$refs.buscador?.focusInput) {
          this.$refs.buscador.focusInput();
        }
      }, 300);
    });
  },
  
  methods: {
    formatearNumero(valor) {
      return parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    onImpreso(resultado) {
      this.mostrarComprobante = resultado;
    },

    onTerminar(venta) {
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
      };

      let tipo = venta.tipo;

      switch (tipo) {
        case 'venta':
          this.ventaRealizada.tipo = 'venta';
          this.ventaRealizada.pagado = venta.pagado;
          this.ventaRealizada.cambio = venta.cambio;
          break;
        case 'cuenta':
          this.ventaRealizada.tipo = 'cuenta';
          this.ventaRealizada.pagado = venta.pagado;
          this.ventaRealizada.porPagar = venta.porPagar;
          break;
        case 'apartado':
          this.ventaRealizada.tipo = 'apartado';
          this.ventaRealizada.pagado = venta.pagado;
          this.ventaRealizada.porPagar = venta.porPagar;
          break;
        case 'cotiza':
          this.ventaRealizada.tipo = 'cotiza';
          break;
      }

      this.tipoVenta = venta.tipo;
      this.cargando = true;

      // Función para preparar los datos de productos con sus descuentos aplicados
      const getProductsData = (products, includePriceType = false) => {
        return products.map(product => ({
          productId: product.id,
          quantity: product.cantidad,
          ...(includePriceType && { priceType: product.priceType }),
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
          if (registrado) {
            if (this.tipoVenta === 'cuenta') {
              handlePayment(registrado.data.id);
            }

            this.$buefy.toast.open({
              type: 'is-info',
              message: tipo.toUpperCase() + ' registrado con éxito'
            });

            this.mostrarPDFVenta(registrado.data.id);
            this.limpiarEstado();
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

    limpiarEstado() {
      this.productos = [];
      this.total = 0;
      this.subtotal = 0;
      this.descuentoTotal = 0;
      this.descuentosDisponibles = [];
      this.descuentosAplicadosPorProducto = {};
      this.cargando = false;
      this.mostrarTerminarVenta = false;
      this.mostrarAgregarCuenta = false;
      this.mostrarAgregarApartado = false;
      this.mostrarRegistrarCotizacion = false;
      this.mostrarDialogo = false;
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
          this.limpiarEstado();
          this.$buefy.toast.open('Venta cancelada');
        }
      });
    },

    abrirDialogo(opcion) {
      this.mostrarDialogo = true;
      this.mostrarTerminarVenta = opcion === "venta";
      this.mostrarAgregarCuenta = opcion === "cuenta";
      this.mostrarAgregarApartado = opcion === "apartado";
      this.mostrarRegistrarCotizacion = opcion === "cotiza";
    },

    onCerrar(opcion) {
      this.mostrarDialogo = false;
      if (opcion === 'venta' || opcion === 'cuenta' || opcion === 'apartado' || opcion === 'cotiza') {
        this.mostrarTerminarVenta = false;
        this.mostrarAgregarCuenta = false;
        this.mostrarAgregarApartado = false;
        this.mostrarRegistrarCotizacion = false;
      }
    },

    onQuitar(id) {
      let indice = this.productos.findIndex(producto => producto.id === id);
      this.productos.splice(indice, 1);

      // Actualizar descuentos disponibles al quitar un producto
      this.descuentosDisponibles = this.descuentosDisponibles.filter(
        descuento => descuento.productId !== id
      );

      // Eliminar del mapa de descuentos aplicados
      delete this.descuentosAplicadosPorProducto[id];

      this.actualizarTotalConDescuentos();
    },

    onAumentar(producto) {
      let verificaExistencia = this.verificarExistenciaAlcanzada(producto.existencia, producto.id);

      if (verificaExistencia) return;

      if (producto.vendidoMayoreo) {
        this.verificarMayoreo(producto.cantidadMayoreo, producto.id, producto.precioMayoreo);
      }

      // Actualizar descuentos si cambia la cantidad
      this.actualizarDescuentosPorCantidad(producto.id);
      this.actualizarTotalConDescuentos();
    },

    onSeleccionado(producto) {
      // Validacion de codigo de barras no encontrado
      if (this.searchByBarcode && !producto) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'Codigo de barras no encontrado'
        });
        return;
      }

      let verificaExistencia = this.verificarExistenciaAlcanzada(producto.existencia, producto.id);

      if (verificaExistencia) return;
      if (producto.vendidoMayoreo) {
        this.verificarMayoreo(producto.cantidadMayoreo, producto.id, producto.precioMayoreo);
      }

      let existeEnLista = this.verificarSiEstaEnLista(producto.id);

      if (existeEnLista >= 0) {
        this.aumentarCantidad(existeEnLista);
        this.actualizarTotalConDescuentos();
        return;
      }

      this.agregarALista(producto);
      this.actualizarTotalConDescuentos();

      this.$nextTick(() => {
        this.$refs.buscador.focusInput();
      });
    },

    agregarALista(producto) {
      if (producto.stock === 0) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'El producto ' + producto.name + ' no tiene stock disponible.'
        });
        return;
      }
      this.productos.push({
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
      });
    },

    verificarExistenciaAlcanzada(existencia, id) {
      let resultado = false;
      this.productos.forEach(producto => {
        if (producto.id === id) {
          if (parseInt(producto.cantidad) >= parseInt(existencia)) {
            this.$buefy.toast.open({
              type: 'is-danger',
              message: 'El producto ' + producto.nombre + ' ha alcanzado la existencia máxima. Solo tienes ' + producto.existencia
            });
            producto.cantidad = existencia;
            resultado = true;
          }
        }
      });
      return resultado;
    },

    verificarMayoreo(cantidadMayoreo, id, precioMayoreo) {
      this.productos.forEach(producto => {
        if (producto.mayoreoAplicado) return;
        if (producto.id === id) {
          if (producto.cantidad >= parseInt(cantidadMayoreo)) {
            this.$buefy.dialog.confirm({
              confirmText: 'Sí, aplicar',
              cancelText: 'No aplicar',
              message: 'El producto ' + producto.nombre + ' tiene mayoreo a partir de ' + cantidadMayoreo + ' piezas, ¿Desea aplicar el mayoreo?',
              onConfirm: () => {
                producto.precio = precioMayoreo;
                producto.mayoreoAplicado = true;
                this.$buefy.toast.open('Mayoreo aplicado correctamente a ' + producto.nombre);
                this.actualizarTotalConDescuentos();
              }
            });
          }
        }
      });
    },

    verificarSiEstaEnLista(id) {
      return this.productos.findIndex(producto => producto.id === id);
    },

    aumentarCantidad(indice) {
      let lista = this.productos;
      let producto = lista[indice];
      producto.cantidad++;
      this.productos = lista;
    },

    mostrarPDFVenta(ventaId) {
      if (!ventaId) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'ID de venta no válido'
        });
        return;
      }

      this.$buefy.toast.open({
        message: 'Generando comprobante...',
        type: 'is-info',
        duration: 2000
      });

      setTimeout(() => {
        this.$refs.visorPDF.abrir(ventaId);
      }, 500);
    },

    calcularTotal() {
      let total = 0;
      this.productos.forEach(producto => {
        total += parseFloat(producto.cantidad * producto.precio);
      });
      return total;
    },

    async buscarDescuentosDisponibles() {
      if (this.productos.length === 0) return;

      this.cargandoDescuentos = true;
      this.descuentosDisponibles = [];

      try {
        for (const producto of this.productos) {
          const url = `discounts/product/${producto.id}/calculate?quantity=${producto.cantidad}&unitPrice=${producto.precio}`;

          const response = await apiRequest({
            method: 'GET',
            path: url
          });

          if (response && response.data) {
            let resultados = response.data;
            if (!Array.isArray(resultados)) {
              resultados = [resultados];
            }

            const descuentosValidos = resultados
              .filter(d => d.valid)
              .map(d => ({
                ...d,
                productId: producto.id,
                productoNombre: producto.nombre,
                aplicado: false,
                discountAmount: parseFloat(d.discountAmount) || 0,
                finalPrice: parseFloat(d.finalPrice) || 0
              }));

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
      const producto = this.productos.find(p => p.id === productoId);
      if (!producto) return;

      const descuentosExistentes = this.descuentosDisponibles.filter(
        d => d.productId === productoId
      );

      if (descuentosExistentes.length === 0) return;

      try {
        const url = `discounts/product/${producto.id}/calculate?quantity=${producto.cantidad}&unitPrice=${producto.precio}`;

        const response = await apiRequest({
          method: 'GET',
          path: url
        });

        if (response && response.data) {
          let resultados = response.data;
          if (!Array.isArray(resultados)) {
            resultados = [resultados];
          }

          const descuentosValidos = resultados.filter(d => {
            const descuento = d.discount;

            const ahora = new Date();
            const inicio = new Date(descuento.startDate);
            const fin = new Date(descuento.endDate);

            if (!descuento.isActive || ahora < inicio || ahora > fin) {
              return false;
            }

            if (producto.cantidad < descuento.minQuantity) {
              return false;
            }

            switch (descuento.type) {
              case 'FIXED_AMOUNT': {
                const valorFijo = parseFloat(descuento.value) || 0;
                d.discountAmount = valorFijo * producto.cantidad;
                d.finalPrice = (producto.precio * producto.cantidad) - d.discountAmount;
                
                if (d.finalPrice <= 0) {
                  d.discountAmount = 0;
                  d.finalPrice = producto.precio * producto.cantidad;
                  return false;
                }
                break;
              }

              case 'PERCENTAGE': {
                const porcentaje = parseFloat(descuento.value) || 0;
                d.discountAmount = (producto.precio * producto.cantidad * porcentaje) / 100;
                d.finalPrice = (producto.precio * producto.cantidad) - d.discountAmount;
                
                if (d.finalPrice <= 0) {
                  d.discountAmount = 0;
                  d.finalPrice = producto.precio * producto.cantidad;
                  return false;
                }
                break;
              }

              case 'BUNDLE': {
                if (producto.cantidad >= descuento.minQuantity) {
                  const bundles = Math.floor(producto.cantidad / descuento.value);
                  d.discountAmount = bundles * producto.precio;
                  d.finalPrice = producto.precio * (producto.cantidad - bundles);
                  
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
                  const gratis = Math.floor(producto.cantidad / (descuento.value + 1));
                  d.discountAmount = gratis * producto.precio;
                  d.finalPrice = producto.precio * (producto.cantidad - gratis);
                  
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
                const valorEstacional = parseFloat(descuento.value) || 0;
                d.discountAmount = (producto.precio * producto.cantidad * valorEstacional) / 100;
                d.finalPrice = (producto.precio * producto.cantidad) - d.discountAmount;
                
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

            d.discountAmount = parseFloat(d.discountAmount.toFixed(2));
            d.finalPrice = parseFloat(d.finalPrice.toFixed(2));
            
            return true;
          });

          const descuentosActualizados = this.descuentosDisponibles.map(d => {
            if (d.productId !== productoId) return d;

            const descuentoActualizado = descuentosValidos.find(
              nuevo => nuevo.discount.id === d.discount.id
            );

            if (descuentoActualizado) {
              return {
                ...descuentoActualizado,
                productId: productoId,
                productoNombre: producto.nombre,
                aplicado: d.aplicado
              };
            } else {
              return {
                ...d,
                valid: false,
                aplicado: false
              };
            }
          });

          this.descuentosDisponibles = descuentosActualizados.filter(
            d => d.valid || d.productId !== productoId
          );
        }
      } catch (error) {
        console.error('Error al actualizar descuentos:', error);
      }
    },

    actualizarTotalConDescuentos() {
      this.subtotal = this.calcularTotal();
      this.descuentosAplicadosPorProducto = {};
      this.descuentoTotal = 0;

      const descuentosPorProducto = {};
      
      this.descuentosDisponibles.forEach(descuento => {
        if (descuento.aplicado) {
          if (!descuentosPorProducto[descuento.productId]) {
            descuentosPorProducto[descuento.productId] = [];
          }
          descuentosPorProducto[descuento.productId].push(descuento);
        }
      });
      
      Object.keys(descuentosPorProducto).forEach(productoId => {
        const descuentosProducto = descuentosPorProducto[productoId];
        
        if (descuentosProducto.length > 0) {
          descuentosProducto.sort((a, b) => b.discountAmount - a.discountAmount);
          
          const mejorDescuento = descuentosProducto[0];
          this.descuentoTotal += mejorDescuento.discountAmount;
          
          this.descuentosAplicadosPorProducto[productoId] = mejorDescuento.discount.id;
          
          descuentosProducto.slice(1).forEach(d => {
            d.aplicado = false;
          });
        }
      });

      if (this.descuentoTotal > this.subtotal) {
        this.descuentoTotal = this.subtotal;
      }

      this.total = Math.max(0, this.subtotal - this.descuentoTotal);
      
      this.total = parseFloat(this.total.toFixed(2));
      this.subtotal = parseFloat(this.subtotal.toFixed(2));
      this.descuentoTotal = parseFloat(this.descuentoTotal.toFixed(2));
    }
  },

  watch: {
    '$route'() {
      this.$nextTick(() => {
        this.$refs.buscador.focusInput();
      });
    }
  },
}
</script>

<style src="./../stilos/RealizarVenta.css"></style>