<template>
  <v-form id="form-company" ref="form">
    <v-row v-if="!readingMode" id="form-row">
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
              data-test="selectCompanyFormIdentifierType"
              attach
              label="Tipo de documento"
              v-model="formData.identifier_type"
              :items="typeDocument"
              item-value="value"
              item-text="label"
              required
              outlined
              dense
              :disabled="isEditing || !!identifierFromAddCompanyForm"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col xl="10" lg="10" class="pt-0">
            <v-text-field
              data-test="inputCompanyFormIdentifier"
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
              data-test="selectCompanyFormIdentifierFromAddCompanyForm"
              attach
              v-if="identifierFromAddCompanyForm"
              label="Tipo de associação"
              v-model="association.identifierFromAddCompanyForm"
              :items="associationTypeList"
              item-value="id"
              item-text="name"
              required
              outlined
              dense
            />
          </v-col>
          <v-col v-if="!isEditing" xl="2" lg="2" class="pt-0">
            <v-btn
              data-test="btnCompanyFormSearch"
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
      <p class="subtitle-2 font-weight-bold" v-if="!searching && !readingMode">
        Escolha o documento e digite os dados
      </p>
    </div>

    <div v-if="searchDone" class="mt-4">
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
                  data-test="selectCompanyFormState"
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
                  data-test="selectCompanyFormPartnership"
                  v-if="formData.partnership"
                  label="Status do parceiro"
                  v-model="formData.partnership"
                  :items="meta.customerPartnership"
                  item-value="value"
                  item-text="name"
                  outlined
                  dense
                  :readonly="true"
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
                  data-test="selectCompanyFormTeam"
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
                ></v-select>
              </v-col>
              <v-col xl="4" lg="4" md="4" sm="4" cols="12" class="pb-0">
                <v-select
                  data-test="selectCompanyFormPipeline"
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
                  data-test="inputCompanyFormLegalName"
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
                  data-test="inputCompanyFormName"
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
                  data-test="inputCompanyFormEmployess"
                  number
                  label="Número de funcionários"
                  v-model="formData.nbr_employess"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                ></v-text-field>
                <v-select
                  data-test="selectCompanyFormTaxModel"
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
                  data-test="inputCompanyFormCnae"
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
                  data-test="inputCompanyFormYearRevenue"
                  label="Receita anual"
                  :value="formData.year_revenue"
                  required
                  outlined
                  dense
                  :readonly="readingMode"
                  @inputValue="(value) => { formData.year_revenue = value }"
                />                
                <v-textarea
                  data-test="textareaCompanyFormDescription"
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
                  data-test="selectCompanyFormSize"
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
                  data-test="selectCompanyFormHierarchicalClassification"
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
                  data-test="selectCompanyFormLegalState"
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
                  data-test="inputCompanyFormCep"
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
                  data-test="inputCompanyFormAddress"
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
                  data-test="inputCompanyFormNumber"
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
                  data-test="inputCompanyFormComplement"
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
                  data-test="inputCompanyFormNeighborhood"
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
                  data-test="inputCompanyFormCity"
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
                  data-test="inputCompanyFormUf"
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
                  data-test="btnCompanyFormRemoveAddress"
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

            <v-row v-if="formData.enderecos">
              <v-btn
                data-test="btnCompanyFormAddAddress"
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
                  data-test="tableCompanyFormContacts"
                  :headers="header"
                  :items="formData.contato"
                  :isLoading="!searchDone"
                  :delete-action="contactsAction"
                  :checkbox-option="!readingMode ? 'Preferencial' : ''"
                  :action-options="!readingMode ? true : false"
                  @removeItem="removeContact"
                  @onCheck="handlePreferentialCheck"
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
                        :associated-company-id="itemId"
                        :by-details="false"
                        :onCompanyCreate="!isEditing"
                        @updateData="updContact"
                      />
                    </template>
                  </Sheet>
                </GenericTable>
              </v-col>
            </v-row>
            <v-row>
              <Sheet
                createContact
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
                    @checkIfHasId="checkIfHasId"
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
                <p class="subtitle-2 font-weight-bold mb-2">Telefones</p>
                <v-divider class="mb-4"></v-divider>
                <v-row
                  v-for="(telefone, i) in formData.telefones"
                  :key="i"
                >
                  <v-col xl="6" class="pb-0">
                    <v-text-field
                      data-test="inputCompanyFormPhone"
                      label="Telefone"
                      v-model="telefone.telefone"
                      required
                      v-mask="maskPhone(telefone.telefone)"
                      outlined
                      dense
                      @keyup="telefone.user = true"
                      :readonly="readingMode"
                      :rules="phoneRules"
                      :messages="phoneValidationMessages"
                    ></v-text-field>
                  </v-col>
                  <v-col xl="1" class="pb-0">
                    <v-btn
                      data-test="btnCompanyFormRemovePhone"
                      fab
                      icon
                      small
                      color=""
                      class="ml-5"
                      @click="removePhone(telefone.id, i, 'telefones')"
                      v-show="!readingMode"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row class="justify-left" v-if="!readingMode">
              <v-col cols="6">
                <v-btn
                  data-test="btnCompanyFormAddPhone"
                  color="secondary"
                  fab
                  small
                  @click="addTelephone"
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
                      data-test="inputCompanyFormEmail"
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
                      data-test="btnCompanyFormRemoveEmail"
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
            <v-row class="justify-left" v-if="!readingMode">
              <v-col cols="12">
                <v-btn
                  data-test="btnCompanyFormAddEmail"
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
                  data-test="inputCompanyFormWebsite"
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
        <AssociationAccordion
          :company-id="companyId"
          :show-form="!readingMode"
        />
        <v-expansion-panel>
          <v-expansion-panel-header disable-icon-rotate expand-icon="">
            <template v-slot:default>
              <div class="w-100 d-flex justify-start align-center">
                <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                <p class="mb-0">Mapeamento da carteira do Contador</p>
              </div>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col class="py-1">
                <span class="body-2 default-text--text">
                  Insira o número de empresas da carteira do Contador conforme o enquadramento tributário.
                </span>
              </v-col>
            </v-row>
            <v-row v-for="(value, type) in numberOfCustomers" :key="type">
              <v-col xl="4" lg="6" md="6" sm="6" cols="9" class="pb-0">
                <v-text-field
                  :data-test="`inputCompanyForm-${type}`"
                  required
                  outlined
                  dense
                  disabled
                  hide-details
                  :value="type === 'nao_especificado' ? 'Não especificado' : getEnum(type, meta.taxModel)"
                ></v-text-field>
              </v-col>
              <v-col xl="2" lg="3" md="3" sm="3" cols="3" class="pb-0">
                <v-text-field
                  :data-test="`inputCompanyForm-${type}-value`"
                  required
                  outlined
                  dense
                  hide-details
                  placeholder="00"
                  min="0"
                  type="number"
                  v-model="numberOfCustomers[type]"
                  :readonly="readingMode"
                  @input="getNumberOfCustomersTotal()"
                  oninput="if(this.value < 0) this.value = 0"
                  @keypress="handleNumberInput($event)"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col xl="6" lg="9" md="9" sm="9" cols="12" class="pt-3 pb-0">
                <v-divider class="my-1"></v-divider>
              </v-col>
            </v-row>
            <v-row>
              <v-col xl="4" lg="6" md="6" sm="6" cols="9" class="pb-1">
                <div class="mt-2 ml-2">
                  <span>Número total de empresas da carteira</span>
                </div>
              </v-col>
              <v-col xl="2" lg="3" md="3" sm="3" cols="3" class="pb-1">
                <v-text-field
                  data-test="inputCompanyFormNumberOfCustomersTotal"
                  required
                  outlined
                  dense
                  disabled
                  hide-details
                  placeholder="00"
                  :value="numberOfCustomersTotal"
                ></v-text-field>
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
import requiredIf from 'vuelidate/lib/validators/requiredIf'
import { mapGetters } from 'vuex'
export default {
  props: {
    itemId: Number,
    sheet: Boolean,
    isEditing: Boolean,
    readingMode: Boolean,
    title: String,
    identifierFromAddCompanyForm: String,
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
    associationList: [],
    associationTypeList: [],
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
      partnership: 'non_applicable',
      cnae: '',
      cnaeDescricao: '',
      is_main_cnae: true,
      accounting: '',
      contato: [],
      telefones: [],
      enderecos: [],
      emails: [],
    },
    association: {
      left_side_id: null,
      right_side_id: null,
      association_type_id: null,
      identifierFromAddCompanyForm: null,
      formCompany: null,
    },
    companyToAssociate: {},
    companyToAccounting: {},
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
      neighborRules: [(v) => !!v || 'Bairro é obrigatório'],
    },
    numberOfCustomers: {},
    numberOfCustomersTotal: null,
  }),
  validations: {
    formData: {
      identifier: { required },
      name: { required },
      legalName: {
        required: requiredIf(function () {
          return this.formData.identifier_type == 'cnpj'
        }),
      },
      cnae: {
        required: requiredIf(function () {
          return this.formData.identifier_type == 'cnpj'
        }),
      },
    },
    association: {
      association_type_id: { required },
    },
  },
  created() {
    this.itemId && (this.companyId = this.itemId)
  },
  async mounted() {
    await this.loadForm(true)
    if (this.identifierFromAddCompanyForm) {
      this.formData.identifier = this.identifierFromAddCompanyForm
      await this.$store.dispatch('fetchAssociationType')
      const ignoredCategories = ['group']
      this.associationTypeList = this.associationType.filter((association) => {
        return !ignoredCategories.includes(association.category)
      })
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
      associations: 'associations',
    }),
  },
  watch: {
    formattedEnhance(newValue) {
      this.searching = false
      this.searchDone = true
      if (newValue.name == '' && newValue.legalName == '') {
        this.noData = true
        this.$swal({
          icon: 'warning',
          title: 'A pesquisa não retornou dados. Por favor, preencha os valores manualmente',
          target: document.getElementById('form-company')
        })
      }
      this.formData = { ...this.formData, ...newValue }
    },
    associations(newValue) {
      this.associationList = newValue.filter(
        ({ association_type: { category } }) =>
          category != 'accountant' && category != 'group'
      )
      this.accountingList = newValue.filter(
        ({ association_type: { category } }) => category == 'accountant'
      )
    },
    async sheet(newValue) {
      if (newValue) {
        await this.loadForm()
      }
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
      if (!this.itemId) {
        this.loadForm()
      }
    },
  },
  methods: {
    checkIfHasId() {
      if(this.companyId) {
        this.$root.$emit('bureauCompanyCreated', this.companyId)
      }
    },
    async contactHasError() {
      if(this.formData.contato.length == 1) {
        this.formData.contato[0].preferential = true
        const payload = {
          id: this.formData.contato[0].relationalId,
          index: 0,
          value: true
        }
        await this.handlePreferentialCheck(payload)
      }
      if(this.formData.contato.length) {
        const found = this.formData.contato.find((contact) => contact.preferential == true)
        if(found == '' || found == null) {
          return true
        }else {
          return false
        }
      }
      return false
    },
    async submitForm() {
      var hasError = await this.contactHasError()
      if (hasError) {
        this.$swal({
          icon: 'warning',
          html: `
            <h3>Atenção!</h3>
            <p class="mb-0">É necessário selecionar um contato preferencial.</p>
          `,
          showConfirmButton: true,
          target: document.getElementById('form-row')
        })
      } else {
        if (this.association.identifierFromAddCompanyForm)
          this.association.association_type_id =
            this.association.identifierFromAddCompanyForm
        this.$v.formData.$touch()
        this.$v.association.$touch()
        if (this.$v.formData.$error) return
        if (this.identifierFromAddCompanyForm && this.$v.association.$error)
          return

        const payload = Object.assign({}, this.formData)

        payload.contato = this.formData.contato.map(
          ({ name, position, document_value, preferential, ...contact }) => ({
            nome: name,
            cargo: position,
            documento: document_value,
            preferencial: preferential,
            ...contact,
          })
        )

        if (payload.emails) {
          payload.emails = this.formData.emails.filter(
            (list) => list.email != ''
          )
        } else {
          payload.emails = []
        }
        this.formData.number_of_customers = this.numberOfCustomers
        if (this.isEditing && !this.existingCompany) {
          const { contato, ...content } = payload
          await this.handleAccounting()
          await this.$store.dispatch('Company/updCompany', content)
          this.$store.dispatch('Partner/refresh', true)
          this.$store.dispatch('Company/refresh', true)
          this.$store.dispatch('BureauCompany/refresh', true)
        } else if (this.identifierFromAddCompanyForm) {
          var responsePut = await this.$store.dispatch(
            'Partner/addPartner',
            payload
          )
          this.$store.dispatch('Partner/refresh', true)
          this.$store.dispatch('Company/refresh', true)
          this.$store.dispatch('BureauCompany/refresh', true)
          this.association.left_side_id = this.$route.params.id
          this.association.right_side_id = responsePut.data.id
          await this.$store.dispatch('addAssociation', this.association)

          // TODO: avaliar erro
          await this.$store.dispatch(
            'fetchAssociations',
            `includes=right_side,association_type&left_side_id=${this.association.left_side_id}`
          )
          //
        } else {
          await this.$store.dispatch('Company/addCompany', payload)
          this.$store.dispatch('Partner/refresh', true)
          this.$store.dispatch('Company/refresh', true)
          this.$store.dispatch('BureauCompany/refresh', true)
        }
        this.searching = false
        this.noData = false
        this.searchDone = false
        this.$refs.form.reset()
        this.$v.$reset()
        this.$emit('closeForm', true)
      }
    },
    async getCompany(itemId) {
      let cnae = ''
      const company = await this.getItem(
        'customer/company',
        'includes=customers_qualification&' +
        `also=medias.media_type,memberships,contacts.contact.medias,cnaes.cnae.cnae_class,contacts.contact_positions,addresses&id=${itemId}`
      )

      const {
        created_at,
        updated_at,
        cnaes,
        addresses,
        contacts,
        medias,
        memberships,
        customers_qualification,
        ...content
      } = company

      let identifier = company.identifier
      cnae = cnaes?.find((c) => c.is_main_cnae)?.cnae_code ?? cnaes?.at(0)?.cnae_code

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
      this.formData.telefones = medias
        .filter((media) => media?.media_type?.base == 'mobile')
        .map(({ value, id }) => ({ id, telefone: value }))
      this.getNumberOfCustomers(customers_qualification)
      //Prevent identifier to get lost upon identifier_type change (SQD5-110)
      let self = this
      this.$nextTick(() => {
        self.formData.identifier = identifier
      })
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
      this.association.right_side_id = itemId
      this.accountingAssociation.right_side_id = itemId

      await this.$store.dispatch(
        'fetchAssociations',
        `includes=left_side,association_type&right_side_id=${itemId}`
      )
    },
    async handleAssociation() {
      const { id = null, identifier = null } = this.companyToAssociate || {}
      if (id) {
        this.association.left_side_id = id
      } else {
        if (identifier) {
          try {
            const {
              data: { data },
            } = await this.$axios.put(
              `/customer/official-data-by-identifier?identifier=${identifier}`
            )
            const [companyCreated] = data
            this.association.left_side_id = companyCreated.id
          } catch (error) {
            return
          }
        }
      }
      if (this.association.left_side_id) {
        await this.$store.dispatch('addAssociation', this.association)
        this.getAssociations(this.companyId)
        this.companyToAssociate = {}
        this.association.left_side_id = null
        this.association.association_type_id = null
        this.$refs.associationAutocomplete.clearCachedItems()
        this.$refs.associationTypeAutocomplete.clearCachedItems()
      }
    },
    async handleAccounting() {
      const { local_company_id = null, cnpj = null } =
        this.companyToAccounting || {}
      if (local_company_id) {
        this.accountingAssociation.left_side_id = local_company_id
      } else {
        if (cnpj) {
          try {
            const {
              data: { data },
            } = await this.$axios.put(
              `/customer/official-data-by-identifier?identifier=${cnpj}`
            )
            const [companyCreated] = data
            this.accountingAssociation.left_side_id = companyCreated.id
          } catch (error) {
            return
          }
        }
      }
      const { accounting } = this.formData
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
        this.updateData(
          '/customer/company',
          { id: this.companyId, accounting },
          { fireSuccessAlert: false }
        )
        this.companyToAccounting = {}
        this.accountingAssociation.left_side_id = null
        this.accountingAssociation.association_type_id = null
        this.$refs.accountingAutocomplete.clearCachedItems()
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
          if (this.formData.identifier_type == 'cnpj') {
            this.$swal({
              icon: 'error',
              title: 'CNPJ inválido',
              target: document.getElementById('form-company')
            })
          } else {
            this.$swal({
              icon: 'error',
              title: 'CPF inválido',
              target: document.getElementById('form-company')
            })
          }
          return
        }
        if (!isAvailable) {
          this.$swal({
            icon: 'warning',
            title: 'Empresa ja cadastrada',
            target: document.getElementById('form-company')
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
    async loadForm(onMounted = false) {
      this.formData.identifier_type = 'cnpj'
      this.formData.state = 'new'
      const { data } = await this.$axios.get('/cash/my-pipelines')
      this.myPipelines = data
      !this.isEditing && (this.formData.team_id = this.userTeam)
      if (this.isEditing) {
        this.searching = true
        this.contactsAction = 'Contact/deleteContact'
        if (!this.companyId) {
          this.createCompanyFromBureau()

        } else {
          await this.getCompany(this.companyId)
          if (!onMounted) await this.getAssociations(this.companyId)
          this.searchDone = true
          this.searching = false
        }
      } else {
        this.getNumberOfCustomers([])
      }
    },
    handleCancel() {
      this.searching = false
      this.noData = false
      this.searchDone = false
      this.$refs.form.reset()
      this.$v.$reset()
      this.$store.dispatch('BureauCompany/refresh', true)
      this.$store.dispatch('Company/refresh', true)
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
    cepSearch(searchedCep) {
      searchedCep = this.onlyNumbers(searchedCep)
      this.$viaCep
        .buscarCep(searchedCep)
        .then(({ logradouro, localidade, uf }) => {
          const i = this.formData.enderecos.findIndex(
            (e) =>
              e.cep ==
              searchedCep
                .replace(/\D/g, '')
                .replace(/^(\d{5})(\d{3})+?$/, '$1-$2')
          )
          this.formData.enderecos[i].logradouro = logradouro.toUpperCase()
          this.formData.enderecos[i].cidade = localidade.toUpperCase()
          this.formData.enderecos[i].uf = uf.toUpperCase()
        })
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
    addTelephone() {
      if (!Array.isArray(this.formData.telefones)) {
        this.formData.telefones = []
      }
      this.formData.telefones.push({
        telefone: '',
      })
      this.$forceUpdate()
    },
    updContact(payload) {
      if (payload.id) {
        const contactIndex = this.formData.contato.findIndex(contact => contact.id === payload.id)

        this.formData.contato.splice(contactIndex, 1)
        this.formData.contato.push(payload)
      }
    },
    associationTypefilter(type) {
      const ignoredCategories = ['group', 'accountant']
      return !ignoredCategories.includes(type.category)
    },
    handlePreferentialCheck(item) {
      const { value, index, id } = item
      if(id) {
        this.updateData('/customer/company-contact', {id, preferential: value}, { fireSuccessAlert: false })
      }else {
        this.formData.contato[index].preferential = value
      }
    },
    async createCompanyFromBureau() {
      const identifier = this.item?.cnpj.replace(/[^A-Z0-9]/gi, '')
      const {
        data: { data },
      } = await this.$axios.put(
        `/customer/official-data-by-identifier?identifier=${identifier}`
      )
      const [companyCreated] = data
      this.companyId = companyCreated.id
      this.$emit('updateCompany')
    },
    getNumberOfCustomers(values) {
      for (const taxModel of this.meta.taxModel) {
        this.numberOfCustomers[taxModel.value] = null
      }
      this.numberOfCustomers['nao_especificado'] = null
      for (const value of values) {
        if (value.tax_model) {
          this.numberOfCustomers[value.tax_model] = value.number_of_customers
        } else {
          this.numberOfCustomers['nao_especificado'] = value.number_of_customers
        }
      }
      this.getNumberOfCustomersTotal()
    },
    getNumberOfCustomersTotal() {
      this.numberOfCustomersTotal = Object.values(this.numberOfCustomers).reduce((a, b) => Number(a) + Number(b))
    },
    handleNumberInput(evt) {
      const keysAllowed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      const keyPressed = evt.key
      if (!keysAllowed.includes(keyPressed)) {
        evt.preventDefault()
      }
    }
  },
}
</script>