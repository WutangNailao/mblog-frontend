<template>
  <div class="aside">
    <section class="aside-section">
      <div class="aside-label">Profile</div>
      <Mine />
    </section>
    <section class="aside-section">
      <div class="aside-label">Activity</div>
      <Statistics />
    </section>
    <section class="aside-section">
      <div class="aside-label">Tags</div>
      <Top10Tag />
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.aside {
  position: sticky;
  top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.aside-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.aside-label {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #78716c;
}

:global(html.dark) .aside-label {
  color: #a8a29e;
}
</style>
