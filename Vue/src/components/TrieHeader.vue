<script setup>
defineProps({ title: { type: String, default: '' } });
</script>

<template>
  <header class="trie-header">
    <div class="brand">
      <img src="/favicon.ico" width="32" height="32" alt="" />
      <span>Frezgi<small>frezgi.com</small></span>
    </div>
    <p :title="title">{{ title || 'Untitled trie' }}</p>
  </header>
</template>

<style scoped>
.trie-header {
  position: fixed;
  top: 12px;
  left: 32px;
  max-width: min(320px, calc(100vw - 100px));
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #ffffff1a;
  border-radius: 12px;
  background: #171c26f2;
  color: #f4f1ea;
  text-align: left;
  box-shadow: 0 4px 12px #0003;
  pointer-events: none;
  z-index: 80;
}
.brand { display: flex; align-items: center; gap: 9px; font-size: 18px; font-weight: 700; line-height: 1.15; }
img { border-radius: 7px; }
small { display: block; margin-top: 2px; color: #cbd5e1; font-size: 10px; font-weight: 400; letter-spacing: .03em; }
p { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 9px 0 0; font-size: 12px; color: #cbd5e1; }
</style>
