<template>
  <div>
    <div id="webchat"></div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
import { mapGetters } from 'vuex'
import logo from '~/static/chat.png'

export default {
  props: {
    startOpened: Boolean,
    hideChat: Boolean,
  },
  mounted() {
    if (!this.hideChat) {
      this.setChat()
      this.loadChat()
    }
  },
  computed: mapGetters(['userInfo']),
  methods: {
    setChat() {
      const script = document.createElement('script')
      script.setAttribute(
        'src',
        'https://storage.googleapis.com/push-webchat/wwc-latest.js'
      )
      document.head.appendChild(script)
    },
    loadChat() {
      const email = this.validateEmail(this.userInfo.email)
      let url = window.location.hostname
      let newUrl = url.replace(/(.crm.ops.omie.us\/)/g, '')

      const identification = `${newUrl}:${email}`

      setTimeout(() => {
        WebChat.default.init({
          params: {
            // storage: 'session', //Isso vai fazer o pushinho guardar o estado do chat e o histórico somente enquanto a aba do navegador estiver aberta.
            images: { dims: { width: 300, height: 200 } },
          },
          selector: '#webchat',
          initPayload: '- Nova sessão -',
          sessionId: identification,
          channelUuid: '122e5706-cd18-435c-a87b-d43a04f4ec18', //Colocar o UUID do Canal
          host: 'https://new.push.al',
          socketUrl: 'https://websocket.weni.ai',
          title: 'Como podemos ajudar?', // Nome que aparece na janela de conversa do chat
          subtitle: '', // Nome que fica em baixo do titulo do chat
          inputTextFieldHint: 'Digite sua mensagem...', // Nome que aparece no campo de texto do chat
          showFullScreenButton: false,

          // profile image
          // profileAvatar: '~/static/account.png', //Imagem de perfil - Link da imagem
          openLauncherImage: logo, //Imagem do avatar - Link da imagem

          // interface customization params
          customizeWidget: {
            titleColor: '#', //Cor do titulo
            subtitleColor: '#', //Cor de Subtitulo
            inputFontColor: '#', //Cor do Caixa de Texto
            launcherHeight: '40px', //Altura do icone de lançamento do chat
            launcherWidth: '40px', // Largura do icone de lançamento do chat
            widgetHeight: '60%', // Altura da janela do chat
            widgetWidth: '', // Largura da janela do chat
            headerBackgroundColor: '#346af4', // Cor da barra do chat
            launcherColor: 'rgba(52, 106, 244, 0.9)', // Cor do circulo do chat
            chatBackgroundColor: '#FFF', // Cor do fundo do chat
            botMessageBubbleColor: '#f4f7f9', //Cor do balão da mensagem do Bot
            botMessageTextColor: '#000', // Cor do texto da mensagem do bot
            userMessageBubbleColor: 'rgba(52, 106, 244, 0.7)', // Cor do balão da mensagem do Usuario
            userMessageTextColor: 'white', //Cor do texto  da mensagem do Usuario
            quickRepliesFontColor: 'rgba(52, 106, 244, 0.7)', // Cor das respostas rapidas em formato de pilula
            quickRepliesBorderColor: '#346af4', // Cor da borda das repostas rapidas em formato de pilula
            inputBackgroundColor: '#f4f7f9', //Cor do fundo da caixa de texto
            inputPlaceholderColor: '#000', // Cor da fonte da caixa de texto
          },
        })
        this.startOpened && WebChat.open()
      }, 1000)
      setTimeout(() => {
        const chatElement = document.querySelector('.push-widget-container')
        chatElement.style.paddingBottom = '4px'
      }, 1400)
    },
    validateEmail(email) {
      if (email) {
        return email
      }
      return 'Anonimo'
    },
  },
}
</script>

<style scoped>
.push-close-button {
  border-radius: 100px !important;
  width: 25px !important;
  height: 25px !important;
}
.push-close-button img {
  width: 10px !important;
  margin-top: -2px !important;
  margin-right: -0.2px !important;
}
.push-poweredby-container {
  display: none !important;
}
</style>
