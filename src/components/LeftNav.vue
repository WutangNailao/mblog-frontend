<template>
  <div class="parent">
    <div class="brand">
      <div class="brand-kicker">Notebook</div>
      <div class="brand-title">{{ siteTitle }}</div>
      <div class="brand-copy">{{ userinfo.token ? '写作 / 归档 / 发布' : '阅读 / 浏览 / 发现' }}</div>
    </div>

    <div
      class="item"
      :class="{ selected: route.path === '/' }"
      @click="navTo('/')"
      v-if="sessionStorage.USER_MODEL === 'MULTIPLE'"
    >
      <div class="i-carbon:ibm-watson-tone-analyzer"></div>
      <div>广场</div>
    </div>
    <div
      class="item"
      :class="{ selected: route.path === '/' }"
      @click="navTo('/')"
      v-if="sessionStorage.USER_MODEL === 'SINGLE'"
    >
      <div class="i-carbon:home"></div>
      <div>首页</div>
    </div>
    <div
      class="item"
      :class="{ selected: route.path === '/me' }"
      @click="navTo('/me')"
      v-if="userinfo.token && sessionStorage.USER_MODEL === 'MULTIPLE'"
    >
      <div class="i-carbon:person"></div>
      <div class="">我的</div>
    </div>
    <div class="item" :class="{ selected: route.path === '/search' }" @click="navTo('/search')" v-if="userinfo.token">
      <div class="i-carbon:search"></div>
      <div>搜索</div>
    </div>
    <div
      class="item"
      :class="{ selected: route.path === '/settings' }"
      @click="navTo('/settings')"
      v-if="userinfo.token"
    >
      <div class="i-carbon:settings"></div>
      <div>设置</div>
    </div>

    <div class="item" @click="logout" v-if="userinfo.token">
      <div class="i-carbon:logout"></div>
      <div>登出</div>
    </div>
    <div class="item" :class="{ selected: route.path === '/login' }" @click="navTo('/login')" v-if="!userinfo.token">
      <div class="i-carbon:login"></div>
      <div>登录</div>
    </div>
    <div class="meta-label">Appearance</div>
    <div class="fr gap-2 items-center justify-start tool-row">
      <div
        class="i-carbon:moon hover:text-gray-7 cursor-pointer"
        @click="toggleTheme('dark')"
        v-if="themeModelVal.theme === 'light'"
      ></div>
      <div
        class="i-carbon:sun text-yellow-5 text-lg hover:text-yellow-4 cursor-pointer"
        @click="toggleTheme('light')"
        v-if="themeModelVal.theme === 'dark'"
      ></div>
      <a
        class="i-carbon:logo-github text-lg hover:text-gray-7 dark:text-yellow-5 dark:hover:text-yellow-4"
        target="_blank"
        href="https://github.com/kingwrcy/mblog-backend"
      ></a>
    </div>
    <div class="version" v-if="version">
      <a
        :href="'https://github.com/kingwrcy/mblog-backend/releases/tag/v' + computedVersion"
        target="_blank"
        class="dark:text-white no-underline"
      >
        v{{ computedVersion }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const themeModelVal = useLocalStorage('themeModel', { theme: 'light' })
const version = import.meta.env.VITE_MBLOG_VERSION
const title = useTitle()
const siteTitle = computed(() => title.value || 'MBlog')
const computedVersion = computed(() => {
  if (version) {
    if (version.startsWith('v')) {
      return version.substring(1)
    } else {
      return version
    }
  }
  return ''
})
const sessionStorage = useSessionStorage('config', {
  USER_MODEL: 'SINGLE',
})
const router = useRouter()
const route = useRoute()
const navTo = (path: string) => {
  router.push(path)
  closeDrawerBus.emit()
}
const userinfo = useStorage('userinfo', { username: '', token: '' })
const toggleTheme = (theme: string) => {
  themeChangeBus.emit({ theme })
  themeModelVal.value.theme = theme
}
const logout = () => {
  userinfo.value = {} as any
  window.location.href = '/'
}
</script>

<style scoped>
.parent {
  display: flex;
  position: sticky;
  top: 1.5rem;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem 0.75rem;
  border-right: 1px solid #d6d3d1;
}

.brand {
  margin-bottom: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e7e5e4;
}

.brand-kicker,
.meta-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #78716c;
}

.brand-title {
  margin-top: 0.35rem;
  color: #1c1917;
  font-size: 1.35rem;
  line-height: 1.1;
  font-weight: 700;
}

.brand-copy {
  margin-top: 0.35rem;
  color: #57534e;
  font-size: 0.85rem;
  line-height: 1.6;
}

.parent .item {
  display: flex;
  list-style: none;
  cursor: pointer;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.6rem;
  padding: 0.45rem 0.25rem;
  color: #44403c;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.parent .item:hover {
  color: #1c1917;
}

.parent .item::before {
  content: '';
  width: 1.25rem;
  height: 1px;
  background: transparent;
}

.parent .item.selected {
  background-color: transparent;
  color: #1c1917;
  font-weight: 600;
}

.parent .item.selected::before {
  background: #1c1917;
}

.tool-row {
  padding-top: 0.15rem;
}

.version {
  padding-top: 0.5rem;
  border-top: 1px solid #e7e5e4;
  color: #78716c;
  font-size: 0.75rem;
}

:global(html.dark) .parent .item {
  color: #d6d3d1;
}

:global(html.dark) .parent {
  border-right-color: #44403c;
}

:global(html.dark) .brand {
  border-bottom-color: #44403c;
}

:global(html.dark) .brand-kicker,
:global(html.dark) .meta-label,
:global(html.dark) .brand-copy,
:global(html.dark) .version {
  color: #a8a29e;
}

:global(html.dark) .brand-title,
:global(html.dark) .parent .item:hover,
:global(html.dark) .parent .item.selected {
  color: #fafaf9;
}

:global(html.dark) .parent .item.selected::before {
  background: #fafaf9;
}

:global(html.dark) .version {
  border-top-color: #44403c;
}

@media screen and (max-width: 639px) {
  .parent {
    top: 0;
    border-right: 0;
    padding: 0;
  }

  .brand,
  .meta-label,
  .version {
    display: none;
  }
}
</style>
