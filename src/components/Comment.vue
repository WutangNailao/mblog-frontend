<style scoped lang="scss">
.comment {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  background-color: #fff;

  .head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    background-color: rgb(241 245 249);
    padding: 0.5rem;
    font-size: 0.75rem;
    color: rgb(107 114 128);

    .author {
      cursor: pointer;

      &:hover {
        color: rgb(17 24 39);
      }
    }

    .approve {
      cursor: pointer;
      color: rgb(248 113 113);

      &:hover {
        color: rgb(185 28 28);
      }
    }

    .right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.25rem;

      .remove {
        display: flex;
        cursor: pointer;
        align-items: center;
        gap: 0.25rem;

        &:hover {
          color: rgb(37 99 235);
        }
      }
    }
  }
}

:global(html.dark) .comment {
  background-color: rgb(55 65 81);
}
</style>
<template>
  <div class="comment">
    <div class="head">
      <div class="time">{{ dayjs(props.comment.created).format('YYYY-MM-DD HH:mm:ss') }}</div>
      <div class="author">@{{ props.comment.userName }}</div>
      <div
        class="approve"
        v-if="userinfo.role === 'ADMIN' && props.comment.approved === 0 && props.comment.userId < 0"
        @click="singleApproved"
      >
        未审核,点击审核通过
      </div>
      <div class="right">
        <div class="floor">#{{ props.index + 1 }}</div>
        <n-popconfirm
          :show-icon="false"
          v-if="userinfo.role === 'ADMIN'"
          @positive-click="removeComment(props.comment.id)"
          negative-text="取消"
          positive-text="确定"
        >
          <template #trigger>
            <div class="remove">
              <div class="i-carbon:trash-can"></div>
            </div>
          </template>
        </n-popconfirm>
      </div>
    </div>
    <div class="p-2 dark:text-white md-content" v-html="commentContent"></div>
  </div>
</template>

<script setup lang="ts">
import type { CommentDTO } from '@/types/comment'
import dayjs from 'dayjs'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'
import { gfmHeadingId } from 'marked-gfm-heading-id'
const options = {
  prefix: 'mblog-comment-',
}
marked.use(gfmHeadingId(options))
marked.use(mangle())

const props = defineProps<{
  comment: CommentDTO
  index: number
}>()
const userinfo = useStorage('userinfo', { role: '' })

const commentContent = ref(marked.parse(props.comment.content))

const removeComment = async (id: number) => {
  const { error } = await useMyFetch('/api/comment/remove?id=' + id)
    .post()
    .json()
  if (!error.value) {
    const { message } = createDiscreteApi(['message'])
    message.success('删除评论成功')
    commetSavedBus.emit()
  }
}

onMounted(() => {
  if (props.comment.mentioned) {
    const users = props.comment.mentioned.split(',')
    users.forEach((user: string) => {
      // @ts-ignore
      const reg = new RegExp(`(@${user}?)\\s+`, 'g')
      commentContent.value = commentContent.value.replaceAll(reg, "<div class='mentioned'>$1</div>")
    })
  }
})

const singleApproved = async () => {
  const { error } = await useMyFetch('/api/comment/singleApprove?id=' + props.comment.id)
    .post()
    .json()
  if (!error.value) {
    window.location.reload()
  }
}
</script>
