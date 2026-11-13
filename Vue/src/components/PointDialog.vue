<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { DEFAULT_RESOLUTION_TEXT, NODE_TYPES, RESOLUTION_HELP } from '../constants.js';

// Dialog for adding a point to a box, or editing the text of a box
const props = defineProps({
  // "add" a new point, or "edit" an existing box
  mode: { type: String, required: true },
  // Type of the point being added or edited: resolution, pro, con or exp
  type: { type: String, required: true },
  // Text of the box that a new point answers
  parentText: { type: String, default: '' },
  initialText: { type: String, default: '' },
});

const emit = defineEmits(['save', 'cancel']);

const text = ref(props.initialText);
const error = ref('');
const input = ref(null);

const isResolution = computed(() => props.mode === 'edit' && props.type === 'resolution');
const info = computed(() => NODE_TYPES[props.type] || {});

const label = computed(() => {
  if (isResolution.value) {
    return 'Your resolution';
  }
  if (props.mode === 'edit') {
    return 'Edit text';
  }
  return `${info.value.name}: "${props.parentText}"`;
});

const help = computed(() => {
  if (isResolution.value) {
    return RESOLUTION_HELP;
  }
  return props.mode === 'add' ? info.value.guidance : '';
});

const placeholder = computed(() => {
  if (isResolution.value) {
    return 'Type your resolution here...';
  }
  if (props.mode === 'add') {
    return info.value.placeholder || 'Type your point here...';
  }
  return 'Type the new text here...';
});

function showError(message) {
  error.value = message;
  nextTick(() => input.value && input.value.focus());
}

function submit() {
  const value = text.value.trim();
  if (!value) {
    showError(props.mode === 'edit' ? 'The text cannot be empty.' : 'Please write your point before you add it.');
  } else if (isResolution.value && value === DEFAULT_RESOLUTION_TEXT) {
    showError('Write your own statement to examine.');
  } else {
    emit('save', value);
  }
}

onMounted(() => {
  input.value.focus();
  if (props.mode === 'edit') {
    input.value.select();
  }
});
</script>

<template>
  <div class="popup-backdrop" @mousedown.self="emit('cancel')">
    <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-label">
      <label>
        <span id="popup-label">{{ label }}</span>
        <input
          ref="input"
          v-model="text"
          type="text"
          :placeholder="placeholder"
          :aria-invalid="error ? 'true' : 'false'"
          aria-describedby="popup-help popup-error"
          @input="error = ''"
          @keydown.enter="submit"
        />
      </label>
      <p v-if="help" id="popup-help" class="popup-help">{{ help }}</p>
      <p id="popup-error" class="popup-error" aria-live="polite">{{ error }}</p>
      <div class="popup-buttons">
        <button type="button" class="dialog-btn primary" @click="submit">{{ mode === 'edit' ? 'Save' : 'Add' }}</button>
        <button type="button" class="dialog-btn secondary" @click="emit('cancel')">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-backdrop {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

.popup {
  width: 100%;
  max-width: 420px;
  min-width: 0;
  max-height: 100%;
  overflow-y: auto;
  overflow-wrap: anywhere;
  box-sizing: border-box;
  padding: 20px 24px;
  border-radius: 12px;
  background: white;
  color: #1f2937;
  text-align: left;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

input {
  width: 100%;
  box-sizing: border-box;
  margin: 15px 0 10px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

input[aria-invalid="true"] {
  border-color: #b91c1c;
}

.popup-help {
  margin: 0 0 6px;
  color: #4b5563;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.45;
}

.popup-error {
  min-height: 1.2em;
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
  font-weight: normal;
}

.popup-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 25px 0 5px;
}
</style>
