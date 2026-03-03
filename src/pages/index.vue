<template>
  <component :is="currentPage" />
</template>

<script setup lang="ts">
import DefaultIndex from './defaultIndex.vue'
import FriendsIndex from './friendsIndex.vue'

const userinfo = useStorage('userinfo', { token: '' })
const currentPage = computed(() => (userinfo.value.token ? DefaultIndex : FriendsIndex))
</script>
