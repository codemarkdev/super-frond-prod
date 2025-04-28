<template>
  <div class="field">
    <label class="label">Efectivo en Mano</label>
    <div class="control has-icons-left has-icons-right">
      <input 
        class="input is-medium"
        :class="{ 'is-danger': !isValidAmount && touched }"
        type="text" 
        v-model="displayValue"
        placeholder="Ingrese el monto en efectivo"
        @input="formatInput"
        @blur="validateOnBlur"
        @focus="handleFocus"
      >
      <span class="icon is-small is-left">
        <i class="mdi mdi-cash"></i>
      </span>
      <span class="icon is-small is-right" v-if="isValidAmount && touched">
        <i class="mdi mdi-check"></i>
      </span>
    </div>
    <p class="help is-danger" v-if="!isValidAmount && touched">
      Por favor, ingrese un monto válido
    </p>
  </div>
</template>

<script>
export default {
  props: {}, 
  data() {
    return {
      displayValue: '',
      numericValue: null,
      touched: false
    };
  },
  computed: {
    isValidAmount() {
      return this.numericValue !== null &&
        this.numericValue >= 0 &&
        !isNaN(this.numericValue);
    }
  },
  methods: {
    formatInput(event) {
      this.touched = true;
      
      // Obtener el valor actual del input
      let value = event.target.value;
      
      // Normalizar el valor: reemplazar múltiples espacios por uno solo
      value = value.replace(/\s+/g, ' ').trim();
      
      // Convertir a valor numérico
      // 1. Eliminar todos los espacios
      // 2. Reemplazar comas por nada (para manejar separadores de miles)
      // 3. Asegurar que solo hay un punto decimal
      let numericString = value.replace(/\s/g, '');
      numericString = numericString.replace(/,/g, '');
      
      // Manejar múltiples puntos decimales (quedarse solo con el primero)
      if ((numericString.match(/\./g) || []).length > 1) {
        const parts = numericString.split('.');
        numericString = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Convertir a número
      this.numericValue = numericString ? parseFloat(numericString) : null;
      
      // Emitir el valor numérico al componente padre
      this.$emit('inputData', this.numericValue);
      
      // No formatear mientras el usuario está escribiendo para no interferir
      this.displayValue = value;
    },
    
    validateOnBlur() {
      this.touched = true;
      
      // Asegurar formato correcto al perder el foco
      if (this.numericValue !== null && !isNaN(this.numericValue)) {
        // Formatear con comas para miles y dos decimales
        const formattedValue = this.formatNumberWithCommas(this.numericValue);
        this.displayValue = formattedValue;
      }
    },
    
    formatNumberWithCommas(number) {
      // Convertir a string con 2 decimales fijos
      const fixedNumber = number.toFixed(2);
      
      // Separar parte entera y decimal
      const parts = fixedNumber.split('.');
      
      // Formatear parte entera con comas cada 3 dígitos
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      // Reconstruir con parte decimal
      return parts.join('.');
    },
    
    handleFocus(event) {
      // Seleccionar todo el texto al hacer foco
      event.target.select();
    }
  }
}
</script>

