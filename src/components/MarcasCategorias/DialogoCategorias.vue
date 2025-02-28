<template>
	<form @submit.prevent="registrar">
		<div class="modal-card" style="width: 600px">
			<header class="modal-card-head">
				<p class="modal-card-title">{{ titulo }} marca</p>
				<button
					type="button"
					class="delete"
					@click="$emit('close')"
					aria-label="Cerrar"/>
			</header>

			<section class="modal-card-body">
				<b-field 
					label="Nombre de la marca"
					:type="{'is-danger': errors.length > 0}"
					:message="errors">
					<b-input
						type="text"
						placeholder="Ej. Nike"
						v-model="nombreMarca"
						required
						:maxlength="100"
						@input="validateInput"
						ref="nombreInput"
						expanded>
					</b-input>
				</b-field>
			</section>

			<footer class="modal-card-foot">
				<b-button
					type="is-light"
					icon-left="close"
					label="Cancelar"
					size="is-medium"
					@click="$emit('close')" />
				<b-button
					type="is-primary"
					icon-left="check"
					label="Guardar"
					size="is-medium"
					native-type="submit"
					:loading="loading"
					:disabled="!isValid" />
			</footer>
		</div>
	</form>
</template>

<script>
export default {
	name: "DialogoMarcas",
	
	props: {
		titulo: {
			type: String,
			required: true,
			validator: value => ['Agregar', 'Editar'].includes(value)
		},
		nombre: {
			type: String,
			default: ""
		}
	},

	data() {
		return {
			nombreMarca: "",
			loading: false,
			errors: [],
			isValid: false
		}
	},

	mounted() {
		this.nombreMarca = this.nombre
		this.validateInput()
		this.$nextTick(() => {
			this.$refs.nombreInput.focus()
		})
	},

	methods: {
		validateInput() {
			this.errors = []
			
			if (!this.nombreMarca.trim()) {
				this.errors.push('El nombre de la marca es requerido')
			} else if (this.nombreMarca.length < 2) {
				this.errors.push('El nombre debe tener al menos 2 caracteres')
			} else if (this.nombreMarca.length > 100) {
				this.errors.push('El nombre no puede exceder los 100 caracteres')
			}

			// Validar caracteres especiales
			const regex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9-_.]+$/
			if (!regex.test(this.nombreMarca)) {
				this.errors.push('El nombre solo puede contener letras, números, espacios y guiones')
			}

			this.isValid = this.errors.length === 0
		},

		registrar() {
			if (!this.isValid) {
				return
			}

			this.loading = true
			this.$emit("registrar", this.nombreMarca.trim())
		}
	},

	watch: {
		nombre(newValue) {
			this.nombreMarca = newValue
			this.validateInput()
		}
	}
}
</script>

<style scoped>
.modal-card {
	margin: 0;
}

.modal-card-title {
	font-weight: 600;
}

.modal-card-body {
	padding: 1.5rem;
}

.modal-card-foot {
	justify-content: flex-end;
	padding: 1rem;
}

.button {
	margin-left: 0.5rem;
}
</style>