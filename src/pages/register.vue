<template>
  <div class="rd bg-white p-2">
    <div class="mx-auto flex w-2/3 flex-col gap-4">
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        <span class="font-medium">用户名</span>
        <InputText v-model="formValue.username" placeholder="输入用户名" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        <span class="font-medium">密码</span>
        <InputText v-model="formValue.password" placeholder="输入密码" type="password" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        <span class="font-medium">确认密码</span>
        <InputText v-model="formValue.repeatPassword" placeholder="输入确认密码" type="password" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        <span class="font-medium">昵称</span>
        <InputText v-model="formValue.displayName" placeholder="可不填写,不填写取`用户名`" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        <span class="font-medium">邮箱</span>
        <InputText v-model="formValue.email" placeholder="可不填写" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700">
        <span class="font-medium">个人介绍</span>
        <Textarea
          v-model="formValue.bio"
          :rows="5"
          placeholder="个人介绍,可不填写,支持markdown"
        />
        <div class="text-right text-xs text-gray-400">{{ formValue.bio?.length || 0 }}</div>
      </label>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" severity="primary" @click="doRegister">注册用户</Button>
        <Button type="button" variant="text" severity="info">
          <RouterLink to="/login">去登录</RouterLink>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterUserDTO } from '@/types/user'
import { useAppMessage } from '@/ui/useAppMessage'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const formValue: Partial<RegisterUserDTO> = reactive({})

const router = useRouter()
const message = useAppMessage()
const doRegister = () => {
  if (!formValue.username) {
    message.warning('用户名必填')
    return
  }
  if (!formValue.password) {
    message.warning('密码必填')
    return
  }
  if ((formValue.password || '').length < 6 || (formValue.password || '').length > 20) {
    message.warning('密码必须在6-20位之间')
    return
  }
  if (!formValue.repeatPassword) {
    message.warning('重复密码必填')
    return
  }
  if (formValue.repeatPassword !== formValue.password) {
    message.warning('两次密码不一致')
    return
  }

  const { error } = useMyFetch('/api/user/register').post(formValue).json()
  if (!error.value) {
    message.success('注册成功,快去登录吧!', {
      onLeave: () => {
        router.push('/login')
      },
    })
  }
}
</script>
