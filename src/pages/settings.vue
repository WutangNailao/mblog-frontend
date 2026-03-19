<template>
  <div class="p-2 bg-white rd dark:bg-gray-7" style="min-height: 600px">
    <Tabs v-model:value="currentTab" class="w-full">
      <TabList class="mb-4 flex flex-wrap gap-2">
        <Tab v-if="userinfo.role === 'ADMIN'" value="sys">系统设置</Tab>
        <Tab value="user">用户设置</Tab>
        <Tab value="tag">标签管理</Tab>
        <Tab value="dev">开发者</Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-if="userinfo.role === 'ADMIN'" value="sys">
          <SysConfig />
        </TabPanel>
        <TabPanel value="user">
          <UserConfig />
        </TabPanel>
        <TabPanel value="tag">
          <TagManage />
        </TabPanel>
        <TabPanel value="dev">
          <DevConfig />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanel from 'primevue/tabpanel'
import TabPanels from 'primevue/tabpanels'
import Tabs from 'primevue/tabs'

const userinfo = useStorage('userinfo', { username: '', token: '', role: '' })
const currentTab = ref<'sys' | 'user' | 'tag' | 'dev'>(userinfo.value.role === 'ADMIN' ? 'sys' : 'user')
</script>
