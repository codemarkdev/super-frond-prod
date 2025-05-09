<template>
  <div v-if="isAdmin">
    <header class="header">
      <h1 class="title is-2">Historial General</h1>
      <p class="subtitle is-5">
        <b-icon icon="calendar-today"></b-icon>
        {{
          new Date().toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </p>
    </header>
    <div class="columns is-multiline">
      <!-- Ingreso del Día -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">HOY</p>
                    <p class="title is-4">${{ formatNumber(ingresoHoy) }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="calendar-today" size="is-large" type="is-info"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingreso Semanal -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">ESTA SEMANA</p>
                    <p class="title is-4">
                      ${{ formatNumber(ingresoSemanal) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="calendar-week" size="is-large" type="is-primary"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ingreso Mensual -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">ESTE MES</p>
                    <p class="title is-4">
                      ${{ formatNumber(ingresoMensual) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="calendar-month" size="is-large" type="is-warning"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ganancia del Inventario -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">GANANCIA INVENTARIO</p>
                    <p class="title is-4">
                      ${{ formatNumber(inventoryProfit) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="trending-up" size="is-large" type="is-success"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Valor Total del Inventario -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">VALOR INVENTARIO</p>
                    <p class="title is-4">
                      ${{ formatNumber(inventoryTotal) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="package" size="is-large" type="is-info"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Stock del Inventario -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">TOTAL PRODUCTOS</p>
                    <p class="title is-4">
                      {{ formatNumber(inventoryTotalStock) }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="archive" size="is-large" type="is-primary"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Producto Más Vendido -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">PRODUCTO MÁS VENDIDO</p>
                    <p class="title is-5">{{ topSellingProduct.product_name || 'Sin datos' }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="trophy" size="is-large" type="is-warning"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total de Proveedores -->
      <div class="column is-3">
        <div class="card">
          <div class="card-content">
            <div class="level is-mobile">
              <div class="level-left">
                <div class="level-item">
                  <div>
                    <p class="heading">TOTAL PROVEEDORES</p>
                    <p class="title is-4">{{ totalProveedores }}</p>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <b-icon icon="truck-delivery" size="is-large" type="is-danger"></b-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/Servicios/HttpService";

export default {
  name: "ResumenIngresos",
  
  props: {
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      ingresoHoy: 0,
      ingresoSemanal: 0,
      ingresoMensual: 0,
      inventoryProfit: 0,
      inventoryTotal: 0,
      inventoryTotalStock: 0,
      totalProveedores: 0,
      topSellingProduct: {
        product_name: "",
        total: 0,
        units: 0
      },
      cargando: {
        ingresosHoy: false,
        ingresosSemana: false,
        ingresosMes: false
      }
    };
  },
  
  mounted() {
    this.cargarDatos();
  },
  
  methods: {
    formatNumber(value) {
      if (value === null || value === undefined) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num)
        ? "0.00"
        : num.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    },
    
    async cargarDatos() {
      try {
        await Promise.all([
          this.obtenerIngresoHoy(),
          this.obtenerIngresoSemanal(),
          this.obtenerIngresoMensual(),
          this.obtenerInventoryProfit(),
          this.obtenerInventoryTotal(),
          this.obtenerInventoryTotalStock(),
          this.obtenerProductoMasVendido(),
          this.obtenerTotalProveedores(),
        ]);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        this.mostrarError("Error al cargar los datos iniciales.");
      }
    },
    
    async obtenerIngresoHoy() {
      this.cargando.ingresosHoy = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sales/today-income",
        });

        if (response.status === 200) {
          this.ingresoHoy = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingreso del día:", error);
        this.mostrarError("Error al cargar el ingreso del día");
        this.ingresoHoy = 0;
      } finally {
        this.cargando.ingresosHoy = false;
      }
    },

    async obtenerIngresoSemanal() {
      this.cargando.ingresosSemana = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sales/weekly-income",
        });

        if (response.status === 200) {
          this.ingresoSemanal = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingreso semanal:", error);
        this.mostrarError("Error al cargar el ingreso semanal");
        this.ingresoSemanal = 0;
      } finally {
        this.cargando.ingresosSemana = false;
      }
    },

    async obtenerIngresoMensual() {
      this.cargando.ingresosMes = true;
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sales/monthly-income",
        });

        if (response.status === 200) {
          this.ingresoMensual = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ingreso mensual:", error);
        this.mostrarError("Error al cargar el ingreso mensual");
        this.ingresoMensual = 0;
      } finally {
        this.cargando.ingresosMes = false;
      }
    },

    async obtenerInventoryProfit() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "products/inventory/total-profit",
        });

        if (response.status === 200) {
          this.inventoryProfit = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener ganancia del inventario:", error);
        this.mostrarError("Error al cargar la ganancia del inventario");
        this.inventoryProfit = 0;
      }
    },

    async obtenerInventoryTotal() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "products/inventory/total-value",
        });

        if (response.status === 200) {
          this.inventoryTotal = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener valor total del inventario:", error);
        this.mostrarError("Error al cargar el valor total del inventario");
        this.inventoryTotal = 0;
      }
    },

    async obtenerInventoryTotalStock() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "products/inventory/total-stock",
        });

        if (response.status === 200) {
          this.inventoryTotalStock = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener total de stock:", error);
        this.mostrarError("Error al cargar el total de stock");
        this.inventoryTotalStock = 0;
      }
    },
    
    async obtenerProductoMasVendido() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "sold-products/top-sold?limit=1",
        });

        if (response.status === 200 && response.data.length > 0) {
          this.topSellingProduct = response.data[0];
        }
      } catch (error) {
        console.error("Error al obtener producto más vendido:", error);
        this.mostrarError("Error al cargar el producto más vendido");
        this.topSellingProduct = {
          product_name: "",
          total: 0,
          units: 0
        };
      }
    },
    
    async obtenerTotalProveedores() {
      try {
        const response = await apiRequest({
          method: "GET",
          path: "providers/total-providers",
        });

        if (response.status === 200) {
          this.totalProveedores = response.data || 0;
        }
      } catch (error) {
        console.error("Error al obtener total de proveedores:", error);
        this.mostrarError("Error al cargar el total de proveedores");
        this.totalProveedores = 0;
      }
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

<style scoped>
.header {
  margin-bottom: 2rem;
  text-align: center;
}

.card {
  margin-bottom: 1rem;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1);
}

.heading {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 0.5rem;
}

@media screen and (max-width: 768px) {
  .column {
    padding: 0.5rem;
  }
}
</style>