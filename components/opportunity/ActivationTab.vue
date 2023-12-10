<template>
  <div>
    <section class="w-100 d-flex justify-end align-center mb-5">
      <div v-if="!loadingData">
        <OpportunityActivationView
          v-if="hasActivatedInvoice"
          :opportunity-id="opportunityId"
          :invoice="invoiceInActivation"
          @onActivationSent="refreshInvoice"
        />
        <OpportunityActivationForm
          v-else
          :opportunity-id="opportunityId"
          :activation-steps="activationSteps"
          :invoice="invoiceInActivation"
          :is-disabled="checkAllSteps()"
          @onActivationSent="refreshInvoice"
        />
      </div>
      <v-progress-linear v-else indeterminate></v-progress-linear>
    </section>
    <v-expansion-panels v-model="activationStep">
      <v-expansion-panel class="v-expansion-panel-no-shadow">
        <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionActivationStart">
          <template v-slot:default>
            <div class="w-100 d-flex justify-start align-center">
              <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
              <p class="mb-0">Proposta pré-existente</p>
              <v-icon small :color="selectedInvoiceId ? 'success' : 'stroke'" class="ml-1">
                {{ 'mdi-check-circle' }}
              </v-icon>
            </div>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list
            dense
            subheader
            two-line
          >
            <v-subheader class="font-body-large">
              <span class="mr-1">
                {{`Selecione uma Proposta pré-existente${!opportunityActivated ?' ou' : '.'}`}}
              </span>
              <a
                v-if="!opportunityActivated"
                data-test="linkActivationNewProposal"
                href="" 
                class="no-text-decoration" 
                @click="handleChangeToProposalTab"
              >
                crie uma nova proposta expressa.
              </a>
            </v-subheader>
            <v-radio-group
              data-test="radioActivationSelect"
              class="mt-0"
              v-model="invoiceId" 
            >
              <v-list-item v-for="(item, index) in invoices" :key="index">
                <v-list-item-action>
                  <v-radio
                    :value="item.id"
                    :disabled="hasActivatedInvoice"
                  ></v-radio>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title class="d-flex font-body-large">
                    <span class="align-self-center">{{`Proposta #${item.index + 1}`}}</span>
                    <OpportunityProposalView :invoice="item" />
                  </v-list-item-title>
                  <v-list-item-subtitle class="font-body-medium mb-2">
                    <span>
                      {{ `Responsável: ${item.user_name ? item.user_name : '--'} | Data: ${$moment(item.created_at).format('L')}` }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-radio-group>
          </v-list>
          <section class="d-flex justify-end align-center">
            <v-btn
              v-if="selectedInvoiceId && (selectedInvoiceId !== invoiceId)"
              color="primary"
              data-test="btnActivationChange"
              :loading="loadingRequest"
              :disabled="hasActivatedInvoice"
              @click="restartActivation"
            >
              {{'Trocar proposta'}}
            </v-btn>
            <v-btn
              v-else
              color="primary"
              data-test="btnActivationStart"
              :disabled="selectedInvoiceId === invoiceId"
              :loading="loadingRequest"
              @click="startActivation"
            >
              {{hasInvoiceInActivation ? 'Proposta em ativação' : 'Seguir para ativação'}}
            </v-btn>
          </section>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-if="activationSteps.activation_fields" class="v-expansion-panel-no-shadow">
        <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionActivationField">
          <template v-slot:default>
            <div class="d-flex justify-start align-center">
              <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
              <p class="mb-0">Produtos Negociados</p>
              <v-icon small :color="activationSteps.activation_fields.completed ? 'success' : 'stroke'" class="ml-1">
                {{ 'mdi-check-circle' }}
              </v-icon>
            </div>
          </template>
          <template v-slot:actions>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row class="mb-3">
            <v-col xl="3" lg="3" class="d-flex align-center py-0 small-text">
              <label>{{`Proposta #${invoiceInActivationIndex + 1}`}}</label>
            </v-col>
            <v-col xl="9" lg="9" class="d-flex align-center py-0 small-text">
              <v-col xl="2" lg="2" class="py-0 px-1">
                <label>Produto</label>
              </v-col>
              <v-col xl="2" lg="2" class="py-0 px-1">
                <label>Valor</label>
              </v-col>
              <v-col xl="2" lg="2" class="py-0 px-1">
                <label>Pagamento</label>
              </v-col>
              <v-col xl="2" lg="2" class="py-0 px-1">
                <label>Dia</label>
              </v-col>
              <v-col xl="2" lg="2" class="py-0 px-1">
                <label>Método</label>
              </v-col>
              <v-col xl="2" lg="2" class="py-0 px-1">
                <label>Parcelas</label>
              </v-col>
            </v-col>
          </v-row>
          <section v-for="(item, index) in activationSteps.activation_fields.productsByCompanies" :key="index">
            <v-divider></v-divider>
            <v-row class="pt-1">
              <v-col xl="3" lg="3" class="d-flex align-center small-text">
                <v-icon class="mr-6">mdi-store</v-icon>
                <div class="d-flex flex-column mr-4">
                  <span>{{item.customer.name | truncate(40)}}</span>
                  <span>{{item.customer.identifier}}</span>
                </div>
              </v-col>
              <v-col xl="9" lg="9">
                <div v-for="product in item.products" :key="product.id" class="d-flex">
                  <v-col xl="2" lg="2" class="d-flex flex-column justify-center align-start px-1">
                    <span class="small-text align-center">
                      {{`${product.amount}x ${product.product.name}`}}
                    </span>
                  </v-col>
                  <v-col xl="2" lg="2" class="d-flex align-center px-1">
                    <span class="small-text align-center">
                      {{`R$ ${maskMoney('pt-br', product.value * product.amount)}`}}
                    </span>
                  </v-col>
                  <v-col xl="2" lg="2" class="px-1">
                    <div v-if="product.fields.find((field) => field.name === 'billing_cadence')">
                      <v-select
                        attach
                        v-if="product.product.payment === 'Único'"
                        outlined
                        dense
                        hide-details
                        disabled
                        data-test="selectActivationCadence"
                        :value="'Sem recorrência'"
                        :items="['Sem recorrência']"
                      ></v-select>
                      <v-select
                        attach
                        v-else
                        outlined
                        dense
                        hide-details
                        data-test="selectActivationCadence"
                        v-model="product.fields[product.fields.findIndex((field) => field.name === 'billing_cadence')].value"
                        :items="generateCadenceItems(product.fields[product.fields.findIndex((field) => field.name === 'billing_cadence')].items)"
                        :disabled="hasActivatedInvoice || !product.bundle_parent && disableCadence(product.fields[product.fields.findIndex((field) => field.name === 'billing_cadence')].items)"
                      ></v-select>
                    </div>
                  </v-col>
                  <v-col xl="2" lg="2" class="px-1">
                    <v-select
                      v-if="product.fields.find((field) => field.name === 'due_date')"
                      attach
                      outlined
                      dense
                      hide-details
                      data-test="selectActivationDueDate"
                      v-model="product.fields[product.fields.findIndex((field) => field.name === 'due_date')].value"
                      :items="product.fields[product.fields.findIndex((field) => field.name === 'due_date')].items"
                      :disabled="hasActivatedInvoice"
                    ></v-select>
                  </v-col>
                  <v-col xl="2" lg="2" class="px-1">
                    <v-select
                      v-if="product.fields.find((field) => field.name === 'payment')"
                      attach
                      outlined
                      dense
                      hide-details
                      data-test="selectActivationPayment"
                      v-model="product.fields[product.fields.findIndex((field) => field.name === 'payment')].value"
                      :items="product.fields[product.fields.findIndex((field) => field.name === 'payment')].items"
                      :disabled="hasActivatedInvoice"
                    ></v-select>
                  </v-col>
                  <v-col xl="2" lg="2" class="px-1">
                    <v-select
                      v-if="product.fields.find((field) => field.name === 'installments')"
                      attach
                      outlined
                      dense
                      hide-details
                      data-test="selectActivationInstallments"
                      v-model="product.fields[product.fields.findIndex((field) => field.name === 'installments')].value"
                      :items="product.fields[product.fields.findIndex((field) => field.name === 'installments')].items"
                      :disabled="hasActivatedInvoice"
                    ></v-select>
                  </v-col>
                </div>
              </v-col>
            </v-row>
          </section>
          <section class="d-flex justify-end align-center mt-4">
            <v-btn
              data-test="btnActivationFieldsSave"
              color="primary"
              min-width="140"
              :disabled="checkStep('activation_fields') || hasActivatedInvoice"
              :loading="loadingRequest"
              @click="saveProductStep(activationSteps.activation_fields.productsByCompanies, 'activation_fields')"
            >
              Salvar
            </v-btn>
          </section>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-if="activationSteps.activation_responsible" class="v-expansion-panel-no-shadow">
        <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionActivationResponsible">
          <template v-slot:default>
            <div class="w-100 d-flex justify-start align-center">
              <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
              <p class="mb-0">Responsáveis</p>
              <v-icon small :color="activationSteps.activation_responsible.completed ? 'success' : 'stroke'" class="ml-1">
                {{ 'mdi-check-circle' }}
              </v-icon>
            </div>
          </template>
          <template v-slot:actions>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content eager>
          <v-row class="mb-3">
            <v-col xl="4" lg="4" class="d-flex align-center py-0">
            </v-col>
            <v-col class="d-flex align-center py-0">
              <v-col xl="4" lg="4" class="py-0">
                <label>Produto</label>
              </v-col>
              <v-col xl="4" lg="4" class="py-0">
                <label>Responsável Financeiro</label>
              </v-col>
              <v-col xl="4" lg="4" class="py-0">
                <label>Responsável Projeto</label>
              </v-col>
            </v-col>
          </v-row>
          <section v-for="(item, index) in activationSteps.activation_responsible.productsByCompanies" :key="index">
            <v-divider></v-divider>
            <v-row class="pt-1">
              <v-col xl="4" lg="4" class="d-flex align-center">
                <v-icon class="mr-6">mdi-store</v-icon>
                <div class="d-flex flex-column mr-4">
                  <span>{{item.customer.name | truncate(40)}}</span>
                  <span>{{item.customer.identifier}}</span>
                </div>
              </v-col>
              <v-col>
                <div v-for="product in item.products" :key="product.id" class="d-flex">
                  <v-col xl="4" lg="4" class="d-flex flex-column justify-center align-start">
                    <span class="font-body-large align-center">
                      {{`${product.amount}x ${product.product.name}`}}
                    </span>
                  </v-col>
                  <v-col xl="4" lg="4">
                    <div class="d-flex justify-center align-center">
                      <v-text-field
                        v-if="product.fields.find((field) => field.name === 'financial_responsible')"
                        outlined
                        dense
                        hide-details
                        disabled
                        data-test="inputActivationFinancialResponsible"
                        placeholder="Adicione um Responsável"
                        class="mr-2"
                        :value="getResponsibleName(product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value)"
                      ></v-text-field>
                      <OpportunityResponsibleForm
                        v-if="product.fields.find((field) => field.name === 'financial_responsible')"
                        financial
                        :is-editing="product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value ? true : false"
                        :responsible="product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value"
                        :company-id="product.customer_id"
                        :is-disabled="hasActivatedInvoice"
                        :company-list="companyList"
                        @onSubmit="(value) => {
                          product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value = value
                        }"
                      />
                    </div>
                    <v-checkbox 
                      v-if="product.fields.find((field) => field.name === 'financial_responsible') && activationSteps.activation_appInfo"
                      small
                      data-test="checkboxActivationFinancialResponsibleInvite"
                      class="mt-1"
                      label="Convidar para o aplicativo."
                      v-model="erpInvites[product.id]['financial_responsible'].invite"
                      :disabled="!product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value || hasActivatedInvoice"
                      @change="(value) => {
                        const responsible = product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value
                        if (responsible) {
                          const responsibleObject = JSON.parse(responsible)
                          responsibleObject.invite = value
                          const finalValue = JSON.stringify(responsibleObject)
                          product.fields[product.fields.findIndex((field) => field.name === 'financial_responsible')].value = finalValue
                        }
                      }"
                    ></v-checkbox>
                  </v-col>
                  <v-col xl="4" lg="4">
                    <div class="d-flex justify-center align-center">
                      <v-text-field
                        v-if="product.fields.find((field) => field.name === 'project_responsible')"
                        outlined
                        dense
                        hide-details
                        disabled
                        data-test="inputActivationProjectResponsible"
                        placeholder="Adicione um Responsável"
                        class="mr-2"
                        :value="getResponsibleName(product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value)"
                      ></v-text-field>
                      <OpportunityResponsibleForm
                        v-if="product.fields.find((field) => field.name === 'project_responsible')"
                        :is-editing="product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value ? true : false"
                        :responsible="product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value"
                        :company-id="product.customer_id"
                        :is-disabled="hasActivatedInvoice"
                        :company-list="companyList"
                        @onSubmit="(value) => {
                          product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value = value
                        }"
                      />
                    </div>
                    <v-checkbox
                      v-if="product.fields.find((field) => field.name === 'project_responsible') && activationSteps.activation_appInfo"
                      small
                      data-test="checkboxActivationProjectResponsibleInvite"
                      class="mt-1"
                      label="Convidar para o aplicativo."
                      v-model="erpInvites[product.id]['project_responsible'].invite"
                      :disabled="!product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value || hasActivatedInvoice"
                      @change="(value) => {
                        const responsible = product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value
                        if (responsible) {
                          const responsibleObject = JSON.parse(responsible)
                          responsibleObject.invite = value
                          const finalValue = JSON.stringify(responsibleObject)
                          product.fields[product.fields.findIndex((field) => field.name === 'project_responsible')].value = finalValue
                        }
                      }"
                    ></v-checkbox>
                  </v-col>
                </div>
              </v-col>
            </v-row>
          </section>
          <section class="d-flex justify-end align-center mt-4">
            <v-btn
              data-test="btnActivationResponsibleSave"
              color="primary"
              min-width="140"
              :disabled="checkStep('activation_responsible') || hasActivatedInvoice"
              :loading="loadingRequest"
              @click="saveProductStep(activationSteps.activation_responsible.productsByCompanies, 'activation_responsible')"
            >
              Salvar
            </v-btn>
          </section>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-if="activationSteps.activation_appInfo" class="v-expansion-panel-no-shadow">
        <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionActivationAppInfo">
          <template v-slot:default>
            <div class="w-100 d-flex justify-start align-center">
              <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
              <p class="mb-0">Dados do Aplicativo</p>
              <v-icon small :color="activationSteps.activation_appInfo.completed ? 'success' : 'stroke'" class="ml-1">
                {{ 'mdi-check-circle' }}
              </v-icon>
            </div>
          </template>
          <template v-slot:actions>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row class="mb-3">
            <v-col xl="4" lg="4" class="d-flex align-center py-0">
            </v-col>
            <v-col class="d-flex align-center py-0">
              <v-col xl="6" lg="6" class="py-0">
                <label>Produto</label>
              </v-col>
              <v-col xl="6" lg="6" class="py-0">
                <label>Nome do Aplicativo</label>
              </v-col>
            </v-col>
          </v-row>
          <section v-for="(item, index) in activationSteps.activation_appInfo.productsByCompanies" :key="index">
            <v-divider></v-divider>
            <v-row class="pt-1">
              <v-col xl="4" lg="4" class="d-flex align-center">
                <v-icon class="mr-6">mdi-store</v-icon>
                <div class="d-flex flex-column mr-4">
                  <span>{{item.customer.name | truncate(40)}}</span>
                  <span>{{item.customer.identifier}}</span>
                </div>
              </v-col>
              <v-col>
                <div v-for="product in item.products" :key="product.id" class="d-flex">
                  <v-col v-if="product.fields.find((field) => field.name === 'name')" xl="6" lg="6">
                    <v-text-field
                      v-for="item, index in product.amount" :key="index"
                      outlined
                      dense
                      disabled
                      :value="product.product.name"
                    ></v-text-field>
                  </v-col>
                  <v-col v-if="product.fields.find((field) => field.name === 'name')" xl="6" lg="6">
                    <v-text-field
                      v-for="item, index in product.amount" :key="index"
                      outlined
                      dense
                      data-test="inputActivationAppName"
                      placeholder="Digite aqui..."
                      v-model="product.fields[product.fields.findIndex((field) => field.name === 'name')].value[index]"
                      :disabled="hasActivatedInvoice"
                    ></v-text-field>
                  </v-col>
                </div>
              </v-col>
            </v-row>
          </section>
          <section class="d-flex justify-end align-center mt-4">
            <v-btn
              data-test="btnActivationAppInfoSave"
              color="primary"
              min-width="140"
              :disabled="checkStep('activation_appInfo') || hasActivatedInvoice"
              :loading="loadingRequest"
              @click="saveProductStep(activationSteps.activation_appInfo.productsByCompanies, 'activation_appInfo')"
            >
              Salvar
            </v-btn>
          </section>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-if="activationSteps.activation_documents" class="v-expansion-panel-no-shadow">
        <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionActivationDocuments">
          <template v-slot:default>
            <div class="w-100 d-flex justify-start align-center">
              <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
              <p class="mb-0">Termos</p>
              <v-icon small :color="activationSteps.activation_documents.completed ? 'success' : 'stroke'" class="ml-1">
                {{ 'mdi-check-circle' }}
              </v-icon>
            </div>
          </template>
          <template v-slot:actions>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content eager>
          <v-row v-if="activationSteps.activation_documents.fields.find((field) => field.name === 'customer_document_type')">
            <v-col xl="7" lg="7">
              <label>Termo de Aceite</label>
              <v-select
                attach
                outlined
                dense
                placeholder="Selecione"
                item-text="name"
                item-value="value"
                data-test="selectActivationDocumentType"
                v-model="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'customer_document_type')].value
                "
                :items="documents.customer.items"
                :disabled="hasActivatedInvoice"
                @change="() => {
                  activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'customer_document')].value = null
                }"
              ></v-select>
            </v-col>
            <v-col xl="5" lg="5">
              <div
                v-if="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'customer_document_type')].value == 'task'
                "
               class="d-flex align-center mt-5 w-75"
              >
                <NewAutocomplete
                  outlined
                  dense
                  clearable
                  hide-details
                  data-test="selectActivationDocumentTask"
                  placeholder="Selecionar tarefa pré-existente"
                  class="mr-2"
                  endpoint="/cash/task"
                  item-value="id"
                  search-key="type.name"
                  v-model="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'customer_document')].value"
                  :query="`includes=type&opportunity_id=${opportunityId}`"
                  :item-text="item => {if (item.type) {return item.type.name +' #'+ item.id} else {return 'Tarefa #'+ item.id}}"
                  :disabled="hasActivatedInvoice"
                  :menu-props="{ maxHeight: '150px' }"
                />
                <OpportunityCreateTaskForm
                  v-if="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'customer_document_type')].value == 'task'
                    || !hasActivatedInvoice
                  "
                  :opportunity="opportunity"
                  :is-disabled="hasActivatedInvoice"
                  @onCreatedTask="(value) => {
                    activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'customer_document')].value = value
                  }"
                />
              </div>
              <v-checkbox
                v-if="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'customer_document_type')].value == 'no_document'
                "
                class="mt-6"
                label="Estou ciente que a proposta não possui comprovante de aceite."
                data-test="checkboxActivationDocumentNoDocument"
                v-model="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'customer_document')].value
                "
                :disabled="hasActivatedInvoice"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row v-if="activationSteps.activation_documents.fields.find((field) => field.name === 'partner_document_type')">
            <v-col xl="7" lg="7">
              <label>Termo de Parceria</label>
                <v-select
                attach
                outlined
                dense
                placeholder="Selecione"
                item-text="name"
                item-value="value"
                data-test="selectActivationDocumentType"
                v-model="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'partner_document_type')].value
                "
                :items="documents.customer.items"
                :disabled="hasActivatedInvoice"
                @change="() => {
                  activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'partner_document')].value = null
                }"
              ></v-select>
            </v-col>
            <v-col xl="5" lg="5">
              <div
                v-if="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'partner_document_type')].value == 'task'
                "
               class="d-flex align-center mt-5 w-75"
              >
                <NewAutocomplete
                  outlined
                  dense
                  clearable
                  hide-details
                  data-test="selectActivationDocumentTask"
                  placeholder="Selecionar tarefa pré-existente"
                  class="mr-2"
                  endpoint="/cash/task"
                  item-value="id"
                  search-key="type.name"
                  v-model="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'partner_document')].value"
                  :query="`includes=type&opportunity_id=${opportunityId}`"
                  :item-text="item => {if (item.type) {return item.type.name +' #'+ item.id} else {return 'Tarefa #'+ item.id}}"
                  :disabled="hasActivatedInvoice"
                  :menu-props="{ maxHeight: '150px' }"
                />
                <OpportunityCreateTaskForm
                  v-if="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'partner_document_type')].value == 'task'
                    || !hasActivatedInvoice
                  "
                  :opportunity="opportunity"
                  @onCreatedTask="(value) => {
                    activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                    .findIndex((field) => field.name === 'partner_document')].value = value
                  }"
                />
              </div>
              <v-checkbox
                v-if="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'partner_document_type')].value == 'no_document'
                "
                data-test="checkboxActivationDocumentNoDocument"
                class="mt-6"
                label="Estou ciente que a proposta não possui comprovante de aceite."
                v-model="activationSteps.activation_documents.fields[activationSteps.activation_documents.fields
                  .findIndex((field) => field.name === 'partner_document')].value
                "
                :disabled="hasActivatedInvoice"
              ></v-checkbox>
            </v-col>
          </v-row>
          <v-row class="d-flex justify-end align-center">
            <v-btn
              data-test="buttonActivationDocumentSave"
              color="primary"
              min-width="140"
              class="mb-2"
              :disabled="checkStep('activation_documents') || hasActivatedInvoice"
              :loading="loadingRequest"
              @click="saveInvoiceStep('activation_documents')"
            >
              Salvar
            </v-btn>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel v-if="activationSteps.activation_relationship" class="v-expansion-panel-no-shadow">
        <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionActivationFeedback">
          <template v-slot:default>
            <div class="w-100 d-flex justify-start align-center">
              <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
              <p class="mb-0">Relacionamento e Feedback</p>
              <v-icon small :color="activationSteps.activation_relationship.completed ? 'success' : 'stroke'" class="ml-1">
                {{ 'mdi-check-circle' }}
              </v-icon>
            </div>
          </template>
          <template v-slot:actions>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content eager>
          <v-form ref="feedbackForm" :disabled="hasActivatedInvoice">
            <section>
              <v-radio-group
                row
                dense
                data-test="radioActivationFeedbackType"
                v-model="feedbackForm.individualAnswer"
                @change="setAnswers"
              >
                <v-radio
                  label="Responder por empresa"
                  :value="true"
                ></v-radio>
                <v-radio
                  label="Responder para todas empresas"
                  :value="false"
                ></v-radio>
              </v-radio-group>
            </section>
            <v-row v-if="!feedbackForm.individualAnswer">
              <v-col>
                <label class="mb-3">Porque o cliente está contratando este produto ou serviço?</label>
                <v-select
                  attach
                  outlined
                  dense
                  required
                  data-test="selectActivationFeedbackCustomerReason"
                  placeholder="Selecione uma opção"
                  v-model="feedbackForm.erpInfos.customerReason"
                  :items="feedbackItems.customerReasons"

                ></v-select>
              </v-col>
              <v-col>
                <label class="mb-3">O cliente precisa migrar os dados de outro ERP?</label>
                <v-select
                  attach
                  outlined
                  dense
                  placeholder="Selecione uma opção"
                  data-test="selectActivationFeedbackDataMigration"
                  v-model="feedbackForm.erpInfos.dataMigration"
                  :items="['Sim', 'Não']"
                ></v-select>
              </v-col>
            </v-row>
            <section v-else>
              <v-row class="mb-3">
                <v-col xl="4" lg="4" class="d-flex align-center py-0">
                </v-col>
                <v-col class="d-flex align-center py-0">
                  <v-col xl="4" lg="4" class="py-0">
                    <label>Produto</label>
                  </v-col>
                  <v-col xl="4" lg="4" class="py-0">
                    <label>Porque o cliente está contratando este produto ou serviço?</label>
                  </v-col>
                  <v-col xl="4" lg="4" class="py-0">
                    <label>Precisa migrar os dados de outro ERP?</label>
                  </v-col>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <section v-for="(item, index) in companiesList" :key="index">
                <v-row class="pt-1">
                  <v-col xl="4" lg="4" class="d-flex align-center">
                    <v-icon class="mr-6">mdi-store</v-icon>
                    <div class="d-flex flex-column mr-4">
                      <span>{{item.customer.name | truncate(40)}}</span>
                      <span>{{item.customer.identifier}}</span>
                    </div>
                  </v-col>
                  <v-col class="d-flex align-center">
                    <v-col xl="4" lg="4" class="d-flex flex-column justify-center align-start">
                      <span v-for="product in item.products" :key="product.id" class="font-body-large align-center">
                        {{`${product.amount}x ${product.product.name}`}}
                      </span>
                    </v-col>
                    <v-col xl="4" lg="4" class="d-flex justify-center align-center">
                      <v-select
                        attach
                        outlined
                        dense
                        required
                        hide-details
                        data-test="selectActivationFeedbackCustomerReason"
                        placeholder="Selecione uma opção"
                        v-model="erpInfos[item.customer_id].customerReason"
                        :items="feedbackItems.customerReasons"

                      ></v-select>
                    </v-col>
                    <v-col xl="4" lg="4" class="d-flex justify-center align-center">
                      <v-select
                        attach
                        outlined
                        dense
                        hide-details
                        data-test="selectActivationFeedbackDataMigration"
                        placeholder="Selecione uma opção"
                        v-model="erpInfos[item.customer_id].dataMigration"
                        :items="['Sim', 'Não']"
                      ></v-select>
                    </v-col>
                  </v-col>
                </v-row>
                <v-divider></v-divider>
              </section>
            </section>
            <section class="mt-4">
              <v-row>
                <v-col cols="6">
                  <div>
                    <label class="mb-3">Parceiro relacionado à Oportunidade</label>
                    <v-icon
                      class="mr-6"
                      v-tooltip="{
                        content: 
                          `<div class='v-btn-tooltip'>
                              Finder comissionado da oportunidade
                          </div>`
                      }"
                    >
                      info
                    </v-icon>
                  </div>
                  <v-radio-group
                    dense
                    class="radio-max-width"
                    data-test="radioActivationFeedbackPartner"
                    v-model="feedbackForm.hasPartner"
                    @change="setPartner"
                  >
                    <v-radio
                      label="Oportunidade sem parceiro"
                      :value="false"
                    ></v-radio>
                    <v-radio
                      label="Oportunidade com parceiro"
                      :value="true"
                    ></v-radio>
                  </v-radio-group>
                  <NewAutocomplete
                    outlined
                    dense
                    clearable
                    hide-details
                    data-test="selectActivationFeedbackPartner"
                    placeholder="Selecione o parceiro"
                    no-data-text="Digite o nome ou CNPJ da empresa parceira"
                    ref="associationAutocomplete"
                    endpoint="/customer/association"
                    item-value="left_side_id"
                    v-model="feedbackForm.opportunityPartnerId"
                    :query="`includes=left_side&left_side.partnership=partner&right_side_id=in(${companyList.join(',')})`"
                    :item-text="item => item.left_side.name +' - '+ maskCnpj(item.left_side.identifier) + ` (${item.left_side.identifier})`"
                    :disabled="!feedbackForm.hasPartner"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="6">
                  <label class="mb-3">Momento do fechamento da oportunidade:</label>
                  <v-select
                    attach
                    outlined
                    dense
                    placeholder="Selecione uma opção"
                    data-test="selectActivationFeedbackClosingStage"
                    v-model="feedbackForm.closingStage"
                    :items="feedbackItems.closingStages"
                  ></v-select>
                </v-col>
              </v-row>
            </section>
            <section v-if="feedbackForm.closingStage == 'Durante a demonstração'">
              <label class="mb-3">Em qual loop da demonstração?</label>
              <v-select
                attach
                outlined
                dense
                placeholder="Selecione uma opção"
                data-test="selectActivationFeedbackClosingLoop"
                v-model="feedbackForm.closingLoop"
                :items="feedbackItems.closingLoops"
              ></v-select>
            </section>
            <section>
              <label class="mb-3">Diagnóstico da venda e recomendações para o onboarding:</label>
              <div
               class="d-flex align-center mt-5 w-75"
              >
                <NewAutocomplete
                  outlined
                  dense
                  clearable
                  hide-details
                  data-test="selectActivationFeedbackDiagnosis"
                  placeholder="Selecionar tarefa pré-existente"
                  class="mr-2"
                  endpoint="/cash/task"
                  item-value="id"
                  search-key="type.name"
                  v-model="feedbackForm.diagnosis"
                  :menu-props="{ top: true, maxHeight: '200px' }"
                  :query="`includes=type&opportunity_id=${opportunityId}`"
                  :item-text="item => {if (item.type) {return item.type.name +' #'+ item.id} else {return 'Tarefa #'+ item.id}}"
                  :disabled="hasActivatedInvoice"
                />
                <OpportunityCreateTaskForm
                  v-if="!hasActivatedInvoice"
                  diagnosis
                  :opportunity="opportunity"
                  @onCreatedTask="(value) => {
                    feedbackForm.diagnosis = value
                  }"
                />
              </div>
            </section>
            <v-row class="d-flex justify-end align-center">
              <v-btn
                color="primary"
                min-width="140"
                class="mb-2"
                data-test="btnActivationFeedbackSave"
                :loading="loadingRequest"
                :disabled="hasActivatedInvoice || hasPartnerSelected()"
                @click="() => { this.partnerConfirmationDialog = true }"
              >
                Salvar
              </v-btn>
            </v-row>
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <OpportunityActivationFeedbackDialog
      :prop-dialog="partnerConfirmationDialog"
      :partner-id="feedbackForm.opportunityPartnerId"
      :opportunity-partner="opportunity.partner"
      @onClose="handleConfirmation"
    />
  </div>
</template>

<script>
import {  mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    itemId: { type: [String, Number], default: null },
    opportunity: Object,
    opportunityActivated: Boolean,
    aggregateCompanies: Array
  },
  data: () => ({
    invoiceInActivation: {
      id: null,
      products: [],
      activation: {
        activation_steps: {}
      }
    },
    activationSteps: {},
    selectedInvoiceId: null,
    invoiceId: null,
    loadingRequest: false,
    loadingData: false,
    activationStep: null,
    feedbackForm: {
      individualAnswer: true,
      erpInfos: {
        customerReason: null,
        dataMigration: null,
      },
      closingStage: null,
      closingLoop: null,
      diagnosisType: null,
      diagnosis: null,
      hasPartner: true,
      partnerName: null,
      opportunityPartnerId: null
    },
    erpInfos: {},
    erpInvites: {},
    invoices: [],
    hasInvoiceInActivation: false,
    hasActivatedInvoice: false,
    companiesList: [],
    LoadingActivation: false,
    partnerConfirmationDialog: false,
    partnershipProductIdentifier: 'cec09e8c33024d5aa19673ad677d6f0d',
    feedbackItems: {
      customerReasons: [
        'Emitir notas fiscais',
        'Fazer cobranças e emitir boletos',
        'Controlar meu estoque',
        'Gerir meu financeiro e o fluxo de caixa',
        'Quero controlar minha produção',
        'Outros',
      ],
      closingStages: [
        'Durante a demonstração',
        'Depois, no follow up',
        'Não foi necessário fazer essa demonstração',
      ],
      closingLoops: [
        'Sem precisar de loop',
        'Loop 01',
        'Loop 02',
        'Loop 03',
      ],
    },
    documents: {
      customer: {
        items: [
          {
            name: 'Tarefa',
            value: 'task'
          },
          {
            name: 'Não há comprovante',
            value: 'no_document'
          }
        ],
      },
      partnership: {
        items: [
          {
            name: 'Tarefa',
            value: 'task'
          },
          {
            name: 'Não há comprovante',
            value: 'no_document'
          }
        ],
      }
    },
    validations: {
      feedbackForm: {
        customerReason: { required },
      }
    },
  }),
  computed: {
    opportunityId: function() {
      return this.opportunity.id
    },
    companyList: function() {
      if(this.opportunity) {
        const companies = this.aggregateCompanies.map(({ company }) => company.id)
        const list = [this.opportunity.customer_id, ...companies]
        return list
      }
      return []
    },
    invoiceInActivationIndex: function() {
      const invoice = this.invoices.find((invoice) => invoice.id === this.invoiceInActivation.id)
      return invoice ? invoice.index : ''
    }
  },
  mounted() {
    // if(this.itemId) {
    //   this.getValidInvoices(this.itemId)
    //   this.setPartnerInfo()
    // }
  },
  watch: {
    // opportunityId(newValue) {
    //   if(newValue) {
    //     this.getValidInvoices(newValue)
    //     this.setPartnerInfo()
    //   }
    // },
    async invoices(newValue) {
      const activatedStatus = ['waiting_customer_approval', 'activated'] 
      const activatedInvoice = newValue.find((invoice) => activatedStatus.includes(invoice.status))
      if (activatedInvoice) {
        this.hasActivatedInvoice = true
        this.selectedInvoiceId = activatedInvoice.id
        this.invoiceId = activatedInvoice.id
        this.invoiceInActivation = await this.getInvoiceInActivation(activatedInvoice.id)
      } else {
        const invoiceInActivation = newValue.find((invoice) => invoice.status === 'in_activation')
        if (invoiceInActivation) {
          this.hasInvoiceInActivation = true
          this.selectedInvoiceId = invoiceInActivation.id
          this.invoiceId = invoiceInActivation.id
          this.invoiceInActivation = await this.getInvoiceInActivation(invoiceInActivation.id)
        } else {
          this.loadingData = false
        }
      }
    },
    invoiceInActivation(newValue) {
      if (newValue) {
        const { activation } = newValue
        this.activationSteps = structuredClone({ ...activation.activation_steps })
        if (this.activationSteps.activation_fields) {
          this.activationSteps.activation_fields.productsByCompanies = this.generateProductsByCompanies(newValue.products, 'activation_fields')
        }
        if (this.activationSteps.activation_responsible) {
          this.activationSteps.activation_responsible.productsByCompanies = this.generateProductsByCompanies(newValue.products, 'activation_responsible')
        }
        if (this.activationSteps.activation_appInfo) {
          this.activationSteps.activation_appInfo.productsByCompanies = this.generateProductsByCompanies(newValue.products, 'activation_appInfo')
        }
        if (this.activationSteps.activation_relationship) {
          this.relationshipStepCompanies(newValue.products)
          const feedbackContent = this.activationSteps.activation_relationship.fields[this.activationSteps.activation_relationship.fields
            .findIndex((field) => field.name === 'feedback')].value
          if (feedbackContent) {
            const { hasPartner, partnerName, opportunityPartnerId, ...feedbackForm } = JSON.parse(feedbackContent)
            this.setPartnerInfo()
            this.feedbackForm = { ...this.feedbackForm, ...feedbackForm }
            if (this.feedbackForm.individualAnswer) {
              this.erpInfos = this.feedbackForm.erpInfos
            }
          }
        }
        this.loadingData = false
      }
    },
    // 'feedbackForm.opportunityPartnerId': async function(newValue) {
    //   if (this.feedbackForm.hasPartner) {
    //     await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: newValue }, { fireSuccessAlert: false })
    //     this.refreshOpportunityData(true)
    //   }
    // },
    opportunity(newValue) {
      if (newValue.partner_id) {
        this.feedbackForm.partnerName = newValue.partner?.name
      }
    }
  },
  methods: {
    ...mapActions({
      refreshOpportunityData: 'Opportunity/refresh',
    }),
    async getValidInvoices(id) {
      const invalidStatus = ['rejected', 'pending_approval']
      const invoices = await this.getList(`/cash/get-invoices-by-opportunity/${id}`)
      if (invoices) {
        this.invoices = invoices.filter((invoice) => !invalidStatus.includes(invoice.status)).sort((a, b) => b.id - a.id)
      }
    },
    async startActivation() {
      this.loadingRequest = true
      try {
        await this.updateData('/cash/update-invoice-activation-status', { invoice_id: this.invoiceId, status: 'in_activation' }, { throwError: true, fireSuccessAlert: false })
        await this.updateData('/cash/generate-invoice-activation/', { invoice_id: this.invoiceId }, { throwError: true })
        this.selectedInvoiceId = this.invoiceId
        this.invoiceInActivation = await this.getInvoiceInActivation(this.selectedInvoiceId)
        this.loadingRequest = false
        this.activationStep = 1
      } catch (error) {
        this.loadingRequest = false
        console.log(error)
      }
    },
    async restartActivation() {
      this.loadingRequest = true
      try {
        await this.updateData('/cash/update-invoice-activation-status', { invoice_id: this.selectedInvoiceId, status: 'cancel' }, { throwError: true, fireSuccessAlert: false })
        await this.updateData('/cash/update-invoice-activation-status', { invoice_id: this.invoiceId, status: 'in_activation' }, { throwError: true, fireSuccessAlert: false })
        await this.updateData('/cash/generate-invoice-activation/', { invoice_id: this.invoiceId }, { throwError: true })
        this.selectedInvoiceId = this.invoiceId
        this.$refs.feedbackForm.reset()
        this.invoiceInActivation = await this.getInvoiceInActivation(this.selectedInvoiceId)
        this.feedbackForm.individualAnswer = true
        this.setPartnerInfo()
        this.loadingRequest = false
        this.activationStep = 1
      } catch (error) {
        this.loadingRequest = false
        console.log(error)
      }
    },
    handleChangeToProposalTab(event) {
      event.preventDefault()
      this.$emit('goToProposalTab', 3)
    },
    async getInvoiceInActivation(id) {
      try {
        const { data: invoice } = await this.$axios.get(`/cash/get-invoice/${id}`)
        return invoice
      } catch (error) {
        return null
      }
    },
    generateProductsByCompanies(invoiceProducts, step) {
      const productsByCompanies = []
      const companies = [...new Set(invoiceProducts.filter((product) => product.customer_id).map((product) => product.customer_id))]
      companies.forEach((customer_id) => {
        const productsList = invoiceProducts.filter((product) => product.customer_id === customer_id)
        const products = productsList.map((product) => {
          const productActivation = this.activationSteps[step].products.find((prod) => product.id === prod.invoice_product_id)
          const productActivationIndex = this.activationSteps[step].products.findIndex((prod) => product.id === prod.invoice_product_id)
          if (step === 'activation_appInfo') {
            if (productActivation?.fields) {
              productActivation.fields.forEach((field, index) => {
                if (!field.value) {
                  productActivation.fields[index].value = []
                  for (let i = 0; i < product.amount; i++) {
                    productActivation.fields[index].value.push(product.customer.name)
                  }
                }
              })
            }
          }
          if (step === 'activation_responsible') {
            if (productActivation?.fields) {
              productActivation.fields.forEach((field, index) => {
                if (field.value) {
                  const value = JSON.parse(productActivation.fields[index].value)
                  this.erpInvites = {
                    ...this.erpInvites,
                    [product.id]: {
                      ...this.erpInvites[product.id],
                      [field.name]: { invite: value.invite ? value.invite : false },
                    }
                  }
                } else {
                  this.erpInvites = {
                    ...this.erpInvites,
                    [product.id]: {
                      ...this.erpInvites[product.id],
                      [field.name]: { invite: false },
                    }
                  }
                }
              })
            }
          }
          return {
            ...product,
            productActivationIndex,
            fields: productActivation?.fields ? productActivation?.fields : [], 
          }
        })
        if (step === 'activation_appInfo') {
          if (products.some((product) => product.fields.length > 0)) {
            productsByCompanies.push({
              customer_id,
              customer: products[0].customer,
              products: products
            })
          }
        } else {
          productsByCompanies.push({
            customer_id,
            customer: products[0].customer,
            products: products
          })
        }
      })
      return productsByCompanies
    },
    relationshipStepCompanies(invoiceProducts) {
      const companies = [...new Set(invoiceProducts.filter((product) => product.customer_id).map((product) => product.customer_id))]
      this.companiesList = companies.map((customer_id) => {
        const productsList = invoiceProducts.filter((product) => product.customer_id === customer_id)
        return {
          customer_id,
          customer: productsList[0].customer,
          products: productsList
        }
      })
      this.companiesList.forEach((company) => {
        this.erpInfos = {
          ...this.erpInfos,
          [company.customer_id]: {
            customerReason: null,
            dataMigration: null,
          }
        }
      })
    },
    arrayIndex(value, key, array) {
      const index = array.findIndex((item) => item[key] === value)
      return index
    },
    async saveProductStep(companiesProducts, step) {
      this.loadingRequest = true
      const activation = structuredClone(this.invoiceInActivation.activation)
      companiesProducts.forEach((company) => {
        company.products.forEach((product) => {
          if (activation.activation_steps[step].products[product.productActivationIndex]) {
            activation.activation_steps[step].products[product.productActivationIndex].fields = product.fields
          }
        })
      })
      activation.activation_steps[step].completed = true
      const activationPayload = { invoice_id: this.selectedInvoiceId, payload: activation }
      try {
        await this.updateData('/cash/update-invoice-activation/', activationPayload, { throwError: true })
        this.invoiceInActivation.activation = structuredClone(activation)
        this.activationSteps[step].completed = true
        this.loadingRequest = false
        this.activationStep += 1
      } catch (error) {
        this.loadingRequest = false
        console.log(error)
      }
    },
    async saveInvoiceStep(step) {
      this.loadingRequest = true
      const activation = structuredClone(this.invoiceInActivation.activation)
      activation.activation_steps[step].fields = this.activationSteps[step].fields
      activation.activation_steps[step].completed = true
      const activationPayload = { invoice_id: this.selectedInvoiceId, payload: activation }
      try {
        await this.updateData('/cash/update-invoice-activation/', activationPayload, { throwError: true })
        this.invoiceInActivation.activation = structuredClone(activation)
        this.activationSteps[step].completed = true
        this.loadingRequest = false
        this.activationStep += 1
      } catch (error) {
        this.loadingRequest = false
        console.log(error)
      }
    },
    async saveFeedbackStep(step) {
      // this.$v.feedbackItems.customerReasons.$touch()
      // if (this.$v.feedbackItems.customerReasons) return
      this.loadingRequest = true
      if (this.feedbackForm.individualAnswer) {
        this.feedbackForm.erpInfos = this.erpInfos
      }
      const activation = structuredClone(this.invoiceInActivation.activation)
      activation.activation_steps[step].fields[activation.activation_steps[step].fields
        .findIndex((field) => field.name === 'feedback')].value = JSON.stringify(this.feedbackForm)
      activation.activation_steps[step].completed = true
      const activationPayload = { invoice_id: this.selectedInvoiceId, payload: activation }
      try {
        await this.updateData('/cash/update-invoice-activation/', activationPayload, { throwError: true })
        this.invoiceInActivation.activation = structuredClone(activation)
        this.activationSteps[step].completed = true
        if (this.opportunity.partner_id !== this.feedbackForm.opportunityPartnerId) {
          await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: this.feedbackForm.opportunityPartnerId }, { fireSuccessAlert: false })
          this.refreshOpportunityData(true)
        }
        this.loadingRequest = false
        this.activationStep += 1
      } catch (error) {
        this.loadingRequest = false
        console.log(error)
      }
    },
    setAnswers() {
      this.feedbackForm.erpInfos = {
        customerReason: null,
        dataMigration: null,
      }
      this.relationshipStepCompanies(this.invoiceInActivation.products)
    },
    getResponsibleName(responsible) {
      if (responsible) {
        const responsibleObject = JSON.parse(responsible)
        if (responsibleObject.name) {
          return responsibleObject.name
        }
        return null
      }
      return null
    },
    checkStep(step) {
      if (this.activationSteps[step]?.origin === 'invoice') {
        const emptyField = this.activationSteps[step].fields.some((field) => !field.value)
        if (emptyField) {
          return true
        }
      } else if (this.activationSteps[step]?.origin === 'invoice_product') {
        let emptyProductField = false
        this.activationSteps[step].products.forEach((product) => {
          let companyProduct = null
          this.activationSteps[step].productsByCompanies.forEach((company) => {
            const productFound = company.products.find((item) => product.product_id === item.product_id)
            if (productFound) {
              companyProduct = productFound
            }
          })
          if (product.fields.some((field) => {
            if (companyProduct) {
              const payment = companyProduct.product.payment
              if (payment === 'Único' && field.name === 'billing_cadence') {
                return false
              }
            }
            return !field.value
          })) {
            emptyProductField = true
          }
        })
        if (emptyProductField) {
          return true
        }
      }
      return false
    },
    checkAllSteps() {
      let disable = false
      if (!this.selectedInvoiceId) {
        disable = true
      }
      for (const step in this.activationSteps) {
        if (!this.activationSteps[step].completed) {
          disable = true
        }
      }
      return disable
    },
    setPartnerInfo() {
      if (this.opportunity?.partner_id) {
        this.feedbackForm.hasPartner = true
        this.feedbackForm.partnerName = this.opportunity.partner.name
        this.feedbackForm.opportunityPartnerId = this.opportunity.partner_id
      } else {
        this.feedbackForm.partnerName = null
        this.feedbackForm.opportunityPartnerId = null
      }
    },
    async refreshData(value) {
      if (value === 4) {
        this.loadingData = true
        // this.$v.$reset()
        await this.getValidInvoices(this.itemId)
        this.setPartnerInfo()
      }
    },
    async refreshInvoice() {
      this.loadingData = true
      await this.getValidInvoices(this.itemId)
      this.$emit('onInvoiceActivate',  this.invoices)
      this.setPartnerInfo()
    },
    async setPartner() {
      if (!this.feedbackForm.hasPartner) {
        this.feedbackForm.opportunityPartnerId = null
        // await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: null }, { fireSuccessAlert: false })
        // this.refreshOpportunityData(true)
      }
    },
    hasPartnerSelected() {
      if (this.feedbackForm.hasPartner) {
        if (this.feedbackForm.opportunityPartnerId) {
          return false
        }
      } else {
        return false
      }
      return true
    },
    handleConfirmation(confirm) {
      this.partnerConfirmationDialog = false
      if (confirm) {
        this.saveFeedbackStep('activation_relationship')
      }
    },
    generateCadenceItems(items) {
      if (items.length > 0) {
        if (typeof items[0] === 'string' || items[0] instanceof String) {
          return items
        } else {
          return items.map((cadence) => cadence.identifier)
        }
      }
      return []
    },
    disableCadence(items) {
      if (items.length > 0) {
        if (typeof items[0] === 'string' || items[0] instanceof String) {
          return false
        } else {
          return true
        }
      }
      return false
    },
  }
}
</script>

<style scoped>
  .v-file-input-bordered {
    border: dashed 1px #D2D6DA;
  }
  .total-container {
    background-color: rgba(245, 245, 245, 0.5);
    border-top: 0.8px solid #D2D6DA;
    border-radius: 0px;
  }
  .company-item {
    border-top: 0.8px solid #F5F5F5;
  }
  .ajust-margin-checkbox {
    margin-top: -23px !important;
  }
  .small-text {
    font-size: 12px !important;
  }
  .radio-max-width {
    max-width: 240px;
  }
</style>
