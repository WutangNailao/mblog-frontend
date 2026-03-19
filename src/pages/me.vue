<template>
  <div class="fc">
    <Tabs v-model:value="currentTab" class="w-full">
      <TabList class="rounded-t-md bg-white px-2 dark:bg-black">
        <Tab value="all">全部({{ state.total }})</Tab>
        <Tab value="liked">已点赞({{ state.liked }})</Tab>
        <Tab value="commented">已评论({{ state.commented }})</Tab>
        <Tab value="mentioned">
          <span class="relative inline-flex items-center">
            <span class="men" style="color: rgb(31, 34, 37)">被提到({{ state.mentioned }})</span>
            <Badge
              v-if="state.unreadMentioned > 0"
              :value="state.unreadMentioned"
              class="ml-1"
            />
          </span>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="all">
          <MeAll />
        </TabPanel>
        <TabPanel value="liked">
          <MeAll :liked="true" />
        </TabPanel>
        <TabPanel value="commented">
          <MeAll :commented="true" />
        </TabPanel>
        <TabPanel value="mentioned">
          <MeAll :commented="true" :mentioned="true" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import Badge from 'primevue/badge'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

const state = ref<MemoStatisticsDto>({
  total: 0,
  liked: 0,
  mentioned: 0,
  commented: 0,
  unreadMentioned: 0,
})
const currentTab = ref('all')

interface MemoStatisticsDto {
  total: number
  liked: number
  mentioned: number
  commented: number
  unreadMentioned: number
}
onMounted(async () => {
  await reload()
})

const reload = async () => {
  const { data, error } = await useMyFetch('/api/user/statistics').post().json()
  if (error.value) return
  state.value = data.value as any as MemoStatisticsDto
}

const changeTab = async (value: string | number) => {
  if (value === 'mentioned' && state.value.unreadMentioned > 0) {
    state.value.unreadMentioned = 0
  }
}

watch(currentTab, changeTab)
</script>

<style scoped>
::v-deep(.p-tablist-tab-list) {
  border-top-right-radius: 5px;
  border-top-left-radius: 5px;
  background-color: #fff;
  padding: 0 10px;
}

::v-deep(html.dark .p-tablist-tab-list) {
  background-color: black;
}
</style>
