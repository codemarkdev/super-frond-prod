<template>
    <section class="box">
        <b-field grouped group-multiline>
            <b-field label="Código de barras" expanded>
                <b-input type="text" icon="barcode" placeholder="Código de barras"
                    v-model="producto.code"></b-input>
            </b-field>
            <b-field label="Nombre" expanded>
                <b-input placeholder="Nombre o descripción del producto" v-model="producto.name"></b-input>
            </b-field>
        </b-field>
      

        <b-field grouped group-multiline>
            <b-field label="Precio compra" expanded>
                <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de compra"
                    v-model="producto.purchasePrice"></b-input>
            </b-field>

            <b-field label="Precio venta" expanded>
                <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de venta"
                    v-model="producto.salePrice" :min="producto.precioCompra"></b-input>
            </b-field>
            <b-field label="Precio turista" expanded>
                <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de venta turista"
                    v-model="producto.touristPrice" :min="producto.precioVenta"></b-input>
            </b-field>
  <b-field label="Existencia" expanded>
                <b-numberinput min="1" type="is-info" placeholder="Existencia" v-model="producto.stock">
                </b-numberinput>
            </b-field>
       
        </b-field>
   
        <br>
        <b-field grouped group-multiline>
            <b-field>
                <b-switch v-model="producto.wholesaleSale" type="is-info">
                    ¿Vendido al mayoreo?
                </b-switch>
            </b-field>

            <b-field label="Precio mayoreo" expanded v-if="producto.wholesaleSale">
                <b-input step="any" icon="currency-usd" type="number" placeholder="Precio de venta al mayoreo"
                    v-model="producto.wholesalePrice" :min="producto.purchasePrice"></b-input>
            </b-field>

            <b-field label="Cantidad mayoreo" expanded v-if="producto.wholesaleSale">
                <b-numberinput min="1" type="is-info" placeholder="Cantidad para aplicar mayoreo"
                    v-model="producto.wholesaleQuantity">
                </b-numberinput>
            </b-field>
        </b-field>
        <br>
        <b-field grouped group-multiline>
            <b-field label="Selecciona una marca">
                <b-select placeholder="Marca" icon="tag-multiple" v-model="producto.brandId">
                    <option v-for="marca in marcas" :key="marca.id" :value="marca.id">
                        {{ marca.brandName }}
                    </option>
                </b-select>
            </b-field>

            <b-field label="Selecciona una categoría">
                <b-select placeholder="Categoría" icon="archive" v-model="producto.categoryId">
                    <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                        {{ categoria.categoryName }}
                    </option>
                </b-select>
            </b-field>
        </b-field>
        <br>
        <div class="buttons has-text-centered">
            <b-button type="is-primary" size="is-large" icon-left="check" @click="registrar">Registrar</b-button>
            <b-button type="is-dark" size="is-large" icon-left="cancel" tag="router-link"
                to="/inventario">Cancelar</b-button>
        </div>
        <errores-component :errores="mensajesError" v-if="mensajesError.length > 0" />
    </section>
</template>
<script>
import apiRequest from '../../Servicios/HttpService';
import Utiles from '../../Servicios/Utiles'
import ErroresComponent from '../Extras/ErroresComponent'
export default {
    name: "FormProducto",
    props: ['productoProp'],
    components: { ErroresComponent },

    data: () => ({
        categorias: [],
        marcas: [],
        producto: {
            code: "",
            name: "",
            purchasePrice: 0,
            salePrice: 0,
            touristPrice: 0,
            stock: 0,
            reservedStock: 0,
            wholesaleSale: false,
            wholesalePrice: 0,
            wholesaleQuantity: 0,
            brandId: "",
            categoryId: ""
        },
        mensajesError: []
    }),

    watch: {
        productoProp(newVal) {
            this.producto = { ...newVal };
            this.setSelectedValues(); 
        }
    },

    mounted() {
        this.obtenerCategorias()
        this.obtenerMarcas()
        this.producto ={ ...this.productoProp }
        if (this.productoProp) {
            this.producto = { ...this.productoProp }
            this.producto.wholesaleQuantity = parseInt(this.productoProp.wholesaleQuantity)
            this.setSelectedValues();
        }
    },

    methods: {
        async registrar() {
            let producto = {
                "code": this.producto.code,
                "name": this.producto.name,
                "purchasePrice": this.producto.purchasePrice,
                "salePrice": this.producto.salePrice,
                "stock": this.producto.stock
            }

            this.mensajesError = Utiles.validarDatos(producto)
            if (parseFloat(this.producto.salePrice) < parseFloat(this.producto.purchasePrice)) {
                this.mensajesError.push("El precio de venta debe ser mayor al precio compra")
            }

            if (this.mensajesError.length > 0) return
            this.$emit("registrado", this.producto)
            this.producto = {
                code: "",
                name: "",
                purchasePrice: 0,
                salePrice: 0,
                touristPrice: 0,
                stock: 0,
                reservedStock: 0,
                wholesaleSale: false,
                wholesalePrice: 0,
                wholesaleQuantity: 0,
                brandId: "",
                categoryId: ""
            }
        },

        setSelectedValues() {
            if (this.marcas.length > 0 && this.producto.brand) {
                const selectedMarca = this.marcas.find(marca => marca.id === this.producto.brand.id);
                if (selectedMarca) {
                    this.producto.brandId = selectedMarca.id;
                }
            }

            if (this.categorias.length > 0 && this.producto.category) {
                const selectedCategoria = this.categorias.find(categoria => categoria.id === this.producto.category.id);
                if (selectedCategoria) {
                    this.producto.categoryId = selectedCategoria.id;
                }
            }
        },

        obtenerMarcas() {
            apiRequest({
                method: 'GET',
                path: "brands"
            })
                .then(marcas => {
                    this.marcas = marcas.data
                    this.setSelectedValues();
                })
        },

        obtenerCategorias() {
            apiRequest({
                method: "GET",
                path: "categories"
            })
                .then(categorias => {
                    this.categorias = categorias.data
                    this.setSelectedValues();
                })
        }
    }

}
</script>