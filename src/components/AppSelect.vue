<template>
  <div ref="wrapRef" class="app-select" v-bind="attrs">
    <button type="button" class="app-select-trigger" :class="{ 'is-placeholder': !selectedOption }" @click="toggle">
      <span>{{ selectedOption?.label ?? props.placeholder ?? '请选择' }}</span>
      <span class="fr items-center gap-2">
        <span
          v-if="props.clearable && hasValue"
          class="i-carbon:close-small cursor-pointer"
          @click.stop="clearValue"
        ></span>
        <span class="i-carbon:chevron-down"></span>
      </span>
    </button>
    <div v-if="opened" class="app-select-panel">
      <button
        v-for="option in normalizedOptions"
        :key="String(option.value)"
        type="button"
        class="app-select-option"
        :class="{ active: isSelected(option.value) }"
        @click="selectValue(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

interface NormalizedOption {
  label: string
  value: string | number | boolean | undefined
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | boolean
    options?: Array<Record<string, any>>
    optionLabel?: string
    optionValue?: string
    placeholder?: string
    clearable?: boolean
  }>(),
  {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: '请选择',
    clearable: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean | undefined): void
}>()

const attrs = useAttrs()
const wrapRef = ref<HTMLElement | null>(null)
const opened = ref(false)

const normalizedOptions = computed<NormalizedOption[]>(() =>
  props.options.map((option) => ({
    label: String(option[props.optionLabel] ?? ''),
    value: option[props.optionValue],
  }))
)

const selectedOption = computed(() =>
  normalizedOptions.value.find((option) => String(option.value) === String(props.modelValue))
)

const hasValue = computed(() => props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '')

const toggle = () => {
  opened.value = !opened.value
}

const selectValue = (value: string | number | boolean | undefined) => {
  emit('update:modelValue', value)
  opened.value = false
}

const clearValue = () => {
  emit('update:modelValue', undefined)
  opened.value = false
}

const isSelected = (value: string | number | boolean | undefined) => String(value) === String(props.modelValue)

onClickOutside(wrapRef, () => {
  opened.value = false
})
</script>

<style scoped>
.app-select {
  position: relative;
  display: inline-block;
}

.app-select-trigger {
  width: 100%;
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.5rem;
  padding: 0.55rem 0.75rem;
  background: rgb(255 255 255);
  color: rgb(28 25 23);
  text-align: left;
}

.app-select-trigger.is-placeholder {
  color: rgb(120 113 108);
}

.app-select-panel {
  position: absolute;
  z-index: 40;
  top: calc(100% + 0.35rem);
  left: 0;
  width: 100%;
  min-width: max-content;
  overflow: hidden;
  border: 1px solid rgb(228 228 231);
  border-radius: 0.75rem;
  background: rgb(255 255 255);
  box-shadow: 0 18px 38px rgb(0 0 0 / 0.14);
}

.app-select-option {
  width: 100%;
  display: block;
  padding: 0.65rem 0.75rem;
  border: 0;
  background: transparent;
  text-align: left;
}

.app-select-option:hover,
.app-select-option.active {
  background: rgb(241 245 249);
}

:global(html.dark) .app-select-trigger {
  border-color: rgb(82 82 91);
  background: rgb(39 39 42);
  color: rgb(244 244 245);
}

:global(html.dark) .app-select-trigger.is-placeholder {
  color: rgb(168 162 158);
}

:global(html.dark) .app-select-panel {
  border-color: rgb(63 63 70);
  background: rgb(39 39 42);
}

:global(html.dark) .app-select-option {
  color: rgb(244 244 245);
}

:global(html.dark) .app-select-option:hover,
:global(html.dark) .app-select-option.active {
  background: rgb(63 63 70);
}
</style>
