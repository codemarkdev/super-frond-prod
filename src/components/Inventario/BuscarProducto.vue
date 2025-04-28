<template>
	<b-field :label="modoBusqueda === 'codigo' ? 'Escanear código de barras' : 'Buscar por nombre'">
		<b-autocomplete 
		v-model="producto" 
		id="producto"
		:placeholder="modoBusqueda === 'codigo' ? 'Escanea o escribe el código exacto' : 'Escribe el nombre o código del producto'"
		:data="productosFiltrados" 
		ref="autocompleteRef"
		field="name" 
		@input="onInput"
		@select="seleccionarProducto" 
		@keyup.enter.native="() => setTimeout(manejarEnter, 600)" size="is-large"
		:loading="cargando">
			<template #empty>
				<div class="notification is-warning is-light">
					{{ modoBusqueda === 'codigo' ? 'Código no encontrado' : 'No hay coincidencias' }}
				</div>
			</template>
		</b-autocomplete>
	</b-field>
</template>

<script>
import apiRequest from '../../Servicios/HttpService';

export default {
	name: "BuscarProducto",
	props: {
		modoBusqueda: {
			type: String,
			default: 'codigo'
		}
	},
	data: () => ({
		producto: "",
		productosEncontrados: [],
		cargando: false,
		timeoutBusqueda: null
	}),

	mounted() {
		if (this.$el.offsetParent !== null) { // Verifica si el componente es visible
    this.forceFocus();
  }
	},

	methods: {
		forceFocus() {
			// 1. Esperar a que el componente esté renderizado
			this.$nextTick(() => {
				const input = this.$refs.autocompleteRef?.$el?.querySelector('input');
				if (!input) return;

				// 2. Resetear estado del input
				input.blur();
				input.readOnly = true;
				input.style.opacity = '0.99'; // Fuerza repaint

				// 3. Enfoque con 3 capas de seguridad
				setTimeout(() => {
					input.readOnly = false;
					input.focus();
					input.select();

					// 4. Verificar si tomó el foco
					console.log("Elemento activo:", document.activeElement === input);

					// 5. Forzar estilo de cursor (para navegadores problemáticos)
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
			}, this.modoBusqueda === 'codigo' ? 200 : 100);
		},

		async buscarProductos() {
			if (!this.producto.trim()) {
				this.productosEncontrados = [];
				return;
			}

			this.cargando = true;
			try {
				if (this.modoBusqueda === 'codigo') {
					const response = await apiRequest({
						method: 'GET',
						path: `products/findByCode/${encodeURIComponent(this.producto)}`
					});

					if (response.data && response.data.id) {
						this.productosEncontrados = [response.data];
						this.autoseleccionarSiExiste();
					} else {
						this.productosEncontrados = [];
					}

				} else {
					const response = await apiRequest({
						method: 'GET',
						path: `products/search/${encodeURIComponent(this.producto)}`
					});
					this.productosEncontrados = response.data ?
						response.data.filter(item => !item.isDeleted) : [];
				}
			} catch (error) {
				console.error("Error en búsqueda:", error);
				this.productosEncontrados = [];
			} finally {
				this.cargando = false;
			}
		},

		autoseleccionarSiExiste() {
			if (this.modoBusqueda === 'codigo' &&
				this.productosFiltrados.length === 1 &&
				this.productosFiltrados[0]?.id) {
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
			if (this.modoBusqueda === 'codigo' &&
				this.productosFiltrados.length === 1 &&
				this.productosFiltrados[0]?.id) {
				this.manejarSeleccion(this.productosFiltrados[0]);
			} else {
				this.$nextTick(() => {
					this.producto = '';
					this.ponerFocus();
				});
			}

		},

		manejarSeleccion(opcion) {
			this.$emit("seleccionado", opcion);

			setTimeout(() => {
				this.producto = '';
				this.ponerFocus();
			}, 300) // 300 ms de delay
		},

		limpiarInput() {
			this.producto = '';
			this.$nextTick(() => {
				this.productosEncontrados = []; // Limpiar sugerencias
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
			if (this.modoBusqueda === 'codigo') return this.productosEncontrados;

			return this.productosEncontrados.filter(opcion => {
				const busqueda = this.producto.toLowerCase();
				return (
					opcion?.name?.toLowerCase().includes(busqueda) ||
					opcion?.code?.toLowerCase().includes(busqueda)
				);
			});
		},
	},

	watch: {
		modoBusqueda() {
			this.limpiarInput();
			this.productosEncontrados = [];
		}
	}
};
</script>