<template>
  <div class="coloredBackdrop" v-bind:style="style"></div>
</template>

<script>
export default {
  name: "ColoredOverlay",
  computed: {
    style() {
      return {opacity: this.$bluemap.mapViewer.controlsManager.data.backdropOpacity}
    }
  }
}
</script>

<style scoped>
.coloredBackdrop {
  background-color: black;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
