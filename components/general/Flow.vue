<template>
  <div id="app" class="remove-app-margin">
    <div id="drawflow">
      <iframe
        ref="frame"
        v-if="id"
        id="df-frame"
        :src="'/admin/mockFlow.html?id=' + id"
      ></iframe>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'

export default {
  components: {},
  props: ['id'],
  data() {
    return {
    }
  },
  mounted() {
    let self = this		  				 

    window.addEventListener('message', (event) => {
      let data = event.data
      if ('command' in data) {
        switch(data.command) {
        case 'loaded':
          self.$refs.frame.contentWindow.vueInstance.loadWorkflow(self.id, localStorage.userInfo)
        }
      }
    })
  },
  methods: {
    exportContentData() {
      return this.$refs.frame.contentWindow.vueInstance.getData()
    }
  }
}
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
} */
.remove-app-margin {
  margin-top: 0 !important;
}
#drawflow {
  width: 100%;
  height: 70vh;
  border: 1px solid #ccc;
}

iframe {
  border: 0;
  width: 100%;
  height: 100%;
}
</style>
