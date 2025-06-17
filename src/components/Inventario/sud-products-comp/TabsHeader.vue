<template>
  <div>
    <div class="level mb-5">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-4">
            {{ tituloActual }}
          </h1>
        </div>
      </div>
      <div class="level-right" v-if="activeTab === 'inventario'">
        <div class="level-item">
          <router-link to="/agregar-producto" class="button is-primary">
            <span class="icon"><i class="mdi mdi-plus"></i></span>
            <span>Agregar producto</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="tabs is-boxed mb-4">
      <ul>
        <li :class="{ 'is-active': activeTab === 'inventario' }">
          <a @click="$emit('tab-change', 'inventario')">
            <span class="icon is-small"><i class="mdi mdi-package-variant-closed"></i></span>
            <span>Inventario</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'abollados' }">
          <a @click="$emit('tab-change', 'abollados')">
            <span class="icon is-small"><i class="mdi mdi-alert-circle"></i></span>
            <span>Dañados</span>
          </a>
        </li>
        <li :class="{ 'is-active': activeTab === 'descuentos' }">
          <a @click="$emit('tab-change', 'descuentos')">
            <span class="icon is-small"><i class="mdi mdi-tag-multiple"></i></span>
            <span>Descuentos</span>
          </a>
        </li>
        <li v-if="isAdmin" :class="{ 'is-active': activeTab === 'eliminados' }">
          <a @click="$emit('tab-change', 'eliminados')">
            <span class="icon is-small"><i class="mdi mdi-archive"></i></span>
            <span>Eliminados</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabsHeader',
  props: {
    activeTab: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  computed: {
    tituloActual() {
      switch (this.activeTab) {
        case 'inventario': return 'Inventario'
        case 'abollados': return 'Productos Dañados'
        case 'eliminados': return 'Productos Eliminados'
        case 'descuentos': return 'Descuentos'
        default: return ''
      }
    }
  }
}
</script>
