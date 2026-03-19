<template>
  <div class="rd bg-white p-2 dark:bg-gray-7 text-4">
    <div class="mx-auto fc gap-4">
      <details class="config-panel" open>
        <summary>基础设置</summary>
        <div class="panel-body">
          <div class="form-row">
            <div class="form-label">网站标题</div>
            <InputText v-model="formValue.WEBSITE_TITLE" placeholder="输入网站标题" />
          </div>
          <div class="form-row">
            <div class="form-label">安全域名</div>
            <InputText v-model="formValue.CORS_DOMAIN_LIST" placeholder="输入安全域名" />
          </div>
          <div class="form-row">
            <div class="form-label">服务端域名</div>
            <InputText v-model="formValue.DOMAIN" placeholder="输入服务端域名" />
          </div>
          <div class="form-row">
            <div class="form-label">首页宽度</div>
            <InputText v-model="formValue.INDEX_WIDTH" placeholder="首页宽度,默认50REM" />
          </div>
          <div class="form-row">
            <div class="form-label">缩略图大小</div>
            <InputText v-model="formValue.THUMBNAIL_SIZE" placeholder="缩略图大小,默认100x100" />
          </div>
          <div class="form-row">
            <div class="form-label">单个记录长度</div>
            <div class="fr items-center gap-2">
              <InputText v-model="formValue.MEMO_MAX_LENGTH" placeholder="默认高度300,超出自动折叠" />
              <span>px</span>
            </div>
          </div>
        </div>
      </details>

      <details class="config-panel" open>
        <summary>功能设置</summary>
        <div class="panel-body">
          <div class="form-row form-row-start">
            <div class="form-label">用户模式</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.USER_MODEL" type="radio" value="SINGLE" />
                <span>单用户</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.USER_MODEL" type="radio" value="MULTIPLE" />
                <span>多用户</span>
              </label>
            </div>
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">开放注册</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.OPEN_REGISTER" type="radio" value="true" />
                <span>开放</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.OPEN_REGISTER" type="radio" value="false" />
                <span>关闭</span>
              </label>
            </div>
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">开放评论</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.OPEN_COMMENT" type="radio" value="true" />
                <span>开放</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.OPEN_COMMENT" type="radio" value="false" />
                <span>关闭</span>
              </label>
            </div>
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">开放点赞</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.OPEN_LIKE" type="radio" value="true" />
                <span>开放</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.OPEN_LIKE" type="radio" value="false" />
                <span>关闭</span>
              </label>
            </div>
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">开放匿名评论</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.ANONYMOUS_COMMENT" type="radio" value="true" />
                <span>开放</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.ANONYMOUS_COMMENT" type="radio" value="false" />
                <span>关闭</span>
              </label>
            </div>
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">匿名评论是否审核</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.COMMENT_APPROVED" type="radio" value="true" />
                <span>需要</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.COMMENT_APPROVED" type="radio" value="false" />
                <span>不需要</span>
              </label>
            </div>
          </div>
        </div>
      </details>

      <details class="config-panel">
        <summary>云存储设置</summary>
        <div class="panel-body">
          <div class="form-row form-row-start">
            <div class="form-label">存储设置</div>
            <div class="radio-group">
              <label class="radio-pill">
                <input v-model="formValue.STORAGE_TYPE" type="radio" value="LOCAL" @change="changeStorage('LOCAL')" />
                <span>本地</span>
              </label>
              <label class="radio-pill">
                <input v-model="formValue.STORAGE_TYPE" type="radio" value="QINIU" @change="changeStorage('QINIU')" />
                <span>七牛云</span>
              </label>
              <label class="radio-pill">
                <input
                  v-model="formValue.STORAGE_TYPE"
                  type="radio"
                  value="AWSS3"
                  @change="changeStorage('AWSS3')"
                />
                <span>AWS S3</span>
              </label>
            </div>
          </div>

          <template v-if="formValue.STORAGE_TYPE !== 'LOCAL'">
            <div class="form-row">
              <div class="form-label">AccessKey</div>
              <InputText v-model="oss.accessKey" placeholder="AccessKey" />
            </div>
            <div class="form-row">
              <div class="form-label">SecretKey</div>
              <InputText v-model="oss.secretKey" placeholder="SecretKey" />
            </div>
            <div class="form-row">
              <div class="form-label">Bucket</div>
              <InputText v-model="oss.bucket" placeholder="Bucket" />
            </div>
            <div class="form-row">
              <div class="form-label">Region</div>
              <AppSelect
                v-if="formValue.STORAGE_TYPE === 'QINIU'"
                v-model="oss.region"
                :options="qiniuRegions"
                option-label="label"
                option-value="value"
                class="w-full max-w-64"
              />
              <InputText v-else v-model="oss.region" placeholder="Region" />
            </div>
            <div class="form-row">
              <div class="form-label">CDN域名</div>
              <InputText v-model="oss.domain" placeholder="CDN域名,不提供默认取cdn提供方提供的二级域名" />
            </div>
            <div class="form-row">
              <div class="form-label">文件夹前缀</div>
              <InputText v-model="oss.prefix" placeholder="文件夹前缀" />
            </div>
            <div class="form-row" v-if="formValue.STORAGE_TYPE !== 'AWSS3'">
              <div class="form-label">图片后缀</div>
              <InputText v-model="oss.suffix" placeholder="图片后缀" />
            </div>
          </template>
        </div>
      </details>

      <details class="config-panel">
        <summary>外观设置</summary>
        <div class="panel-body">
          <div class="form-row form-row-start">
            <div class="form-label">自定义CSS</div>
            <Textarea v-model="formValue.CUSTOM_CSS" placeholder="输入自定义CSS" :rows="5" auto-resize />
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">自定义Script</div>
            <Textarea
              v-model="formValue.CUSTOM_JAVASCRIPT"
              placeholder="输入自定义Script"
              :rows="5"
              auto-resize
            />
          </div>
        </div>
      </details>

      <details class="config-panel">
        <summary>Webhook设置</summary>
        <div class="panel-body">
          <div class="form-row form-row-start">
            <div class="form-label">推送到官方广场</div>
            <div class="fc gap-2 items-start">
              <div class="radio-group">
                <label class="radio-pill">
                  <input v-model="formValue.PUSH_OFFICIAL_SQUARE" type="radio" value="true" />
                  <span>是</span>
                </label>
                <label class="radio-pill">
                  <input v-model="formValue.PUSH_OFFICIAL_SQUARE" type="radio" value="false" />
                  <span>否</span>
                </label>
              </div>
              <a href="https://square.mblog.club" target="_blank">square.mblog.club</a>
            </div>
          </div>
          <div class="form-row">
            <div class="form-label">Webhook地址:</div>
            <InputText v-model="formValue.WEB_HOOK_URL" placeholder="发送所有人可见的博文时自动通知到这个地址上" />
          </div>
          <div class="form-row">
            <div class="form-label">Webhook Token:</div>
            <InputText
              v-model="formValue.WEB_HOOK_TOKEN"
              readonly
              placeholder="可空,安全起见,建议填写,发送webhook时会在请求头里的`token`字段里带上"
            />
          </div>
          <div class="form-row form-row-start">
            <div class="form-label">例子</div>
            <code
              id="htmlViewer"
              class="rd"
              style="
                font-family: Verdana, Geneva, Tahoma, sans-serif;
                color: rgb(168, 161, 159);
                font-weight: 400;
                background-color: rgb(27, 25, 24);
                background: rgb(27, 25, 24);
                display: block;
                padding: 0.5em;
              "
              >curl -L &#x27;http://WEBHOOK_URL&#x27; -H &#x27;token: Webhook Token&#x27; -H &#x27;Content-Type:
              application/json&#x27; -d &#x27;{
              <span style="color: rgb(123, 151, 38); font-weight: 400">&quot;content:&quot;</span>
              内容<span style="color: rgb(123, 151, 38); font-weight: 400">&quot;, &quot;tags</span>
              <span style="color: rgb(123, 151, 38); font-weight: 400">&quot;:&quot;</span>标签
              <span style="color: rgb(123, 151, 38); font-weight: 400">&quot;,&quot;authorName</span>
              <span style="color: rgb(123, 151, 38); font-weight: 400">&quot;:&quot;</span>发送者名称
              <span style="color: rgb(123, 151, 38); font-weight: 400">&quot;,&quot;resources</span>
              <span style="color: rgb(123, 151, 38); font-weight: 400"></span>[资源列表]
              <span style="color: rgb(123, 151, 38); font-weight: 400">&quot;, &quot;created</span
              ><span style="color: rgb(123, 151, 38); font-weight: 400">&quot;:&quot;</span>发文时间<span
                style="color: rgb(123, 151, 38); font-weight: 400"
                >&quot; }&#x27;</span
              ></code
            >
          </div>
        </div>
      </details>

      <div class="fr justify-end pt-4">
        <Button type="button" @click="saveConfig">保存配置</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppMessage } from '@/ui/useAppMessage'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import type { SysConfig, OssStorage } from '@/types/config'

const formValue: Partial<SysConfig> = reactive({})

let oss = ref<Partial<OssStorage>>({})

const changeStorage = (val: string) => {
  oss.value = {}
  if (val === 'QINIU') {
    oss.value = JSON.parse(formValue.QINIU_PARAM as string)
  } else if (val === 'AWSS3') {
    oss.value = JSON.parse(formValue.AWSS3_PARAM as string)
  }
  oss.value.accessKey = oss.value.accessKey || ''
  oss.value.secretKey = oss.value.secretKey || ''
  oss.value.bucket = oss.value.bucket || ''
  oss.value.domain = oss.value.domain || ''
  oss.value.prefix = oss.value.prefix || ''
  oss.value.suffix = oss.value.suffix || ''
  oss.value.region = oss.value.region || ''
}

const qiniuRegions = [
  {
    label: '华东-浙江',
    value: 'huadong',
  },
  {
    label: '华东-浙江2',
    value: 'huadongZheJiang2',
  },
  {
    label: '华北-河北',
    value: 'huabei',
  },
  {
    label: '华南-广东',
    value: 'huanan',
  },
  {
    label: '北美-洛杉矶',
    value: 'beimei',
  },
  {
    label: '亚太-新加坡（原东南亚）',
    value: 'xinjiapo',
  },
]
const message = useAppMessage()

const reload = async () => {
  const { data, error } = await useMyFetch('/api/sysConfig/get').get().json()
  if (error.value) return
  const config = data.value as Array<{ key: string; value: string }>
  config.forEach(({ key, value }) => {
    formValue[key] = value
  })
  changeStorage(formValue.STORAGE_TYPE!!)
}

const saveConfig = async () => {
  const items = []

  items.push({
    key: 'STORAGE_TYPE',
    value: formValue.STORAGE_TYPE,
  })
  items.push({
    key: 'CORS_DOMAIN_LIST',
    value: formValue.CORS_DOMAIN_LIST,
  })
  items.push({
    key: 'DOMAIN',
    value: formValue.DOMAIN,
  })
  items.push({
    key: 'WEBSITE_TITLE',
    value: formValue.WEBSITE_TITLE,
  })

  items.push({
    key: 'OPEN_REGISTER',
    value: formValue.OPEN_REGISTER,
  })
  items.push({
    key: 'OPEN_COMMENT',
    value: formValue.OPEN_COMMENT,
  })
  items.push({
    key: 'OPEN_LIKE',
    value: formValue.OPEN_LIKE,
  })

  items.push({
    key: 'USER_MODEL',
    value: formValue.USER_MODEL,
  })
  items.push({
    key: 'MEMO_MAX_LENGTH',
    value: formValue.MEMO_MAX_LENGTH,
  })
  items.push({
    key: 'INDEX_WIDTH',
    value: formValue.INDEX_WIDTH,
  })
  if (formValue.STORAGE_TYPE !== 'LOCAL') {
    items.push({
      key: `${formValue.STORAGE_TYPE}_PARAM`,
      value: JSON.stringify(oss.value),
    })
  }
  items.push({
    key: 'CUSTOM_CSS',
    value: formValue.CUSTOM_CSS,
  })
  items.push({
    key: 'CUSTOM_JAVASCRIPT',
    value: formValue.CUSTOM_JAVASCRIPT,
  })
  items.push({
    key: 'THUMBNAIL_SIZE',
    value: formValue.THUMBNAIL_SIZE,
  })
  items.push({
    key: 'ANONYMOUS_COMMENT',
    value: formValue.ANONYMOUS_COMMENT,
  })
  items.push({
    key: 'COMMENT_APPROVED',
    value: formValue.COMMENT_APPROVED,
  })
  items.push({
    key: 'WEB_HOOK_URL',
    value: formValue.WEB_HOOK_URL,
  })
  items.push({
    key: 'PUSH_OFFICIAL_SQUARE',
    value: formValue.PUSH_OFFICIAL_SQUARE,
  })

  const { error } = await useMyFetch('/api/sysConfig/save').post({ items }).json()
  if (!error.value) {
    message.success('保存系统配置成功!')
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }
}

onMounted(async () => {
  await reload()
})
</script>

<style scoped>
.config-panel {
  border: 1px solid rgb(231 229 228);
  border-radius: 0.75rem;
  overflow: hidden;
}

.config-panel > summary {
  cursor: pointer;
  padding: 0.875rem 1rem;
  font-weight: 600;
  color: rgb(28 25 23);
  background: rgb(250 250 249);
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: center;
}

.form-row-start {
  align-items: flex-start;
}

.form-label {
  color: rgb(87 83 78);
  font-size: 0.875rem;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.radio-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}


:global(html.dark) .config-panel {
  border-color: rgb(63 63 70);
}

:global(html.dark) .config-panel > summary {
  color: rgb(250 250 249);
  background: rgb(39 39 42);
}

:global(html.dark) .form-label {
  color: rgb(214 211 209);
}

@media screen and (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
<route lang="yaml">
meta:
  layout: manage
</route>
