<template>
    <div class="date-info">
      <p class="is-6">
        <span class="icon-text">
          <span class="icon">
            <i class="mdi mdi-calendar"></i>
          </span>
          <span class="has-text-weight-bold">{{ fecha }}</span>
        </span>
      </p>
      <p class="is-6">
        <span class="icon-text">
          <span class="icon">
            <i class="mdi mdi-clock-outline"></i>
          </span>
          <span>{{ hora }}</span>
        </span>
      </p>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      fecha: String,
      hora: String
    }
  }
  </script>
  