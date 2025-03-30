<template>
  <section class="hero is-fullheight fondo">
    <div class="hero-body">
      <div class="container">
        <div :class="['box', 'login-box', animateLogin]">
          <div class="logo-container animate__animated animate__fadeInDown">
            <img src="@/assets/logo.png" alt="Logo" class="logo">
          </div>

          <template v-if="mostrarRegistroInicial">
            <h1 class="title is-3 has-text-centered is-family-sans-serif animate__animated animate__fadeInDown">Registro
              Inicial</h1>
            <p class="subtitle is-6 has-text-centered animate__animated animate__fadeInUp">Crea el primer usuario
              administrador</p>

            <form @submit.prevent="registrarUsuarioInicial">
              <b-field label="Nombre de usuario" class="input-container animate__animated animate__fadeInLeft">
                <b-input v-model="nuevoUsuario.username" type="text" placeholder="Ej. admin" required expanded>
                </b-input>
              </b-field>

              <b-field label="Nombre completo" class="input-container animate__animated animate__fadeInLeft">
                <input v-model="nuevoUsuario.name" type="text" placeholder="Ej. Juan Pérez" required class="input"
                  autocomplete="name">
              </b-field>

              <b-field label="Teléfono" class="input-container animate__animated animate__fadeInRight">
                <b-input v-model="nuevoUsuario.phone" type="tel" placeholder="Ej. 22577777" required expanded>
                </b-input>
              </b-field>

              <b-field label="Contraseña" class="input-container animate__animated animate__fadeInRight">
                <b-input v-model="nuevoUsuario.password" type="password" placeholder="Contraseña" required
                  password-reveal expanded>
                </b-input>
              </b-field>

              <div v-if="loading" class="loading-spinner animate__animated animate__fadeIn">
                <b-icon icon="loading" size="is-large" spin></b-icon>
              </div>

              <div v-else class="buttons-container animate__animated animate__fadeInUp">
                <b-button native-type="submit" type="is-primary" size="is-medium" icon-left="user-plus"
                  class="login-button" :loading="loading">
                  Registrar Usuario
                </b-button>
              </div>
            </form>
          </template>

          <template v-else>
            <h1 class="title is-3 has-text-centered is-family-sans-serif animate__animated animate__fadeInDown">
              Bienvenido</h1>
            <p class="subtitle is-6 has-text-centered animate__animated animate__fadeInUp">Ingresa tus datos para
              continuar</p>

            <form @submit.prevent="iniciarSesion">
              <b-field label="Nombre de usuario" class="input-container animate__animated animate__fadeInLeft">
                <b-input v-model="usuario.username" type="text" placeholder="Ej. Juan" required expanded>
                </b-input>
              </b-field>

              <b-field label="Contraseña" class="input-container animate__animated animate__fadeInRight">
                <b-input v-model="usuario.password" type="password" placeholder="Contraseña" required password-reveal
                  expanded>
                </b-input>
              </b-field>

              <div v-if="loading" class="loading-spinner animate__animated animate__fadeIn">
                <b-icon icon="loading" size="is-large" spin></b-icon>
              </div>

              <div v-else class="buttons-container animate__animated animate__fadeInUp">
                <b-button native-type="submit" type="is-primary" size="is-medium" icon-left="check" class="login-button"
                  :loading="loading">
                  Ingresar
                </b-button>
              </div>
            </form>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { formatLocalDateTime } from '@/helpers/formatDate';
import AyudanteSesion from '@/Servicios/AyudanteSesion'
import apiRequest from '@/Servicios/HttpService';

export default {
  name: "InicioSesion",

  data() {
    return {
      usuario: {
        username: "",
        password: ""
      },
      nuevoUsuario: {
        username: "",
        name: "",
        phone: "",
        password: ""
      },
      loading: false,
      animateLogin: 'animate__animated animate__fadeIn',
      mostrarRegistroInicial: false
    }
  },

  mounted() {
    this.verificarUsuariosExistentes();
  },

  methods: {
    async verificarUsuariosExistentes() {
      try {
        const response = await apiRequest({
          method: 'GET',
          path: 'users'
        });
        this.mostrarRegistroInicial = response.data.length === 0;
      } catch (error) {
        console.error('Error al verificar usuarios existentes:', error);
        this.mostrarRegistroInicial = true; // Asumimos que no hay usuarios si hay un error
      }
    },

    async registrarUsuarioInicial() {
      if (!this.nuevoUsuario.username || !this.nuevoUsuario.name || !this.nuevoUsuario.phone || !this.nuevoUsuario.password) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'Por favor completa todos los campos'
        });
        return;
      }

      this.loading = true;

      try {
        const response = await apiRequest({
          method: 'POST',
          path: "users/register",
          data: this.nuevoUsuario,
        });

        if (response.status === 201) {
          this.$buefy.toast.open({
            type: 'is-success',
            message: 'Usuario administrador registrado exitosamente'
          });

          // Cambiamos a la vista de inicio de sesión
          this.mostrarRegistroInicial = false;
          this.animateLogin = 'animate__animated animate__fadeIn';
        } else {
          throw new Error('Error al registrar el usuario');
        }
      } catch (error) {
        console.error("Error en el registro:", error);
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'Error al registrar el usuario. Por favor, intenta de nuevo.'
        });
      } finally {
        this.loading = false;
      }
    },

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
        const response = await apiRequest({
          method: 'POST',
          path: "users/login",
          data: this.usuario,
        })

        if (response.status === 201) {
          AyudanteSesion.establecerSesion(response.data);
          
          const today = formatLocalDateTime()
          const respCash = await apiRequest({
            method: 'get',
            path: `cash-register/details/${response.data.id}/${today}`

          })

          
          if (respCash.data.length == 0 || respCash.data.state == 'open') {
            const { status } = await apiRequest({
              method: 'POST',
              path: `cash-register/open/${response.data.id}`,
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
          this.animateLogin = 'animate__animated animate__fadeOut';
          this.$buefy.toast.open({
            type: 'is-success',
            message: 'Inicio de sesión exitoso.'
          });

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
