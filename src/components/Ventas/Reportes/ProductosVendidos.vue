<template>
  <div class="card dashboard-card mb-6" v-if="isAdmin">
    <header class="card-header">
      <p class="card-header-title">
        <b-icon icon="package" type="is-info"></b-icon>
        Detalles de Productos Vendidos
      </p>
    </header>
    <div class="card-content">
      <b-field label="Buscar por nombre de producto">
        <b-input v-model="filtroNombreProducto" placeholder="Escriba el nombre del producto" expanded></b-input>
      </b-field>

      <b-table :data="productosPaginados" :loading="cargando" :striped="true" :hoverable="true">
        <b-table-column field="nombreProducto" label="Nombre Producto" v-slot="props">
          {{ props.row.nombreProducto }}
        </b-table-column>
        <b-table-column field="quantity" label="Cantidad" numeric v-slot="props">
          {{ formatNumber(props.row.quantity) }}
        </b-table-column>
        <b-table-column field="price" label="Precio Venta" numeric v-slot="props">
          ${{ formatNumber(props.row.price) }}
        </b-table-column>
        <b-table-column field="priceWithouthIVA" label="Precio sin IVA" numeric v-slot="props">
          ${{ formatNumber(props.row.priceWithouthIVA) }}
        </b-table-column>
        <b-table-column field="iva" label="IVA" numeric v-slot="props">
          ${{ formatNumber(props.row.iva) }}
        </b-table-column>
      </b-table>

      <b-pagination v-model="productosPaginacion.currentPage" :total="productosPaginacion.total"
        :per-page="productosPaginacion.perPage" :range-before="3" :range-after="3" order="is-centered"
        aria-next-label="Siguiente página" aria-previous-label="Página anterior" aria-page-label="Página"
        aria-current-label="Página actual" @change="cambiarPaginaProductos">
      </b-pagination>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "ProductosVendidos",
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      productosVendidos: [],
      productosPaginacion: {
        total: 0,
        currentPage: 1,
        perPage: 10,
        totalPages: 0,
      },
      filtroNombreProducto: "",
      cargando: false
    };
  },
  
  computed: {
    productosPaginados() {
      if (!this.filtroNombreProducto) {
        return this.productosVendidos;
      }
      const filtro = this.filtroNombreProducto.toLowerCase();
      return this.productosVendidos.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(filtro)
      );
    }
  },
  
  mounted() {
    this.obtenerProductosVendidosConNombres();
  },
  
  methods: {
    formatNumber(value) {
      if (!value) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num)
        ? "0.00"
        : num.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    },
    
    async obtenerProductosVendidosConNombres() {
      this.cargando = true;
      try {
        const respuestaProductosVendidos = await apiRequest({
          method: "GET",
          path: `sold-products?page=${this.productosPaginacion.currentPage}&limit=${this.productosPaginacion.perPage}`,
        });

        if (respuestaProductosVendidos?.data) {
          const productosVendidos = respuestaProductosVendidos.data.data || [];

          this.productosPaginacion.total =
            respuestaProductosVendidos.data.total || 0;
          this.productosPaginacion.totalPages =
            respuestaProductosVendidos.data.totalPages || 0;

          const peticionesDetallesProductos = productosVendidos.map(
            (producto) =>
              apiRequest({
                method: "GET",
                path: `sold-products/${producto.id}/${producto.type}`,
              })
          );

          const respuestasDetallesProductos = await Promise.all(
            peticionesDetallesProductos
          );

          this.productosVendidos = productosVendidos.map(
            (producto, indice) => ({
              ...producto,
              nombreProducto:
                respuestasDetallesProductos[indice].data[0]?.product_name ||
                "Desconocido",
            })
          );
        }
      } catch (error) {
        console.error("Error obteniendo productos vendidos:", error);
        this.mostrarError("Error al cargar los productos vendidos");
      } finally {
        this.cargando = false;
      }
    },
    
    cambiarPaginaProductos(pagina) {
      this.productosPaginacion.currentPage = pagina;
      this.obtenerProductosVendidosConNombres();
    },
    
    mostrarError(mensaje) {
      this.$buefy.toast.open({
        message: mensaje,
        type: "is-danger",
        duration: 5000,
      });
    }
  }
};
</script>