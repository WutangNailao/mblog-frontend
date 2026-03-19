<template>
  <div>
    <label class="inline-flex cursor-pointer">
      <Button as="span">导入flomo</Button>
      <input class="hidden" type="file" accept=".json,.txt" @change="handleFileChange" />
    </label>
  </div>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions } from '@/ui/types/upload'
import Button from 'primevue/button'

const userinfo = useStorage('userinfo', { token: '' })

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  await customRequest({ file: { file } })
  target.value = ''
}

const customRequest = async ({ file }: UploadCustomRequestOptions) => {
  const uploadUrl = `${import.meta.env.VITE_BASE_URL}/api/import/flomo`
  const uploadHeaders = {
    token: userinfo.value.token,
  }
  const formData = new FormData()
  formData.append('file', file.file as File)

  const { data, error } = await useMyFetch(uploadUrl, {
    body: formData,
    headers: uploadHeaders,
  })
    .post()
    .json()
  if (!error.value) {
    console.log('upload result ', data)
  }
}
</script>

<style scoped></style>
