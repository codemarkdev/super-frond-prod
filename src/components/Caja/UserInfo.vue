<template>
    <div class="user-info" v-if="!cargando">
      <div class="columns is-mobile is-multiline">
        <div class="column is-full">
          <p class="title is-4">
            <span class="icon-text">
              <span class="icon">
                <i class="mdi mdi-account-circle"></i>
              </span>
              <span>{{ userData.name }}</span>
            </span>
          </p>
        </div>
        <div class="column is-half">
          <p class="subtitle is-6">
            <span class="icon-text">
              <span class="icon">
                <i class="mdi mdi-at"></i>
              </span>
              <span>{{ userData.username }}</span>
            </span>
          </p>
        </div>
        <div class="column is-half">
          <p class="subtitle is-6">
            <span class="icon-text">
              <span class="icon">
                <i class="mdi mdi-phone"></i>
              </span>
              <span>{{ userData.phone }}</span>
            </span>
          </p>
        </div>
      </div>
    </div>
    <p v-else class="is-loading">Cargando datos del usuario...</p>
  </template>
  
  <script>
  export default {
    props: {
      cargando: Boolean,
      userData: Object
    }
  }
  </script>
  