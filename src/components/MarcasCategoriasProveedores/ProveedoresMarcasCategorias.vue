<template>
  <section>
    <p class="title is-1">Proveedores, Marcas y Categorías</p>
    <b-breadcrumb
    align="is-left"
    >
    <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
    <b-breadcrumb-item active>Proveedores, Marcas y Categorías</b-breadcrumb-item>
  </b-breadcrumb>
  
  <b-tabs v-model="tabActiva" size="is-large">
    <b-tab-item label="Proveedores" icon="truck">
      <proveedores-component />
    </b-tab-item>

    <b-tab-item label="Marcas" icon="tag-multiple">
      <marcas-component/>
    </b-tab-item>

    <b-tab-item label="Categorías" icon="archive">
      <categorias-component />
    </b-tab-item>
  </b-tabs>
</section>
</template>
<script>
  import MarcasComponent from './MarcasComponent'
  import CategoriasComponent from './CategoriasComponent'
  import ProveedoresComponent from './ProveedoresComponent.vue';
  export default{
    name: "MarcasCategoriasProveedores",
    components: { MarcasComponent, CategoriasComponent, ProveedoresComponent},

    data:()=>({
      tabActiva: 0,      
    }),
  }
</script>