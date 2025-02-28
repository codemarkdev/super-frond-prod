<template>
	<section>
		<b-field label="Nombre del cliente">
			<b-autocomplete
				v-model="cliente"
				id="cliente"
				placeholder="Escribe el nombre del cliente"
				:keep-first="true"
				:data="clientesFiltrados"
				field="name"
				@input="buscarClientes"
				@select="seleccionarCliente"
				size="is-medium"
			>
			</b-autocomplete>
		</b-field>
		<div class="notification is-info mt-2" v-if="clienteSeleccionado">
			<button class="delete" @click="deseleccionarCliente"></button>
			<p>Cliente: <b>{{ clienteSeleccionado.name }}</b></p>
			<p>Teléfono: <b>{{ clienteSeleccionado.phone }}</b></p>
		</div>
	</section>
</template>
<script>
	import apiRequest from '../../Servicios/HttpService';

	export default{
		name: "BusquedaCliente",

		data:()=>({
			cliente: "",
			clientesEncontrados: [],
			clienteSeleccionado: null
		}),

		methods: {
			deseleccionarCliente(){
				this.clienteSeleccionado = null
			},
			seleccionarCliente(opcion) {
				if(!opcion) return
				this.clienteSeleccionado = opcion
				this.$emit("seleccionado", this.clienteSeleccionado)
				setTimeout(() => this.cliente = '', 10)
			},

			buscarClientes(){
				if (!this.cliente.trim()) {
				this.clientesEncontrados = [];
				return;
			}
				apiRequest({
					method: 'GET',
				path: `customers/search/${this.cliente}`
				})
				.then(clientes =>{ 
					this.clientesEncontrados = clientes.status === 200 ? clientes.data : []
				})
			},
		},

		computed: {
			clientesFiltrados() {
				return this.clientesEncontrados.filter(opcion => {
					return (
						opcion.name
							.toString()
							.toLowerCase()
							.indexOf(this.cliente.toLowerCase()) >= 0
					)
				})
			}
		}

	}
</script>