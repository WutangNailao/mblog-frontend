<template>
  <div class="drauu" v-if="show">
    <svg id="svg" ref="target"></svg>
  </div>
</template>

<script setup lang="ts">
import { useDrauu } from '@vueuse/integrations/useDrauu'

const target = ref()
const show = ref(false)
// @ts-ignore
// const { undo, redo, canUndo, canRedo, brush } = useDrauu(target)
useDrauu(target)
toggleDrauuBus.on(() => {
  show.value = !show.value
})
</script>

<style scoped>
.drauu {
  width: 100%;
  min-height: 400px;
  display: flex;
}

.drauu #svg {
  width: 100%;
  flex: 1;
}
</style>
