<template>
  <section class="box">
    <b-field grouped group-multiline>
      <b-field label="Código de barras" expanded>
        <template #label>
          Código de barras
          <b-tooltip label="Si quieres registrar un producto temporal, dejalo vacío y se te generará un código de barras temporal automáticamente." position="is-right"
            type="is-dark">
            <b-icon icon="information-outline" size="is-small" class="ml-1"></b-icon>
          </b-tooltip>
        </template>
        <b-input type="text" icon="barcode" placeholder="Código de barras" v-model="producto.code" />
      </b-field>

      <b-field label="Nombre" expanded>
        <b-input placeholder="Nombre o descripción del producto" v-model="producto.name" />
      </b-field>
    </b-field>

    <b-field grouped group-multiline>
      <b-field label="Precio compra" expanded>
        <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de compra"
          v-model.number="producto.purchasePrice" />
      </b-field>

      <b-field label="Precio venta" expanded>
        <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de venta"
          v-model.number="producto.salePrice" :min="producto.purchasePrice" />
      </b-field>

      <b-field label="Precio turista" expanded>
        <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de venta turista"
          v-model.number="producto.touristPrice" :min="producto.salePrice" />
      </b-field>

      <b-field label="Existencia" expanded>
        <b-numberinput min="0" type="is-info" placeholder="Existencia" v-model.number="producto.stock" />
      </b-field>
    </b-field>

    <br />

    <b-field grouped group-multiline>
      <b-field>
        <b-switch v-model="producto.wholesaleSale" type="is-info">
          ¿Vendido al mayoreo?
        </b-switch>
      </b-field>

      <b-field label="Precio mayoreo" expanded v-if="producto.wholesaleSale">
        <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de venta al mayoreo"
          v-model.number="producto.wholesalePrice" :min="producto.purchasePrice" />
      </b-field>

      <b-field label="Cantidad mayoreo" expanded v-if="producto.wholesaleSale">
        <b-numberinput min="1" type="is-info" placeholder="Cantidad para aplicar mayoreo"
          v-model.number="producto.wholesaleQuantity" />
      </b-field>
    </b-field>

    <br />

    <b-field grouped group-multiline>
      <!-- MARCA -->
      <b-field label="Selecciona una marca" expanded>
        <b-autocomplete v-model="brandInput" :data="marcasFiltradas" field="brandName" placeholder="Buscar marca..."
          icon="magnify" :open-on-focus="true" @select="onSeleccionMarca" @input="onInputMarca">
          <template #empty>
            <div class="notification is-light">No hay coincidencias</div>
          </template>
          <template #default="{ option }">
            <div class="is-flex is-justify-content-space-between is-align-items-center">
              <span>{{ option.brandName }}</span>
              <small class="has-text-grey">ID: {{ option.id }}</small>
            </div>
          </template>
        </b-autocomplete>
      </b-field>

      <b-field label="Selecciona una categoría" expanded>
        <b-autocomplete v-model="categoryInput" :data="categoriasFiltradas" field="categoryName"
          placeholder="Buscar categoría..." icon="magnify" :open-on-focus="true" @select="onSeleccionCategoria"
          @input="onInputCategoria">
          <template #empty>
            <div class="notification is-light">No hay coincidencias</div>
          </template>

          <template #default="{ option }">
            <div class="is-flex is-justify-content-space-between is-align-items-center">
              <span>{{ option.categoryName }}</span>
              <small class="has-text-grey">ID: {{ option.id }}</small>
            </div>
          </template>
        </b-autocomplete>
      </b-field>
    </b-field>


    <br />

    <div class="buttons has-text-centered">
      <b-button type="is-primary" size="is-large" icon-left="check" @click="registrar">
        Registrar
      </b-button>

      <b-button type="is-dark" size="is-large" icon-left="cancel" tag="router-link" to="/inventario">
        Cancelar
      </b-button>
    </div>

    <errores-component :errores="mensajesError" v-if="mensajesError.length > 0" />
  </section>
</template>

<script>
import Utiles from '../../Servicios/Utiles'
import ErroresComponent from '../Extras/ErroresComponent'
import apiRequest from '../../Servicios/HttpService'

const sanitizeCode = (s) =>
  String(s ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export default {
  name: 'FormProducto',
  props: ['productoProp'],
  components: { ErroresComponent },

  data: () => ({
    categorias: [],
    marcas: [],
    brandInput: '',
    categoryInput: '',

    producto: {
      code: '',
      name: '',
      purchasePrice: null,
      salePrice: null,
      touristPrice: null,
      stock: null,
      reservedStock: 0,
      wholesaleSale: false,
      wholesalePrice: null,
      wholesaleQuantity: null,
      brandId: null,
      categoryId: null,
    },
    mensajesError: [],
  }),

  computed: {
    isCodeEmpty() {
      const v = (this.producto.code ?? '').trim();
      return v.length === 0;
    },
    marcasFiltradas() {
      const q = norm(this.brandInput)
      if (!q) return this.marcas.slice(0, 30)
      return this.marcas.filter(m => norm(m.brandName).includes(q)).slice(0, 30)
    },
    categoriasFiltradas() {
      const q = norm(this.categoryInput)
      if (!q) return this.categorias.slice(0, 30)
      return this.categorias.filter(c => norm(c.categoryName).includes(q)).slice(0, 30)
    },
  },

  watch: {
    productoProp(newVal) {
      this.producto = { ...this.producto, ...newVal }
      this.setSelectedValues()
      this.syncBrandAndCategoryInputs()
    },
  },

  mounted: async function () {
    await Promise.all([this.obtenerMarcas(), this.obtenerCategorias()])

    if (this.productoProp) {
      this.producto = { ...this.producto, ...this.productoProp }
      this.producto.wholesaleQuantity = parseInt(
        this.productoProp.wholesaleQuantity || 0,
        10
      )
      this.setSelectedValues()
    }

    this.syncBrandAndCategoryInputs()
  },

  methods: {
    registrar() {
      this.mensajesError = []
      this.producto.code = sanitizeCode(this.producto.code)
      this.producto.name = (this.producto.name || '').trim()

      const basicos = {
        name: this.producto.name,
        purchasePrice: this.producto.purchasePrice,
        salePrice: this.producto.salePrice,
        stock: this.producto.stock,
      }
      this.mensajesError = Utiles.validarDatos(basicos)

      if (+this.producto.salePrice < +this.producto.purchasePrice) {
        this.mensajesError.push(
          'El precio de venta debe ser mayor o igual al precio de compra'
        )
      }
      if (this.producto.brandId == null) this.mensajesError.push('La marca es obligatoria')
      if (this.producto.categoryId == null) this.mensajesError.push('La categoría es obligatoria')

      if (this.mensajesError.length > 0) return

      this.$emit('registrado', { ...this.producto })
    },

    reset() {
      this.producto = {
        code: '',
        name: '',
        purchasePrice: null,
        salePrice: null,
        touristPrice: null,
        stock: null,
        reservedStock: 0,
        wholesaleSale: false,
        wholesalePrice: null,
        wholesaleQuantity: null,
        brandId: null,
        categoryId: null,
      }
      this.brandInput = ''
      this.categoryInput = ''
      this.mensajesError = []
    },

    setSelectedValues() {
      if (this.marcas.length > 0 && this.producto.brand) {
        const found = this.marcas.find(m => Number(m.id) === Number(this.producto.brand.id))
        if (found) this.producto.brandId = found.id
      }
      if (this.categorias.length > 0 && this.producto.category) {
        const found = this.categorias.find(c => Number(c.id) === Number(this.producto.category.id))
        if (found) this.producto.categoryId = found.id
      }
    },
    onSeleccionMarca(opcion) {
      if (!opcion) return
      this.producto.brandId = opcion.id
      this.brandInput = opcion.brandName
    },
    onInputMarca(val) {
      if (!val) {
        this.producto.brandId = null
        return
      }
      const match = this.marcas.find(m => Number(m.id) === Number(this.producto.brandId))
      if (!match || match.brandName !== val) {
        this.producto.brandId = null
      }
    },
    onSeleccionCategoria(opcion) {
      if (!opcion) return
      this.producto.categoryId = opcion.id
      this.categoryInput = opcion.categoryName
    },
    onInputCategoria(val) {
      if (!val) {
        this.producto.categoryId = null
        return
      }
      const match = this.categorias.find(c => Number(c.id) === Number(this.producto.categoryId))
      if (!match || match.categoryName !== val) {
        this.producto.categoryId = null
      }
    },
    syncBrandAndCategoryInputs() {
      if (this.producto.brandId != null) {
        const m = this.marcas.find(x => Number(x.id) === Number(this.producto.brandId))
        this.brandInput = m?.brandName || ''
        if (!m) this.producto.brandId = null
      } else {
        this.brandInput = ''
      }

      if (this.producto.categoryId != null) {
        const c = this.categorias.find(x => Number(x.id) === Number(this.producto.categoryId))
        this.categoryInput = c?.categoryName || ''
        if (!c) this.producto.categoryId = null
      } else {
        this.categoryInput = ''
      }
    },

    async obtenerMarcas() {
      try {
        const resp = await apiRequest({
          method: 'GET',
          path: 'brands',
          headers: { 'Cache-Control': 'no-store' },
        })
        this.marcas = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? [])
      } catch (e) {
        console.error('Error cargando marcas:', e)
        this.marcas = []
      }
    },

    async obtenerCategorias() {
      try {
        const resp = await apiRequest({
          method: 'GET',
          path: 'categories',
          headers: { 'Cache-Control': 'no-store' },
        })
        this.categorias = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? [])
      } catch (e) {
        console.error('Error cargando categorías:', e)
        this.categorias = []
      }
    },
  },
}
</script>
