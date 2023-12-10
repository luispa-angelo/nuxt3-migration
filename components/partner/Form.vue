<template>
  <v-form ref="form">
    <v-row v-if="!readingMode">
      <v-col
        xl="2"
        lg="2"
        md="4"
        sm="4"
        cols="12"
        class="d-flex justify-center py-3"
      >
        <FormAvatar />
      </v-col>
      <v-col xl="5" lg="5" md="4" sm="4" cols="12" class="pb-0">
        <v-row>
          <v-col xl="10" lg="10">
            <v-select
              attach
              label="Tipo de documento"
              v-model="formData.identifier_type"
              :items="typeDocument"
              item-value="value"
              item-text="label"
              required
              outlined
              dense
              :disabled="isEditing || !!identifierFromAddParterForm"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col xl="10" lg="10" class="pt-0">
            <v-text-field
              v-if="
                formData.identifier_type == 'cnpj' ||
                formData.identifier_type == 'cpf'
              "
              label="Número do documento"
              v-model="formData.identifier"
              v-mask="
                formData.identifier_type == 'cnpj'
                  ? this.mask_cnpj
                  : this.mask_cpf
              "
              required
              outlined
              dense
              :disabled="isEditing"
              :error="$v.formData.identifier.$error"
              :error-messages="
                $v.formData.identifier.$error ? 'Esse campo é obrigatório' : ''
              "
            ></v-text-field>
            <v-select
              attach
              v-if="identifierFromAddParterForm"
              label="Tipo de associação"
              v-model="association.association_type_id"
              :items="associationTypeList"
              item-value="id"
              item-text="name"
              required
              outlined
              dense
              :error="$v.association.association_type_id.$error"
              :error-messages="
                $v.association.association_type_id.$error
                  ? 'Esse campo é obrigatório'
                  : ''
              "
            ></v-select>
          </v-col>
          <v-col v-if="!isEditing" xl="2" lg="2" class="pt-0">
            <v-btn
              v-if="formData.identifier_type"
              color="secondary"
              @click="handleSearch"
            >
              Pesquisar
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <div
      v-if="!searchDone"
      v-show="!readingMode"
      class="mt-10 d-flex justify-center"
    >
      <v-progress-circular v-if="searching" indeterminate></v-progress-circular>
      <p class="subtitle-2 font-weight-bold" v-if="!searching">
        Escolha o documento e digite os dados
      </p>
    </div>

    <div v-if="searchDone" class="mt-2">
      <v-expansion-panels v-model="panel" :multiple="!readingMode">
        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Status</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col xl="4" lg="4">
                <v-select
                  attach
                  v-if="searchDone"
                  label="Status"
                  v-model="formData.state"
                  :items="meta.customerState"
                  item-value="value"
                  item-text="name"
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
              </v-col>
              <v-col xl="4" lg="4">
                <v-select
                  attach
                  v-if="searchDone"
                  label="Status do parceiro"
                  v-model="formData.partnership"
                  :items="meta.customerPartnership"
                  item-value="value"
                  item-text="name"
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="!isEditing">
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Atribuição</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-select
                  attach
                  v-if="searchDone"
                  required
                  outlined
                  dense
                  label="Time responsável"
                  item-text="name"
                  item-value="id"
                  v-model="formData.team_id"
                  :items="userTeams"
                  :error="$v.formData.team_id.$error"
                  :error-messages="
                    $v.formData.team_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                  :readonly="readingMode"
                ></v-select>
              </v-col>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-select
                  attach
                  v-if="searchDone"
                  required
                  outlined
                  dense
                  label="Pipeline"
                  item-text="name"
                  item-value="id"
                  v-model="formData.pipeline_id"
                  :items="pipelineList"
                  :readonly="readingMode"
                ></v-select>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Detalhes da empresa</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-text-field
                  label="Razão Social"
                  v-model="formData.legalName"
                  required
                  outlined
                  dense
                  :error="$v.formData.legalName.$error"
                  :error-messages="
                    $v.formData.legalName.$error
                      ? 'Esse campo é obrigatório'
                      : ''
                  "
                  :readonly="readingMode"
                ></v-text-field>
                <v-text-field
                  label="Nome da empresa"
                  v-model="formData.name"
                  required
                  outlined
                  dense
                  :error="$v.formData.name.$error"
                  :error-messages="
                    $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
                  "
                  :readonly="readingMode"
                ></v-text-field>
                <v-text-field
                  number
                  label="Número de funcionários"
                  v-model="formData.nbr_employess"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
                <v-select
                  attach
                  label="Enquadramento tributário"
                  v-model="formData.tax_model"
                  :items="meta.taxModel"
                  item-value="value"
                  item-text="name"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
              </v-col>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-text-field
                  label="CNAE"
                  v-model="formData.cnae"
                  required
                  outlined
                  dense
                  :error="$v.formData.cnae.$error"
                  :error-messages="
                    $v.formData.cnae.$error ? 'Esse campo é obrigatório' : ''
                  "
                  :readonly="readingMode"
                ></v-text-field>
                <CurrencyInput                  
                  label="Receita anual"
                  :value="formData.year_revenue"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                  @inputValue="
                    (value) => {
                      formData.year_revenue = value
                    }
                  "
                />                
                <v-textarea
                  label="Sobre a empresa"
                  v-model="formData.description"
                  required
                  outlined
                  dense
                  rows="5"
                  height="105px"
                  :readonly="readingMode"
                ></v-textarea>
              </v-col>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-select
                  attach
                  label="Porte"
                  v-model="formData.size"
                  :items="meta.companySize"
                  item-value="value"
                  item-text="name"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
                <v-select
                  attach
                  label="Hierarquia da empresa"
                  v-model="formData.hierarchical_classification"
                  :items="meta.companyHierarchy"
                  item-value="value"
                  item-text="name"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
                <v-select
                  attach
                  label="Status legal"
                  v-model="formData.legal_state"
                  :items="meta.customerLegalState"
                  item-value="value"
                  item-text="name"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Informações de endereço</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row v-for="(address, i) in formData.enderecos" :key="i">
              <v-col cols="2" class="pb-0">
                <v-text-field
                  label="CEP"
                  v-model="address.cep"
                  required
                  outlined
                  dense
                  v-mask="'#####-###'"
                  :rules="rules.cepRules"
                  @keydown.enter="cepSearch(address.cep)"
                  @click:append="cepSearch(address.cep)"
                  @blur="cepSearch(address.cep)"
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="pb-0">
                <v-text-field
                  label="Logradouro"
                  v-model="address.logradouro"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="pb-0">
                <v-text-field
                  label="Nº"
                  v-model="address.numero"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="pb-0">
                <v-text-field
                  label="Complemento"
                  v-model="address.complemento"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="pb-0">
                <v-text-field
                  label="Bairro"
                  v-model="address.bairro"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="pb-0">
                <v-text-field
                  label="Cidade"
                  v-model="address.cidade"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="pb-0">
                <v-text-field
                  label="UF"
                  v-model="address.uf"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="pb-0">
                <v-btn
                  fab
                  icon
                  small
                  color=""
                  class="ml-5"
                  @click="removeAddress(address.id, i)"
                  v-show="!readingMode"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="justify-left" v-if="!readingMode">
              <v-col cols="12">
                <v-btn
                  color="secondary"
                  fab
                  small
                  @click="addEmail"
                  v-tooltip="{
                    content: `<div class='v-btn-tooltip'>Adicionar e-mail</div>`,
                    placement: 'bottom-center',
                    trigger: 'hover',
                  }"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row v-if="formData.enderecos">
              <v-btn
                class="ml-3 mb-3"
                color="secondary"
                @click="addNewAddress"
                v-show="!readingMode"
              >
                Adicionar endereço
              </v-btn>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Contatos da empresa</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content eager>
            <v-row>
              <v-col>
                <GenericTable
                  :headers="header"
                  :items="formData.contato"
                  :isLoading="contactsTableLoading"
                  :delete-action="contactsAction"
                  @removeItem="removeContact"
                  @onCheck="handlePreferentialCheck"
                  redirect-to="contact-id"
                  :checkbox-option="!readingMode ? 'Preferencial' : ''"
                  :action-options="!readingMode ? true : false"
                  v-slot:default="slotProps"
                >
                  <Sheet
                    isEditing
                    title="Editar Contato"
                    @submit="$refs[`myForm-${slotProps.itemId}`].submitForm()"
                    @cancel="$refs[`myForm-${slotProps.itemId}`].handleCancel()"
                  >
                    <template v-slot="{ sheet, closed }">
                      <ContactForm
                        isEditing
                        :ref="`myForm-${slotProps.itemId}`"
                        :sheet="sheet"
                        @closeForm="closed"
                        :item="slotProps.item"
                        :item-id="slotProps.itemId"
                        :by-details="false"
                        :onCompanyCreate="!isEditing"
                        :associatedCompanyId="itemId"
                        @updateData="updContact"
                      />
                    </template>
                  </Sheet>
                </GenericTable>
              </v-col>
            </v-row>
            <v-row>
              <Sheet
                standardSecondary
                class="ml-3 mb-3"
                title="Criar Contato"
                @submit="$refs[`myForm`].submitForm()"
                @cancel="$refs[`myForm`].handleCancel()"
                v-show="!readingMode"
              >
                <template v-slot="{ sheet, closed }">
                  <ContactForm
                    :ref="`myForm`"
                    :sheet="sheet"
                    @closeForm="closed"
                    :associatedCompanyId="itemId"
                    :by-details="false"
                    :onCompanyCreate="!isEditing"
                    @onContactCreate="addContact"
                  />
                </template>
              </Sheet>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Telefones</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col xl="6" class="pt-0">
                <p class="subtitle-2 font-weight-bold mb-2">Fixos</p>
                <v-divider class="mb-4"></v-divider>
                <v-row
                  v-for="(telefone, i) in formData.telefonesFixos"
                  :key="i"
                >
                  <v-col xl="6" class="pb-0">
                    <v-text-field
                      label="Telefone"
                      v-model="telefone.telefone"
                      required
                      v-mask="'(##) ####-####'"
                      outlined
                      dense
                      @keyup="telefone.user = true"
                      :readonly="readingMode"
                    ></v-text-field>
                  </v-col>
                  <v-col xl="1" class="pb-0">
                    <v-btn
                      fab
                      icon
                      small
                      color=""
                      class="ml-5"
                      @click="removePhone(telefone.id, i, 'telefonesFixos')"
                      v-show="!readingMode"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>

              <v-col xl="6" class="pt-0">
                <p class="subtitle-2 font-weight-bold mb-2">Móveis</p>
                <v-divider class="mb-4"></v-divider>
                <v-row
                  v-if="formData.telefonesMoveis.length > 0"
                  v-for="(telefone, i) in formData.telefonesMoveis"
                  :key="i"
                >
                  <v-col xl="6" class="pb-0">
                    <v-text-field
                      label="Telefone"
                      v-model="telefone.telefone"
                      v-mask="'(##) #####-####'"
                      required
                      outlined
                      dense
                      @keyup="telefone.user = true"
                      :readonly="readingMode"
                    ></v-text-field>
                  </v-col>
                  <v-col xl="1" class="pb-0">
                    <v-btn
                      fab
                      icon
                      small
                      color=""
                      class="ml-5"
                      @click="removePhone(telefone.id, i, 'telefonesMoveis')"
                      v-show="!readingMode"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="formData.telefonesMoveis.length <= 0">
                  <v-text-field
                    label="Telefone"
                    v-model="formData.telefonesMoveis"
                    v-mask="'(##) #####-####'"
                    required
                    outlined
                    dense
                    @keyup="telefone.user = true"
                    :readonly="readingMode"
                  ></v-text-field>
                </v-row>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">E-mails</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col cols="6">
                <v-row v-for="(email, i) in formData.emails" :key="i">
                  <v-col cols="11" class="pb-0">
                    <v-text-field
                      label="Email"
                      v-model="email.email"
                      required
                      outlined
                      dense
                      :readonly="readingMode"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="1" class="pb-0">
                    <v-btn
                      fab
                      icon
                      small
                      color=""
                      class="ml-5"
                      @click="removeEmail(email.id, i)"
                      v-show="!readingMode"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Mídias</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-text-field
                  label="Site"
                  v-model="formData.website"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel v-if="isEditing">
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">
                  {{
                    formData.accounting == 'internal'
                      ? 'Contabilidade - ATUAL: INTERNA'
                      : 'Contabilidade'
                  }}
                </p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content eager>
            <v-row>
              <v-col xl="3">
                <v-select
                  attach
                  label="Tipo de contabilidade"
                  v-model="formData.accounting"
                  :items="meta.accountant"
                  item-value="value"
                  item-text="name"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-select>
              </v-col>
              <v-col xl="3" v-if="formData.accounting == 'external'">
                <div>
                  <Autocomplete
                    label="Empresa"
                    outlined
                    dense
                    clearable
                    endpoint="/customer/company"
                    query="partnership=partner"
                    :readonly="readingMode"
                    @valueSelected="
                      (value) => {
                        accountingAssociation.left_side_id = value
                      }
                    "
                  ></Autocomplete>
                </div>
              </v-col>
              <v-col xl="1">
                <v-btn
                  color="secondary"
                  fab
                  small
                  :disabled="
                    formData.accounting == 'external' &&
                    accountingList.length > 0
                  "
                  @click="handleAccounting"
                  v-show="!readingMode"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col v-if="formData.accounting == 'external'">
                <GenericTable
                  :headers="associationHeaders"
                  :items="accountingList"
                  @removeItem="deleteAccounting"
                  delete-action="delete"
                  :action-options="isEditing"
                  :empty-slot="true"
                >
                </GenericTable>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  props: {
    itemId: Number,
    sheet: Boolean,
    isEditing: Boolean,
    readingMode: Boolean,
    title: String,
    identifierFromAddParterForm: String,
    item: Object,
  },
  data: () => ({
    companyId: null,
    panel: [0, 1, 2, 3, 4],
    typeDocument: [
      {
        value: 'cnpj',
        label: 'CNPJ',
      },
      {
        value: 'cpf',
        label: 'CPF',
      },
    ],
    enhanceData: {
      contato: [],
    },
    searching: false,
    noData: false,
    searchDone: false,
    contactsTableLoading: true,
    contactsArray: [],
    contactsAction: 'delete',
    associations: [],
    associationTypeList: [],
    associationList: [],
    accountingList: [],
    partnersList: [],
    pipelineList: [],
    myPipelines: {},
    formData: {
      pipeline_id: null,
      team_id: null,
      legalName: '',
      external_id: null,
      external_hs_id: null,
      identifier: '',
      identifier_type: 'cnpj',
      nbr_employess: null,
      member_of_id: null,
      creator_id: null,
      economic_group: '',
      hierarchical_classification: '',
      size: '',
      tax_model: '',
      fundation: '',
      valuation: null,
      name: '',
      website: '',
      year_revenue: null,
      tota_revenue: null,
      description: '',
      observations: '',
      type: 'company',
      state: 'new',
      legal_state: '',
      category_id: null,
      partnership: 'partner',
      cnae: '',
      cnaeDescricao: '',
      accounting: '',
      contato: [],
      telefones: {
        fixos: [],
        moveis: [],
      },
      enderecos: [],
      emails: [],
    },
    association: {
      left_side_id: null,
      right_side_id: null,
      association_type_id: null,
    },
    accountingAssociation: {
      left_side_id: null,
      right_side_id: null,
      association_type_id: null,
    },
    associationHeaders: [
      { text: 'Empresa', value: 'left_side.name' },
      { text: 'Tipo de associação', value: 'association_type.name' },
    ],
    header: [
      { text: 'ID', value: 'id' },
      { text: 'Cargo', value: 'position' },
      { text: 'Nome', value: 'name' },
      { text: 'Documento', value: 'document_value' },
    ],
    rules: {
      cepRules: [
        (v) => !!v || 'CEP é obrigatório',
        (v) => (v && v.length === 9) || 'CEP Inválido',
      ],
      neighborhood: [(v) => !!v || 'Bairro é obrigatório'],
    },
  }),
  validations: {
    formData: {
      identifier: { required },
      legalName: { required },
      name: { required },
      cnae: { required },
      team_id: { required },
    },
    association: {
      association_type_id: { required },
    },
  },
  created() {
    this.itemId && (this.companyId = this.itemId)
  },
  async mounted() {
    await this.loadForm()
    if (this.identifierFromAddParterForm) {
      this.formData.identifier = this.identifierFromAddParterForm
      await this.$store.dispatch('fetchAssociationType')
      const ignoredCategories = ['group']
      if (
        this.associations.some(
          (association) => association.association_type.category == 'accountant'
        )
      ) {
        ignoredCategories.push('accountant')
      }
      this.associationTypeList = this.associationType.filter(
        (associationType) => {
          return !ignoredCategories.includes(associationType.category)
        }
      )
    }
  },
  computed: {
    ...mapGetters({
      userTeam: 'userTeam',
      userTeams: 'userTeams',
      companies: 'Company/companies',
      partners: 'Partner/partners',
      formattedEnhance: 'formattedEnhance',
      meta: 'meta',
      associationType: 'associationType',
    }),
  },
  watch: {
    formattedEnhance(newValue) {
      this.searching = false
      this.searchDone = true
      if (newValue.name == '') {
        this.noData = true
        this.$swal({
          icon: 'warning',
          title:
            'A pesquisa não retornou dados, por favor, preencha os valores manualmente',
        })
      }
      this.formData = { ...this.formData, ...newValue }
      this.contactsArray = this.formData.contato
    },
    associations(newValue) {
      this.associationList = newValue.filter(
        ({ association_type: { category } }) =>
          category != 'accountant' && category != 'group'
      )
      this.accountingList = newValue.filter(
        ({ association_type: { category } }) => category == 'accountant'
      )
      this.associationTypeList = this.associationType.filter(
        (type) => type.category != 'accountant' && type.category != 'group'
      )
    },
    async sheet(newValue) {
      if (newValue) {
        await this.loadForm()
      }
    },
    partners(newValue) {
      this.partnersList = newValue.filter(
        (partner) => partner.partnership == 'partner'
      )
    },
    searchDone(newValue) {
      this.formData.contato = []
      this.contactsTableLoading = !newValue
      this.contactsArray.forEach((contact) => {
        const enhanceContact = { ...contact, origin: 'enhancement' }
        this.formData.contato.push(enhanceContact)
      })
    },
    'formData.team_id': async function (newValue) {
      if (newValue) {
        const pipelines = this.myPipelines[newValue]
        if (pipelines) {
          this.pipelineList = pipelines.map(({ id, name }) => ({
            id,
            name,
          }))
          this.formData.pipeline_id = this.pipelineList[0].id
        } else {
          this.formData.pipeline_id = null
          this.pipelineList = []
        }
      }
    },
    companyId() {
      if (!this.companyId) {
        this.loadForm()
      }
    },
  },
  methods: {
    contactHasError() {
      if (this.formData.contato.length) {
        const found = this.formData.contato.find(
          (contact) => contact.preferential == true
        )
        if (found == '' || found == null) {
          return true
        } else {
          return false
        }
      }
    },
    async submitForm() {
      const hasError = this.contactHasError()

      if (hasError) {
        this.$swal({
          icon: 'error',
          title: 'Selecione um contato preferencial',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        this.formData.telefones.fixos = this.formData.telefonesFixos
        this.formData.telefones.moveis = this.formData.telefonesMoveis
        this.formData.contato = this.formData.contato.map(
          ({ name, position, document_value, preferential, ...contact }) => ({
            nome: name,
            cargo: position,
            documento: document_value,
            preferencial: preferential,
            ...contact,
          })
        )
        this.$v.formData.$touch()
        if (this.$v.formData.$error) return

        this.$v.association.$touch()
        if (this.identifierFromAddParterForm && this.$v.association.$error)
          return

        if (this.formData.emails) {
          this.formData.emails = this.formData.emails.filter(
            (list) => list.email != ''
          )
        } else {
          this.formData.emails = []
        }

        if (this.isEditing && !this.existingCompany) {
          console.log('formData isEditing', this.formData)
          const { contato, ...content } = this.formData
          await this.handleAccounting()
          await this.$store.dispatch('Partner/updPartner', content)
          this.$store.dispatch('Partner/refresh', true)
          this.$store.dispatch('Company/refresh', true)
          this.$store.dispatch('BureauCompany/refresh', true)
        } else if (this.identifierFromAddParterForm) {
          var responsePut = await this.$store.dispatch(
            'Partner/addPartner',
            this.formData
          )
          this.$store.dispatch('Partner/refresh', true)
          this.$store.dispatch('Company/refresh', true)
          this.$store.dispatch('BureauCompany/refresh', true)
          this.association.left_side_id = responsePut.data.id
          this.association.right_side_id = this.companyId
          await this.$store.dispatch('addAssociation', this.association)
          // TODO: avaliar erro
          const { data } = await this.getList(
            '/customer/association',
            `includes=left_side,association_type&right_side_id=${this.association.right_side_id}`
          )
          this.associations = data
        } else {
          await this.$store.dispatch('Partner/addPartner', this.formData)
          this.$store.dispatch('Partner/refresh', true)
          this.$store.dispatch('Company/refresh', true)
          this.$store.dispatch('BureauCompany/refresh', true)
        }
        this.searching = false
        this.noData = false
        this.searchDone = false
        this.$refs.form.reset()
        this.$v.$reset()
        this.$emit('closeForm')
      }
    },
    async getPartner(itemId) {
      let cnae = ''

      const partner = await this.getItem(
        'customer/company',
        `includes=medias.media_type,memberships,contacts.contact.medias,cnaes.cnae.cnae_class,contacts.contact_positions,addresses&id=${itemId}`
      )
      const {
        created_at,
        updated_at,
        cnaes,
        addresses,
        contacts,
        medias,
        memberships,
        ...content
      } = partner
      cnaes.length > 0 && (cnae = cnaes[0].cnae_code)
      memberships?.length > 0 &&
        (this.formData.team_id = memberships[0].team_id)
      this.formData = { ...this.formData, ...content, id: itemId, cnae }
      this.formData.enderecos = addresses.map((address) => ({
        id: address.id,
        logradouro: address.location,
        cidade: address.city,
        cep: address.zipcode,
        bairro: address.neighborhood,
        numero: address.number,
        complemento: address.complement,
        uf: address.state,
      }))
      this.formData.contato = contacts.map(
        ({
          contact: { id, name, document_value, origin },
          preferential,
          id: relationalId,
          contact_positions,
        }) => ({
          id,
          name,
          position:
            contact_positions.length > 0
              ? contact_positions.at(-1).position
              : '',
          document_value,
          origin,
          preferential,
          relationalId,
        })
      )
      this.formData.emails = medias
        .filter((media) => media?.media_type?.base == 'mail')
        .map(({ value, id }) => ({ id, email: value }))
      this.formData.telefonesFixos = medias
        .filter((media) => media?.media_type?.base == 'landline')
        .map(({ value, id }) => ({ id, telefone: value }))
      this.formData.telefonesMoveis = medias
        .filter((media) => media?.media_type?.base == 'mobile')
        .map(({ value, id }) => ({ id, telefone: value }))
    },
    async getEnhance() {
      this.searching = true
      try {
        await this.$store.dispatch(
          'fetchEnhance',
          `cnpj=${this.formData.identifier}`
        )
      } catch (error) {
        console.log(error)
      }
    },
    async getAssociations(itemId) {
      this.accountingAssociation.right_side_id = itemId
      const { data } = await this.getList(
        '/customer/association',
        `includes=left_side,association_type&right_side_id=${itemId}`
      )
      this.associations = data
    },
    async handleAccounting() {
      const { accounting } = this.formData
      if (accounting == 'internal') {
        if (this.accountingList.length > 0) {
          const [{ id }] = this.accountingList
          await this.$store.dispatch('deleteAssociation', id)
        }
      } else {
        if (
          this.accountingList.length == 0 &&
          this.accountingAssociation.left_side_id
        ) {
          const { id } = await this.getItem(
            '/customer/association-type',
            'category=accountant'
          )
          this.accountingAssociation.association_type_id = id
          await this.$store.dispatch(
            'addAssociation',
            this.accountingAssociation
          )
          this.accountingAssociation.left_side_id = null
          this.accountingAssociation.association_type_id = null
        }
      }
      this.getAssociations(this.companyId)
    },
    async deleteAccounting() {
      const [{ id }] = this.accountingList
      await this.$store.dispatch('deleteAssociation', id)
      this.getAssociations(this.companyId)
    },
    async handleSearch() {
      this.searchDone = false
      let isAvailable = false
      if (!this.isEditing) {
        const identifier = this.formData.identifier
          .replaceAll('.', '')
          .replaceAll('/', '')
          .replaceAll('-', '')
        try {
          const {
            data: { available },
          } = await this.$axios.get(
            `/customer/company-availability/${identifier}`
          )
          isAvailable = available
        } catch (error) {
          console.log('identifier', this.formData.identifier_type)
          if (this.formData.identifier_type == 'cnpj') {
            this.$swal({
              icon: 'error',
              title: 'CNPJ inválido',
            })
          } else {
            this.$swal({
              icon: 'error',
              title: 'CPF inválido',
            })
          }
          return
        }
        if (!isAvailable) {
          this.$swal({
            icon: 'warning',
            title: 'Empresa ja cadastrada',
          })
        } else {
          await this.getEnhance()
        }
      }
    },
    removeAddress(id, index) {
      if (id) {
        this.$axios.delete(`/customer/customer-address/${id}`)
      }
      const newAddresses = this.formData.enderecos.filter(
        (address, i) => i != index
      )
      this.formData = { ...this.formData, enderecos: newAddresses }
    },
    removePhone(id, index, phoneType) {
      if (id) {
        this.$axios.delete(`/customer/customer-media/${id}`)
      }
      const newPhones = this.formData[phoneType].filter(
        (phone, i) => i != index
      )
      this.formData = { ...this.formData, [phoneType]: newPhones }
    },
    removeEmail(id, index) {
      if (id) {
        this.$axios.delete(`/customer/customer-media/${id}`)
      }
      const newEmails = this.formData.emails.filter((emails, i) => i != index)
      this.formData = { ...this.formData, emails: newEmails }
    },
    removeContact(index) {
      const newContacts = this.formData.contato.filter(
        (associate, i) => i != index
      )
      this.formData = { ...this.formData, contato: newContacts }
    },
    async loadForm() {
      this.searching = false
      this.formData.identifier_type = 'cnpj'
      this.formData.state = 'new'
      const { data } = await this.$axios.get('/cash/my-pipelines')
      this.myPipelines = data
      !this.isEditing && (this.formData.team_id = this.userTeam)
      if (this.isEditing) {
        this.contactsAction = 'Contact/deleteContact'
        this.searchDone = true
        if (!this.companyId) {
          this.createCompanyFromBureau()
        } else {
          await this.getPartner(this.companyId)
          await this.getAssociations(this.companyId)
          this.searching = false
        }
      }
    },
    handleCancel() {
      this.searching = false
      this.noData = false
      this.searchDone = false
      this.$refs.form.reset()
      this.$v.$reset()
      this.$store.dispatch('BureauCompany/refresh', true)
    },
    addNewAddress() {
      this.formData.enderecos.push({
        logradouro: null,
        numero: null,
        complemento: null,
        cidade: null,
        uf: null,
        cep: null,
      })
    },
    async cepSearch(searchedCep) {
      searchedCep = this.onlyNumbers(searchedCep)
      const { logradouro, localidade, uf } = await this.$viaCep.buscarCep(
        searchedCep
      )
      const i = this.formData.enderecos.findIndex(
        (e) =>
          e.cep ==
          searchedCep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})+?$/, '$1-$2')
      )
      this.formData.enderecos[i].logradouro = logradouro.toUpperCase()
      this.formData.enderecos[i].cidade = localidade.toUpperCase()
      this.formData.enderecos[i].uf = uf.toUpperCase()
    },
    addContact(payload) {
      this.formData.contato.push(payload)
    },
    addEmail() {
      if (!Array.isArray(this.formData.emails)) {
        this.formData.emails = []
      }
      this.formData.emails.push({
        email: '',
      })
    },
    updContact(payload) {
      if (payload.id) {
        const contactIndex = this.formData.contato.findIndex(contact => contact.id === payload.id)

        this.formData.contato.splice(contactIndex, 1)
        this.formData.contato.push(payload)
      }
    },
    handlePreferentialCheck(item) {
      const { value, index, id } = item
      if (id) {
        this.updateData('/customer/company-contact', {
          id,
          preferential: value,
        })
      } else {
        this.formData.contato[index].preferential = value
      }
    },
    async createCompanyFromBureau() {
      const identifier = this.item.cnpj.replace(/[^A-Z0-9]/gi, '')
      const {
        data: { data },
      } = await this.$axios.put(
        `/customer/official-data-by-identifier?identifier=${identifier}`
      )
      this.companyId = data.id
    },
  },
}
</script>
