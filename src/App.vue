<template>
  <div id="app">
    <inicio-sesion @login="onLogin" v-if="!logeado"/>
    <div v-if="logeado">
      <encabezado-component />
      <div class="container" style="margin-top: 6rem;">
        <router-view/>
      </div>
    </div>    
  </div>
</template>
<script>
  import EncabezadoComponent from './components/EncabezadoComponent'
  import InicioSesion from './components/Usuarios/InicioSesion'
import { formatLocalDateTime } from './helpers/formatDate'
  import AyudanteSesion from './Servicios/AyudanteSesion'
import apiRequest from './Servicios/HttpService'

  export default {
    name: "App", 
    components: {
      EncabezadoComponent,
      InicioSesion
    },

    data:()=>({
      logeado: false
    }),

    mounted(){
      const log = AyudanteSesion.verificarSesion()
      this.logeado = log
      console.log(this.logeado)
      this.registerCashOpen()
    },

    methods: {
      onLogin(resultado){
        console.log(resultado)
        if(resultado.estado) {
          AyudanteSesion.establecerSesion(resultado.usuario)
          this.logeado = AyudanteSesion.verificarSesion()
        }
      },

      async registerCashOpen() {
        const {id} = AyudanteSesion.obtenerDatosSesion()
      
        const today = formatLocalDateTime()
          const respCash = await apiRequest({
            method: 'get',
            path: `cash-register/details/${id}/${today}`

          })
          console.log('resp', respCash)
          if (respCash.data.length == 0 || respCash.data.state == 'open') {
            
            const { status } = await apiRequest({
              method: 'POST',
              path: `cash-register/open/${id}`,
              data: {
                initialCash: 0,
                state: "open"
              }
            });
            if (status === 201) {
              this.$buefy.toast.open({
                message: 'Caja abierta exitosamente',
                type: 'is-success',
                duration: 5000
              });


            }
            else {
              throw new Error('Error al abrir la caja');
            }
          }

      }
    }
  }
</script>
