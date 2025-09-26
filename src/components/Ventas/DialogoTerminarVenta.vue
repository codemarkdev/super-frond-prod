<template>
	<form action="">
		<div class="modal-card" style="width: 600px">
			<header class="modal-card-head has-background-success">
				<p class="modal-card-title has-text-white">Terminar venta</p>
				<button type="button" class="delete" @click="$emit('close', 'venta')" />
			</header>
			<section class="modal-card-body">
				<p class="is-size-1 has-text-weight-bold">Total ${{ totalFormateado }}</p>
				<busqueda-cliente @seleccionado="onSeleccionado" />
				<b-field label="El cliente paga con">
					<b-input ref="pagado" type="text" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]{0,2}"
						:maxlength="10" icon="currency-usd" placeholder="Monto pagado" v-model="pagadoStr"
						@input="onPaidInput" @blur.native="onPaidBlur" @keydown.native="blockInvalidPaidKeys"
						@paste.native="onPaidPaste" @keyup.enter.native="terminarVenta" size="is-medium" />
				</b-field>
				<p class="is-size-1 has-text-weight-bold">Cambio ${{ cambioFormateado }}</p>
			</section>
			<footer class="modal-card-foot">
				<b-button label="Cancelar" icon-left="cancel" size="is-medium" @click="$emit('close', 'venta')" />
				<b-button label="Terminar venta" type="is-success" icon-left="check" size="is-medium"
					@click="terminarVenta" />
			</footer>
		</div>
	</form>
</template>
<script>
import BusquedaCliente from '../Clientes/BusquedaCliente'

const MAX_PAID = 9999999.99;

export default {
	name: "DialogoTerminarVenta",
	props: ['totalVenta'],
	components: { BusquedaCliente },

	data: () => ({
		pagadoStr: '',
		cambio: 0,
		cliente: {}
	}),

	computed: {
		totalFormateado() {
			const total = Number(this.totalVenta);
			return Number.isFinite(total) ? total.toFixed(2) : '0.00';
		},
		cambioFormateado() {
			return (Number.isFinite(this.cambio) ? this.cambio : 0).toFixed(2);
		}
	},

	mounted() {
		this.$refs.pagado?.focus();
	},

	methods: {
		onSeleccionado(cliente) {
			this.cliente = cliente;
		},

		getPaidNumber() {
			const n = Number(this.pagadoStr.replace(',', '.'));
			if (!Number.isFinite(n) || n < 0) return 0;
			const clamped = Math.min(n, MAX_PAID);
			return Math.round(clamped * 100) / 100;
		},


		calcularCambio() {
			const pagado = this.getPaidNumber();
			const total = Math.round(Number(this.totalVenta) * 100) / 100;
			this.cambio = Math.round((pagado - total) * 100) / 100;
		},

		sanitizeMoneyString(raw) {
			let s = String(raw || '').replace(/,/g, '.').replace(/[^\d.]/g, '');


			const firstDot = s.indexOf('.');
			if (firstDot !== -1) {
				s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
			}

			let [intPart, decPart = ''] = s.split('.');
			intPart = intPart.replace(/^0+(?=\d)/, '');
			intPart = intPart.slice(0, 7);
			decPart = decPart.slice(0, 2);

			let out = intPart || '0';
			if (decPart.length) out += '.' + decPart;

			const num = Number(out);
			if (Number.isFinite(num) && num > MAX_PAID) out = MAX_PAID.toFixed(2);

			return out;
		},

		onPaidInput() {
			const sane = this.sanitizeMoneyString(this.pagadoStr);
			if (sane !== this.pagadoStr) this.pagadoStr = sane;
			this.calcularCambio();
		},

		onPaidBlur() {
			this.pagadoStr = this.getPaidNumber().toFixed(2);
			this.calcularCambio();
		},

		blockInvalidPaidKeys(e) {
			const invalid = ['e', 'E', '+', '-'];
			if (invalid.includes(e.key)) { e.preventDefault(); return; }

			if (e.key === '.') {
				if (String(this.pagadoStr).includes('.')) e.preventDefault();
				return;
			}

			if (!/\d/.test(e.key) && e.key.length === 1) {
				e.preventDefault();
			}
		},

		onPaidPaste(e) {
			e.preventDefault();
			const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
			const sane = this.sanitizeMoneyString(text);
			this.pagadoStr = sane;
			this.calcularCambio();
		},

		terminarVenta() {
			const pagado = this.getPaidNumber();
			const total = Math.round(Number(this.totalVenta) * 100) / 100;

			if (!(pagado >= total)) {
				this.$buefy.toast.open({ type: 'is-danger', message: 'Debes colocar el total pagado.' });
				return;
			}

			const clienteData = Object.keys(this.cliente).length > 0
				? this.cliente
				: { id: null, name: '' };

			this.$emit("terminar", {
				tipo: 'venta',
				pagado,
				cambio: this.cambio,
				cliente: clienteData
			});
		}
	}
}
</script>
