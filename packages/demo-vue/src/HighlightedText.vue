<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  text: string;
  indexes: number[];
}>();

const displayName = computed(() => {
  return props.text
    .split("")
    .map((char, idx) =>
      props.indexes.includes(idx)
        ? { highlight: true, char }
        : { highlight: false, char }
    );
});
</script>

<template>
  <template v-for="{ char, highlight } of displayName">
    <span class="font-bold" v-if="highlight">{{ char }}</span>
    <span v-else>{{ char }}</span>
  </template>
</template>
