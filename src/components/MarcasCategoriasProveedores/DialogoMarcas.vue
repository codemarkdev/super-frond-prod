<template>
	<form action="">
		<div class="modal-card" style="width: 600px">
			<header class="modal-card-head">
				<p class="modal-card-title">{{ titulo }} marca</p>
				<button
					type="button"
					class="delete"
					@click="$emit('close')"/>
			</header>
			<section class="modal-card-body">
				<b-field label="Nombre de la marca" >
					<b-input  type="text" placeholder="Ej. Alimentos" v-model="nombreMarca"></b-input>
				</b-field>
				<b-field label="Proveedor" label-position="on-border">
					<b-select  
						v-model="selectedProviderId"
						placeholder="Seleccione un proveedor" 
						required 
						expanded>
						<option
						v-for="provider in providers"
						:key="provider.id"
						:value="provider.id">
						{{ provider.name }}
					</option>
					</b-select>
				</b-field>
			</section>
			<footer class="modal-card-foot">
				<b-button
					label="Cancelar"
					icon-left="cancel"
					size="is-medium"
					@click="$emit('close')" />
				<b-button
					label="Registrar"
					type="is-primary"
					icon-left="check"
					@click="registrar" />
			</footer>
		</div>
	</form>
</template>
<script>
	export default{
		name: "DialogoMarcas",
		props: {
			titulo: String,
			nombre: String,
			providerId: Number,
			providers: Array
		},

		data:()=>({
			nombreMarca: "",
			selectedProviderId: null
		}),

		mounted(){
			this.nombreMarca = this.nombre
			this.selectedProviderId = this.providerId || null;
		},

		methods:{

			registrar(){
				if (!this.validarCampos()) return;

				this.$emit("registrar", {
					nombre: this.nombreMarca,
					providerId: this.selectedProviderId
				});
			},
			
			validarCampos() {
				if (!this.nombreMarca.trim()) {
					this.mostrarError('Debes ingresar un nombre para la marca');
					return false;
				}

				if (!this.selectedProviderId) {
					this.mostrarError('Debes seleccionar un proveedor');
					return false;
				}

				return true;
			},

			mostrarError(mensaje) {
				this.$buefy.toast.open({
					type: 'is-danger',
					message: mensaje,
					duration: 3000
				});
			}
		}
	}
</script>