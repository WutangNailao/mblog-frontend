<template>
  <div class="home-page" ref="middleRef">
    <header class="hero">
      <p class="eyebrow">Writing Desk</p>
      <div class="hero-main">
        <div>
          <h1>文章编辑</h1>
          <p class="hero-copy">以写作为中心的工作台。先落笔，再整理标签、筛选与归档。</p>
        </div>
        <div class="hero-meta">
          <div class="hero-meta-label">已载入</div>
          <div class="hero-meta-value">{{ state.total }}</div>
          <div class="hero-meta-unit">篇记录</div>
        </div>
      </div>
    </header>

    <section class="editor-shell" v-if="userinfo.token">
      <div class="section-label">Draft</div>
      <memo-input />
    </section>

    <section class="filter-shell" v-if="activeFilterCount > 0">
      <div class="filter-header">
        <span class="section-label">Filters</span>
        <span class="filter-count">{{ activeFilterCount }} 个筛选条件生效</span>
      </div>
      <div class="filter-tags">
        <div class="filter-pill-wrap">
          <button v-if="state.search.tag" class="filter-pill filter-pill-success" @click="state.search.tag = undefined">
            <span>{{ state.search.tag }}</span>
            <span class="i-carbon:close-small" aria-hidden="true"></span>
          </button>
          <button
            v-if="state.search.username && state.search.userId"
            class="filter-pill filter-pill-warning"
            @click="state.search.userId = undefined"
          >
            <span>{{ state.search.username }}</span>
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
    </section>

    <section class="archive-shell">
      <div class="archive-header">
        <div>
          <p class="section-label">Archive</p>
          <h2>最近文章</h2>
        </div>
        <div class="archive-subtitle">按时间倒序浏览并继续编辑你的记录。</div>
      </div>

      <div class="memo-list">
        <memo
          :memo="item"
          v-for="item in state.memos"
          :key="item.id"
          :id="item.id"
          :max-height="sessionStorage.MEMO_MAX_LENGTH"
        />
      </div>

      <div v-cloak v-if="state.memos.length === 0 && state.search.page === 1" class="empty-state">
        还没有文章，先从上方写下第一篇。
      </div>
      <div class="load-more" v-if="state.search.page < state.totalPage" @click="++state.search.page">
        点击继续加载更多...
      </div>
    </section>
  </div>

  <div class="fixed bottom-10% lt-md:hidden" :style="'left:' + (left + width + 20) + 'px'" v-if="y > 150">
    <div class="fc items-center cursor-pointer hover:text-gray-7 text-gray-400" @click="scroll2Top">
      <div class="i-carbon:upgrade text-xl" title="回到顶部"></div>
      <div class="text-xs">回到顶部</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyFetch } from '@/api/fetch'
import type { ListMemoResponse, MemoDTO, MemoSaveParam, MemoSearchParam } from '@/types/memo'
import { reloadMemosBus, searchMemosBus } from '@/event/event'
import dayjs from 'dayjs'

const middleRef = ref(null)
const { left, width } = useElementBounding(middleRef)
const { y } = useWindowScroll()
let timer = 0

const scroll2Top = () => {
  cancelAnimationFrame(timer)
  timer = requestAnimationFrame(function fn() {
    var oTop = document.body.scrollTop || document.documentElement.scrollTop
    if (oTop > 0) {
      document.body.scrollTop = document.documentElement.scrollTop = oTop - 100
      timer = requestAnimationFrame(fn)
    } else {
      cancelAnimationFrame(timer)
    }
  })
}

const userinfo = useStorage('userinfo', { token: '', userId: 0 })
const sessionStorage = useSessionStorage('config', {
  MEMO_MAX_LENGTH: 300,
  USER_MODEL: 'SINGLE',
})
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
changedMemoBus.on(async (param: MemoSaveParam) => {
  if (param.id && param.id > 0) {
    const memo = state.memos.find((r) => r.id === param.id)
    if (memo) {
      if (param.deleteMemo) {
        const idx = state.memos.findIndex((r) => r.id === param.id)
        state.memos.splice(idx, 1)
      } else {
        const { data, error } = await useMyFetch('/api/memo/' + param.id)
          .post()
          .json()
        if (error.value) {
          return
        }
        Object.assign(memo, data.value)
      }
    }
  } else {
    await reload()
  }
})

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

const activeFilterCount = computed(() => {
  let count = 0
  if (state.search.tag) count += 1
  if (state.search.username && state.search.userId) count += 1
  if (state.search.visibility) count += 1
  if (searchDayDesc.value) count += 1
  return count
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero,
.filter-shell,
.archive-shell {
  border: 1px solid #d6d3d1;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.92);
}

.hero {
  padding: 1.5rem;
}

.eyebrow,
.section-label {
  margin: 0;
  color: #78716c;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-top: 0.75rem;
}

.hero h1,
.archive-header h2 {
  margin: 0;
  color: #1c1917;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.hero-copy,
.archive-subtitle,
.filter-count {
  margin: 0.5rem 0 0;
  color: #57534e;
  line-height: 1.7;
}

.hero-copy {
  max-width: 38rem;
}

.hero-meta {
  min-width: 8.5rem;
  border-left: 1px solid #d6d3d1;
  padding-left: 1rem;
  color: #44403c;
}

.hero-meta-label,
.hero-meta-unit {
  font-size: 0.8rem;
  color: #78716c;
}

.hero-meta-value {
  font-size: 2rem;
  line-height: 1;
  font-weight: 700;
  margin: 0.35rem 0;
}

.editor-shell {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-shell,
.archive-shell {
  padding: 1.25rem;
}

.filter-header,
.archive-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.filter-tags {
  margin-top: 0.9rem;
}

.filter-pill-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

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

.filter-pill-warning {
  background: rgb(254 243 199);
  color: rgb(146 64 14);
}

.filter-pill-info {
  background: rgb(219 234 254);
  color: rgb(30 64 175);
}

.filter-pill-error {
  background: rgb(254 226 226);
  color: rgb(153 27 27);
}

.archive-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.memo-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.empty-state,
.load-more {
  border-top: 1px solid #e7e5e4;
  padding-top: 1rem;
  text-align: center;
  color: #78716c;
}

.load-more {
  cursor: pointer;
  transition: color 0.2s ease;
}

.load-more:hover {
  color: #1c1917;
}

:global(html.dark) .hero,
:global(html.dark) .filter-shell,
:global(html.dark) .archive-shell {
  border-color: #44403c;
  background: rgba(24, 24, 27, 0.9);
}

:global(html.dark) .eyebrow,
:global(html.dark) .section-label,
:global(html.dark) .hero-meta-label,
:global(html.dark) .hero-meta-unit,
:global(html.dark) .filter-count,
:global(html.dark) .archive-subtitle,
:global(html.dark) .hero-copy,
:global(html.dark) .empty-state,
:global(html.dark) .load-more {
  color: #d6d3d1;
}

:global(html.dark) .hero h1,
:global(html.dark) .archive-header h2,
:global(html.dark) .hero-meta-value {
  color: #fafaf9;
}

:global(html.dark) .hero-meta {
  border-left-color: #44403c;
}

:global(html.dark) .filter-pill-success {
  background: rgb(20 83 45 / 0.4);
  color: rgb(187 247 208);
}

:global(html.dark) .filter-pill-warning {
  background: rgb(120 53 15 / 0.4);
  color: rgb(253 230 138);
}

:global(html.dark) .filter-pill-info {
  background: rgb(30 58 138 / 0.4);
  color: rgb(191 219 254);
}

:global(html.dark) .filter-pill-error {
  background: rgb(127 29 29 / 0.4);
  color: rgb(254 202 202);
}

:global(html.dark) .empty-state,
:global(html.dark) .load-more {
  border-top-color: #44403c;
}

@media screen and (max-width: 768px) {
  .hero,
  .filter-shell,
  .archive-shell {
    padding: 1rem;
  }

  .hero-main,
  .filter-header,
  .archive-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-meta {
    min-width: auto;
    border-left: 0;
    border-top: 1px solid #d6d3d1;
    padding-left: 0;
    padding-top: 0.75rem;
    width: 100%;
  }

  :global(html.dark) .hero-meta {
    border-top-color: #44403c;
  }
}
</style>
