<template>
  <v-card color="shape-base" flat class="login-card py-10 px-10">
    <v-card-title class="d-flex justify-center mb-5">
      <h6>Faça seu login</h6>
    </v-card-title>

    <v-card-text class="text-left">
      <v-form @submit.prevent="doLogin()" ref="form">
        <v-text-field
          type="email"
          label="Entre com o seu e-mail"
          placeholder="nome@omie.com.br"
          variant="outlined"
          v-model="formData.user"
          color="primary"
        >
          <!-- 
          :error="$v.formData.user.$error"
          :error-messages="userErrors" 
        -->
          <template v-slot:append-inner>
            <v-icon color="primary" icon="mdi-email" style="opacity: 1" />
          </template>
        </v-text-field>
        <v-text-field
          :type="showPassword ? 'text' : 'password'"
          label="Digite sua senha"
          placeholder="***************"
          hint="Minimo de 8 caracteres"
          counter
          variant="outlined"
          v-model="formData.password"
          color="primary"
        >
          <!-- 
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :error="$v.formData.password.$error"
          :error-messages="passwordErrors" 
        -->
          <template v-slot:append-inner>
            <v-icon
              color="primary"
              :icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
              @click="showPassword = !showPassword"
              style="opacity: 1"
            />
          </template>
        </v-text-field>
        <v-text-field
          v-if="twoAuth"
          type="number"
          variant="outlined"
          label="Autenticação de 2 fatores"
          placeholder="Autenticação de 2 fatores"
          v-model="formData.code"
          class="ajust-index"
        >
          <v-icon slot="append" color="primary">mdi-lock</v-icon>
        </v-text-field>
        <div v-if="multiTenant" class="d-flex justify-space-between">
          <v-select
            variant="outlined"
            :items="tenants"
            item-text="name"
            item-value="id"
            v-model="formData.tenant_id"
          >
          </v-select>
        </div>
        <div class="d-flex align-center justify-space-between pb-6">
          <span>
            <a
              href="https://app.omie.com.br/login/"
              target="_blank"
              class="link-retrieve-password font-body-large"
              >Esqueceu a senha?</a
            >
          </span>
          <v-checkbox
            v-if="!isProductionEnv"
            label="Login local"
            v-model="isLocalLogin"
            class="mt-0 pt-0 d-flex justify-end"
            density="compact"
            hide-details="auto"
          ></v-checkbox>
        </div>
        <div>
          <v-btn type="submit" color="primary" block dark class="">
            <v-icon class="spinner mr-1" v-if="isLoading">mdi-loading</v-icon>
            Entrar
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
// import { required, email, minLength } from 'vuelidate/lib/validators'
import { mapState, mapActions } from 'pinia';
import { useUserStore } from '../../stores/user';

var CryptoJSAesJson = {
  stringify: function (cipherParams) {
    const j = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
    if (cipherParams.iv) j.iv = cipherParams.iv.toString();
    if (cipherParams.salt) j.s = cipherParams.salt.toString();
    return JSON.stringify(j).replace(/\s/g, '');
  },
  parse: function (jsonStr) {
    const j = JSON.parse(jsonStr);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(j.ct),
    });
    if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
    if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
    return cipherParams;
  },
};

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
      code: '',
    },
    token: null,
    multiTenant: false,
    tenants: [],
  }),
  computed: {
    ...mapState(useUserStore, {
      userInfo: 'getUserInfo',
    }),
    userErrors() {
      const errors = [];
      // if (!this.$v.formData.user.$dirty) return errors
      // !this.$v.formData.user.email && errors.push('Deve ser um e-mail valido')
      // !this.$v.formData.user.required && errors.push('E-mail é obrigatório')
      return errors;
    },
    passwordErrors() {
      const errors = [];
      // if(!this.$v.formData.password.$dirty) return errors
      // !this.$v.formData.password.min && errors.push('Deve conter no mínimo 8 caracteres')
      // !this.$v.formData.password.required && errors.push('A senha é obrigatória')
      return errors;
    },
  },
  // validations: {
  //   formData: {
  //     user: { required, email },
  //     password: { required, min: minLength(8) }
  //   }
  // },
  async mounted() {
    this.isProductionEnv = document.URL.split('//')[1].split('.')[0] == 'app';
    this.mountCryptoSrc();

    const urlParams = new URLSearchParams(window.location.search);
    this.multiTenant = urlParams.get('multiTenant') === 'true';
    if (this.multiTenant) {
      const data = await getList('/auth/tenants');
      this.tenants = data ?? [];
    }
  },
  methods: {
    ...mapActions(useUserStore, {
      setUserInfo: 'setUser',
    }),
    mountCryptoSrc() {
      const script = document.createElement('script');
      script.setAttribute(
        'src',
        'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js'
      );
      document.body.appendChild(script);
    },
    cryptoForm(form, formFields, token, action) {
      const actionObj = { action: action };
      let str = '';
      for (let field of formFields) {
        actionObj[field] = form[field];
      }
      str = JSON.stringify(actionObj);
      str = CryptoJS.AES.encrypt(str, token, {
        format: CryptoJSAesJson,
      }).toString();

      return { safe_login: str };
    },
    async getPlatformToken() {
      let ret = null;
      if (this.token != null) {
        ret = new Promise((resolve, reject) => {
          resolve(this.token);
        });
      } else {
        const { token } = await getItem('/auth/fake-login-token');
        return (this.token = token ?? null);
        // ret = this.$axios.get('/auth/fake-login-token').then((data) => {
        //   this.token = data.data;
        //   return this.token;
        // });

        // console.log('ret', ret);
      }
      return ret;
    },
    doLogin() {
      sessionStorage.clear();
      // this.$v.formData.$touch();
      // if (this.$v.formData.$error) return;

      this.isLoading = true;
      if (this.isLocalLogin) {
        this.authenticate({
          email: this.formData.user,
          password: this.formData.password,
        });
      } else {
        this.getPlatformToken().then(async (data) => {
          const token = data;
          const payload = {
            email: this.formData.user,
            login_step: 2,
            'current-password': this.formData.password,
            code: this.twoAuth ? this.formData.code : null,
            redirect_to: '/home/',
          };
          const date = new Date();
          const timezone_min = date.getTimezoneOffset();
          const safe = {
            data: this.cryptoForm(
              payload,
              [
                'email',
                'login_step',
                'current-password',
                'code',
                'redirect_to',
              ],
              token,
              'login'
            ),
            token,
            timezone_min,
          };
          if (this.formData.tenant_id) {
            safe['tenant_id'] = this.formData.tenant_id;
          }

          const hostname = window.location.hostname;
          if (hostname.indexOf('planotatico.crm.omie.com.br') >= 0) {
            safe['tenant_id'] = 368;
          }

          const {
            data: { _rawValue: loginResponse },
          } = await useFetch('/auth/fake-login', {
            method: 'POST',
            body: safe,
          });

          if (loginResponse) {
            if (loginResponse.detail === 'missing two factor token') {
              this.twoAuth = true;
              this.isLoading = false;
            } else {
              if ('access_token' in loginResponse) {
                localStorage.setItem('userInfo', JSON.stringify(loginResponse));
                this.setUserInfo(JSON.stringify(loginResponse));
                this.isLoading = false;
                this.$router.push('/home');
              } else {
                this.authenticate(loginResponse);
              }
            }
          } else {
            this.$swal({
              icon: 'error',
              title: 'Usuário ou senha incorreto.',
            });
            this.isLoading = false;
          }
        });
      }
    },
    async authenticate(data) {
      const date = new Date();
      const timezone_min = date.getTimezoneOffset();

      if (this.formData.tenant_id) {
        data['tenant_id'] = this.formData.tenant_id;
      }
      const hostname = window.location.hostname;
      if (hostname.indexOf('planotatico.crm.omie.com.br') >= 0) {
        safe['tenant_id'] = 368;
      }

      const payload = {
        ...data._rawValue,
        timezone_min,
      };

      const {
        data: { _rawValue: authResponse },
      } = await useFetch('/auth/login', {
        method: 'POST',
        body: payload,
      });

      if (authResponse) {
        localStorage.setItem('userInfo', JSON.stringify(authResponse));
        this.setUserInfo(JSON.stringify(authResponse));

        this.isLoading = false;
        this.$router.push('/home');
      } else {
        this.$swal({
          icon: 'error',
          title: 'Verifique seu e-mail, por favor.',
        });
        this.isLoading = false;
      }
    },
  },
};
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
  width: 30vw !important;
  border-radius: 32px;
}
</style>
