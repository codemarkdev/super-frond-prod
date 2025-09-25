<template>
  <section class="box">
    <b-field grouped group-multiline>
      <b-field label="Código de barras" expanded>
        <b-input
          type="text"
          icon="barcode"
          placeholder="Código de barras"
          v-model="producto.code"
        />
      </b-field>

      <b-field label="Nombre" expanded>
        <b-input
          placeholder="Nombre o descripción del producto"
          v-model="producto.name"
        />
      </b-field>
    </b-field>

    <b-field grouped group-multiline>
      <b-field label="Precio compra" expanded>
        <b-input
          step="any"
          icon="currency-usd"
          type="number"
          placeholder="Precio de compra"
          v-model.number="producto.purchasePrice"
        />
      </b-field>

      <b-field label="Precio venta" expanded>
        <b-input
          step="any"
          icon="currency-usd"
          type="number"
          placeholder="Precio de venta"
          v-model.number="producto.salePrice"
          :min="producto.purchasePrice"
        />
      </b-field>

      <b-field label="Precio turista" expanded>
        <b-input
          step="any"
          icon="currency-usd"
          type="number"
          placeholder="Precio de venta turista"
          v-model.number="producto.touristPrice"
          :min="producto.salePrice"
        />
      </b-field>

      <b-field label="Existencia" expanded>
        <b-numberinput
          min="0"
          type="is-info"
          placeholder="Existencia"
          v-model.number="producto.stock"
        />
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
        <b-input
          step="any"
          icon="currency-usd"
          type="number"
          placeholder="Precio de venta al mayoreo"
          v-model.number="producto.wholesalePrice"
          :min="producto.purchasePrice"
        />
      </b-field>

      <b-field label="Cantidad mayoreo" expanded v-if="producto.wholesaleSale">
        <b-numberinput
          min="1"
          type="is-info"
          placeholder="Cantidad para aplicar mayoreo"
          v-model.number="producto.wholesaleQuantity"
        />
      </b-field>
    </b-field>

    <br />

    <b-field grouped group-multiline>
      <b-field label="Selecciona una marca">
        <b-select
          placeholder="Marca"
          icon="tag-multiple"
          v-model="producto.brandId"
        >
          <option v-for="m in marcas" :key="m.id" :value="m.id">
            {{ m.brandName }}
          </option>
        </b-select>
      </b-field>

      <b-field label="Selecciona una categoría">
        <b-select
          placeholder="Categoría"
          icon="archive"
          v-model="producto.categoryId"
        >
          <option v-for="c in categorias" :key="c.id" :value="c.id">
            {{ c.categoryName }}
          </option>
        </b-select>
      </b-field>
    </b-field>

    <br />

    <div class="buttons has-text-centered">
      <b-button
        type="is-primary"
        size="is-large"
        icon-left="check"
        @click="registrar"
      >
        Registrar
      </b-button>

      <b-button
        type="is-dark"
        size="is-large"
        icon-left="cancel"
        tag="router-link"
        to="/inventario"
      >
        Cancelar
      </b-button>
    </div>

    <errores-component
      :errores="mensajesError"
      v-if="mensajesError.length > 0"
    />
  </section>
</template>

<script>
import Utiles from '../../Servicios/Utiles'
import ErroresComponent from '../Extras/ErroresComponent'
import apiRequest from '../../Servicios/HttpService';

const sanitizeCode = (s) =>
  String(s ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

export default {
  name: 'FormProducto',
  props: ['productoProp'],
  components: { ErroresComponent },

  data: () => ({
    categorias: [],
    marcas: [],
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

  watch: {
    productoProp(newVal) {
      this.producto = { ...this.producto, ...newVal }
      this.setSelectedValues()
    },
  },

  mounted: async function() {
    await Promise.all([ this.obtenerMarcas(), this.obtenerCategorias() ]);

    if (this.productoProp) {
      this.producto = { ...this.producto, ...this.productoProp }
      this.producto.wholesaleQuantity = parseInt(
        this.productoProp.wholesaleQuantity || 0,
        10
      )
      this.setSelectedValues()
    }
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
      if (!this.producto.brandId) this.mensajesError.push('La marca es obligatoria')
      if (!this.producto.categoryId)
        this.mensajesError.push('La categoría es obligatoria')

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
      this.mensajesError = []
    },

    setSelectedValues() {
      if (this.marcas.length > 0 && this.producto.brand) {
        const found = this.marcas.find((m) => m.id === this.producto.brand.id)
        if (found) this.producto.brandId = found.id
      }
      if (this.categorias.length > 0 && this.producto.category) {
        const found = this.categorias.find((c) => c.id === this.producto.category.id)
        if (found) this.producto.categoryId = found.id
      }
    },

  async obtenerMarcas() {
    try {
      const resp = await apiRequest({
        method: 'GET',
        path: 'brands',
        headers: { 'Cache-Control': 'no-store' },
      });
      this.marcas = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? []);
      this.setSelectedValues();
    } catch (e) {
      console.error('Error cargando marcas:', e);
      this.marcas = [];
    }
  },

  async obtenerCategorias() {
    try {
      const resp = await apiRequest({
        method: 'GET',
        path: 'categories',
        headers: { 'Cache-Control': 'no-store' },
      });
      this.categorias = Array.isArray(resp.data) ? resp.data : (resp.data?.data ?? []);
      this.setSelectedValues();
    } catch (e) {
      console.error('Error cargando categorías:', e);
      this.categorias = [];
    }
  },
  },
}
</script>
