<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useColorScheme } from '../composables/useColorScheme.js';

const emit = defineEmits(['close']);
const colors = useColorScheme();

const PAGE_COUNT = 3;
const page = ref(0);
const primaryButton = ref(null);

// Keep keyboard focus on the main button, also when the page changes
function focusPrimaryButton() {
  nextTick(() => primaryButton.value && primaryButton.value.focus());
}

function next() {
  if (page.value < PAGE_COUNT - 1) {
    page.value++;
    focusPrimaryButton();
  } else {
    emit('close');
  }
}

onMounted(focusPrimaryButton);
</script>

<template>
  <div class="guide-backdrop" @click.self="emit('close')">
    <div class="guide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <h2 id="guide-title">Welcome to Frezgi</h2>
      <p class="guide-progress">Page {{ page + 1 }} of {{ PAGE_COUNT }}</p>

      <section v-if="page === 0">
        <p class="guide-intro">
          Frezgi is an argument-mapping tool. You write one statement, called the
          resolution, and build a map of the reasons for it, the reasons against it,
          and the questions it raises. The map helps you decide what you think, and why.
        </p>

        <h3>The parts of a map</h3>
        <ul class="guide-parts">
          <li>
            <span class="swatch" :style="{ backgroundColor: colors.nodeColors.resolution }"></span>
            <span><strong>Resolution</strong>: the statement you are examining. It should be one clear claim that people could agree or disagree with.</span>
          </li>
          <li>
            <span class="swatch" :style="{ backgroundColor: colors.nodeColors.pro }"></span>
            <span><strong>Supporting</strong> 👍: a reason why the point it is linked to is true.</span>
          </li>
          <li>
            <span class="swatch" :style="{ backgroundColor: colors.nodeColors.con }"></span>
            <span><strong>Opposing</strong> 👎: a reason why the point it is linked to may be false. Opposing points stop you from seeing only one side.</span>
          </li>
          <li>
            <span class="swatch" :style="{ backgroundColor: colors.nodeColors.exp }"></span>
            <span><strong>Exploring</strong> ✋: a question or something to check. It marks what you do not know yet.</span>
          </li>
        </ul>
      </section>

      <section v-if="page === 1">
        <h3>How it differs from a comment thread</h3>
        <table class="guide-compare">
          <thead>
            <tr><th scope="col">In a comment thread</th><th scope="col">In an argument map</th></tr>
          </thead>
          <tbody>
            <tr><td>Replies are listed in the order they were posted.</td><td>Each point is linked to the exact point it answers.</td></tr>
            <tr><td>One post often mixes several ideas.</td><td>Each box holds one claim, so it can be judged on its own.</td></tr>
            <tr><td>People reply to people.</td><td>You respond to ideas. Any reason can be supported, opposed or questioned.</td></tr>
            <tr><td>The latest or loudest post gets the attention.</td><td>The shape of the map shows which reasons are supported and which are challenged.</td></tr>
          </tbody>
        </table>
      </section>

      <section v-if="page === 2">
        <h3>How it builds critical thinking</h3>
        <ul>
          <li>You separate a claim from the reasons behind it.</li>
          <li>You state the strongest objections, including objections to your own view.</li>
          <li>You see which reasons have no support and which have not been challenged.</li>
          <li>You turn doubts into questions that you can check.</li>
        </ul>

        <h3>Useful to know</h3>
        <ul>
          <li>Double-click a box to edit its text.</li>
          <li>Drag the boxes to arrange your map. To remove a box, drag it onto the box it came from. Its sub-points are removed with it.</li>
          <li>Move your pointer to the left edge of the screen to change the colours.</li>
          <li>Choose <strong>?</strong> at the top right to see this guide again.</li>
        </ul>

        <p class="guide-note">Note: your map is not saved when you close or reload the page.</p>
      </section>

      <div class="guide-nav">
        <button v-if="page > 0" type="button" class="dialog-btn secondary" @click="page--">Back</button>
        <button v-else type="button" class="guide-skip" @click="emit('close')">Skip</button>
        <button ref="primaryButton" type="button" class="dialog-btn primary" @click="next">
          {{ page < PAGE_COUNT - 1 ? 'Next' : 'Start mapping' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 200;
}

.guide {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  box-sizing: border-box;
  padding: 24px 28px;
  overflow-y: auto;
  border-radius: 12px;
  background: white;
  color: #1f2937;
  text-align: left;
  line-height: 1.5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

h3 {
  margin: 18px 0 6px;
  font-size: 16px;
}

section h3:first-child {
  margin-top: 0;
}

ul {
  margin: 0;
  padding-left: 22px;
}

li {
  margin-bottom: 4px;
}

.guide-progress {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 13px;
}

.guide-intro {
  margin: 0;
}

.guide-parts {
  list-style: none;
  padding-left: 0;
}

.guide-parts li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.guide-parts .swatch {
  margin-top: 4px;
  border-color: rgba(0, 0, 0, 0.25);
}

.guide-compare {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.4;
}

.guide-compare th,
.guide-compare td {
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: top;
}

.guide-compare th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.guide-compare td:last-child {
  background-color: #eff6ff;
}

.guide-note {
  margin: 16px 0;
  font-size: 14px;
  color: #6b7280;
}

/* Kept in view when a page is taller than the screen */
.guide-nav {
  position: sticky;
  bottom: -24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px -4px -8px;
  padding: 8px 4px;
  background: white;
}

.guide-nav .primary {
  margin-left: auto;
}

.guide-skip {
  margin: 0;
  padding: 8px 4px;
  border: none;
  background: none;
  color: #4b5563;
  font-size: 15px;
  text-decoration: underline;
  cursor: pointer;
}

/* Tighter guide on phones, so that each page needs little or no scrolling */
@media (max-width: 480px) {
  .guide {
    padding: 16px 18px;
    font-size: 15px;
    line-height: 1.4;
  }

  h2 {
    font-size: 19px;
  }

  h3 {
    margin-top: 12px;
  }

  .guide-compare {
    font-size: 13px;
  }

  .guide-compare th,
  .guide-compare td {
    padding: 4px 6px;
  }

  .guide-nav {
    bottom: -16px;
  }
}
</style>
