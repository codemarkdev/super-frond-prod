<template>
  <div class="discounts-section">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          <span class="icon mr-2"><i class="mdi mdi-tag-multiple"></i></span>
          Descuentos Disponibles
        </p>
      </header>
      <div class="card-content">
        <div class="columns is-multiline">
          <div class="column is-6" 
              v-for="(descuento, index) in descuentosDisponibles" 
              :key="index">
            <div class="card mb-2">
              <div class="card-content p-3">
                <div class="level mb-0">
                  <div class="level-left">
                    <div class="level-item">
                      <div>
                        <p class="is-size-6 has-text-weight-bold">{{ descuento.discount.name }}</p>
                        <p class="is-size-7">
                          <b-tag 
                            :type="getDiscountTagType(descuento.discount.type)"
                            size="is-small">
                            {{ getDiscountTagText(descuento.discount) }}
                          </b-tag>
                          <span class="ml-2 has-text-grey">Producto: {{ descuento.productoNombre }}</span>
                        </p>
                        <p class="is-size-7 has-text-success">
                          Ahorro: ${{ formatearNumero(descuento.discountAmount) }}
                        </p>
                        <p v-if="descuento.finalPrice <= 0" class="is-size-7 has-text-danger">
                          Este descuento no puede aplicarse (precio final inválido).
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="level-right">
                    <div class="level-item">
                      <b-checkbox 
                        v-model="descuento.aplicado" 
                        @input="onDescuentoToggle"
                        :disabled="descuento.finalPrice <= 0">
                        Aplicar
                      </b-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeccionDescuentos',
  props: {
    descuentosDisponibles: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatearNumero(valor) {
      return parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    getDiscountTagType(type) {
      const typeMap = {
        'PERCENTAGE': 'is-info',
        'FIXED_AMOUNT': 'is-success',
        'BUY_X_GET_Y': 'is-warning',
        'BUNDLE': 'is-primary',
        'SEASONAL': 'is-link'
      };
      
      return typeMap[type] || 'is-dark';
    },
    
    getDiscountTagText(discount) {
      switch (discount.type) {
        case 'PERCENTAGE':
          return `${discount.value}%`;
        case 'FIXED_AMOUNT':
          return `$${discount.value}`;
        case 'BUY_X_GET_Y':
          return `${discount.name}`;
        case 'BUNDLE':
          return `Paquete ${discount.value}`;
        case 'SEASONAL':
          return `Descuento ${discount.value}`;
        default:
          return 'N/A';
      }
    },
    
    onDescuentoToggle() {
      this.$emit('actualizar-descuentos');
    }
  }
}
</script>

<style scoped>
.discounts-section {
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
}
</style>