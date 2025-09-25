<template>
  <section>
    <p class="title is-1">Agregar productos</p>
    <b-breadcrumb align="is-left">
      <b-breadcrumb-item tag="router-link" to="/">Inicio</b-breadcrumb-item>
      <b-breadcrumb-item tag="router-link" to="/inventario">Inventario</b-breadcrumb-item>
      <b-breadcrumb-item active>Agregar producto</b-breadcrumb-item>
    </b-breadcrumb>

    <form-producto ref="form" @registrado="onRegistrado" :productoProp="producto" />

    <b-loading :is-full-page="true" v-model="cargando" :can-cancel="false"></b-loading>
  </section>
</template>

<script>
import FormProducto from './FormProducto.vue'
import apiRequest from '../../Servicios/HttpService'

const sanitizeCode = (s) =>
  String(s ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

const isHttpOk = (resp) =>
  resp && typeof resp.status === 'number' && resp.status >= 200 && resp.status < 300

const extractMessage = (resp, fallback) => {
  const data = resp?.data ?? resp
  const msg = data?.message
  return Array.isArray(msg) ? msg.join(', ') : (msg || fallback)
}

export default {
  name: 'AgregarProducto',
  components: { FormProducto },

  data: () => ({
    cargando: false,
    producto: {},
  }),

  methods: {
    async onRegistrado(producto) {
      this.cargando = true
      try {
        const payload = {
          ...producto,
          code: sanitizeCode(producto.code),
          name: (producto.name || '').trim(),
        }

        if (!payload.code) {
          const gen = await apiRequest({
            method: 'GET',
            path: 'products/internal-barcode/generate',
            headers: { 'Cache-Control': 'no-store' },
          })

          if (!isHttpOk(gen) || !gen?.data?.code) {
            const texto = extractMessage(gen, 'No se pudo generar un código de barras.')
            this.$buefy.toast.open({ type: 'is-danger', message: texto })
            return
          }
          payload.code = gen.data.code
        }

        const resp = await apiRequest({
          method: 'POST',
          path: 'products',
          data: {
            code: payload.code,
            name: payload.name,
            purchasePrice: payload.purchasePrice,
            salePrice: payload.salePrice,
            touristPrice: payload.touristPrice,
            reservedStock: 0,
            stock: payload.stock,
            wholesaleSale: payload.wholesaleSale,
            wholesalePrice: payload.wholesalePrice,
            wholesaleQuantity: payload.wholesaleQuantity,
            brandId: payload.brandId,
            categoryId: payload.categoryId,
          },
          headers: { 'Cache-Control': 'no-store' },
        })

        if (!isHttpOk(resp)) {
          const texto = extractMessage(resp, 'No se pudo registrar producto')
          this.$buefy.toast.open({ type: 'is-danger', message: texto })
          return
        }

        this.$buefy.toast.open({ type: 'is-success', message: 'Producto registrado con éxito.' })
        this.$refs.form?.reset?.()
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || 'No se pudo registrar producto'
        const texto = Array.isArray(msg) ? msg.join(', ') : msg
        this.$buefy.toast.open({ type: 'is-danger', message: texto })
      } finally {
        this.cargando = false
      }
    },
  },
}
</script>
