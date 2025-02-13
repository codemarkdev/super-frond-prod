<template>
	<form>
		<b-field label="Nombre de usuario">
			<b-input icon="shield-account" type="text" placeholder="Ej. Juan" v-model="datosUsuario.username"></b-input>
		</b-field>
		<b-field label="Nombre completo">
			<b-input icon="account" type="text" placeholder="Ej. Juan Perez" v-model="datosUsuario.name"></b-input>
		</b-field>
		<b-field label="Teléfono del usuario">
			<b-input step="any" icon="phone" type="number" placeholder="Ej. 737737737"
				v-model="datosUsuario.phone"></b-input>
		</b-field>
		<!-- <b-field label="Contraseña">
			<b-input step="any"  type="number" 
				v-model="datosUsuario.password"></b-input>
		</b-field> -->

		<div class="buttons has-text-centered">
			<b-button type="is-primary" size="is-large" icon-left="check" @click="registrar">Registrar</b-button>
			<b-button type="is-dark" size="is-large" icon-left="cancel" tag="router-link"
				to="/usuarios">Cancelar</b-button>
		</div>
		<errores-component :errores="mensajesError" v-if="mensajesError.length > 0" />
	</form>
</template>
<script>
import Utiles from '../../Servicios/Utiles'
import ErroresComponent from '../Extras/ErroresComponent'

export default {
	name: "FormUsuario",
	props: ["usuario"],
	components: { ErroresComponent },

	data: () => ({
		datosUsuario: {
			username: "",
			name: "",
			phone: "",
			password: "123456"
		},
		mensajesError: []
	}),

	mounted() {
		this.datosUsuario = this.usuario
	},

	methods: {
		registrar() {
			this.mensajesError = Utiles.validarDatos(this.datosUsuario)
			if (this.mensajesError.length > 0) return
			this.$emit("registrar", this.datosUsuario)
			this.datosUsuario = {
				username: "",
				name: "",
				phone: "",
				password: "123456"
			}
		}
	}
}
</script>