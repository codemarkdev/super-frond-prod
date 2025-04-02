<template>
	<form action="">
		<div class="modal-card" style="width: 600px">
			<header class="modal-card-head has-background-success">
				<p class="modal-card-title has-text-white">Terminar venta</p>
				<button
					type="button"
					class="delete"
					@click="$emit('close', 'venta')"/>
			</header>
			<section class="modal-card-body">
				<p class="is-size-1 has-text-weight-bold">Total ${{ totalFormateado }}</p>
				<busqueda-cliente @seleccionado="onSeleccionado" />
				<b-field label="El cliente paga con" >
					<b-input step="any" ref="pagado" icon="currency-usd" type="number" placeholder="Monto pagado" v-model="pagado" @input="calcularCambio" @keyup.enter.native="terminarVenta" size="is-medium"></b-input>
				</b-field>
				<p class="is-size-1 has-text-weight-bold">Cambio ${{ cambioFormateado }}</p>
			</section>
			<footer class="modal-card-foot">
				<b-button
					label="Cancelar"
					icon-left="cancel"
					size="is-medium"
					@click="$emit('close', 'venta')" />
				<b-button
					label="Terminar venta"
					type="is-success"
					icon-left="check"
					size="is-medium"
					@click="terminarVenta" />
			</footer>
		</div>
	</form>
</template>
<script>
	import BusquedaCliente from '../Clientes/BusquedaCliente'

	export default{
		name:"DialogoTerminarVenta",
		props: ['totalVenta'],
		components: { BusquedaCliente },

		data:()=>({
			pagado: "",
			cambio: 0,
			cliente: {}
		}),

		computed: {
			totalFormateado() {
				// Formatear el total con 2 decimales fijos para la visualización
				const total = parseFloat(this.totalVenta);
				return isNaN(total) ? "0.00" : total.toFixed(2);
			},
			cambioFormateado() {
				// Formatear el cambio con 2 decimales fijos para la visualización
				return this.cambio.toFixed(2);
			}
		},

		mounted(){
			this.$refs.pagado.focus()
		},

		methods:{
			onSeleccionado(cliente){
				this.cliente = cliente
			},

			calcularCambio(){
				if (this.pagado === "") {
					this.cambio = 0;
					return;
				}
				
				// Convertir a números
				const pagadoNum = parseFloat(this.pagado);
				const totalNum = parseFloat(this.totalVenta);
				
				// Usar Math.round para evitar problemas de precisión de punto flotante
				// Multiplicamos por 100, redondeamos, y luego dividimos por 100
				this.cambio = Math.round((pagadoNum - totalNum) * 100) / 100;
			},

			terminarVenta(){
				if(this.pagado === "" || parseFloat(this.pagado) < parseFloat(this.totalVenta)) {
					this.$buefy.toast.open({
                         type: 'is-danger',
                         message: 'Debes colocar el total pagado.'
                    })
                    return
				}

				// Ensure cliente object exists with at least an empty structure
				const clienteData = Object.keys(this.cliente).length > 0 
					? this.cliente 
					: { id: null, name: '' };

				let payload = {
					tipo: 'venta',
					pagado: this.pagado,
					cambio: this.cambio,
					cliente: clienteData
				}

				this.$emit("terminar", payload)
			}	
		}
	}
</script>

