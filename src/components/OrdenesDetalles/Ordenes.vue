<template>
  <div class="ordenes-component">
    <div class="section">
      <!-- Componente de búsqueda -->
      <BuscadorOrdenes 
        :busqueda="busqueda" 
        @buscar="actualizarBusqueda" 
      />

      <!-- Componente de tabla de órdenes -->
      <TablaOrdenes 
        :ordenes="ordenesPaginadas" 
        :cargando="cargando" 
        :error="error"
        :esAdmin="esAdmin"
        :totalOrdenes="ordenesFiltradas.length"
        :paginaActual="paginaActual"
        :elementosPorPagina="elementosPorPagina"
        :productosCache="productosCache"
        @recargar="cargarOrdenes"
        @cambiar-pagina="cambiarPagina"
        @cambiar-elementos-por-pagina="cambiarElementosPorPagina"
        @ver-detalles="verDetalles"
        @ver-resumen="verResumenFinanciero"
        @eliminar="confirmarEliminar"
      />
    </div>

    <!-- Modal de detalles -->
    <DetallesOrden 
      :activo="modalDetallesActivo" 
      :orden="ordenDetalle"
      :productosCache="productosCache"
      @cerrar="cerrarModalDetalles"
    />

    <!-- Modal de resumen financiero -->
    <ResumenFinanciero 
      :activo="modalResumenActivo" 
      :resumen="resumenFinanciero"
      @cerrar="cerrarModalResumen"
    />

    <!-- Modal de edición -->
    <EditarOrden 
      :activo="modalEditarActivo" 
      :orden="ordenEditando"
      :actualizando="actualizando"
      @cerrar="cerrarModalEditar"
      @guardar="actualizarOrden"
    />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmarEliminar 
      :activo="modalEliminarActivo" 
      :orden="ordenEliminar"
      :eliminando="eliminando"
      @cerrar="cerrarModalEliminar"
      @confirmar="eliminarOrden"
    />
  </div>
</template>

<script>
import apiRequest from '@/Servicios/HttpService';
import AyudanteSesion from '@/Servicios/AyudanteSesion';
import BuscadorOrdenes from './Ordenes/BuscadorOrdenes.vue';
import TablaOrdenes from './Ordenes/TablaOrdenes.vue';
import DetallesOrden from './Ordenes/DetallesOrden.vue';
import ResumenFinanciero from './Ordenes/ResumenFinanciero.vue';
import EditarOrden from './Ordenes/EditarOrden.vue';
import ConfirmarEliminar from './Ordenes/ConfirmarEliminar.vue';

export default {
  name: 'OrdenesComponent',
  
  components: {
    BuscadorOrdenes,
    TablaOrdenes,
    DetallesOrden,
    ResumenFinanciero,
    EditarOrden,
    ConfirmarEliminar
  },
  
  data() {
    return {
      // Lista de órdenes
      ordenes: [],
      ordenesFiltradas: [],
      busqueda: '',
      
      // Paginación
      paginaActual: 1,
      elementosPorPagina: 10,
      
      // Estados de carga
      cargando: false,
      error: null,
      
      // Modal de edición
      modalEditarActivo: false,
      ordenEditando: null,
      actualizando: false,
      
      // Modal de eliminación
      modalEliminarActivo: false,
      ordenEliminar: null,
      eliminando: false,
      
      // Modal de detalles
      modalDetallesActivo: false,
      ordenDetalle: null,
      
      // Modal de resumen financiero
      modalResumenActivo: false,
      resumenFinanciero: null,
      cargandoResumen: false,
      
      // Estado de administrador
      esAdmin: false,
      
      // Caché de productos
      productosCache: {}
    };
  },
  
  computed: {
    // Obtener las órdenes para la página actual
    ordenesPaginadas() {
      const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
      const fin = inicio + this.elementosPorPagina;
      return this.ordenesFiltradas.slice(inicio, fin);
    }
  },
  
  created() {
    this.verificarAdmin();
    this.cargarOrdenes();
    this.cargarProductos();
  },
  
  methods: {
    // Actualizar búsqueda
    actualizarBusqueda(busqueda) {
      this.busqueda = busqueda;
      this.filtrarOrdenes();
    },
    
    // Cambiar de página
    cambiarPagina(pagina) {
      this.paginaActual = pagina;
    },
    
    // Cambiar elementos por página
    cambiarElementosPorPagina(elementos) {
      this.elementosPorPagina = elementos;
      this.paginaActual = 1; // Volver a la primera página al cambiar elementos por página
    },
    
    // Verificar si el usuario es administrador
    verificarAdmin() {
      const datosUsuario = AyudanteSesion.obtenerDatosSesion();
      this.esAdmin = datosUsuario.rol === 'Admin';
    },
    
    // Cargar todas las órdenes
    async cargarOrdenes() {
      this.cargando = true;
      this.error = null;
      
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'orders'
        });
        
        if (response.status === 200) {
          this.ordenes = response.data;
          
          // Enriquecer las órdenes con nombres de productos
          await this.enriquecerOrdenesConProductos(this.ordenes);
          
          this.ordenesFiltradas = [...this.ordenes];
          this.paginaActual = 1; // Volver a la primera página al cargar nuevos datos
        } else {
          this.error = `Error ${response.status}: No se pudieron cargar las órdenes`;
        }
      } catch (err) {
        console.error('Error al cargar órdenes:', err);
        this.error = err.message || 'Error al cargar las órdenes. Por favor, intente nuevamente.';
      } finally {
        this.cargando = false;
      }
    },
    
    // Enriquecer órdenes con nombres de productos
    async enriquecerOrdenesConProductos(ordenes) {
      // Si no tenemos productos en caché, los cargamos
      if (Object.keys(this.productosCache).length === 0) {
        await this.cargarProductos();
      }
      
      try {
        // Obtener todos los detalles de productos
        const response = await apiRequest({
          method: 'GET',
          path: 'order-details'
        });
        
        if (response && response.data) {
          // Crear un mapa de productos para acceso rápido
          const productosMap = {};
          response.data.forEach(detalle => {
            if (detalle.product) {
              productosMap[detalle.product.id] = detalle.product;
            }
          });
          
          // Actualizar el caché global con cualquier producto nuevo
          Object.assign(this.productosCache, productosMap);
          
          // Enriquecer cada orden con nombres de productos
          ordenes.forEach(orden => {
            if (orden.orderDetails && orden.orderDetails.length > 0) {
              orden.orderDetails.forEach(detalle => {
                // Buscar el detalle correspondiente en los detalles con productos
                const detalleCompleto = response.data.find(d => d.id === detalle.id);
                
                if (detalleCompleto && detalleCompleto.product) {
                  // Si encontramos el detalle con su producto, usamos ese nombre
                  detalle.productName = detalleCompleto.product.name;
                  detalle.productId = detalleCompleto.product.id;
                } else if (detalle.product && detalle.product.id) {
                  // Si el detalle ya tiene un producto con ID
                  const productId = detalle.product.id;
                  if (productosMap[productId]) {
                    detalle.productName = productosMap[productId].name;
                  } else if (this.productosCache[productId]) {
                    detalle.productName = this.productosCache[productId].name;
                  } else {
                    detalle.productName = detalle.product.name || `Producto #${productId}`;
                  }
                } else {
                  // Si no podemos encontrar el producto, mostramos un mensaje genérico
                  detalle.productName = "Producto sin información";
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Error al enriquecer órdenes con productos:", error);
      }
    },
    
    // Cargar productos para tener un caché
    async cargarProductos() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'order-details'
        });
        
        if (response.status === 200 && Array.isArray(response.data)) {
          // Crear un mapa de productos para acceso rápido
          response.data.forEach(detalle => {
            if (detalle.product && detalle.product.id) {
              this.productosCache[detalle.product.id] = detalle.product;
            }
          });
          
          console.log('Caché de productos cargado:', Object.keys(this.productosCache).length, 'productos');
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    },
    
    // Filtrar órdenes según la búsqueda
    filtrarOrdenes() {
      if (!this.busqueda.trim()) {
        this.ordenesFiltradas = [...this.ordenes];
        this.paginaActual = 1; // Volver a la primera página al limpiar la búsqueda
        return;
      }
      
      const busquedaLower = this.busqueda.toLowerCase().trim();
      
      this.ordenesFiltradas = this.ordenes.filter(orden => {
        // Buscar en los datos básicos de la orden
        const coincideBasicos = orden.invoiceNumber.toLowerCase().includes(busquedaLower) ||
                               orden.provider.name.toLowerCase().includes(busquedaLower) ||
                               orden.id.toString().includes(busquedaLower);
        
        // Buscar en los nombres de productos
        let coincideProductos = false;
        if (orden.orderDetails && orden.orderDetails.length > 0) {
          coincideProductos = orden.orderDetails.some(detalle => {
            const nombreProducto = this.obtenerNombreProducto(detalle);
            return nombreProducto.toLowerCase().includes(busquedaLower);
          });
        }
        
        return coincideBasicos || coincideProductos;
      });
      
      this.paginaActual = 1; // Volver a la primera página al filtrar
    },
    
    // Obtener nombre de producto para un detalle
    obtenerNombreProducto(detalle) {
      if (detalle.productName) {
        return detalle.productName;
      }
      
      if (detalle.product && detalle.product.name) {
        return detalle.product.name;
      }
      
      if (detalle.product && detalle.product.id && this.productosCache[detalle.product.id]) {
        return this.productosCache[detalle.product.id].name;
      }
      
      if (detalle.productId && this.productosCache[detalle.productId]) {
        return this.productosCache[detalle.productId].name;
      }
      
      return "Producto sin información";
    },
    
    // Ver detalles de la orden
    verDetalles(orden) {
      this.ordenDetalle = JSON.parse(JSON.stringify(orden)); // Copia profunda
      this.modalDetallesActivo = true;
    },
    
    // Cerrar modal de detalles
    cerrarModalDetalles() {
      this.modalDetallesActivo = false;
      this.ordenDetalle = null;
    },
    
    // Ver resumen financiero
    async verResumenFinanciero(orden) {
      if (!orden || !orden.invoiceNumber) {
        this.$buefy.toast.open({
          message: 'No se pudo obtener el número de factura para esta orden',
          type: 'is-danger'
        });
        return;
      }
      
      this.cargando = true;
      this.resumenFinanciero = null; // Reiniciar el resumen financiero
      
      try {
        console.log(`Obteniendo resumen financiero para factura: ${orden.invoiceNumber}`);
        
        // Si no tenemos productos en caché, los cargamos
        if (Object.keys(this.productosCache).length === 0) {
          await this.cargarProductos();
        }
        
        const response = await apiRequest({
          method: 'GET',
          path: `order-details/summary/${orden.invoiceNumber}`
        });
        
        if (response && response.data && response.data.summary) {
          this.resumenFinanciero = response.data;
          
          // Enriquecer los detalles del resumen con nombres de productos
          if (this.resumenFinanciero.details) {
            // Primero, intentemos obtener los detalles completos de los productos para esta orden
            try {
              const detallesResponse = await apiRequest({
                method: 'GET',
                path: 'order-details'
              });
              
              if (detallesResponse && detallesResponse.data) {
                // Crear un mapa de productos para acceso rápido
                const productosMap = {};
                detallesResponse.data.forEach(detalle => {
                  if (detalle.product) {
                    productosMap[detalle.product.id] = detalle.product;
                  }
                });
                
                // Actualizar el caché global con cualquier producto nuevo
                Object.assign(this.productosCache, productosMap);
                
                // Ahora enriquecer los detalles del resumen
                this.resumenFinanciero.details.forEach(detalle => {
                  if (detalle.productId && productosMap[detalle.productId]) {
                    detalle.productName = productosMap[detalle.productId].name;
                  } else if (detalle.productId && this.productosCache[detalle.productId]) {
                    detalle.productName = this.productosCache[detalle.productId].name;
                  } else {
                    detalle.productName = `Producto ID: ${detalle.productId || 'No disponible'}`;
                  }
                });
              }
            } catch (error) {
              console.error("Error al obtener detalles de productos para el resumen:", error);
              // Si hay un error, usamos solo el caché
              this.resumenFinanciero.details.forEach(detalle => {
                if (detalle.productId && this.productosCache[detalle.productId]) {
                  detalle.productName = this.productosCache[detalle.productId].name;
                } else {
                  detalle.productName = `Producto ID: ${detalle.productId || 'No disponible'}`;
                }
              });
            }
          }
        } else {
          console.warn('Respuesta de resumen financiero incompleta o vacía');
          // Crear un objeto resumenFinanciero vacío para mostrar el mensaje de no disponible
          this.resumenFinanciero = { details: [] };
        }
      } catch (error) {
        console.error("Error al obtener resumen financiero:", error);
        
        // Crear un objeto resumenFinanciero vacío para mostrar el mensaje de no disponible
        this.resumenFinanciero = { details: [] };
        
        // Registrar el error en la consola pero no mostrar toast, ya que mostraremos el modal con mensaje
        console.error("Detalles del error:", error);
      } finally {
        this.cargando = false;
        // Siempre mostrar el modal, incluso si no hay datos
        this.modalResumenActivo = true;
      }
    },
    
    // Cerrar modal de resumen financiero
    cerrarModalResumen() {
      this.modalResumenActivo = false;
      this.resumenFinanciero = null;
    },
    
    // Confirmar eliminación
    confirmarEliminar(orden) {
      this.ordenEliminar = orden;
      this.modalEliminarActivo = true;
    },
    
    // Cerrar modal de eliminación
    cerrarModalEliminar() {
      this.modalEliminarActivo = false;
      this.ordenEliminar = null;
    },
    
    // Eliminar orden
    async eliminarOrden() {
      if (!this.ordenEliminar || !this.ordenEliminar.id) return;
      
      this.eliminando = true;
      
      try {
        const response = await apiRequest({
          method: 'DELETE',
          path: `orders/${this.ordenEliminar.id}`
        });
        
        if (response.status === 200 || response.status === 204) {
          // Eliminar la orden de la lista local
          this.ordenes = this.ordenes.filter(o => o.id !== this.ordenEliminar.id);
          this.ordenesFiltradas = this.ordenesFiltradas.filter(o => o.id !== this.ordenEliminar.id);
          
          // Mostrar mensaje de éxito
          this.$buefy.toast.open({
            message: 'Orden eliminada correctamente',
            type: 'is-success'
          });
          
          // Cerrar el modal
          this.cerrarModalEliminar();
        } else {
          throw new Error(`Error ${response.status}: No se pudo eliminar la orden`);
        }
      } catch (err) {
        console.error('Error al eliminar orden:', err);
        
        this.$buefy.toast.open({
          message: err.message || 'Error al eliminar la orden',
          type: 'is-danger'
        });
      } finally {
        this.eliminando = false;
      }
    },
    
    // Abrir modal de edición
    async abrirModalEditar(orden) {
      // Hacer una copia profunda de la orden para editar
      this.ordenEditando = JSON.parse(JSON.stringify({
        id: orden.id,
        invoiceNumber: orden.invoiceNumber,
        orderDate: orden.orderDate,
        isActive: orden.isActive,
        provider: orden.provider,
        orderDetails: orden.orderDetails || []
      }));
      
      // Si no tenemos los detalles de la orden, los obtenemos
      if (!orden.orderDetails || !Array.isArray(orden.orderDetails)) {
        try {
          const response = await apiRequest({
            method: 'GET',
            path: `orders/${orden.id}`
          });
          
          if (response.status === 200 && response.data) {
            this.ordenEditando.orderDetails = response.data.orderDetails || [];
          }
        } catch (error) {
          console.error("Error al obtener detalles de la orden:", error);
          this.ordenEditando.orderDetails = [];
        }
      }
      
      this.modalEditarActivo = true;
    },
    
    // Cerrar modal de edición
    cerrarModalEditar() {
      this.modalEditarActivo = false;
      this.ordenEditando = null;
    },
    
    // Actualizar orden
    async actualizarOrden(datosActualizacion) {
      if (!this.ordenEditando || !this.ordenEditando.id) return;
      
      this.actualizando = true;
      
      try {
        const response = await apiRequest({
          method: 'PATCH',
          path: `orders/${this.ordenEditando.id}`,
          data: datosActualizacion
        });
        
        if (response.status === 200) {
          // Mostrar mensaje de éxito
          this.$buefy.toast.open({
            message: 'Orden actualizada correctamente',
            type: 'is-success'
          });
          
          // Cerrar el modal
          this.cerrarModalEditar();
          
          // Recargar los datos para asegurar que todo esté actualizado
          await this.cargarOrdenes();
        } else {
          throw new Error(`Error ${response.status}: No se pudo actualizar la orden`);
        }
      } catch (err) {
        console.error('Error al actualizar orden:', err);
        
        this.$buefy.toast.open({
          message: err.message || 'Error al actualizar la orden',
          type: 'is-danger'
        });
      } finally {
        this.actualizando = false;
      }
    }
  }
};
</script>

<style src="./../stilos/ordenes.css"></style>