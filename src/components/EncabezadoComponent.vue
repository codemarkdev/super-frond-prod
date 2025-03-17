<template>
  <b-navbar type="is-warning" class="fondo">
         <template #brand>
             <b-navbar-item tag="router-link" :to="{ path: '/' }">
                 <img
                     src="@/assets/logo.png"
                 >
             </b-navbar-item>
         </template>
         <template #start>
             <b-navbar-item tag="router-link" :to="{ path: '/' }">
             
                 <span></span>
                 Inicio
             </b-navbar-item>
             <b-navbar-item  tag="router-link" :to="{ path: '/inventario' }">
                
                 <span></span>
                 Inventario
             </b-navbar-item> 
 
             <b-navbar-item  tag="router-link" :to="{ path: '/proveedores-marcas-y-categorias' }">
              
                 <span></span>
                 Proveedores, Marcas y Categorías
             </b-navbar-item> 
 
     
             <b-navbar-item  tag="router-link" :to="{ path: '/DetallesPedido' }">
              
              <span></span>
              Detalles de Ordenes
          </b-navbar-item> 

             <b-navbar-item>
                
                 <b-navbar-dropdown label="Reportes" icon="home">
                 <b-navbar-item tag="router-link" :to="{ path: '/reporte-ventas' }">
                  
                     <span></span>
                     Ventas
                 </b-navbar-item>
                 
                
                
                 </b-navbar-dropdown>
             </b-navbar-item>
 
             <b-navbar-item  tag="router-link" :to="{ path: '/usuarios' }">
              
                 <span></span>
                 Usuarios
             </b-navbar-item>
             <b-navbar-item  tag="router-link" :to="{ path: '/Empleados' }">
              
              <span></span>
              Empleados
          </b-navbar-item>
             <b-navbar-item  tag="router-link" :to="{ path: '/clientes' }">
               
                 <span></span>
                 Clientes
             </b-navbar-item>
 
         </template>
 
         <template #end>
           
 
             <b-navbar-item  tag="router-link" :to="{ path: '/perfil' }">
                 <b-icon
                     icon="account"
                     size="is-medium">
                 </b-icon>
                 <span> </span>
                 {{ usuario }}
             </b-navbar-item>
             <b-navbar-item >
                 <div class="buttons">
                     <a class="button is-light" @click="salir">
                         Salir
                     </a>
                 </div>
             </b-navbar-item>
         </template>
     </b-navbar>
 </template>
 <script>
     import AyudanteSesion from '../Servicios/AyudanteSesion'
 
     export default {
         name: "EncabezadoComponent",
 
         data:()=>({
             usuario: ""
         }),
 
         mounted(){
             this.usuario = AyudanteSesion.obtenerDatosSesion().usuario
         },
 
         methods: {
             salir(){
                 AyudanteSesion.cerrarSesion()
             }
         }
     }
 </script>