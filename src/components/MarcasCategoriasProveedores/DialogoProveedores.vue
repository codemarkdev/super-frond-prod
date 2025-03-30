<template>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ titulo }} Proveedor</p>
        <b-button icon-left="close" @click="$emit('close')" />
      </header>
  
      <section class="modal-card-body">
        <b-field label="Nombre" label-position="on-border">
          <b-input v-model="proveedorLocal.name" required></b-input>
        </b-field>
  
        <b-field 
        label="NIT" 
        label-position="on-border"
        :type="nitError ? 'is-danger' : ''"
        :message="nitError ? 'Formato requerido: 0000-000000-000-0' : ''"
        >
          <b-input 
          v-model="proveedorLocal.taxId" 
          placeholder="0000-000000-000-0"
          maxlength="17"
          @blur="validarNIT"
          required></b-input>
        </b-field>
  
        <b-field label="Dirección" label-position="on-border">
          <b-input v-model="proveedorLocal.address" required></b-input>
        </b-field>
  
        <b-field 
        label="Teléfono" 
        label-position="on-border"
        :type="telefonoError ? 'is-danger' : ''"
        :message="telefonoError ? 'Formato requerido: 0000-0000' : ''"
        >
          <b-input 
          v-model="proveedorLocal.phone" 
          placeholder="0000-0000"
          maxlength="9"
          @blur="validarTelefono"
          required></b-input>
        </b-field>
      </section>
  
      <footer class="modal-card-foot is-justify-content-flex-end">
        <b-button @click="$emit('close')">Cancelar</b-button>
        <b-button type="is-primary" @click="guardar">Guardar</b-button>
      </footer>
    </div>
  </template>

<script>
export default {
  props: {
    titulo: String,
    proveedor: Object
  },

  data() {
    return {
      proveedorLocal: {
        name: "",
        taxId: "",
        address: "",
        phone: "",
        ...this.proveedor
      },
      nitError: false,
      telefonoError: false
    }
  },

  computed: {
    nitPattern() {
      return /^\d{4}-\d{6}-\d{3}-\d{1}$/
    },
    telefonoPattern() {
      return /^\d{4}-\d{4}$/
    }
  },

  watch: {
    'proveedorLocal.taxId'(newVal) {
      this.formatearNIT(newVal)
    },
    'proveedorLocal.phone'(newVal) {
      this.formatearTelefono(newVal)
    }
  },

  mounted() {
    if (this.proveedor?.taxId) {
      this.formatearNIT(this.proveedor.taxId)
    }
    if (this.proveedor?.phone) {
      this.formatearTelefono(this.proveedor.phone)
    }
  },

  methods: {
    formatearNIT(valor) {
      const nitLimpio = valor.replace(/[^\d]/g, '').substring(0, 14)
      let formatted = ''
      
      // Formato NIT: 0000-000000-000-0
      for (let i = 0; i < nitLimpio.length; i++) {
        if ([4, 10, 13].includes(i)) formatted += '-'
        formatted += nitLimpio[i]
      }

      this.proveedorLocal.taxId = formatted.substring(0, 17)
      this.validarNIT()
    },

    formatearTelefono(valor) {
      const telefonoLimpio = valor.replace(/[^\d]/g, '').substring(0, 8)
      let formatted = ''
      
      // Formato Teléfono: 0000-0000
      for (let i = 0; i < telefonoLimpio.length; i++) {
        if (i === 4) formatted += '-'
        formatted += telefonoLimpio[i]
      }

      this.proveedorLocal.phone = formatted.substring(0, 9)
      this.validarTelefono()
    },

    validarNIT() {
      this.nitError = !this.nitPattern.test(this.proveedorLocal.taxId)
    },

    validarTelefono() {
      this.telefonoError = !this.telefonoPattern.test(this.proveedorLocal.phone)
    },

    guardar() {
      if (this.validarCampos()) {
        this.$emit('registrar', this.proveedorLocal)
      }
    },

    validarCampos() {
      const camposRequeridos = ['name', 'taxId', 'address', 'phone']
      
      // Validar campos vacíos
      for (const campo of camposRequeridos) {
        if (!this.proveedorLocal[campo]?.trim()) {
          this.mostrarError(`El campo ${campo} es requerido`)
          return false
        }
      }

      // Validar formato NIT
      if (!this.nitPattern.test(this.proveedorLocal.taxId)) {
        this.mostrarError('Formato de NIT inválido. Use: 0000-000000-000-0')
        return false
      }

      // Validar formato Teléfono
      if (!this.telefonoPattern.test(this.proveedorLocal.phone)) {
        this.mostrarError('Formato de teléfono inválido. Use: 0000-0000')
        return false
      }

      return true
    },

    mostrarError(mensaje) {
      this.$buefy.toast.open({
        type: 'is-danger',
        message: mensaje,
        duration: 3000
      })
    }
  }
}
</script>