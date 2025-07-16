<template>
	<b-field label="Buscar producto (nombre o código)">
		<b-autocomplete 
		v-model="producto" 
		id="producto"
		placeholder="Escribe el nombre o código del producto"
		:data="productosFiltrados" 
		ref="autocompleteRef"
		field="name" 
		@input="onInput"
		@select="seleccionarProducto" 
		@keyup.enter.native="() => setTimeout(manejarEnter, 600)" size="is-large"
		:loading="cargando">
			<template #empty>
				<div class="notification is-warning is-light">
					No hay coincidencias
				</div>
			</template>
		</b-autocomplete>
	</b-field>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';

export default {
	name: "BuscarProducto",
	props: {},
	data: () => ({
		producto: "",
		productosEncontrados: [],
		cargando: false,
		timeoutBusqueda: null,
		ultimoCodigoBuscado: "",
		seleccionandoPorWatcher: false,
		ultimoSeleccionadoId: null 
	}),

	mounted() {
		if (this.$el.offsetParent !== null) {
			this.forceFocus();
		}
	},

	methods: {
		forceFocus() {
			this.$nextTick(() => {
				const input = this.$refs.autocompleteRef?.$el?.querySelector('input');
				if (!input) return;
				input.blur();
				input.readOnly = true;
				input.style.opacity = '0.99';
				setTimeout(() => {
					input.readOnly = false;
					input.focus();
					input.select();
					input.style.cssText = `
						caret-color: #4287f5 !important;
						animation: cursor-blink 1s step-end infinite !important;
					`;
				}, 300);
			});
		},
		onInput() {
			clearTimeout(this.timeoutBusqueda);
			this.timeoutBusqueda = setTimeout(() => {
				this.buscarProductos();
			}, 100);
		},

		async buscarProductos() {
			const busqueda = this.producto.trim();
			if (!busqueda) {
				this.productosEncontrados = [];
				return;
			}
			this.cargando = true;
			try {
				// 1. Buscar por nombre/código (search endpoint)
				const response = await apiRequest({
					method: 'GET',
					path: `products/search/${encodeURIComponent(busqueda)}`
				});
				let encontrados = response.data ? response.data.filter(item => !item.isDeleted) : [];
				// 2. Si no hay resultados, buscar por código exacto
				if (encontrados.length === 0) {
					const respCode = await apiRequest({
						method: 'GET',
						path: `products/findByCode/${encodeURIComponent(busqueda)}`
					});
					if (respCode.data && respCode.data.id) {
						encontrados = [respCode.data];
					}
				}
				this.productosEncontrados = encontrados;
				this.autoseleccionarSiExiste();
			} catch (error) {
				console.error("Error en búsqueda:", error);
				this.productosEncontrados = [];
			} finally {
				this.cargando = false;
			}
		},

		autoseleccionarSiExiste() {
			if (
				this.productosFiltrados.length === 1 &&
				this.productosFiltrados[0]?.id
			) {
				setTimeout(() => {
					this.manejarSeleccion(this.productosFiltrados[0]);
				}, 50);
			}
		},

		seleccionarProducto(opcion) {
			if (!opcion) return;
			this.manejarSeleccion(opcion);
		},

		manejarEnter() {
			
			if (this.seleccionandoPorWatcher) {
				this.seleccionandoPorWatcher = false;
				return;
			}
			if (
				this.productosFiltrados.length === 1 &&
				this.productosFiltrados[0]?.id
			) {
				this.manejarSeleccion(this.productosFiltrados[0]);
			} else {
				this.$nextTick(() => {
					this.producto = '';
					this.ponerFocus();
				});
			}
		},

		manejarSeleccion(opcion) {
			
			if (this.ultimoSeleccionadoId === opcion.id) return;
			this.ultimoSeleccionadoId = opcion.id;
			this.$emit("seleccionado", opcion);
			setTimeout(() => {
				this.producto = '';
				this.ponerFocus();
				this.ultimoSeleccionadoId = null; 
			}, 300)
		},

		limpiarInput() {
			this.producto = '';
			this.$nextTick(() => {
				this.productosEncontrados = [];
				const input = document.querySelector("#producto");
				if (input) input.focus();
			})
		},

		ponerFocus() {
			this.$nextTick(() => {
				const input = document.querySelector("#producto");
				if (input) input.focus();
			});
		}
	},
	computed: {
		productosFiltrados() {
			const busqueda = this.producto.toLowerCase();
			return this.productosEncontrados.filter(opcion => {
				return (
					opcion?.name?.toLowerCase().includes(busqueda) ||
					opcion?.code?.toLowerCase().includes(busqueda)
				);
			});
		},
	},

	watch: {
		producto(newVal, oldVal) {
		
			if (
				newVal &&
				newVal.length >= 6 && 
				newVal !== oldVal &&
				this.productosFiltrados.length === 1 &&
				this.productosFiltrados[0]?.code === newVal
			) {
				this.seleccionandoPorWatcher = true;
				this.manejarSeleccion(this.productosFiltrados[0]);
			}
		}
	}
};
</script>