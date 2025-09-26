<template>
	<b-table :data="listaProductos">
		<b-table-column field="codigo" label="Código" v-slot="props">
			{{ props.row.codigo }}
		</b-table-column>

		<b-table-column field="nombre" label="Nombre" v-slot="props">
			{{ props.row.nombre }}
		</b-table-column>

		<b-table-column field="precio" label="Precio" v-slot="props">
			${{ formatPrice(props.row.precio) }}
		</b-table-column>

		<b-table-column field="cantidad" label="Cantidad" v-slot="props">
			<b-field>
				<b-numberinput v-model.number="props.row.cantidad" :min="1" :max="props.row.existencia" :editable="true"
					@input="val => onCantidadInput(props.row, val)" @blur="() => onCantidadBlur(props.row)"
					@keydown.native="e => blockIfOverMax(e, props.row)" @paste.native="e => onPasteClamp(e, props.row)"
					style="width: 13em" />

			</b-field>
		</b-table-column>

		<b-table-column field="subtotal" label="Subtotal" v-slot="props">
			<b>${{ formatPrice(calcularSubtotal(props.row)) }}</b>
		</b-table-column>

		<b-table-column field="quitar" label="Quitar" v-slot="props">
			<b-button icon-left="delete" type="is-danger" @click="quitar(props.row.id)">
				Quitar
			</b-button>
		</b-table-column>
	</b-table>
</template>

<script>
export default {
	name: "TablaProductos",
	props: ["listaProductos"],

	methods: {
		quitar(id) { this.$emit("quitar", id) },

		clampCantidad(val, existencia) {
			const max = Math.max(0, Number(existencia) || 0);
			let n = Math.floor(Number(val) || 0);
			if (n < 1) n = 1;
			if (max > 0 && n > max) n = max;
			return n;
		},

		onCantidadInput(row, val) {
			const n = this.clampCantidad(val, row.existencia);
			if (row.cantidad !== n) row.cantidad = n;
			this.$emit('editar-cantidad', { id: row.id, cantidad: row.cantidad });
		},

		onCantidadBlur(row) {
			if (!row.cantidad || row.cantidad < 1) {
				row.cantidad = 1;
				this.$emit('editar-cantidad', { id: row.id, cantidad: 1 });
			}
		},

		// Evita teclear un dígito que haría superar el max
		blockIfOverMax(e, row) {
			const isDigit = e.key >= '0' && e.key <= '9';
			if (!isDigit) return;

			const el = e.target;
			const current = el.value ?? '';
			const selStart = el.selectionStart ?? current.length;
			const selEnd = el.selectionEnd ?? current.length;

			const nextText = current.slice(0, selStart) + e.key + current.slice(selEnd);
			const nextNum = Number(nextText);
			const max = Number(row.existencia) || 0;

			if (max > 0 && nextNum > max) {
				e.preventDefault(); // no deja ingresar ese dígito
			}
		},

		// Pegar: limpia, clamp y aplica
		onPasteClamp(e, row) {
			let text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
			text = text.replace(/[^\d]/g, '');
			if (!text) { e.preventDefault(); return; }

			const n = this.clampCantidad(text, row.existencia);
			e.preventDefault();
			row.cantidad = n;
			this.$emit('editar-cantidad', { id: row.id, cantidad: n });
		},

		calcularSubtotal(producto) {
			const total = Number(producto.precio || 0) * Number(producto.cantidad || 0);
			return Number(total.toFixed(2));
		},

		formatPrice(value) {
			const num = typeof value === "string" ? parseFloat(value) : Number(value || 0);
			return num.toFixed(2);
		}
	}
};
</script>
