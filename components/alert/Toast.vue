<template>
  <div class="container-item-toast">
    <i v-if="type || customIcon" class="material-symbols-outlined" :style="{ color: getIconColor }">
      {{ icon }}
    </i>
    <div class="container-item-message">
      <p v-html="messageHtml"></p>
    </div>
    <v-btn v-if="hasButton" @click.native.stop="executeAction($event)" color="tertiary">
      {{ buttonText }}
    </v-btn>
  </div>
</template>
<script>
export default {
  props: {
    customIcon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'success'
    },
    message: {
      type: String,
      default: ''
    },
    hasButton: {
      type: Boolean,
      default: true
    },
    buttonText: {
      type: String,
      default: ''
    },
  },
  computed: {
    icon() {
      if(this.customIcon) return this.customIcon
      switch (this.type) {
      case 'success':
        return 'check_circle'
      case 'warning':
        return 'warning'
      case 'error':
        return 'cancel'
      default:
        return 'notifications'
      }
    },
    messageHtml() {
      let lineLength = null
      this.hasButton ? lineLength = 45 : lineLength = 60
      let messageToDisplay = this.message

      if(messageToDisplay.length > 237) {
        messageToDisplay = messageToDisplay.substring(0, 237) + '...'
      }

      if(messageToDisplay.length > lineLength) {
        let formattedMessage = ''
        for (let i = 0; i < messageToDisplay.length; i += lineLength) {
          const chunk = messageToDisplay.substring(i, i + lineLength)
          if (i === 0) {
            formattedMessage += `<b>${chunk}</b><br>`
          } else {
            formattedMessage += `${chunk}<br>`
          }
        }
        return formattedMessage
      }
      return messageToDisplay
    },
    getIconColor() {
      switch (this.type) {
      case 'success':
        return 'var(--v-success-base)'
      case 'warning':
        return 'var(--v-warning-base)'
      case 'error':
        return 'var(--v-error-base)'
      default:
        return 'var(--v-primary-base)'
      }
    },
  },
  methods: {
    executeAction(event) {
      const clickedElement = event.target
      const closestToastIdElement = clickedElement.closest('[toast-id]')
      if(closestToastIdElement) {
        const toastId = closestToastIdElement.getAttribute('toast-id')
        this.$emit('clickToast', toastId)
      }
    }
  }
}
</script>