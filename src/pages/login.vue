<template>
  <div class="rd bg-white p-2 dark:bg-gray-700">
    <div class="mx-auto flex w-2/3 flex-col gap-4">
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <span class="font-medium">用户名</span>
        <InputText v-model="formValue.username" placeholder="输入用户名" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <span class="font-medium">密码</span>
        <InputText v-model="formValue.password" placeholder="输入密码" type="password" />
      </label>
      <div class="flex flex-wrap items-center gap-2">
        <Button type="button" severity="primary" @click="doLogin">登录</Button>
        <Button type="button" variant="text" severity="info" v-openRegister>
          <RouterLink to="/register" class="dark:text-white">去注册</RouterLink>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppMessage } from '@/ui/useAppMessage'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const router = useRouter()
const route = useRoute()
const message = useAppMessage()
const userinfo = useStorage('userinfo', { username: '', token: '', role: '' })

const formValue = reactive({
  username: '',
  password: '',
})

const doLogin = () => {
  if (!formValue.username) {
    message.warning('用户名必填')
    return
  }
  if (!formValue.password) {
    message.warning('密码必填')
    return
  }
  if (formValue.password.length < 6 || formValue.password.length > 20) {
    message.warning('密码必须在6-20位之间')
    return
  }

  useMyFetch('/api/user/login')
    .post(formValue)
    .json()
    .then(({ error, data }) => {
      if (!error.value) {
        const target = (route.query.redirect as string) || '/'
        message.success('登录成功,请稍等...', {
          duration: 1000,
          onLeave: () => {
            userinfo.value = data.value
            router.push(target)
          },
        })
      }
    })
}
</script>
