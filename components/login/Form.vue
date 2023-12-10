<template>
  <v-card color="shape" class="login-card mb-10 py-10 px-10">
    <v-card-title class="d-flex justify-center mb-5">
      <h6>Faça seu login</h6>
    </v-card-title>
    <v-card-text class="text-left">
      <v-form @submit.prevent="doLogin()" ref="form">
        <v-text-field
          type="email"
          label="Entre com o seu e-mail"
          placeholder="nome@omie.com.br"
          outlined
          v-model="formData.user"
          :error="$v.formData.user.$error"
          :error-messages="userErrors"
        >
          <v-icon slot="append" color="primary">mdi-email</v-icon>
        </v-text-field>
        <v-text-field
          :type="showPassword ? 'text' : 'password'"
          label="Digite sua senha"
          placeholder="***************"
          hint="Minimo de 8 caracteres"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          counter
          outlined
          v-model="formData.password"
          :error="$v.formData.password.$error"
          :error-messages="passwordErrors"
        >
          <v-icon
            @click="showPassword = !showPassword"
            slot="append"
            color="primary"
          >
            {{showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'}}
          </v-icon>
        </v-text-field>
        <v-text-field
          v-if="twoAuth"
          type="number"
          outlined
          label="Autenticação de 2 fatores"
          placeholder="Autenticação de 2 fatores"
          v-model="formData.code"
          class="ajust-index"
        >
          <v-icon slot="append" color="primary">mdi-lock</v-icon>
        </v-text-field>
        <div v-if="multiTenant" class="d-flex justify-space-between">
          <v-select
            outlined
            :items="tenants"
            item-text="name"
            item-value="id"
            v-model="formData.tenant_id"
          > 
          </v-select>
        </div>
        <div class="d-flex justify-space-between " style="height: 65px;">
          <span>
            <a href="https://app.omie.com.br/login/" target="_blank" class="link-retrieve-password">Esqueceu a senha?</a>
          </span>
          <v-checkbox
            v-if="!isProductionEnv"
            label="Login local"
            v-model="isLocalLogin"
            class="mt-0 pt-0"
          ></v-checkbox>
        </div>
        <div>
          <v-btn type="submit" color="primary" block dark class="mt-1 mb-3">
            <v-icon class="spinner mr-1" v-if="isLoading">mdi-loading</v-icon>
            Entrar
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
/* eslint-disable no-undef */
import { required, email, minLength } from 'vuelidate/lib/validators'

var CryptoJSAesJson = {
  stringify: function (cipherParams) {
    const j = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) }
    if (cipherParams.iv) j.iv = cipherParams.iv.toString()
    if (cipherParams.salt) j.s = cipherParams.salt.toString()
    return JSON.stringify(j).replace(/\s/g, '')
  },
  parse: function (jsonStr) {
    const j = JSON.parse(jsonStr)
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(j.ct),
    })
    if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
    if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
    return cipherParams
  },
}

export default {
  data: () => ({
    twoAuth: false,
    showPassword: false,
    isLoading: false,
    isLocalLogin: false,
    isProductionEnv: false,
    formData: {
      user: '',
      password: '',
      code: ''
    },
    token: null,
    multiTenant: false,
    tenants: []
  }),
  computed: {
    userErrors() {
      const errors = []
      if (!this.$v.formData.user.$dirty) return errors
      !this.$v.formData.user.email && errors.push('Deve ser um e-mail valido')
      !this.$v.formData.user.required && errors.push('E-mail é obrigatório')
      return errors
    },
    passwordErrors() {
      const errors = []
      if(!this.$v.formData.password.$dirty) return errors
      !this.$v.formData.password.min && errors.push('Deve conter no mínimo 8 caracteres')
      !this.$v.formData.password.required && errors.push('A senha é obrigatória')
      return errors
    }
  },
  validations: {
    formData: {
      user: { required, email },
      password: { required, min: minLength(8) }
    }
  },
  mounted() {
    this.isProductionEnv = document.URL.split('//')[1].split('.')[0] == 'app'
    this.mountCryptoSrc()

    const urlParams = new URLSearchParams(window.location.search);
    this.multiTenant = urlParams.get('multiTenant') === 'true';
    if (this.multiTenant) {
        this.$axios.get('/auth/tenants')
          .then(data => {
            this.tenants = data.data
          })
    }
    else {
      this.tenants = []
    }

  },
  methods: {
    mountCryptoSrc() {
      const script = document.createElement('script')
      script.setAttribute(
        'src',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
      )
      document.body.appendChild(script)
    },
    cryptoForm(form, formFields, token, action) {
      const actionObj = { action: action }
      let str = ''
      for (let field of formFields) {
        actionObj[field] = form[field]
      }
      str = JSON.stringify(actionObj)
      str = CryptoJS.AES.encrypt(str, token, {
        format: CryptoJSAesJson,
      }).toString()

      return { safe_login: str }
    },
    getPlatformToken() {
      let ret = null
      if (this.token != null) {
        ret = new Promise((resolve, reject) => {resolve(this.token)})
      }
      else {
        ret = this.$axios.get('/auth/fake-login-token')
          .then(data => {
            this.token = data.data 
            return this.token
          })
      }
      return ret
    },
    doLogin() {
      sessionStorage.clear()
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return

      this.isLoading = true
      if (this.isLocalLogin) {
        this.authenticate({
          email: this.formData.user,
          password: this.formData.password,
        })
      }
      else {
        this.getPlatformToken().then((data) => {
          const token = data.token
          const payload = {
            email: this.formData.user,
            login_step: 2,
            'current-password': this.formData.password,
            code: this.twoAuth ? this.formData.code : null,
            redirect_to: '/home/',
          }
          const date = new Date()
          const timezone_min = date.getTimezoneOffset()
          const safe = {
            data: this.cryptoForm(
              payload,
              ['email', 'login_step', 'current-password', 'code', 'redirect_to'],
              token,
              'login'
            ),
            token,
            timezone_min,
          }
          if (this.formData.tenant_id) {
            safe["tenant_id"] = this.formData.tenant_id
          }

          const hostname = window.location.hostname;
          if (hostname.indexOf('planotatico.crm.omie.com.br') >= 0) {
            safe["tenant_id"] = 368
          }

          this.$axios.post('/auth/fake-login', safe)
            .then((data) => {    
              if (data?.data?.detail === 'missing two factor token')
              {
                this.twoAuth = true
                this.isLoading = false
              }else{
                const resFakeLogin = data.data
                if ('access_token' in resFakeLogin) {
                  const userInfo = data.data
                  localStorage.setItem('userInfo', JSON.stringify(userInfo))
                  this.$store.dispatch('setUser', JSON.stringify(userInfo))
                  this.$router.push('/home')
                }
                else {
                  this.authenticate(resFakeLogin)               
                }                    
              }
            })
            .catch((err) => {
              console.log(err)
              this.$swal({
                icon: 'error',
                title: 'Usuário ou senha incorreto.',
              })
              this.isLoading = false
            })
        })
      }
    },
    authenticate(data) {
      const date = new Date()
      const timezone_min = date.getTimezoneOffset()

      if (this.formData.tenant_id) {
        data["tenant_id"] = this.formData.tenant_id
      }
      const hostname = window.location.hostname;
      if (hostname.indexOf('planotatico.crm.omie.com.br') >= 0) {
        safe["tenant_id"] = 368
      }
      this.$axios.post('/auth/login', { ...data, timezone_min })
        .then((data) => {
          const userInfo = data.data
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          this.$store.dispatch('setUser', JSON.stringify(userInfo))
          this.isLoading = false
          this.$router.push('/home')
        })
        .catch((_err) => {
          this.$swal({
            icon: 'error',
            title: 'Verifique seu e-mail, por favor.',
          })
          this.isLoading = false
        })
    }
  }
}
</script>

<style scoped>
  .hasError label {
    color: red;
  }
  .discover-link {
    text-decoration: none;
  }
  .ajust-text {
    text-align: justify;
  }
  .login-card {
    width: 500px;
    border-radius: 32px;
  }
</style>