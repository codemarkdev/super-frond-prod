<template>
  <section>
    <div class="field is-grouped mb-4">
      <div class="control is-expanded">
        <b-input
          v-model="searchTerm"
          placeholder="Buscar por nombre o código de barras"
          icon="magnify"
          @input="onSearch"
          debounce="400"
        />
      </div>
      <div class="control">
        <b-button icon-left="close-circle" type="is-light" @click="limpiarBusqueda" v-if="searchTerm">
          Limpiar
        </b-button>
      </div>
    </div>

    <TabsHeader :activeTab="activeTab" :isAdmin="isAdmin" @tab-change="cambiarTab" />

    <component
      :is="getCurrentTabComponent"
      :productos="productos"
      :totales="cartasTotales"
      :cargando="cargando"
      :pagination="pagination"
      :total="totalProductos"
      @agregar="agregarExistencia"
      @quitar="quitarExistencia"
      @marcar-danado="marcarComoDanado"
      @editar="editar"
      @eliminar="eliminar"
      @page-change="onPageChange"
      @producto-restaurado="obtenerProductos"
    />

    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false" />
  </section>
</template>
<script>
import TabsHeader from './sud-products-comp/TabsHeader.vue'
import InventarioTab from './sud-products-comp/InventarioTab.vue'
import ProductosAbollados from '../Inventario/Productos-Abollados.vue'
import ProductosEliminados from '../Inventario/Productos-Eliminados.vue'
import GestionDescuentos from '../Descuentos/Descuentos.vue'
import apiRequest from '../../Servicios/HttpService'
import AyudanteSesion from '../../Servicios/AyudanteSesion'

export default {
  name: 'ProductosComponent',
  components: {
    TabsHeader,
    InventarioTab,
    ProductosAbollados,
    ProductosEliminados,
    GestionDescuentos
  },
  data: () => ({
    activeTab: 'inventario',
    productos: [],
    cartasTotales: [],
    totalProductos: 0,
    cargando: false,
    searchTerm: '',
    pagination: {
      currentPage: 1,
      perPage: 10,
      totalPages: 1
    },
    isAdmin: false
  }),
  computed: {
    getCurrentTabComponent() {
      switch (this.activeTab) {
        case 'inventario': return 'InventarioTab'
        case 'abollados': return 'ProductosAbollados'
        case 'descuentos': return 'GestionDescuentos'
        case 'eliminados': return this.isAdmin ? 'ProductosEliminados' : null
        default: return null
      }
    }
  },
  mounted() {
    this.verificarPermisos()
    this.obtenerProductos()
  },
  methods: {
    // ---- Helpers de estado ----
    esEliminado(p) {
      return p?.isDeleted === true || p?.deleted === true || !!p?.deletedAt
    },
    esInactivo(p) {
      return p?.is_active === false || p?.active === false || p?.status === 'inactive'
    },
    esActivo(p) {
      return !this.esEliminado(p) && !this.esInactivo(p)
    },

    cambiarTab(tab) {
      this.activeTab = tab
      this.pagination.currentPage = 1
      this.obtenerProductos()
    },
    verificarPermisos() {
      const datos = AyudanteSesion.obtenerDatosSesion()
      this.isAdmin = datos.rol === 'Admin'
    },
    onPageChange(page) {
      this.pagination.currentPage = page
      this.obtenerProductos()
    },
    onSearch() {
      this.pagination.currentPage = 1
      this.obtenerProductos()
    },
    limpiarBusqueda() {
      this.searchTerm = ''
      this.pagination.currentPage = 1
      this.obtenerProductos()
    },

    async obtenerProductos() {
      this.cargando = true
      const page = this.pagination.currentPage
      const limit = this.pagination.perPage
      const term = this.searchTerm.trim()

      try {
        let res
        if (term) {
          // --- Búsqueda ---
          res = await apiRequest({ method: 'GET', path: `products/search/${encodeURIComponent(term)}` })
          const resultados = Array.isArray(res?.data) ? res.data : []
          const q = term.toLowerCase()

          // 1) Filtrar por estado según pestaña
          const porEstado = (this.activeTab === 'eliminados')
            ? resultados.filter(p => this.esEliminado(p))      // mostrar solo eliminados
            : resultados.filter(p => this.esActivo(p))          // ocultar eliminados/inactivos

          // 2) Filtrar por texto (name/code) y limitar
          this.productos = porEstado
            .filter(p => p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q))
            .slice(0, 20)

          // totales locales (la búsqueda es client-side)
          this.totalProductos = this.productos.length
          this.pagination.totalPages = 1
          this.cartasTotales = []
        } else {
          // --- Listado paginado ---
          res = await apiRequest({ method: 'GET', path: `products?page=${page}&limit=${limit}` })
          const lista = Array.isArray(res?.data?.data) ? res.data.data : []

          // Filtrar por estado según pestaña
          const filtrados = (this.activeTab === 'eliminados')
            ? lista.filter(p => this.esEliminado(p))
            : lista.filter(p => this.esActivo(p))

          this.productos = filtrados

          // Nota: los totales del backend incluyen todo; como filtramos client-side,
          // ajustamos contadores para lo que se muestra actualmente.
          // Si quieres totales “reales” por estado, pide endpoints separados.
          this.totalProductos = filtrados.length
          // Mantén la paginación del backend si no buscas; si el filtro te deja menos filas,
          // puedes dejar la página tal cual o recalcular. Aquí lo dejamos como viene:
          this.pagination.totalPages = res?.data?.totalPages || 1

          // Cartas de totales (sólo cuando no se está buscando)
          const valorRes = await apiRequest({ method: 'GET', path: 'products/inventory/total-value' })
          const gananciaRes = await apiRequest({ method: 'GET', path: 'products/inventory/total-profit' })

          this.cartasTotales = [
            { nombre: 'Número Productos', total: this.totalProductos, icono: 'package-variant-closed', clase: 'has-text-danger' },
            { nombre: 'Total Inventario', total: `$ ${parseFloat(valorRes.data).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icono: 'chart-bar-stacked', clase: 'has-text-primary' },
            { nombre: 'Ganancia a precio venta', total: `$ ${parseFloat(gananciaRes.data).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icono: 'currency-usd', clase: 'has-text-info' }
          ]
        }
      } catch (e) {
        console.error('Error al obtener productos o totales:', e)
        this.productos = []
        this.totalProductos = 0
        this.pagination.totalPages = 1
        this.cartasTotales = []
        this.$buefy.toast.open({ message: 'Error al cargar productos', type: 'is-danger' })
      } finally {
        this.cargando = false
      }
    },

    agregarExistencia(producto) {
      this.$buefy.dialog.prompt({
        message: `¿Cuántas piezas vas a agregar a ${producto.name}?`,
        cancelText: 'Cancelar',
        confirmText: 'Agregar',
        inputAttrs: {
          type: 'number',
          placeholder: 'Cantidad a agregar',
          min: 1
        },
        trapFocus: true,
        onConfirm: (value) => {
          const cantidad = Number(value)
          if (isNaN(cantidad) || cantidad <= 0) {
            this.$buefy.toast.open({ message: 'Por favor ingresa una cantidad válida', type: 'is-danger' })
            return
          }
          this.cargando = true
          apiRequest({
            method: 'PATCH',
            path: `products/${producto.id}/add-stock?quantity=${cantidad}`
          })
            .then(registrado => {
              this.cargando = false
              if (registrado) {
                this.$buefy.toast.open(`${cantidad} productos agregados a ${producto.name}`)
                this.obtenerProductos()
              }
            })
            .catch(() => {
              this.cargando = false
              this.$buefy.toast.open({ message: 'Error al agregar existencia', type: 'is-danger' })
            })
        }
      })
    },

    quitarExistencia(producto) {
      this.$buefy.dialog.prompt({
        message: '¿Cuántas piezas vas a quitar de ' + producto.name + '?',
        cancelText: 'Cancelar',
        confirmText: 'Quitar',
        inputAttrs: {
          type: 'number',
          placeholder: 'Escribe la cantidad de productos',
          value: '',
          min: 1
        },
        trapFocus: true,
        onConfirm: (value) => {
          const cantidad = Number(value)
          if (isNaN(cantidad) || cantidad <= 0) {
            this.$buefy.toast.open({ message: 'Por favor ingresa una cantidad válida', type: 'is-danger' })
            return
          }
          if (cantidad > producto.stock) {
            this.$buefy.toast.open('No puedes quitar más de ' + producto.stock + ' productos')
            return
          }
          this.cargando = true
          apiRequest({
            method: 'PATCH',
            path: `products/${producto.id}/subtract-stock?quantity=${cantidad}`
          })
            .then(registrado => {
              this.cargando = false
              if (registrado) {
                this.$buefy.toast.open(cantidad + ' Productos quitados a ' + producto.name)
                this.obtenerProductos()
              }
            })
            .catch(() => {
              this.cargando = false
              this.$buefy.toast.open({ message: 'Error al quitar existencia', type: 'is-danger' })
            })
        }
      })
    },

    marcarComoDanado(producto) {
      this.$buefy.dialog.prompt({
        title: 'Marcar como abollado',
        message: '¿Cuántas unidades de ' + producto.name + ' están abolladas?',
        cancelText: 'Cancelar',
        confirmText: 'Marcar como abollado',
        inputAttrs: {
          type: 'number',
          placeholder: 'Cantidad',
          value: '1',
          min: 1,
          max: producto.stock
        },
        trapFocus: true,
        onConfirm: (value) => {
          const cantidad = Number(value)
          if (isNaN(cantidad) || cantidad <= 0) {
            this.$buefy.toast.open({ message: 'Por favor ingresa una cantidad válida', type: 'is-danger' })
            return
          }
          if (cantidad > producto.stock) {
            this.$buefy.toast.open({ message: 'No puedes marcar más unidades de las disponibles', type: 'is-danger' })
            return
          }
          this.$buefy.dialog.prompt({
            title: 'Motivo del abollado',
            message: 'Indica el motivo por el que el producto está abollado',
            cancelText: 'Cancelar',
            confirmText: 'Confirmar',
            inputAttrs: {
              type: 'text',
              placeholder: 'Motivo del abollado',
              maxlength: 200,
              required: true
            },
            trapFocus: true,
            onConfirm: (motivo) => {
              this.cargando = true
              apiRequest({
                method: 'POST',
                path: 'damaged-products',
                data: {
                  productId: producto.id,
                  quantity: cantidad,
                  notes: motivo
                }
              })
                .then(resultado => {
                  this.cargando = false
                  if (resultado) {
                    this.$buefy.toast.open({ message: 'Producto marcado como abollado correctamente', type: 'is-success' })
                    this.obtenerProductos()
                  } else {
                    this.$buefy.toast.open({ message: 'Error al marcar el producto como abollado', type: 'is-danger' })
                  }
                })
                .catch(() => {
                  this.cargando = false
                  this.$buefy.toast.open({ message: 'Error al marcar el producto como abollado', type: 'is-danger' })
                })
            }
          })
        }
      })
    },

    eliminar(id) {
      this.$buefy.dialog.confirm({
        title: 'Eliminar producto',
        message: 'Seguro que quieres <b>eliminar</b> este producto? Esta acción no se puede revertir.',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => {
          this.cargando = true
          apiRequest({
            method: 'DELETE',
            path: `products/${id}`
          })
            .then(resultado => {
              this.cargando = false
              if (resultado) {
                this.$buefy.toast.open({ type: 'is-info', message: 'Producto eliminado.' })
                this.obtenerProductos()
              } else {
                this.$buefy.toast.open('Error al eliminar')
              }
            })
            .catch(() => {
              this.cargando = false
              this.$buefy.toast.open({ message: 'Error al eliminar el producto', type: 'is-danger' })
            })
        }
      })
    },

    editar(id) {
      this.$router.push({ name: 'EditarProducto', params: { id } })
    }
  }
}
</script>
