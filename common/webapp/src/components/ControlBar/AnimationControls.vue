<template>
  <template v-if="isAnimation">
    <SvgButton class="play" @action="actionPlay">
      <svg viewBox="0 0 330 330">
        <path d="M37.728,328.12c2.266,1.256,4.77,1.88,7.272,1.88c2.763,0,5.522-0.763,7.95-2.28l240-149.999
	c4.386-2.741,7.05-7.548,7.05-12.72c0-5.172-2.664-9.979-7.05-12.72L52.95,2.28c-4.625-2.891-10.453-3.043-15.222-0.4
	C32.959,4.524,30,9.547,30,15v300C30,320.453,32.959,325.476,37.728,328.12z"/>
      </svg>
    </SvgButton>
    <SvgButton class="pause" @action="actionPause">
      <svg viewBox="0 0 330 330">
        <path d="M37.728,328.12c2.266,1.256,4.77,1.88,7.272,1.88c2.763,0,5.522-0.763,7.95-2.28l240-149.999
	c4.386-2.741,7.05-7.548,7.05-12.72c0-5.172-2.664-9.979-7.05-12.72L52.95,2.28c-4.625-2.891-10.453-3.043-15.222-0.4
	C32.959,4.524,30,9.547,30,15v300C30,320.453,32.959,325.476,37.728,328.12z"/>
      </svg>
    </SvgButton>
    <SvgButton class="pin" @action="actionPin">
      <svg viewBox="0 0 12 12">
        <g stroke-width="2" fill="none">
          <path d="M11.29 11.71l-4-4"/>
          <circle cx="5" cy="5" r="4"/>
        </g>
      </svg>
    </SvgButton>
  </template>

</template>


<script>
import SvgButton from "@/components/ControlBar/SvgButton.vue";

export default {
  name: "AnimationControls",
  components: {
    SvgButton
  },
  data() {
    return {
      controls: this.$bluemap.animationControls,
    }
  },
  computed: {
    isAnimation() {
      return this.$bluemap.appState.controls.state === "animation";
    }
  },
  methods: {
    actionPlay(evt) {
      evt.preventDefault();

      this.controls.play();
      //if (animation) animation.cancel();

      // let startRotation = this.controls.rotation;
      // animation = animate(t => {
      //   this.controls.rotation = startRotation * (1-EasingFunctions.easeOutQuad(t));
      // }, 300);
    },
    actionPause(evt) {
      evt.preventDefault();

      this.controls.pause();
      //if (animation) animation.cancel();

      // let startRotation = this.controls.rotation;
      // animation = animate(t => {
      //   this.controls.rotation = startRotation * (1-EasingFunctions.easeOutQuad(t));
      // }, 300);
    },
    actionPin(evt) {
      evt.preventDefault();

      this.controls.dumpCamera();

      // if (animation) animation.cancel();
      //
      // let startRotation = this.controls.rotation;
      // animation = animate(t => {
      //   this.controls.rotation = startRotation * (1-EasingFunctions.easeOutQuad(t));
      // }, 300);
    }
  }
}
</script>

<style lang="scss">
.play {
  svg {
    height: 1.8em;
  }
}

.pin {
  svg {
    height: 1.8em;

    g {
      stroke: #6c6c6c;
    }
  }

}
</style>