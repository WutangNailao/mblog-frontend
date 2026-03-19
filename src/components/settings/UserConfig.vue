<template>
  <div class="rd bg-white p-2 dark:bg-gray-7">
    <div class="mx-auto fc gap-4">
      <div class="form-row">
        <div class="form-label">头像</div>
        <label class="inline-flex cursor-pointer">
          <Avatar shape="circle" :size="'xlarge'" :image="formValue.avatarUrl" class="cursor-pointer" />
          <input class="hidden" type="file" accept="image/*" @change="handleFileChange" />
        </label>
      </div>
      <div class="form-row">
        <div class="form-label">昵称</div>
        <InputText v-model="formValue.displayName" placeholder="输入昵称" />
      </div>
      <div class="form-row">
        <div class="form-label">密码</div>
        <Password
          v-model="formValue.password"
          placeholder="留空就是不修改密码"
          input-class="w-full"
          :feedback="false"
          toggle-mask
        />
      </div>
      <div class="form-row">
        <div class="form-label">邮箱</div>
        <InputText v-model="formValue.email" placeholder="输入邮箱" />
      </div>
      <div class="form-row form-row-start">
        <div class="form-label">个人介绍</div>
        <Textarea v-model="formValue.bio" placeholder="输入个人介绍" :rows="5" auto-resize />
      </div>
      <div class="form-row">
        <div class="form-label">默认可见性</div>
        <AppSelect
          v-model="formValue.defaultVisibility"
          :options="getVisbilitys()"
          option-label="label"
          option-value="value"
          class="w-50"
          placeholder="选择可见性"
          clearable
        />
      </div>
      <div class="form-row form-row-start" v-if="sessionStorage.OPEN_COMMENT">
        <div class="form-label">默认是否可评论</div>
        <div class="fr gap-4 py-2">
          <label class="fr items-center gap-2 cursor-pointer">
            <input type="radio" value="true" v-model="formValue.defaultEnableComment" />
            <span>可以评论</span>
          </label>
          <label class="fr items-center gap-2 cursor-pointer">
            <input type="radio" value="false" v-model="formValue.defaultEnableComment" />
            <span>禁止评论</span>
          </label>
        </div>
      </div>
      <div class="fr justify-end">
        <Button type="button" @click="saveConfig">保存配置</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'
import type { UploadCustomRequestOptions } from '@/ui/types/upload'
import { useAppMessage } from '@/ui/useAppMessage'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'

const sessionStorage = useSessionStorage('config', {
  OPEN_COMMENT: false,
})
const userinfo = useStorage('userinfo', { token: '', defaultVisibility: 'PUBLIC', defaultEnableComment: 'false' })
const formValue = ref<Partial<User> & { password?: string }>({})
const message = useAppMessage()

const reload = async () => {
  const { data, error } = await useMyFetch('/api/user/current').post().json()
  if (error.value) return
  formValue.value = data.value
}

const saveConfig = async () => {
  const { error } = await useMyFetch('/api/user/update').post(formValue).json()
  if (!error.value) {
    message.success('保存用户配置成功!')
    userinfo.value.defaultVisibility = formValue.value.defaultVisibility || 'PUBLIC'
    userinfo.value.defaultEnableComment = formValue.value.defaultEnableComment || 'false'
    await reload()
  }
}
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  await customRequest({ file: { file } })
  target.value = ''
}

const customRequest = async ({ file }: UploadCustomRequestOptions) => {
  const uploadUrl = `${import.meta.env.VITE_BASE_URL}/api/resource/upload`
  const uploadHeaders = {
    token: userinfo.value.token,
  }
  const formData = new FormData()
  formData.append('files', file.file as File)

  const { data, error } = await useMyFetch(uploadUrl, {
    body: formData,
    headers: uploadHeaders,
  })
    .post()
    .json()
  if (!error.value) {
    let img = data.value[0]
    let url = img.url
    if (data.value[0].storageType === 'LOCAL') {
      url = import.meta.env.VITE_BASE_URL + url
    }
    formValue.value.avatarUrl = url + (img.fileType.includes('webp') ? '' : img.suffix || '')
  }
}

onMounted(async () => {
  await reload()
})
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
}

.form-row-start {
  align-items: flex-start;
}

.form-label {
  color: rgb(87 83 78);
  font-size: 0.875rem;
}

:global(html.dark) .form-label {
  color: rgb(214 211 209);
}

</style>
<route lang="yaml">
meta:
  layout: manage
</route>
