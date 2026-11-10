<script setup>
// Step-by-step tips for a new user's first map
defineProps({
  // "challenge": ask the user to test their first reason; "done": praise
  step: { type: String, required: true },
});

defineEmits(['finish']);
</script>

<template>
  <div class="coach" role="status">
    <template v-if="step === 'challenge'">
      <p class="coach-title">Next step: test your reason</p>
      <p class="coach-text">
        Hover over your reason and choose 👎 to add the strongest objection to it.
        In an argument map, any reason can be supported, opposed or questioned, not only the resolution.
      </p>
    </template>
    <template v-else>
      <p class="coach-title">Well done</p>
      <p class="coach-text">
        You have built your first argument map. Keep adding reasons, objections and questions
        until you can judge the resolution fairly.
      </p>
    </template>
    <button type="button" class="coach-btn" @click="$emit('finish')">
      {{ step === 'challenge' ? 'Skip tips' : 'Got it' }}
    </button>
  </div>
</template>

<style scoped>
/* Bottom left, away from the main box */
.coach {
  position: fixed;
  left: 16px;
  bottom: 12px;
  width: min(420px, calc(100vw - 32px));
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid rgba(37, 99, 235, 0.6);
  border-radius: 10px;
  background-color: #171c26;
  color: #e5e7eb;
  text-align: left;
  font-size: 14px;
  line-height: 1.45;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  z-index: 99;
}

/* On phones, sit above the collapsed Key instead of covering it */
@media (max-width: 599px) {
  .coach {
    bottom: 56px;
  }
}

.coach-title {
  margin: 0 0 4px;
  color: white;
  font-weight: 700;
}

.coach-text {
  margin: 0;
}

.coach-btn {
  display: block;
  margin: 8px 0 0 auto;
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: none;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.coach-btn:hover,
.coach-btn:focus-visible {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
