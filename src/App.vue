<script setup lang="ts">
const themeModelVal = useLocalStorage('themeModel', { theme: 'day' })
themeChangeBus.on(({ theme }) => {
  if (theme === 'dark') {
    window.document.documentElement.classList.add('dark')
    themeModelVal.value.theme = theme
  } else {
    window.document.documentElement.classList.remove('dark')
    themeModelVal.value.theme = theme
  }
})

onMounted(async () => {
  themeChangeBus.emit({ theme: themeModelVal.value.theme })
})
</script>

<template>
  <RouterView />
</template>
