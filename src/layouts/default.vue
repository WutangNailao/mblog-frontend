<template>
  <div class="shell">
    <div class="wrapper" ref="wrapper" :style="{ maxWidth: isSmallerScreen ? '100%' : sessionStorage.INDEX_WIDTH }">
      <header class="masthead">
        <div>
          <div class="masthead-kicker">Personal Publishing</div>
          <div class="masthead-title">{{ sessionStorage.WEBSITE_TITLE }}</div>
        </div>
        <div class="masthead-copy">
          {{ userinfo.token ? '面向写作的个人文章工作台' : '一页一页阅读与记录' }}
        </div>
      </header>

      <div class="main fr gap-2">
        <div class="left">
          <LeftNav v-if="userinfo.token || !route.path.startsWith('/memo')" />
        </div>
        <div class="middle">
          <RouterView />
        </div>
        <div class="right" :style="{ visibility: userinfo.token ? 'visible' : 'hidden' }">
          <RightNav />
        </div>
      </div>
      <div class="left">
        <div class="page-tail">Built for drafting, editing, and archiving.</div>
      </div>
    </div>
    <div
      title="设置"
      class="bg-blue rd md:hidden sticky hover:bg-blue-5 left-2 bottom-2 z-99 w-10 items-center justify-center cursor-pointer flex"
    >
      <div class="i-carbon:settings text-3xl text-white" @click="showDrawer = !showDrawer"></div>
    </div>
  </div>

  <Drawer v-model:visible="showDrawer" position="right" :style="{ width: '60%' }">
    <div class="fc gap-2">
      <LeftNav />
      <RightNav v-if="userinfo.token" />
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import Drawer from 'primevue/drawer'

const preferredColor = usePreferredColorScheme()
const userinfo = useStorage('userinfo', { username: '', token: '' })
const themeModelVal = useLocalStorage('themeModel', { theme: 'light' })

themeChangeBus.emit({
  theme: themeModelVal.value.theme || preferredColor.value,
})

const showDrawer = ref(false)
const route = useRoute()
closeDrawerBus.on(() => {
  showDrawer.value = false
})
const wrapper = ref<HTMLElement>()
const isSmallerScreen = useMediaQuery('(max-width: 768px)')
const sessionStorage = useSessionStorage('config', {
  OPEN_REGISTER: false,
  OPEN_COMMENT: false,
  OPEN_LIKE: false,
  MEMO_MAX_LENGTH: 300,
  INDEX_WIDTH: '50rem',
  WEBSITE_TITLE: 'MBlog',
  USER_MODEL: 'SINGLE',
  CUSTOM_CSS: '',
  CUSTOM_JAVASCRIPT: '',
  THUMBNAIL_SIZE: '100,100',
  ANONYMOUS_COMMENT: false,
  COMMENT_APPROVED: true,
})
onBeforeMount(async () => {
  const { data, error } = await useMyFetch('/api/sysConfig/').get().json()
  if (error.value) {
    return
  }
  const configData = data.value as Array<{ key: string; value: string }>
  sessionStorage.value.USER_MODEL = configData.find((r) => r.key === 'USER_MODEL')?.value || 'SINGLE'
  sessionStorage.value.OPEN_REGISTER = configData.find((r) => r.key === 'OPEN_REGISTER')?.value === 'true' || false
  sessionStorage.value.OPEN_COMMENT = configData.find((r) => r.key === 'OPEN_COMMENT')?.value === 'true' || false
  sessionStorage.value.OPEN_LIKE = configData.find((r) => r.key === 'OPEN_LIKE')?.value === 'true' || false

  sessionStorage.value.WEBSITE_TITLE = configData.find((r) => r.key === 'WEBSITE_TITLE')?.value || 'MBlog'
  sessionStorage.value.MEMO_MAX_LENGTH = parseInt(configData.find((r) => r.key === 'MEMO_MAX_LENGTH')?.value as any)
  sessionStorage.value.INDEX_WIDTH = configData.find((r) => r.key === 'INDEX_WIDTH')?.value || '50rem'

  const title = useTitle()
  title.value = sessionStorage.value.WEBSITE_TITLE

  sessionStorage.value.USER_MODEL = configData.find((r) => r.key === 'USER_MODEL')?.value || 'SINGLE'
  sessionStorage.value.CUSTOM_JAVASCRIPT = configData.find((r) => r.key === 'CUSTOM_JAVASCRIPT')?.value || ''
  sessionStorage.value.CUSTOM_CSS = configData.find((r) => r.key === 'CUSTOM_CSS')?.value || ''
  sessionStorage.value.THUMBNAIL_SIZE = configData.find((r) => r.key === 'THUMBNAIL_SIZE')?.value || '100,100'
  sessionStorage.value.ANONYMOUS_COMMENT =
    configData.find((r) => r.key === 'ANONYMOUS_COMMENT')?.value === 'true' || false
  sessionStorage.value.COMMENT_APPROVED =
    configData.find((r) => r.key === 'COMMENT_APPROVED')?.value === 'true' || false

  var head = document.getElementsByTagName('head')[0]

  if (sessionStorage.value.CUSTOM_JAVASCRIPT) {
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = sessionStorage.value.CUSTOM_JAVASCRIPT
    head.appendChild(script)
  }
  if (sessionStorage.value.CUSTOM_CSS) {
    var externalStyle = document.createElement('style')
    externalStyle.type = 'text/css'
    externalStyle.innerHTML = sessionStorage.value.CUSTOM_CSS
    head.appendChild(externalStyle)
  }
})
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 1rem 3rem;
}

.shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(245, 245, 244, 0.9), transparent 35%),
    linear-gradient(180deg, #fafaf9 0%, #f5f5f4 30%, #fafaf9 100%);
}

.masthead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #d6d3d1;
}

.masthead-kicker,
.page-tail {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #78716c;
}

.masthead-title {
  margin-top: 0.45rem;
  color: #1c1917;
  font-size: clamp(2rem, 3vw, 2.8rem);
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.masthead-copy {
  max-width: 20rem;
  color: #57534e;
  line-height: 1.7;
}

.wrapper .left {
  width: 12rem;
}

.wrapper .middle {
  flex: 1 1 0%;
  min-width: 0;
}

.wrapper .right {
  width: 14rem;
}

.page-tail {
  padding-top: 0.5rem;
}

@media screen and (min-width: 1024px) {
  .wrapper {
    width: min(100%, 75rem);
  }
}

@media screen and (max-width: 639px) {
  .wrapper {
    padding: 1rem 0.75rem 2rem;
    gap: 1rem;
  }

  .masthead {
    flex-direction: column;
    align-items: flex-start;
  }

  .masthead-copy,
  .page-tail {
    max-width: none;
  }

  .wrapper .left,
  .wrapper .right {
    display: none;
  }
}

:global(html.dark) .shell {
  background:
    radial-gradient(circle at top left, rgba(63, 63, 70, 0.25), transparent 35%),
    linear-gradient(180deg, #09090b 0%, #18181b 30%, #09090b 100%);
}

:global(html.dark) .masthead {
  border-bottom-color: #44403c;
}

:global(html.dark) .masthead-kicker,
:global(html.dark) .masthead-copy,
:global(html.dark) .page-tail {
  color: #d6d3d1;
}

:global(html.dark) .masthead-title {
  color: #fafaf9;
}
</style>
