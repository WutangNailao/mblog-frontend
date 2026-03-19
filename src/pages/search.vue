<template>
  <div class="rd bg-white dark:bg-gray-7 p-2">
    <div class="flex flex-col gap-4 p-2">
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <span class="font-medium">标签</span>
        <AppSelect
          v-model="state.tag"
          :options="tags"
          option-label="name"
          option-value="name"
          placeholder="选择标签"
          clearable
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <span class="font-medium">可见性</span>
        <AppSelect
          v-model="state.visibility"
          :options="getVisbilitys()"
          option-label="label"
          option-value="value"
          placeholder="选择可见性"
          clearable
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200" v-if="userinfo.role === 'ADMIN'">
        <span class="font-medium">用户</span>
        <AppSelect
          v-model="state.userId"
          :options="users"
          option-label="displayName"
          option-value="id"
          placeholder="请选择用户"
          clearable
        />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <span class="font-medium">内容</span>
        <InputText v-model="state.search" type="text" placeholder="支持全文搜索" />
      </label>
      <label class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <span class="font-medium">时间</span>
        <DatePicker v-model="searchRange" selection-mode="range" date-format="yy-mm-dd" :manual-input="false" />
      </label>

      <div class="fr justify-center">
        <Button severity="primary" class="px-6" size="small" @click="search">搜索</Button>
      </div>
    </div>
  </div>

  <div class="rd" v-if="state.totalPage >= 1">
    <div class="fc gap-1">
      <div class="fr justify-end my-2 gap-2 items-center">
        <div class="text-gray-5 text-xs">总共{{ state.totalRecord }}条</div>
        <Paginator
          v-if="state.totalPage > 1"
          :first="Math.max(state.page - 1, 0)"
          :rows="1"
          :total-records="Math.max(state.totalPage, 1)"
          template="PrevPageLink CurrentPageReport NextPageLink"
          current-page-report-template="{currentPage} / {totalPages}"
          @page="onPage"
        />
      </div>
      <memo
        :memo="item"
        v-for="item in state.memos"
        :key="item.id"
        :id="item.id"
        :max-height="sessionStorage.MEMO_MAX_LENGTH"
      />
      <div class="fr justify-end my-2 gap-2 items-center">
        <div class="text-gray-5 text-xs">总共{{ state.totalRecord }}条</div>
        <Paginator
          v-if="state.totalPage > 1"
          :first="Math.max(state.page - 1, 0)"
          :rows="1"
          :total-records="Math.max(state.totalPage, 1)"
          template="PrevPageLink CurrentPageReport NextPageLink"
          current-page-report-template="{currentPage} / {totalPages}"
          @page="onPage"
        />
      </div>
    </div>
  </div>
  <div class="rd p-4 flex justify-center text-gray-5" v-else>暂无记录</div>
</template>

<script setup lang="ts">
import { type MemoDTO } from '@/types/memo'
import type { Tag } from '@/types/tag'
import type { User } from '@/types/user'
import dayjs from 'dayjs'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'

const userinfo = useStorage('userinfo', { token: '', role: '' })
const tags = ref<Array<Tag>>([])
const users = ref<Array<User>>([])
const sessionStorage = useSessionStorage('config', {
  MEMO_MAX_LENGTH: 300,
})
const state = reactive({
  tag: '',
  search: '',
  visibility: '',
  range: [dayjs().subtract(3, 'y').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')] as [
    string,
    string
  ],
  page: 1,
  size: 20,
  totalRecord: 0,
  totalPage: 0,
  userId: undefined,
  memos: Array<MemoDTO>(),
})

const searchRange = computed({
  get: () => [dayjs(state.range[0]).toDate(), dayjs(state.range[1]).toDate()],
  set: (value: Date[] | null) => {
    const nextValue = Array.isArray(value) ? value : []
    state.range = [
      nextValue[0] ? dayjs(nextValue[0]).format('YYYY-MM-DD') : dayjs().subtract(3, 'y').format('YYYY-MM-DD'),
      nextValue[1] ? dayjs(nextValue[1]).format('YYYY-MM-DD') : dayjs().endOf('month').format('YYYY-MM-DD'),
    ]
  },
})

onMounted(async () => {
  const { data, error } = await useMyFetch('/api/tag/list').post().json()
  if (error.value) return
  tags.value = data.value

  if (userinfo.value.role === 'ADMIN') {
    await loadUserList()
  }
})

const loadUserList = async () => {
  const { data, error } = await useMyFetch('/api/user/list').post().json()
  if (error.value) return
  users.value = data.value
}

const search = async () => {
  const { data, error } = await useMyFetch('/api/memo/list')
    .post({
      tag: state.tag || undefined,
      visibility: state.visibility || undefined,
      begin: dayjs(state.range[0]).toDate() || dayjs().subtract(3, 'y').toDate(),
      end: dayjs(state.range[1]).toDate() || dayjs().endOf('month').toDate(),
      page: state.page,
      size: state.size,
      search: state.search || undefined,
      userId: state.userId || undefined,
    })
    .json()
  if (error.value) return
  state.totalPage = data.value.totalPage
  state.totalRecord = data.value.total
  state.memos = data.value.items
  state.memos.forEach((memo) => {
    memo.resources.forEach((item) => {
      if (item.storageType === 'LOCAL' && item.url.startsWith('/')) {
        item.url = import.meta.env.VITE_BASE_URL + item.url
      }
    })
  })
}

const onPage = (event: { page: number }) => {
  state.page = event.page + 1
  search()
}
</script>

<style scoped></style>
