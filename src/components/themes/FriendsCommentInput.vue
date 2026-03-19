<template>
  <div class="p-2 rd">
    <Textarea :placeholder="placeholder" v-model="content" :disabled="!enabelComment" auto-resize :rows="4" />
    <div class="fr items-center justify-end mt-2 gap-2">
      <template v-if="!userinfo.token">
        <div class="fr items-center">
          <InputText placeholder="昵称" v-model="username" size="small"></InputText>
        </div>
        <div class="fr items-center">
          <InputText placeholder="主页" v-model="link" size="small"></InputText>
        </div>
        <div class="fr items-center">
          <InputText placeholder="邮箱" v-model="email" size="small"></InputText>
        </div>
      </template>

      <Button
        v-if="!userinfo.token"
        variant="text"
        type="button"
        severity="info"
        class="dark:text-white text-xs"
        @click="nav2Login"
      >
        去登陆
      </Button>
      <Button size="small" @click="saveComment" :disabled="!enabelComment">{{ btnName }}</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppMessage } from '@/ui/useAppMessage'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const content = ref('')
const username = ref('')
const email = ref('')
const link = ref('')
const placeholder = ref('请先登录,再发表评论')
const btnName = ref('发表评论')

const props = defineProps<{ memoId: number,reply?:string }>()
const userinfo = useStorage('userinfo', { token: '' })
const router = useRouter()
const message = useAppMessage()

const nav2Login = () => {
  router.push('/login?redirect=/memo/' + props.memoId)
}

const sessionStorage = useSessionStorage('config', {
  OPEN_COMMENT: false,
  ANONYMOUS_COMMENT: false,
  COMMENT_APPROVED: true,
})

const enabelComment = computed(() => {
  console.log(sessionStorage.value.OPEN_COMMENT, userinfo.value.token, sessionStorage.value.ANONYMOUS_COMMENT)
  if (sessionStorage.value.OPEN_COMMENT === false) {
    return false
  }
  if (userinfo.value.token) {
    return true
  }
  if (sessionStorage.value.ANONYMOUS_COMMENT === true) {
    return true
  }
  return false
})

const saveComment = async () => {
  if (!content.value) {
    message.warning('先填写评论')
    return
  }
  const { error } = await useMyFetch('/api/comment/add')
    .post({
      content: content.value,
      memoId: props.memoId,
      username: username.value || '匿名',
      link: link.value,
      email: email.value,
    })
    .json()
  if (error.value) return
  if (!userinfo.value.token && sessionStorage.value.COMMENT_APPROVED) {
    message.warning('匿名评论成功,等待审核.')
  }
  content.value = ''
  commetSavedBus.emit()
}

onMounted(async () => {
  if (userinfo.value.token) {
    placeholder.value = '输入您的评论吧,文明发言'
  } else {
    placeholder.value = '支持匿名评论,输入您的评论吧,文明发言'
    btnName.value = '回复'
  }

  if(props.reply){
    placeholder.value = "回复给@"+props.reply
  }
})
</script>

<style scoped></style>
