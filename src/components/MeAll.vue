<template>
  <div class="fc">
    <div class="search">
      <div class="flex flex-wrap gap-2">
        <button v-if="state.search.tag" class="filter-pill filter-pill-success" @click="state.search.tag = undefined">
          <span>{{ state.search.tag }}</span>
          <span class="i-carbon:close-small" aria-hidden="true"></span>
        </button>
        <button
          v-if="state.search.visibility"
          class="filter-pill filter-pill-info"
          @click="state.search.visibility = undefined"
        >
          <span>{{ getVisbilityDesc(state.search.visibility) }}</span>
          <span class="i-carbon:close-small" aria-hidden="true"></span>
        </button>
        <button v-if="searchDayDesc" class="filter-pill filter-pill-error" @click="clearSearchDate">
          <span>{{ searchDayDesc }}</span>
          <span class="i-carbon:close-small" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <memo :memo="item" v-for="item in state.memos" :key="item.id" :id="item.id" />

    <div v-cloak v-if="state.memos.length === 0 && state.search.page === 1" class="flex justify-center text-gray-700">
      暂无记录
    </div>
    <div
      class="flex items-center justify-center text-gray-500 text-sm cursor-pointer my-4 hover:text-blue-300"
      v-if="state.search.page < state.totalPage"
      @click="++state.search.page"
    >
      点击继续加载更多...
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyFetch } from '@/api/fetch'
import type { ListMemoResponse, MemoDTO, MemoSearchParam } from '@/types/memo'
import { reloadMemosBus, searchMemosBus } from '@/event/event'
import dayjs from 'dayjs'

const props = defineProps<{
  liked?: boolean
  commented?: boolean
  mentioned?: boolean
}>()

const userinfo = useStorage('userinfo', { token: '', userId: 0 })

interface State {
  memos: Array<MemoDTO>
  search: MemoSearchParam
  total: number
  totalPage: number
}

const state: State = reactive({
  memos: [],
  search: {
    page: 1,
    size: 20,
    begin: dayjs().subtract(20, 'year').startOf('d').toDate(),
    end: dayjs().endOf('d').toDate(),
    userId: props.liked || props.commented ? 0 : userinfo.value.userId,
    liked: props.liked,
    commented: props.commented,
    mentioned: props.mentioned,
  },
  total: 0,
  totalPage: 0,
})

watch(
  () => state.search,
  async () => {
    await reload()
  },
  {
    deep: true,
  }
)

onMounted(async () => {
  await reload()
})

const reload = async () => {
  const { data, error } = await useMyFetch('/api/memo/list').post(state.search).json()
  if (!error.value) {
    const response = data.value as ListMemoResponse
    if (state.search.page > 1) {
      state.memos.push(...response.items)
    } else {
      state.memos = response.items
    }
    state.memos.forEach((memo) => {
      memo.resources.forEach((item) => {
        if (item.storageType === 'LOCAL' && item.url.startsWith('/')) {
          item.url = import.meta.env.VITE_BASE_URL + item.url
        }
      })
    })
    state.total = response.total
    state.totalPage = response.totalPage
  }
}

searchMemosBus.on(async (params) => {
  params.page = 1
  state.search = Object.assign(state.search, params)
})

reloadMemosBus.on(reload)
changedMemoBus.on(reload)

const clearSearchDate = () => {
  state.search.begin = undefined
  state.search.end = undefined
}

const searchDayDesc = computed(() => {
  if (state.search.begin && state.search.end) {
    if (dayjs(state.search.begin).isSame(state.search.end, 'D')) {
      return dayjs(state.search.begin).format('YYYY-MM-DD')
    }
  }
  return ''
})
</script>

<style scoped>
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 0;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  line-height: 1rem;
  cursor: pointer;
}

.filter-pill-success {
  background: rgb(220 252 231);
  color: rgb(22 101 52);
}

.filter-pill-info {
  background: rgb(219 234 254);
  color: rgb(30 64 175);
}

.filter-pill-error {
  background: rgb(254 226 226);
  color: rgb(153 27 27);
}

:global(html.dark) .filter-pill-success {
  background: rgb(20 83 45 / 0.4);
  color: rgb(187 247 208);
}

:global(html.dark) .filter-pill-info {
  background: rgb(30 58 138 / 0.4);
  color: rgb(191 219 254);
}

:global(html.dark) .filter-pill-error {
  background: rgb(127 29 29 / 0.4);
  color: rgb(254 202 202);
}
</style>
