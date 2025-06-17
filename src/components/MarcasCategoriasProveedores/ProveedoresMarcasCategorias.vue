<template>
  <section>
    <p class="title is-1">Catálogo PMC</p>
    <b-breadcrumb
    align="is-left"
    >
    <b-breadcrumb-item tag='router-link' to="/">Inicio</b-breadcrumb-item>
    <b-breadcrumb-item active>Catálogo PMC</b-breadcrumb-item>
  </b-breadcrumb>
  
  <!-- <b-tabs v-model="tabActiva" size="is-large">
    <b-tab-item label="Proveedores" icon="truck">
      <proveedores-component />
    </b-tab-item>

    <b-tab-item label="Marcas" icon="tag-multiple">
      <marcas-component/>
    </b-tab-item>

    <b-tab-item label="Categorías" icon="archive">
      <categorias-component />
    </b-tab-item>
  </b-tabs> -->
  <b-tabs type="is-boxed">
        <b-tab-item>
            <template #header>
                <b-icon icon="information-outline"></b-icon>
                <span>Proveedor </span>
            </template>
         
            <proveedores-component />
        </b-tab-item>
        <b-tab-item>
            <template #header>
                <b-icon icon="information-outline"></b-icon>
                <span>Marca </span>
            </template>
   
            <marcas-component/>
        </b-tab-item>
        <b-tab-item>
            <template #header>
                <b-icon icon="information-outline"></b-icon>
                <span>Categoría</span>
              
            </template>
         
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