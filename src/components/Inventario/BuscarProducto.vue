<template>
	<b-field label="Buscar producto por nombre o código de barras">
		<b-autocomplete 
		v-model="producto" id="producto"
			placeholder="Escribe el nombre o el código de barras del producto" :keep-first="true"
			:data="productosFiltrados" field="name" @input="buscarProductos" @select="seleccionarProducto"
			size="is-large">
		</b-autocomplete>
		
	</b-field>
</template>
<script>
import apiRequest from '../../Servicios/HttpService';

export default {
	name: "BuscarProducto",

	data: () => ({
		producto: "",
		productosEncontrados: []
	}),

	mounted() {
		this.ponerFocus()
	},

	methods: {
		seleccionarProducto(opcion) {
			if (!opcion) return
            console.log(opcion)	
			this.$emit("seleccionado", opcion)
			this.ponerFocus()
			setTimeout(() => this.producto = '', 10)
		},

		buscarProductos() {
			if (!this.producto.trim()) {
				this.productosEncontrados = [];
				return;
			}
			apiRequest({
				method: 'GET',
				path: `products/search/${this.producto}`
			})
				.then(productos => {
					this.productosEncontrados = productos.status === 200 ? productos.data : []
				})
		},

		ponerFocus() {
			document.querySelector("#producto").focus()
		}
		
	},

	computed: {
		productosFiltrados() {
			if (this.productosEncontrados.length === 0) {
                return [{ name: "No existen productos con ese nombre", noResults: true }]
            }
			return this.productosEncontrados.filter(opcion => {
				return (
					opcion?.name
						.toString()
						.toLowerCase()
						.indexOf(this.producto.toLowerCase()) >= 0
					||
					opcion?.code
						.toString()
						.indexOf(this.producto) >= 0
				)
			})
		}
	}


}
</script>

