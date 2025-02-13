<template>
  <section class="hero is-fullheight fondo">
    <div class="hero-body">
      <div class="container">
        <div :class="['box', 'login-box', animateLogin]">
          <div class="logo-container animate__animated animate__fadeInDown">
            <img src="@/assets/logo.png" alt="Logo" class="logo">
          </div>

          <h1 class="title is-3 has-text-centered is-family-sans-serif animate__animated animate__fadeInDown">Bienvenido</h1>
          <p class="subtitle is-6 has-text-centered animate__animated animate__fadeInUp">Ingresa tus datos para continuar</p>

          <form @submit.prevent="iniciarSesion">
            <b-field label="Nombre de usuario" class="input-container animate__animated animate__fadeInLeft">
              <b-input
                v-model="usuario.username"
                type="text"
                placeholder="Ej. Juan"
                required
                expanded>
              </b-input>
            </b-field>

            <b-field label="Contraseña" class="input-container animate__animated animate__fadeInRight">
              <b-input
                v-model="usuario.password"
                type="password"
                placeholder="Contraseña"
                required
                password-reveal
                expanded>
              </b-input>
            </b-field>

            <div v-if="loading" class="loading-spinner animate__animated animate__fadeIn">
              <b-icon icon="loading" size="is-large" spin></b-icon>
            </div>

            <div v-else class="buttons-container animate__animated animate__fadeInUp">
              <b-button 
                native-type="submit"
                type="is-primary" 
                size="is-medium" 
                icon-left="check" 
                class="login-button"
                :loading="loading">
                Ingresar
              </b-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import HttpService from '@/Servicios/HttpService'
import AyudanteSesion from '@/Servicios/AyudanteSesion'

export default {
  name: "InicioSesion",

  data() {
    return {
      usuario: {
        username: "",
        password: ""
      },
      loading: false,
      animateLogin: 'animate__animated animate__fadeIn'
    }
  },

  methods: {
    async iniciarSesion() {
      if (!this.usuario.username || !this.usuario.password) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'Por favor completa todos los campos'
        });
        return;
      }

      this.loading = true;
    
      try {
        const response = await HttpService.login(this.usuario);
        console.log('Respuesta completa:', response);

        if (response.statusCode === 201) {
          AyudanteSesion.establecerSesion(response.data);
          
          this.animateLogin = 'animate__animated animate__fadeOut';
          this.$buefy.toast.open({
            type: 'is-success',
            message: 'Inicio de sesión exitoso.'
          });

          // Redirigir al usuario después de un breve retraso
          setTimeout(() => {
            this.$router.push({ name: 'InicioComponent' })
              .catch(err => {
                console.error('Error en la redirección:', err);
                // Si falla el push, intentamos con replace
                this.$router.replace({ name: 'InicioComponent' })
                  .catch(err => {
                    console.error('Error en replace:', err);
                    // Como último recurso, usamos window.location
                    window.location.href = '/';
                  });
              });
          }, 1000);
        } else {
          throw new Error('Credenciales inválidas');
        }
      } catch (error) {
        console.error("Error en la autenticación:", error);
        
        this.animateLogin = 'animate__animated animate__shakeX';
        setTimeout(() => {
          this.animateLogin = 'animate__animated animate__fadeIn';
        }, 1000);

        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'Información incorrecta. Verifica.'
        });
      } finally {
        this.loading = false;
      }
    }
  }
}

const API = import.meta.VUE_APP_API

console.log("API",API )
</script>

<style scoped>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css";

.fondo {
  background: linear-gradient(135deg, #714dd2, #714dd2);
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-box {
  max-width: 400px;
  width: 100%;
  margin: auto;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  background: white;
  text-align: center;
  transition: all 0.3s ease;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.logo {
  max-width: 150px;
  margin: 0 auto;
  display: block;
}

.input-container {
  margin-bottom: 1rem;
}

.buttons-container {
  margin-top: 1.5rem;
}

.loading-spinner {
  text-align: center;
  margin-top: 1rem;
}

.login-button {
  width: 100%;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #FF7F13;
  color: white;
}

@media (max-width: 768px) {
  .login-box {
    padding: 1.5rem;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.15);
  }

  .logo {
    max-width: 120px;
  }

  .login-button {
    font-size: 1rem;
  }
}
</style>