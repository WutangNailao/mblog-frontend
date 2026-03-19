<template>
  <div class="dark:bg-gray-7">
    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-2 dark:border-gray-6">
            <th class="py-2 pr-3">ID</th>
            <th class="py-2 pr-3">标签名称</th>
            <th class="py-2 pr-3">引用计数</th>
            <th class="py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(tag, index) in tags" :key="tag.id" class="border-b border-gray-1 dark:border-gray-7">
            <td class="py-2 pr-3">{{ tag.id }}</td>
            <td class="py-2 pr-3">
              <InputText v-model="tags[index].name" @update:modelValue="tags[index].edited = true" />
            </td>
            <td class="py-2 pr-3">{{ tag.count }}</td>
            <td class="py-2">
              <Button v-if="tag.count === 0" severity="danger" size="small" @click="removeTag(tag.id)">删除</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex items-center justify-center mt-2">
      <Button @click="saveTag" v-if="tags.length > 0">保存标签</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '@/types/tag'
import { useAppMessage } from '@/ui/useAppMessage'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

const tags = ref<Array<Tag>>([])
const message = useAppMessage()

onMounted(async () => {
  await reload()
})

const removeTag = async (id: number) => {
  const { error } = await useMyFetch('/api/tag/remove?id=' + id)
    .post()
    .json()
  if (error.value) return
  message.success('删除标签成功！')
  await reload()
}

const reload = async () => {
  const { data, error } = await useMyFetch('/api/tag/list').post().json()
  if (error.value) return
  const tagsList = data.value as Array<Tag>
  tagsList.map((ele: Tag) => {
    ele.name = ele.name.substring(1)
  })
  tags.value = tagsList
}

const saveTag = async () => {
  if (
    new Set(
      tags.value.map(({ name }) => {
        return name
      })
    ).size != tags.value.length
  ) {
    message.error('存在名称相同的标签!')
    return
  }
  const updatedTags = tags.value
    .filter((r) => r.edited)
    ?.map(({ id, name }) => {
      return { id, name: '#' + name }
    })
  if (updatedTags && updatedTags.length > 0) {
    const { error } = await useMyFetch('/api/tag/save')
      .post({
        list: updatedTags,
      })
      .json()
    if (error.value) return
    message.success('保存标签成功！')
    await reload()
  } else {
    message.success('保存标签成功！')
  }
}
</script>

<style scoped></style>
