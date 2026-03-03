<template>
  <div class="memo" :class="{ top: props.memo.priority > 0 && route.path === '/' }" @dblclick="editMemo()">
    <div class="header">
      <div class="date">{{ dayjs(props.memo.created).format('YYYY-MM-DD HH:mm:ss') }}</div>
      <div class="author" @click="searchMemosBus.emit({ userId: props.memo.userId, username: props.memo.authorName })">
        @{{ props.memo.authorName }}
      </div>
      <div class="visibility" @click="searchMemosBus.emit({ visibility: props.memo.visibility })" v-if="userinfo.token">
        {{ getVisbilityDesc(props.memo.visibility) }}
      </div>
      <div v-if="props.memo.priority > 0 && route.path === '/'" class="fw-700">已置顶</div>
      <div v-openLike class="fav" @click="saveRealtion(props.memo)">
        <div class="i-carbon:favorite-filled text-red-500" v-if="props.memo.liked"></div>
        <div class="i-carbon:favorite" v-else></div>
        <div>{{ props.memo.likeCount }}</div>
      </div>
      <div v-openComment class="count" @click="goToDetail(props.memo.id)">
        <div class="i-carbon:chat"></div>
        <div>{{ props.memo.commentCount }}</div>
      </div>
      <div class="view">
        <div class="i-carbon:view"></div>
        <div>{{ props.memo.viewCount }}</div>
      </div>
      <div
        class="fr items-center gap-1 lt-md:hidden text-red-4 cursor-pointer"
        v-if="props.memo.unApprovedCommentCount > 0 && userinfo.role === 'ADMIN'"
        :title="`有${props.memo.unApprovedCommentCount}条待审核评论`"
      >
        <div class="i-carbon:task-view"></div>
        <div>{{ props.memo.unApprovedCommentCount }}</div>
      </div>
      <div
        class="fr gap-1 items-center cursor-pointer hover:text-blue-600 ml-auto"
        @click="navTo('/memo/' + props.memo.id)"
        title="查看详情"
        v-if="route.path === '/' && !userinfo.token"
      >
        <div class="i-carbon:book"></div>
      </div>

      <n-popover
        trigger="manual"
        placement="left"
        :show="popoverShow"
        @clickoutside="popoverShow = false"
        v-if="userinfo.token && route.path === '/'"
      >
        <template #trigger>
          <div class="detail i-carbon:table" @click="popoverShow = !popoverShow"></div>
        </template>
        <div class="fc gap-1">
          <div
            v-if="props.memo.userId === userinfo.userId"
            class="fr gap-1 items-center cursor-pointer hover:text-blue-600"
            @click="editMemo()"
          >
            <div class="i-carbon:edit"></div>
            <div>编辑</div>
          </div>
          <div
            class="fr gap-1 items-center cursor-pointer hover:text-blue-600"
            v-if="route.path === '/'"
            @click="navTo('/memo/' + props.memo.id)"
          >
            <div class="i-carbon:book"></div>
            <div>详情</div>
          </div>
          <div
            v-if="props.memo.priority === 0 && userinfo.role === 'ADMIN'"
            class="fr gap-1 items-center cursor-pointer hover:text-blue-600"
            @click="setMemoPriority(props.memo.id, true)"
          >
            <div class="i-carbon:up-to-top"></div>
            <div>置顶</div>
          </div>
          <div
            v-if="userinfo.role === 'ADMIN' && props.memo.priority > 0"
            class="fr gap-1 items-center cursor-pointer hover:text-blue-600"
            @click="setMemoPriority(props.memo.id, false)"
          >
            <div class="i-carbon:down-to-bottom"></div>
            <div>取消置顶</div>
          </div>
          <n-popconfirm
            :show-icon="false"
            v-if="props.memo.userId === userinfo.userId || userinfo.role === 'ADMIN'"
            @positive-click="removeMemo(props.memo.id)"
            negative-text="取消"
            positive-text="确定"
          >
            <template #trigger>
              <div class="fr gap-1 items-center cursor-pointer hover:text-blue-600">
                <div class="i-carbon:trash-can"></div>
                <div>删除</div>
              </div>
            </template>
          </n-popconfirm>
        </div>
      </n-popover>
    </div>
    <div
      class="content md-content"
      ref="el"
      :style="{ 'max-height': maxHeight }"
      v-html="props.memo && props.memo.content && marked.parse(props.memo.content)"
    ></div>

    <div class="imgs" v-if="imgs && imgs.length > 0">
      <n-image-group>
        <n-space>
          <n-image
            v-for="(img, index) in imgs"
            class="rd hover:shadow-2xl"
            :key="index"
            :width="thumbnailWidth"
            :height="thumbnailHeight"
            lazy
            object-fit="cover"
            :src="img.url + (img.fileType.includes('webp') ? '' : img.suffix || '')"
            :fallback-src="img.url"
            :preview-src="img.url"
            :intersection-observer-options="{
              root: '#image-scroll-container',
            }"
          >
            <template #placeholder>
              <div
                style="
                  width: 100px;
                  height: 100px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: #0001;
                "
              >
                加载中...
              </div>
            </template>
          </n-image>
        </n-space>
      </n-image-group>
    </div>
    <div class="fc gap-2 px-2 mb-2 flex-wrap" v-if="files && files.length > 0">
      <div v-for="(resource, index) in files" :key="index" class="text-sm text-gray-3">
        <a target="_blank" :href="resource.url" style="color: rgb(156, 163, 175)">{{ resource.fileName }}</a>
      </div>
    </div>
    <template v-if="!route.path.startsWith('/memo/')">
      <div
        v-if="height >= props.maxHeight && fold"
        class="fr justify-center my-4 cursor-pointer hover:text-gray-5 items-center text-gray-4 select-none"
        title="展开"
        @click="toggleContent"
      >
        <div class="i-carbon:arrow-down"></div>
        <div>展开</div>
      </div>
      <div
        v-if="!fold"
        class="fr justify-center my-4 cursor-pointer hover:text-gray-5 items-center text-gray-4 select-none"
        title="折叠"
        @click="toggleContent"
      >
        <div class="i-carbon:arrow-up"></div>
        <div>折叠</div>
      </div>
    </template>
    <div class="tags" v-if="tags && tags.length > 0">
      <div class="tag" v-for="tag in tags" :key="tag" @click="searchMemosBus.emit({ tag: tag })">{{ tag }}</div>
    </div>

    <div class="source" v-if="props.memo.source && props.memo.source !== 'web'">来自{{ props.memo.source }}</div>
  </div>
  <div class="flex items-center justify-center my-4" v-if="route.path !== '/' && !userinfo.token">
    <n-button type="primary" class="px-6" @click="router.push('/')">回首页</n-button>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { mangle } from 'marked-mangle'
import { gfmHeadingId } from 'marked-gfm-heading-id'

import { type MemoDTO, getVisbilityDesc } from '@/types/memo'
import { searchMemosBus, reloadMemosBus } from '@/event/event'
import { useMyFetch } from '@/api/fetch'
import dayjs from 'dayjs'
const options = {
  prefix: 'mblog-',
}

const props = withDefaults(
  defineProps<{
    memo: MemoDTO
    id: number | string
    maxHeight?: number
  }>(),
  {
    maxHeight: 300,
  }
)

const userinfo = useStorage('userinfo', { token: '', userId: 0, role: '' })

const route = useRoute()

const imgs = computed(() => {
  return props.memo.resources?.filter((r) => r.fileType.includes('image'))
})

const files = computed(() => {
  return props.memo.resources?.filter((r) => r.fileType.includes('application'))
})

const tags = computed(() => {
  return props.memo.tags?.split(',').filter((r) => r.trim().length > 0)
})

const sessionStorage = useSessionStorage('config', {
  THUMBNAIL_SIZE: '100,100',
})

const thumbnailWidth = computed(() => {
  return sessionStorage.value.THUMBNAIL_SIZE.split(',')[0]
})
const thumbnailHeight = computed(() => {
  return sessionStorage.value.THUMBNAIL_SIZE.split(',')[1]
})
const setMemoPriority = async (id: number, top: boolean) => {
  popoverShow.value = false
  const { error } = await useMyFetch(`/api/memo/setPriority?id=${id}&set=${top}`).post().json()
  if (!error.value) {
    const { message } = createDiscreteApi(['message'])
    message.success('操作成功')
    reloadMemosBus.emit()
  }
}

const goToDetail = (id: number) => {
  router.push('/memo/' + id)
}

const saveRealtion = async (memo: MemoDTO) => {
  if (!userinfo.value.token) {
    const { message } = createDiscreteApi(['message'])
    message.warning('请先登录')
    return
  }
  const { error } = await useMyFetch(`/api/memo/relation`)
    .post({
      memoId: memo.id,
      type: 'LIKE',
      operateType: memo.liked > 0 ? 'REMOVE' : 'ADD',
    })
    .json()
  if (!error.value) {
    const { message } = createDiscreteApi(['message'])
    message.success('操作成功')
    reloadMemosBus.emit()
  }
}

marked.use(gfmHeadingId(options))
marked.use(mangle())

const el = ref<any>(null)
const { height } = useElementSize(el)
const fold = ref(true)
const maxHeight = ref(props.maxHeight + 'px')
const toggleContent = () => {
  fold.value = !fold.value
  const contentHeight = window.getComputedStyle(el.value).maxHeight
  maxHeight.value = contentHeight === `${props.maxHeight}px` ? 'none' : `${props.maxHeight}px`
}

onMounted(() => {
  if (route.path.startsWith('/memo')) {
    el.value.style.maxHeight = 'none'
    maxHeight.value = 'none'
  }
})

const router = useRouter()
const navTo = (path: string) => {
  router.push(path)
}

const popoverShow = ref(false)

const removeMemo = async (id: number) => {
  const { error } = await useMyFetch(`/api/memo/remove?id=${id}`).post().json()
  if (!error.value) {
    const { message } = createDiscreteApi(['message'])
    message.success('删除成功')
    changedMemoBus.emit({ id, deleteMemo: true })
  }
}

const editMemo = () => {
  if (props.memo.userId === userinfo.value.userId) {
    editMemoBus.emit(props.memo)
    popoverShow.value = false
  }
}
</script>

<style scoped lang="scss">
.memo {
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;
  background-color: #fff;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  .source {
    position: absolute;
    right: 0.25rem;
    bottom: 0.5rem;
    z-index: 10;
    font-size: 0.75rem;
    color: rgb(209 213 219);
  }

  &.top {
    .header {
      background-color: rgb(239 246 255);
    }
  }

  .header {
    display: flex;
    gap: 0.5rem;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    background-color: rgb(249 250 251);
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: rgb(107 114 128);

    .author,
    .visibility {
      cursor: pointer;

      &:hover {
        color: rgb(96 165 250);
      }
    }

    .fav {
      display: flex;
      cursor: pointer;
      align-items: center;
      gap: 0.25rem;

      &:hover {
        color: rgb(59 130 246);
      }
    }

    .count {
      display: flex;
      cursor: pointer;
      align-items: center;
      gap: 0.25rem;

      &:hover {
        color: rgb(59 130 246);
      }
    }

    .view {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .detail {
      margin-left: auto;
      cursor: pointer;
      color: rgb(156 163 175);

      &:hover {
        color: rgb(55 65 81);
      }
    }
  }

  .content {
    padding: 0.5rem 1rem;
    transition-duration: 300ms;
    transition-property: all;
    overflow-wrap: anywhere;
    overflow: hidden;
  }

  .imgs {
    margin-bottom: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .tags {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0.5rem;
    color: rgb(156 163 175);

    .tag {
      cursor: pointer;
      border: 1px solid currentColor;
      border-radius: 0.25rem;
      padding: 0 0.5rem;
      font-size: 0.5rem;
      line-height: 0.75rem;
      color: #18a058;

      &:hover {
        color: #36ad6a;
      }
    }
  }
}

@media screen and (max-width: 639px) {
  .memo .header {
    .fav,
    .count,
    .view {
      display: none;
    }
  }
}

:global(html.dark) .memo {
  background-color: rgb(55 65 81);
  color: rgb(156 163 175);
}

:global(html.dark) .memo.top .header {
  background-color: rgb(239 246 255);
}

:global(html.dark) .memo .header {
  background-color: rgb(107 114 128);
  color: rgb(17 24 39);
}
</style>
