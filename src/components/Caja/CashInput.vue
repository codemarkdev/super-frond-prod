<template>
    <div class="field">
      <label class="label">{{ cajaAbierta ? 'Efectivo en Mano' : 'Monto Inicial' }}</label>
      <div class="control has-icons-left has-icons-right">
        <input 
          class="input is-medium"
          :class="{ 'is-danger': !isValidAmount && inputValue !== null }"
          type="number" 
          v-model.number="inputValue"
          placeholder="Ingrese el monto en efectivo"
          min="0"
          step="0.01"
          @input="sendDataToParent"
        >
        <span class="icon is-small is-left">
          <i class="mdi mdi-cash"></i>
        </span>
        <span class="icon is-small is-right" v-if="isValidAmount">
          <i class="mdi mdi-check"></i>
        </span>
      </div>
      <p class="help is-danger" v-if="!isValidAmount && inputValue !== null">
        Por favor, ingrese un monto válido
      </p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      cajaAbierta: Boolean,
    }, 
    data() {
    return {
     inputValue :''
    };
  },
  computed: {
        isValidAmount() {
            return this.inputValue !== null &&
                this.inputValue >= 0 &&
                !isNaN(this.inputValue)
        }
    },

  methods: {
    sendDataToParent() {
        this.$emit('inputData', this.inputValue)
    }
  }
 
  }
  </script>
