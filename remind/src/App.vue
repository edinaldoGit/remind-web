<script setup>
  import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Reset Global mantendo suas configurações */
* { box-sizing: border-box; }

body {
  margin: 0;
  overflow: hidden; 
  background-color: #0B1240; 
  /* Se você já configurou a Urbanist no main.css, ela funcionará. 
     Se não, pode manter a Inter aqui por enquanto */
  font-family: 'Urbanist', 'Inter', sans-serif;
}
</style>