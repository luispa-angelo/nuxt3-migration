<template>
  <div>
    <v-dialog v-model="dialog" scrollable persistent max-width="1200" transition="fadeDown">
      <v-card style="overflow-y: none;">
        <DialogHeader
          :title="`Solicitação - ${typeRequest} #${cscId}`"
          enableMinimize
          @onMinimize="handleMinimize"
          @onCancel="handleCancel"
        >
          <template v-slot:subtitle>
            <div class="d-flex align-center">
              <span class="default-text--text mr-2">Criado em</span>
              <v-chip color="sub-text--text" label small outlined class="mr-2">
                {{ $moment(createdAt).format('DD/MM/YYYY') }}
              </v-chip>
            </div>
            <v-chip
              :color="
                status == 'Aprovado' ? 'success' :
                status == 'Rejeitado' ? 'error' :
                status == 'Cancelado' ? 'error' :
                status == 'Pendente' ? 'warning' :
                status == 'Concluído' ? '' :
                'primary'
              "
              small
              outlined
            >
              {{ status }}
            </v-chip>
            <v-chip
              v-if="requestData.result"
              small
              outlined
              class="ml-2"
              :color="
                requestData.result == 'Rejeitado' ? 'error' :
                requestData.result == 'Aprovado' ? 'success' : ''"
            >
              <span v-if="typeRequest == 'Apoio' && requestData.result == 'Aprovado'">Realizado</span>
              <span v-else-if="typeRequest == 'Apoio' && requestData.result == 'Rejeitado'">Não Realizado</span>
              <span v-else>{{ requestData.result }}</span>
            </v-chip>
          </template>
        </DialogHeader>
        <v-card-text class="pt-2">
          <v-row>
            <v-col xl="7" lg="7" class="left-column">
              <TabComponent :tab-items="tabItems">
                <template v-slot:solicitation>
                  <v-card class="v-card-main" elevation="0">
                    <v-card-text
                      id="v-card-text-scrollbar"
                      class="v-card-text-scrollbar pa-1"
                    >
                      <v-overlay absolute :value="loading">
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                      </v-overlay>
                      <section v-if="conversation.length" class="d-flex flex-column w-100">
                        <v-sheet 
                          v-for="(message, index) in conversation"
                          :key="index"
                          class="flex-column mb-4"
                          :class="message.origin_id == userInfo.id ? 'd-flex justify-end align-end' : 'd-flex justify-start align-start'"
                        >
                          <section :class="message.origin_id == userInfo.id ? 'd-flex justify-end align-start' : 'd-flex justify-start align-start'">
                            <p class="font-body-medium mb-0">
                              <span class="font-weight-bold">{{ message.userName }}</span>
                              <span>{{ $moment(message.created_at).format('DD/MM/YYYY H:mm') }}</span>
                            </p>
                          </section>
                          <v-sheet
                            v-if="!message.is_attach"
                            :color="message.colored ? 'primary lighten-5' : 'stroke lighten-5'"
                            elevation="2"
                            max-width="90%"
                            :class="message.origin_id == userInfo.id ? 'right-reply' : 'left-reply'"
                            class="font-body-medium pa-4"
                            v-html="message.content"
                            style="white-space: pre-line;"
                          ></v-sheet>
                          <v-sheet
                            v-else
                            :color="message.colored ? 'primary lighten-5' : 'stroke lighten-5'"
                            elevation="2"
                            max-width="90%"
                            :class="message.origin_id == userInfo.id ? 'right-reply' : 'left-reply'"
                            class="text-center font-body-medium pa-4"
                          >
                            <p class="text-left mb-2">{{ message.file_name }}</p>
                            <iframe
                              v-if="message.file_name.includes('pdf')"
                              :src="message.file_url"
                              scrolling=“no”
                              frameborder="0"
                              allowfullscreen
                              width="300"
                              height="150"
                            ></iframe>
                            <v-icon
                              v-else-if="
                                message.file_name.includes('doc') ||
                                message.file_name.includes('docx') ||
                                message.file_name.includes('xls') ||
                                message.file_name.includes('xlsx')
                              "
                              size="45"
                              class="material-icons-outlined"
                            >
                              description
                            </v-icon>
                            <v-img v-else :src="message.file_url" class="mb-2"></v-img>
                            <a class="mb-0 d-flex justify-start align-center link-item" target="_blank" :href="message.file_url">
                              <p class="mb-0">Abrir Anexo</p>
                              <v-icon class="material-symbols-rounded" color="primary">
                                open_in_new
                              </v-icon>
                            </a>
                          </v-sheet>
                        </v-sheet>
                      </section>
                      <v-sheet v-else class="mb-4">
                        <v-sheet elevation="2" max-width="90%" class="left-reply font-body-medium pa-4">
                          <v-icon class="mb-1">mdi-alert</v-icon>
                          Nenhuma observação foi enviada pelo solicitante.
                        </v-sheet>
                      </v-sheet>
                    </v-card-text>
                    <v-card-actions class="d-flex align-start w-100">
                      <section class="container-textarea w-100">
                        <div>
                          <v-checkbox
                            v-if="isAttendant"
                            dense
                            hide-details
                            class="conversation-warn-customer mx-0 px-0"
                            v-model="request_submitter"
                            label="Marcar pendente com o solicitante ao enviar"
                          ></v-checkbox>
                          <v-textarea
                            :label="haveAttendant ? 'Digite aqui para enviar uma mensagem' : ''"
                            outlined
                            rows="5"
                            no-resize
                            class="w-100"
                            v-model="content"
                            :disabled="disabled || !haveAttendant || disableTextField"
                            @keydown.enter="sendRequestMoreInfo($event)"
                            :error="$v.content.$error"
                          ></v-textarea>
                          <v-sheet class="d-flex justify-space-between align-center w-100 ajust-action-buttons px-2">
                            <div class="d-flex">
                              <v-file-input
                                ref="attachFileConversation"
                                dense
                                hide-input
                                hide-details
                                class="ma-0 pa-0"
                                :disabled="disabled || !haveAttendant"
                                v-model="attachFileConversation"
                              >
                              </v-file-input>
                            </div>
                            <v-btn @click="sendRequestMoreInfo($event)" fab icon color="primary" :disabled="disabled || !haveAttendant || !content">
                              <v-icon class="material-symbols-outlined">send</v-icon>
                            </v-btn>
                          </v-sheet>
                        </div>
                        <div v-if="canAttend">
                          <v-btn
                            v-show="!loading && !haveAttendant"
                            @click="setAttendant"
                            :disabled="disabled || status == 'Cancelado'"
                            color="primary"
                            max-width="250"
                            class="btn-set-attendant mb-1"
                          >
                            Iniciar atendimento
                          </v-btn>
                        </div>
                      </section>
                    </v-card-actions>
                  </v-card>
                </template>
                <template v-slot:note>
                  <v-card class="v-card-main" elevation="0">
                    <v-card-text id="v-card-text-scrollbar-note" class="v-card-text-scrollbar pa-1">
                      <v-overlay absolute :value="loading">
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                      </v-overlay>
                      <section v-if="annotations.length" class="d-flex flex-column w-100">
                        <v-sheet 
                          v-for="message in annotations"
                          :key="message.id"
                          class="d-flex justify-start align-start flex-column mb-4"
                        >
                          <section class="d-flex justify-start align-start">
                            <p class="font-body-medium mb-0">
                              <span class="font-weight-bold">{{ message.owner.name }}</span>
                              <span>{{ $moment(message.created_at).format('DD/MM/YYYY H:mm') }}</span>
                            </p>
                          </section>
                          <v-sheet
                            v-if="!message.is_attach"
                            color="bg-annotation"
                            elevation="2"
                            max-width="90%"
                            class="left-reply font-body-medium pa-4"
                            v-html="message.content"
                            style="white-space: pre-line;"
                          >
                          </v-sheet>
                          <v-sheet
                            v-else
                            color="bg-annotation"
                            elevation="2"
                            max-width="90%"
                            class="left-reply font-body-medium pa-4"
                          >
                            <p class="mb-2">{{ message.file_name }}</p>
                            <iframe
                              v-if="message.file_name.includes('pdf')"
                              :src="message.file_url"
                              scrolling=“no”
                              frameborder="0"
                              allowfullscreen
                              width="300"
                              height="150"
                            ></iframe>
                            <v-icon
                              v-else-if="
                                message.file_name.includes('doc') ||
                                message.file_name.includes('docx') ||
                                message.file_name.includes('xls') ||
                                message.file_name.includes('xlsx')
                              "
                              size="45"
                              class="material-icons-outlined"
                            >
                              description
                            </v-icon>
                            <v-img v-else :src="message.file_url" class="mb-2"></v-img>
                            <a class="mb-0 d-flex justify-start align-center link-item" target="_blank" :href="message.file_url">
                              <p class="mb-0">Abrir Anexo</p>
                              <v-icon class="material-symbols-rounded" color="primary">
                                open_in_new
                              </v-icon>
                            </a>
                          </v-sheet>
                        </v-sheet>
                      </section>
                      <v-sheet v-else class="mb-4">
                        <v-sheet elevation="2" max-width="90%" class="left-reply font-body-medium pa-4">
                          <v-icon class="mb-1">mdi-alert</v-icon>
                          Nenhuma anotação foi feita.
                        </v-sheet>
                      </v-sheet>
                    </v-card-text>
                    <v-card-actions class="d-flex align-start w-100">
                      <section class="container-textarea w-100">
                        <v-textarea
                          label="Escreva uma anotação interna"
                          outlined
                          rows="5"
                          no-resize
                          class="w-100"
                          v-model="annotationContent"
                          :disabled="!haveAttendant"
                          @keydown.enter="submitAnnotation($event)"
                          :error="$v.annotationContent.$error"
                        ></v-textarea>
                        <v-sheet class="d-flex justify-space-between align-center w-100 ajust-action-buttons px-2">
                          <div class="d-flex">
                            <v-file-input
                              ref="attachFile"
                              dense
                              hide-input
                              hide-details
                              :disabled="!haveAttendant"
                              class="ma-0 pa-0"
                              v-model="attachFile"
                            >
                            </v-file-input>
                          </div>
                          <v-btn @click="submitAnnotation($event)" fab icon color="primary" :disabled="!haveAttendant || !annotationContent">
                            <v-icon class="material-symbols-outlined">send</v-icon>
                          </v-btn>
                        </v-sheet>
                      </section>
                    </v-card-actions>
                  </v-card>
                </template>
              </TabComponent>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col xl="5" lg="5" class="right-column mt-0">
              <v-expansion-panels v-model="panels" multiple>
                <div class="w-100 v-expansion-panel-bordered mb-2">
                  <v-expansion-panel class="v-expansion-panel-no-shadow mb-0">
                    <v-expansion-panel-header disable-icon-rotate expand-icon="" class="py-2 px-3">
                      <template v-slot:default>
                        <div class="w-100 d-flex justify-space-between align-center">
                          <div class="d-flex justify-start align-center">
                            <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                            <p class="mb-0">Detalhes</p>
                          </div>
                          <div v-if="haveAttendant || canAttend">
                            <v-btn
                              v-if="!detailsEdit"
                              @click.native.stop="detailsEdit = !detailsEdit"
                              :disabled="!haveAttendant || disabled || !canAttend"
                              fab
                              color="secondary"
                            >
                              <v-icon class="material-symbols-rounded">
                                edit
                              </v-icon>
                            </v-btn>
                            <div v-else>
                              <v-btn @click.native.stop="updateDetailForm" fab color="primary">
                                <v-icon class="material-symbols-rounded">
                                  check
                                </v-icon>
                              </v-btn>
                              <v-btn @click.native.stop="detailsEdit = !detailsEdit" fab icon color="primary">
                                <v-icon class="material-symbols-rounded">
                                  close
                                </v-icon>
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-slot:actions></template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="font-body-medium">
                      <v-row>
                        <v-col>
                          <div v-if="typeRequest != 'Apoio'">
                            <p class="font-weight-bold mb-2">Responsável</p>
                            <p class="font-weight-bold mb-2">Solicitante</p>
                            <p class="font-weight-bold mb-2">Time do Solicitante</p>
                          </div>
                          <div v-else>
                            <p class="font-weight-bold mb-2">Responsável</p>
                            <p class="font-weight-bold mb-2">Time de Apoio</p>
                            <p class="font-weight-bold mb-2">Solicitante</p>
                            <p class="font-weight-bold mb-2">Data e Horário</p>
                            <p class="font-weight-bold mb-2">Meio de comunicação</p>
                          </div>
                        </v-col>
                        <v-col>
                          <div v-if="!detailsEdit">
                            <div v-if="typeRequest != 'Apoio'">
                              <p v-if="formData.attendant_id" class="mb-2">{{ formData.attendant_id | truncate(18) }}</p>
                              <p v-else class="mb-2">Não atribuído</p>
                              <p class="mb-2">{{ formData.submitter_id | truncate(18) }}</p>
                              <p class="mb-2">{{ formData.submitter_team_id }}</p>
                            </div>
                            <div v-else>
                              <p v-if="formData.attendant_id" class="mb-2">{{ formData.attendant_id | truncate(18) }}</p>
                              <p v-else class="mb-2">Não atribuído</p>
                              <p v-if="dataRequest.team.attendant_team" class="mb-2">{{ dataRequest.team.attendant_team.name }}</p>
                              <p class="mb-2">{{ formData.submitter_id | truncate(18) }}</p>
                              <p class="mb-2">{{ $moment(requestData.scheduled_to).format('DD/MM/YYYY HH:mm') }}</p>
                              <p class="mb-2">
                                {{ translateCommunication(dataRequest.communication) }}
                              </p>
                            </div>
                          </div>
                          <v-form v-else class="v-form-details">
                            <div v-if="typeRequest != 'Apoio'">
                              <NewAutocomplete
                                label="Responsável"
                                dense
                                clearable
                                hide-details
                                return-object
                                endpoint="/ecosystem/user"
                                item-value="id"
                                item-text="name"
                                class="mb-2"
                                v-model="newAttendant"
                              />
                              <p class="mb-2">{{ formData.submitter_id }}</p>
                              <p class="mb-2">{{ formData.submitter_team_id }}</p>
                            </div>
                            <div v-else>
                              <NewAutocomplete
                                v-if="dataRequest"
                                label="Responsável"
                                dense
                                clearable
                                hide-details
                                return-object
                                :endpoint="endpointCapability"
                                :query="`includes=user,team&team_id=${dataRequest.team.attendant_team_id}`"
                                item-value="user_id"
                                item-text="user.name"
                                class="mb-2"
                                v-model="newAttendant"
                              />
                              <p v-if="dataRequest.team.attendant_team" class="mb-2">{{ dataRequest.team.attendant_team.name }}</p>
                              <p class="mb-2">{{ formData.submitter_id | truncate(18) }}</p>
                              <p class="mb-2">{{ $moment(dataRequest.scheduled_to).format('DD/MM/YYYY HH:mm') }}</p>
                              <p class="mb-2">
                                {{ translateCommunication(dataRequest.communication) }}
                              </p>
                            </div>
                          </v-form>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </div>
                <div v-if="typeRequest == 'Transferência'" class="w-100 v-expansion-panel-bordered mb-2">
                  <v-expansion-panel class="v-expansion-panel-no-shadow mb-0">
                    <v-expansion-panel-header disable-icon-rotate expand-icon="" class="py-2 px-3">
                      <template v-slot:default>
                        <div class="w-100 d-flex justify-space-between align-center">
                          <div class="d-flex justify-start align-center">
                            <v-avatar size="36" rounded color="blue lighten-5 mr-2">
                              <v-icon color="primary" class="material-symbols-rounded">
                                domain
                              </v-icon>
                            </v-avatar>
                            <p v-if="companyList.length == 1" class="mb-0">{{ companyList[0].name | truncate(20) }}</p>
                            <p v-else class="mb-0">Empresas</p>
                          </div>
                          <v-btn v-if="companyList.length == 1" :to="redirectPage(companyList[0])" target="_blank" fab icon color="primary">
                            <v-icon class="material-symbols-rounded">
                              open_in_new
                            </v-icon>
                          </v-btn>
                        </div>
                      </template>
                      <template v-slot:actions></template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="font-body-medium">
                      <v-list dense>
                        <v-list-item v-for="(company, index) in companyList" :key="index" class="px-0">
                          <v-list-item-content class="ma-0 pa-0">
                            <v-row>
                              <v-col v-if="companyList.length >= 1 && typeRequest == 'Transferência'" xl="1" lg="1" class="pt-1">
                                <v-checkbox
                                  dense
                                  hide-details
                                  class="mt-1"
                                  v-model="selectedCompanys"
                                  :value="company.identifier"
                                ></v-checkbox>
                              </v-col>
                              <v-col>
                                <p class="font-weight-bold mb-2">Razão social</p>
                                <p class="font-weight-bold mb-2">CNPJ</p>
                                <p class="font-weight-bold mb-2">Time</p>
                                <p class="font-weight-bold mb-2">Responsável</p>
                                <p class="font-weight-bold mb-2">Contabilidade</p>
                              </v-col>
                              <v-col>
                                <p class="mb-2"><NuxtLink :to="redirectPage(company)" target="_blank">{{ company.name | truncate(15) }}</NuxtLink></p>
                                <p class="mb-2">{{ company.identifier }}</p>
                                <p class="mb-2">{{ company.team ? company.team : '--' }}</p>
                                <p class="mb-2">{{ company.assigned_to ? company.assigned_to : '--' }}</p>
                                <p class="mb-2">{{ company.accounting ? company.accounting : '--' }}</p>
                              </v-col>
                            </v-row>
                            <section v-if="company.economic_group" class="d-flex justify-start align-center">
                              <v-chip color="primary" small outlined>{{ company.economic_group }}</v-chip>
                            </section>
                            <v-divider v-if="index != companyList.length - 1" class="mb-4"></v-divider>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </div>
                <div v-if="typeRequest == 'Transferência'" class="w-100 v-expansion-panel-bordered mb-2">
                  <v-expansion-panel class="v-expansion-panel-no-shadow mb-0">
                    <v-expansion-panel-header disable-icon-rotate expand-icon="" class="py-2 px-3">
                      <template v-slot:default>
                        <div class="w-100 d-flex justify-start align-center">
                          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                          <p class="mb-0">
                            <span class="font-weight-bold">Últimas solicitações</span>
                            <span>{{ requestData.submitter.name }}</span>
                          </p>
                        </div>
                      </template>
                      <template v-slot:actions></template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="font-body-medium">
                      <v-list dense>
                        <v-list-item v-for="item in lastRequest.slice(0, 3)" :key="item.id" class="d-flex justify-space-between align-center">
                          <v-row>
                            <v-col xl="4" lg="4">
                              <p class="mb-0">{{ item.submitter.name | truncate(12) }}</p>
                            </v-col>
                            <v-col xl="6" lg="6">
                              <v-chip
                                small 
                                outlined 
                                :color="
                                  item.status == 'Rejeitado' ? 'error' : 
                                  item.status == 'Aprovado' ? 'success' : 
                                  item.status == 'Pendente' ? 'warning' : 
                                  'primary'
                                "
                              >{{ item.status }}</v-chip>
                            </v-col>
                            <v-col xl="2" lg="2" class="text-right">
                              <p class="mb-0">{{ $moment(item.created_at).format('DD/MM') }}</p>
                            </v-col>
                          </v-row>
                        </v-list-item>
                      </v-list> 
                      <section class="d-flex justify-end">
                        <v-btn @click="filterAttendant" text color="primary">Ver todas</v-btn>
                      </section>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </div>
                <div v-if="typeRequest == 'Voucher' || typeRequest == 'Apoio'" class="w-100 v-expansion-panel-bordered mb-2">
                  <v-expansion-panel class="v-expansion-panel-no-shadow mb-0">
                    <v-expansion-panel-header disable-icon-rotate expand-icon="" class="py-2 px-3">
                      <template v-slot:default>
                        <div class="w-100 d-flex justify-space-between align-center">
                          <div class="d-flex justify-start align-center">
                            <v-avatar size="36" rounded color="blue lighten-5 mr-2">
                              <v-icon color="primary" class="material-symbols-rounded">
                                domain
                              </v-icon>
                            </v-avatar>
                            <p v-if="opportunityInfo" class="mb-0">{{ `Oportunidade #${opportunityInfo.id}` }}</p>
                          </div>
                          <v-btn v-if="opportunityInfo" :to="redirectToOpportunityPage(opportunityInfo)" target="_blank" fab icon>
                            <v-icon class="material-symbols-rounded" color="primary">
                              open_in_new
                            </v-icon>
                          </v-btn>
                        </div>
                      </template>
                      <template v-slot:actions></template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="font-body-medium">
                      <v-list dense>
                        <v-list-item class="px-0">
                          <v-list-item-content class="ma-0 pa-0">
                            <v-row>
                              <v-col>
                                <p class="font-weight-bold mb-2">Razão social</p>
                                <p class="font-weight-bold mb-2">CNPJ</p>
                                <div v-if="typeRequest == 'Voucher'">
                                  <p class="font-weight-bold mb-2">Equipe</p>
                                  <p class="font-weight-bold mb-2">Responsável</p>
                                  <p class="font-weight-bold mb-2">Fase</p>
                                </div>
                                <div else>
                                  <p class="font-weight-bold mb-2">Regime Tributário</p>
                                  <p class="font-weight-bold mb-2">Previsão de fechamento</p>
                                  <p class="font-weight-bold mb-2">Site</p>
                                </div>
                              </v-col>
                              <v-col>
                                <p v-if="opportunityInfo.customer" class="mb-2">{{ opportunityInfo.customer.name | truncate(15) }}</p>
                                <p v-else class="mb-2">--</p>
                                <p v-if="opportunityInfo.customer" class="mb-2">{{ opportunityInfo.customer.identifier | VMask('##.###.###/####-##') }}</p>
                                <p v-else class="mb-2">--</p>
                                <div v-if="typeRequest == 'Voucher'">
                                  <p class="mb-2">{{ opportunityInfo.team ? opportunityInfo.team.name : '--' }}</p>
                                  <p class="mb-2">{{ opportunityInfo.assigned_to ? opportunityInfo.assigned_to.name : '--' }}</p>
                                  <p class="mb-2">{{ opportunityInfo.stage ? opportunityInfo.stage.name : '--' }}</p>
                                </div>
                                <div else>
                                  <p v-if="opportunityInfo.customer" class="mb-2">{{ opportunityInfo.customer.tax_model ? opportunityInfo.customer.tax_model : '--' }}</p>
                                  <p class="mb-2">{{ opportunityInfo.prevision ? opportunityInfo.prevision : '--' }}</p>
                                  <p v-if="opportunityInfo.customer" class="mb-2">{{ opportunityInfo.customer.website ? opportunityInfo.customer.website : '--' }}</p>
                                </div>
                              </v-col>
                            </v-row>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </div>
                <div v-show="typeRequest == 'Voucher'" v-for="item in listProducts" :key="item.id" class="w-100 v-expansion-panel-bordered mb-2">
                  <v-expansion-panel class="v-expansion-panel-no-shadow">
                    <v-expansion-panel-header disable-icon-rotate expand-icon="" class="py-2 px-3">
                      <template v-slot:default>
                        <div class="w-100 d-flex justify-start align-center">
                          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                          <p class="mb-0">
                            <span class="font-weight-bold mr-5">CNPJ</span>
                            <span>{{ item.company.identifier | VMask('##.###.###/####-##') }}</span>
                          </p>
                        </div>
                      </template>
                      <template v-slot:actions></template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="font-body-medium">
                      <div v-for="(productItem, index) in item.products" :key="productItem.id">
                        <section class="d-flex justify-start align-center mb-1">
                          <v-avatar size="36" rounded color="blue lighten-5 mr-2" class="mr-2">
                            <v-icon color="primary" class="material-symbols-outlined">
                              inventory_2
                            </v-icon>
                          </v-avatar>
                          <b>{{ productItem.product.name }}</b>
                        </section>
                        <v-row>
                          <v-col>
                            <p class="font-weight-bold mb-0">Quantidade</p>
                            <p class="font-weight-bold mb-0">Preço Unitário</p>
                            <p class="font-weight-bold mb-0">Subtotal</p>
                            <p class="font-weight-bold mb-0">Desconto</p>
                            <p class="font-weight-bold mb-0">Total c/ desconto</p>
                            <p class="font-weight-bold mb-0">Vigência</p>
                          </v-col>
                          <v-col v-if="productItem.original_value">
                            <p class="mb-0">{{ productItem.amount }}</p>
                            <p class="mb-0">{{ productItem.original_value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}</p>
                            <p class="mb-0">{{ (productItem.original_value * productItem.amount).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}</p>
                            <p class="mb-0">
                              <v-chip color="warning" small outlined>{{ productItem.discount?productItem.discount.toFixed(0).toLocaleString('pt-br',{style: 'decimal'}) + '%': '-' }}</v-chip>
                            </p>
                            <p class="mb-0">{{ ((productItem.original_value * productItem.amount) - ((productItem.original_value * productItem.amount) * productItem.discount /  100)).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})   }}</p>
                            <p class="mb-0">{{ productItem.discount_months > 0 ? `${productItem.discount_months} meses` : 'N/A' }}</p>
                          </v-col>
                          <v-col v-else>
                            <p class="mb-0">{{ productItem.amount }}</p>
                            <p class="mb-0">{{ (productItem.value + (productItem.value * productItem.discount / 100)).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}</p>
                            <p class="mb-0">{{ (productItem.value + (productItem.value * productItem.discount / 100)).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}</p>
                            <p class="mb-0">
                              <v-chip color="warning" small outlined>{{ productItem.discount?productItem.discount.toFixed(0).toLocaleString('pt-br',{style: 'decimal'}) + '%': '-' }}</v-chip>
                            </p>
                            <p class="mb-0">{{ productItem.value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'}) }}</p>
                            <p class="mb-0">{{ productItem.discount_months > 0 ? `${productItem.discount_months} meses` : 'N/A' }}</p>
                          </v-col>
                        </v-row>
                        <v-divider v-if="index != item.products.length - 1" class="mt-3 mb-4"></v-divider>
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </div>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card-text>
        <DialogAction
          v-if="isAttendant"
          :hide-submit="true"
          :hide-cancel="true"
        >
          <template v-slot:customButton>
            <section v-if="typeRequest != 'Apoio'">
              <v-btn
                @click="denyDialog = !denyDialog"
                :disabled="disabled || !haveAttendant || !isAttendant"
                color="error"
                class="mr-3"
              >
                Reprovar
              </v-btn>
              <v-btn
                @click="checkAcceptSelection"
                :disabled="disabled || !haveAttendant || !isAttendant"
                color="success"
              >
                Aprovar
              </v-btn>
            </section>
            <section v-else class="d-flex align-center">
              <v-btn
                @click="handleCancel"
                text
                color="primary"
              >
                Fechar
              </v-btn>
              <v-btn
                @click="checkAcceptSelection"
                :disabled="disabled || !haveAttendant || !isAttendant"
                color="primary"
              >
                Concluir
              </v-btn>
            </section>
          </template>
        </DialogAction>
        <DialogAction
          v-else
          @cancel="handleCancel"
          cancel-color="secondary"
          cancel-text="Fechar"
          :hide-submit="true"
        >
          <template v-slot:customButton>
            <RequestCancel
              v-if="showCancel"
              isDialog
              @reloadData="reloadDataList"
              :request-type="typeRequest"
              :item-id="requestData.id"
            />
          </template>
        </DialogAction>
      </v-card>
    </v-dialog>
    <v-dialog v-model="acceptDialog" persistent :max-width="typeRequest != 'Apoio' ? 400 : 450">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="acceptDialog = !acceptDialog" />
        <v-card-text class="text-center pt-3">
          <section v-if="typeRequest != 'Apoio'">
            <p class="subtitle-1">
              <v-icon color="success" large class="material-symbols-outlined" style="margin-left: -175px">icon_check</v-icon>
              Aprovar Solicitação
            </p>
            <p class="mb-0">Tem certeza que deseja aprovar essa transferência?</p>
          </section>
          <section v-else class="d-flex flex-column align-center">
            <p class="subtitle-1">
              Resultado
            </p>
            <p class="sub-text--text mb-0">Por favor, insira qual foi o resultado dessa solicitação</p>
            <v-radio-group
              v-model="result"
              row
            >
              <v-radio
                label="Realizado"
                value="accept"
              ></v-radio>
              <v-radio
                label="Não realizado"
                value="deny"
              ></v-radio>
            </v-radio-group>
          </section>
        </v-card-text>
        <DialogAction
          v-if="typeRequest != 'Apoio'"
          :show-divider="false"
          actions-align="center"
          submit-text="Sim, aprovar"
          cancel-text="Não, cancelar"
          @submit="acceptRequest"
          @cancel="acceptDialog = !acceptDialog"
        />
        <DialogAction
          v-else
          :show-divider="false"
          actions-align="end"
          submit-text="Concluir"
          cancel-text="Cancelar"
          :disable-submit="!result"
          @submit="concludeRequest"
          @cancel="acceptDialog = !acceptDialog"
        />
      </v-card>
    </v-dialog>
    <v-dialog v-model="denyDialog" persistent max-width="600">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="denyDialog = !denyDialog" />
        <v-card-text class="text-center pt-3">
          <p class="subtitle-1">
            <v-icon color="error" large class="material-symbols-outlined" style="margin-left: -175px">icon_close</v-icon>
            Reprovar Solicitação
          </p>
          <p>Tem certeza que deseja reprovar essa transferência?</p>
          <v-textarea
            label="Motivo"
            outlined
            dense
            rows="4"
            v-model="reproved_reason"
            :error="$v.reproved_reason.$error"
          ></v-textarea>
        </v-card-text>
        <DialogAction
          :show-divider="false"
          submit-text="Sim, reprovar"
          cancel-text="Não, cancelar"
          @submit="denyRequest()"
          @cancel="denyDialog = !denyDialog"
        />
      </v-card>
    </v-dialog>
     <v-dialog v-model="transferActions" persistent max-width="800">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="transferActions = !transferActions" title="Ações de transferência"/>
        <v-card-text class="text-center pt-3">
          <div v-for="v in postApprovalData.items" :key="v">
            <v-row>
              <v-col class="default-text--text text-left">Equipe: <span class="font-weight-bold">{{v.name}}</span></v-col>
              <v-col>
                  <v-select 
                    v-model="v.action" 
                    :items="postApprovalTeamOptions"
                    outlined
                    dense
                    hide-details
                  ></v-select>
              </v-col>
            </v-row>
            <section class="default-text--text text-left">
                <label><input type="checkbox" v-model="v.transferBant"> Transferir leads da carteira para novo dono</label>
            </section>
            <v-divider class="my-2"></v-divider>
            <template v-if="v.opportunities && v.opportunities.length">
              <v-row>
                <v-col class="font-weight-bold">Id da Op.</v-col>
                <v-col class="font-weight-bold">Pipeline</v-col>
                <v-col class="font-weight-bold">Estado</v-col>
                <v-col class="font-weight-bold">Ação</v-col>
              </v-row>
            </template>
            <div v-for="op in v.opportunities" :key="op">
              <v-row>
                <v-col class="font-body-medium">{{op.id}}</v-col>
                <v-col class="font-body-medium">{{op.pipeline}}</v-col>
                <v-col class="font-body-medium">{{op.status}}</v-col>
                <v-col class="font-body-medium">
                  <v-select 
                    v-model="op.action" 
                    :items="postApprovalOptions"
                    outlined
                    dense
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card-text>
            <v-card-actions class="d-flex justify-end py-4">
            <v-btn
              id="btn-cancel-dialog"
              class="mr-2"
              @click="transferActions=false"
              :disabled="postApprovalSending"
            >
              Cancelar
            </v-btn>
            <v-btn
              id="btn-submit-dialog"
              color="primary"
              :disabled="postApprovalSending"
              @click="postApprovalData.resolve"
            >
              Continuar
            </v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import requiredIf from 'vuelidate/lib/validators/requiredIf'

const initialState = () => {
  return {
    panels: [0, 1, 3],
    emptyLabel: '--',
    detailsEdit: false,
    singleSelect: false,
    selectedCompanys: [],
    loading: false,
    dialog: false,
    result: null,
    acceptDialog: false,
    denyDialog: false,
    haveAttendant: false,
    newAttendant: null,
    isSubmitter: null,
    isSubmitterTeam: null,
    isAttendant: null,
    canAttend: false,
    product_opportunity_id: null,
    listOpportunityProduct: [],
    moreInfo: false,
    requestData: false,
    createdDate: null,
    opportunityInfo: [],
    conversation: [],
    conversationPayload: null,
    list: [],
    listCompany: [],
    lastRequest: [],
    annotations: [],
    listApprovedCompanies: [],
    opportunityData: [],
    companyData: [],
    listProducts: [],
    customerList: [],
    attachFile: null,
    attachFileConversation: null,
    selectedSubmitter: null,
    selectedTeam: null,
    selectedAttendant: null,
    disabled: false,
    disableBtn: false,
    disableTextField: true,
    showCancel: false,
    formData: {
      submitter_id: null,
      submitter_team_id: null,
      attendant_id: null,
    },
    reproved_reason: null,
    request_submitter: false,
    content: null,
    annotationContent: null,
    transferActions: false,
    postApprovalData: {},
    postApprovalSending: false,
    itemQuantity: 4,
    postApprovalTeamOptions: [
      {text: 'Manter propriedade', value: 'keep'},
      {text: 'Remover propriedade', value: 'remove'},
    ],
    postApprovalOptions: [
      {text: 'Manter', value: 'keep'},
      {text: 'Perder', value: 'lost'},
      {text: 'Cancelar', value: 'cancelled'},
    ],
    headerCompany: [
      { text: 'Nome', value: 'name' },
      { text: 'CNPJ', value: 'identifier' },
      { text: 'Status', value: 'status' },
    ],
    headerProduct: [
      { text: '', value: 'customer.name', groupable: false},
      { text: 'Produto', value: 'product.name', groupable: false},
      { text: 'Desconto', value: 'discount', groupable: false},
      { text: 'Prazo', value: 'discount_months', groupable: false},
      { text: 'Total', value: 'value', groupable: false},
      { text: 'Dt. Pag.', value: 'product.created_at', groupable: false}
    ],
    endpointOpportunity: '/cash/opportunity',
    endpointCompany: '/customer/company',
    endpointUser: '/ecosystem/user',
    endpointTeam: '/ecosystem/team',
    endpointCapability: '/ecosystem/capability',
    endpointAnyTeam: '/ecosystem/any-team',
    endpointRequest: '/csc/request',
    endpointRequestTransfer: '/csc/request-transfer',
    endpointGetRequest: '/csc/get-request-by-id',
    endpointSetAttendant: '/csc/set-request-attendant',
    endpointEvaluateRequest: '/csc/evaluate-request',
    endpointSubmitterReply: '/csc/submitter-reply',
    endpointConversation: '/csc/conversation',
    endpointRequestLog: '/csc/request-log',
    redirectTo: '/business-companies/bureau',
    redirectOppTo: '/business-opportunity',
    transfer_bant: false
  }
}

export default {
  props: {
    openDialog: {
      type: Boolean
    },
    cscId: {
      type: Number
    }
  },
  data () {
    return initialState()
  },
  validations: {
    content: { required: requiredIf(function() { return this.moreInfo }) },
    annotationContent: { required: requiredIf(function() { return this.moreInfo }) },
    reproved_reason: { required: requiredIf(function() { return this.denyDialog }) },
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam'
    }),
    tabItems() {
      var disable = false
      if(!this.canAttend) {
        disable = true
      }
      const tabs = [
        { name: 'Solicitação', value: 'solicitation', disabled: disable },
        { name: 'Anotações', value: 'note', disabled: disable }
      ]
      return tabs
    },
    companyList() {
      if(this.typeRequest == 'Transferência' && this.requestData && this.companyData.length > 0 && this.opportunityData.length > 0) {
        const data = JSON.parse(this.requestData.data)
        const list = data.companys.map((company) => {
          const identifier = company.identifier.replace(/[^a-zA-Z0-9 ]/g, '')
          const companyInfo = this.companyData.find(item => item.identifier == identifier)

          const opportunityList = this.opportunityData.filter(item => item.customer_id == companyInfo.id)
          const opportunityInfo = opportunityList[opportunityList.length - 1]

          return {
            ...company,
            id: companyInfo?.id,
            partnership: companyInfo?.partnership,
            team: opportunityInfo?.team?.name,
            assigned_to: opportunityInfo?.assigned_to?.name,
            accounting: companyInfo?.accounting,
            economic_group: companyInfo?.economic_group
          }
        })
        return list
      }
      return []
    },
    createdAt() {
      if(this.requestData) {
        return this.requestData.created_at
      }
      return this.emptyLabel
    },
    status() {
      if(this.requestData) {  
        return this.requestData.status
      }
      return this.emptyLabel
    },
    typeRequest() {
      if(this.requestData) {
        return this.requestData.type?.type
      }
      return this.emptyLabel
    },
    dataRequest() {
      if(this.requestData) {
        const data = JSON.parse(this.requestData.data)
        return data
      }
      return []
    }
  },
  watch: {
    openDialog(newValue) {
      this.dialog = newValue
    },
    async dialog(newValue) {
      if(newValue) {
        await this.loadForm()
      }
    },
    attachFile(newValue) {
      if(newValue) {
        this.uploadFile(newValue)
      }
    },
    attachFileConversation(newValue) {
      if(newValue) {
        this.uploadFileConversation(newValue)
      }
    },
  },
  mounted() {
    this.loadForm()
  },
  methods: {
    async checkIfExistOnTray() {
      const list = await this.getAllIDBData(this.config_IDB.database, this.config_IDB.version, this.config_IDB.store.request)
      const item = list.find(i => i.id == this.requestData.id)
      if(item) {
        this.$root.$emit('removeDialogFromTray', item)
      }
    },
    async handleMinimize() {
      const request = { 
        id: this.requestData.id,
        name: this.requestData.type.name,
        dialog: 'request',
        created_at: this.$moment().format('YYYY-MM-DD HH:mm:ss')
      }
      this.$root.$emit('checkQuantity', this.requestData)
      await new Promise((resolve) => {
        setTimeout(async () => {
          await this.addIDBData(this.config_IDB.database, this.config_IDB.version, this.config_IDB.store.request, request, this.itemQuantity)
          this.$root.$emit('updateTray')
          this.$emit('closeDialog')
          resolve()
        }, 500)
      })
    },
    showRequestCancel() {
      const { submitter_id, type } = this.requestData
      if(type.type == 'Apoio' && submitter_id == this.userInfo.id && this.status == 'Pendente') {
        this.showCancel = true
      }else {
        this.showCancel = false
      }
    },
    async reloadDataList() {
      await this.$emit('reloadData')
      await this.$emit('closeDialog')
    },
    translateCommunication(value) {
      if(value == 'call') {
        return 'Ligação'
      }else if(value == 'email') {
        return 'E-mail'
      }else if(value == 'meeting') {
        return 'Reunião'
      }else {
        return '--'
      }
    },
    async handleScrollConversation({ target: { scrollTop, clientHeight, scrollHeight }}) {
      var roundScrollTop = Math.round(scrollTop)

      if ((roundScrollTop + clientHeight + 10) >= scrollHeight) {
        if (this.conversationPayload?.hasNext) {
          this.conversationPayload.page += 1
          const { data, hasNext } = await this.getList(this.endpointConversation, `request_id=${this.requestData.id}&page=${this.conversationPayload.page}`)
          
          const newData = []
          for await (const message of data) {
            const objWithIdIndex = this.conversation.findIndex((obj) => obj.id === message.id)
            if (objWithIdIndex > -1) {
              this.conversation.splice(objWithIdIndex, 1)
              this.conversation.data.splice(objWithIdIndex, 1)
            }

            var colored = false
            if(message.origin_id == this.userInfo.id) {
              colored = true
            }
            
            const content = message.content
            const result = content?.includes('file_id')
            if(result) {
              var objContent = JSON.parse(content)
              var { file_id, name } = objContent
              var fileUrl = await this.handleRedirectFile(file_id, true)
            }

            newData.push({
              origin_id: message.origin_id,
              userName: await this.getUserName(message.origin_id),
              content: message.content,
              created_at: this.$moment(new Date(`${message.created_at}Z`)),
              colored: colored,
              is_attach: result,
              file_id: file_id,
              file_name: name,
              file_url: fileUrl,
            })
          }

          this.conversation = this.conversation.concat(newData)
          this.conversationPayload.data = this.conversationPayload.data.concat(newData)
          this.conversationPayload.hasNext = hasNext
        }
      }
    },
    async uploadFile(file) {
      this.$refs['attachFile'].validate(file)
      const cscInfo = { request_id: this.cscId }
      const payload = new FormData()
      payload.append('data', JSON.stringify(cscInfo))
      payload.append('file', file)
      try {
        const { data } = await this.createItem('/csc/upload-csc-file', payload, { throwError: true })

        const attachData = JSON.stringify(data[0])
        
        const formData = {
          request_id: this.cscId,
          type: 'annotation',
          content: attachData,
          owner_id: this.userInfo.id
        }
        await this.createItem(this.endpointRequestLog, formData, { fireSuccessAlert: false })
        this.loadForm()
      } catch (error) {
        console.log(error)
      }
      this.attachFile = null
    },
    async uploadFileConversation(file) {
      this.$refs['attachFileConversation'].validate(file)
      const cscInfo = { request_id: this.cscId }
      const payload = new FormData()
      payload.append('data', JSON.stringify(cscInfo))
      payload.append('file', file)
      try {
        const { data } = await this.createItem('/csc/upload-csc-file', payload, { throwError: true })

        const attachData = JSON.stringify(data[0])
        
        const conversationFormData = { 
          origin_id: this.userInfo.id,
          request_id: this.cscId,
          content: attachData
        }
        await this.createItem(this.endpointConversation, conversationFormData)
        this.loadForm()

      } catch (error) {
        console.log(error)
      }
      this.attachFileConversation = null
    },
    async handleRedirectFile(fileId, image) {
      try {
        const { data: { url } } = await this.$axios.get(`/csc/get-csc-file/${fileId}`)
        if(image) {
          return url
        }else{
          window.open(url, '_blank').focus()
        }
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Não foi possível gerar o link',
          footer: `details: ${error.data?.detail}`
        })
      }
    },
    checkStatus() {
      if (this.isSubmitter && this.isAttendant) {
        this.disableBtn = false
      }else if(this.isSubmitter && (this.status == 'Aguardando Atendente' || this.status == 'Aguardando Atendimento' || this.status == 'Em Atendimento')) {
        this.disableBtn = true
      }else if(!this.isSubmitter && this.status == 'Aguardando Solicitante') {
        this.disableBtn = true
      }else {
        this.disableBtn = false
      }
    },
    getMyTeams() {
      let teams = []
      try {
        let uinfo = JSON.parse(localStorage.userInfo)
        if (uinfo.capabilities) {
          for (let cap of uinfo.capabilities) {
            teams.push(cap?.team_id)
          }
        }
      }
      catch(e) {
        console.log('Error parsing user info')
        console.log(e)
      }
      return teams
    },
    async checkPersona() {
      const { submitter_id, submitter_team, attendant_id} = this.requestData
      
      const res = await this.getItem(this.endpointCapability, `user_id=${submitter_id}`)
      if(res) {
        this.isSubmitterTeam = true
      }else {
        const res = await this.getItem(this.endpointCapability, `team_id=${submitter_team}`)
        if(res) {
          this.isSubmitterTeam = true
        }else {
          this.isSubmitterTeam = false
        }
      }

      if(submitter_id == this.userInfo.id) {
        this.isSubmitter = true
      }else {
        this.isSubmitter = false
      }

      this.isAttendant = attendant_id == this.userInfo.id
    },
    async getAnnotation() {
      if(this.requestData) {
        const list = this.requestData.logs.filter((log) => log.type == 'Anotação')
        this.annotations = []
        for (const annotation of list) {
          const content = annotation.content
          const result = content.includes('file_id')
          if(result) {
            var objContent = JSON.parse(content)
            var { file_id, name } = objContent
            var fileUrl = await this.handleRedirectFile(file_id, true)
          }
          this.annotations.push({
            ...annotation,
            created_at: this.$moment(new Date(`${annotation.created_at}Z`)),
            is_attach: result,
            file_id: file_id,
            file_name: name,
            file_url: fileUrl,
          })
        }
      }
    },
    async getUserName(id) {
      const { name } = await this.getItem(this.endpointUser, `id=${id}`)
      return name
    },
    async getCompany() {
      const listIdentifier = []
      const data = JSON.parse(this.requestData.data)
      if(data.companys) {
        if(data?.companys.length == 1) {
          const identifier = data.companys[0].identifier
          this.selectedCompanys.push(identifier)
        }
      
        data.companys.forEach(company => {
          const identifier = company.identifier.replace(/[^a-zA-Z0-9 ]/g, '')
          listIdentifier.push(identifier)
        })
      }else if(data.products) {
        data.products.forEach(product => {
          const company = product.customer
          if(company) {
            const identifier = company.identifier.replace(/[^a-zA-Z0-9 ]/g, '')
            listIdentifier.push(identifier)
          }
        })

      }
      const list = await this.getList(this.endpointCompany, `translateEnums=true&identifier=in(${listIdentifier})`)
      this.companyData = list.data
    },
    async getOpportunity() {
      const listId = []

      const data = JSON.parse(this.requestData.data)

      this.companyData.forEach(company => {
        const id = company.id
        listId.push(id)
      })

      const list = await this.getList(this.endpointOpportunity, `includes=team,assigned_to,stage&customer_id=in(${listId})`)
      this.opportunityData = list.data

      if(data.products && data.products.length) {
        const opp_id = data.products[0].opportunity_id

        const oppData = await this.getItem(this.endpointOpportunity, `translateEnums=true&includes=customer,team,assigned_to,stage&id=${opp_id}`)
        this.opportunityInfo = oppData
      }else if(data.opportunity_id) {
        this.opportunityInfo = this.dataRequest.opportunity
      }

    },
    async loadForm(page=0) {
      this.haveAttendant = false
      this.disabled = false
      
      this.panels = [0, 1, 3]
      this.request_submitter = false
      this.loading = true
      if(this.cscId) {
        const request = await this.getItem(this.endpointRequest, `translateEnums=true&includes=submitter_team,submitter,type.eligible_teams,logs.owner,uploads&id=${this.cscId}`)
        this.requestData = request

        const lastRequest = await this.getList(this.endpointRequest, `translateEnums=true&includes=type.eligible_teams,uploads,submitter&submitter_id=${this.requestData.submitter_id}`)
        this.lastRequest = lastRequest.data


        if(this.requestData) {
          await this.checkIfExistOnTray()
          await this.checkPersona()
          await this.checkStatus()
          await this.getCompany()
          this.getOpportunity()
          this.getAnnotation()
          this.showRequestCancel()
          
          const requestStatus = await this.requestData.status
          if(requestStatus == 'Concluído') {
            this.disabled = true
          }

          if(this.requestData.submitter_id == this.userInfo.id) {
            if(requestStatus == 'Em Atendimento' || requestStatus == 'Aguardando Solicitante') {
              this.disableTextField = false
            }
          }else if(this.requestData.attendant_id == this.userInfo.id) {
            if(requestStatus == 'Em Atendimento') {
              this.disableTextField = false
            }
          }
          
          if(this.requestData.attendant_id) {
            this.haveAttendant = true
            this.selectedAttendant = await this.getItem(this.endpointUser, `id=${this.requestData.attendant_id}`)
            this.formData.attendant_id = this.selectedAttendant.name
          }

          this.canAttend = false
          if (this.requestData?.type?.eligible_teams) {
            let myTeams = this.getMyTeams()
            // eslint-disable-next-line no-unsafe-optional-chaining
            for (let et of this.requestData?.type?.eligible_teams) {
              if (myTeams.includes(et.attendant_team_id)) {
                this.canAttend = true
                break
              }
            }
          }

          this.reproved_reason = this.requestData.reproved_reason

          if(this.requestData.data) {
            const requestData = JSON.parse(this.requestData.data)

            this.selectedTeam = null
            if (requestData.team_name) {
              this.selectedTeam = requestData.team_name
            }

            var statusPending = null
            if(this.requestData.status == 'Rejeitado') {
              statusPending = 'Rejeitado'
            }else if(this.requestData.status == 'Aprovado') {
              statusPending = 'Rejeitado'
            }else {
              statusPending = 'Pendente'
            }

            if(requestData.approved_companies) {
              var pending = []
              const approved = requestData?.approved_companies.map(company => ({
                ...company,
                status: 'Aprovado'
              }))

              requestData?.companys.forEach(company => {
                const search = approved.find(item => item.identifier == company.identifier)
                if(!search) {
                  pending.push({
                    ...company,
                    status: statusPending
                  })
                }
              })
              this.listCompany = [ ...pending, ...approved ]
            }else {
              if(requestData.companys) {
                const pending = requestData?.companys.map(company => ({
                  ...company,
                  status: statusPending
                }))
                this.listCompany = pending
              }
            }
            
            this.product_opportunity_id = requestData?.opportunity
            
            if(this.product_opportunity_id) {
              this.listOpportunityProduct = await this.getItem('/cash/opportunity', `id=${this.product_opportunity_id}`)
            }


            this.listProducts = []
            if(requestData?.products) {
              var productsByCustomer = {}
                
              let products = requestData?.products?.filter(product => product.state == 'csc_required')
              for (let product of products) {
                if (!(product.customer_id in productsByCustomer)) {
                  productsByCustomer[product.customer_id]=[]
                }
                productsByCustomer[product.customer_id].push(product)
              }

              this.listProducts = []
              for (let company in productsByCustomer) {
                let obj = {
                  company: productsByCustomer[company][0].customer,
                  products: productsByCustomer[company]
                }
                this.listProducts.push(obj)
              }
            }

          }
          
          const conversation =  await this.getList(this.endpointConversation, `request_id=${this.requestData.id}`)
          this.conversationPayload = conversation
          this.conversationPayload.page = page || 0

          this.conversation = []

          for(const message of conversation.data) {
            var colored = false
            if(message.origin_id == this.userInfo.id) {
              colored = true
            }

            const content = message.content
            const result = content.includes('file_id')
            if(result) {
              var objContent = JSON.parse(content)
              var { file_id, name } = objContent
              var fileUrl = await this.handleRedirectFile(file_id, true)
            }

            this.conversation.push({
              origin_id: message.origin_id,
              userName: await this.getUserName(message.origin_id),
              content: message.content,
              created_at: this.$moment(new Date(`${message.created_at}Z`)),
              colored: colored,
              is_attach: result,
              file_id: file_id,
              file_name: name,
              file_url: fileUrl,
            })
          }

          this.selectedSubmitter = await this.getItem(this.endpointUser, `id=${this.requestData.submitter_id}`)
      
          this.formData.submitter_id = this.selectedSubmitter?.name
          this.formData.submitter_team_id = this.requestData.submitter_team?.name
          
        }
      }
      this.loading = false
      this.dialog && this.scrollToEnd()
    },
    filterAttendant() {
      this.$emit('filter-attendant', this.requestData.submitter_id)
      this.dialog = false
    },
    scrollToEnd() {
      setTimeout(() => {
        const timelineScroll = document.querySelector('#v-card-text-scrollbar')
        const timelineScrollNote = document.querySelector('#v-card-text-scrollbar-note')

        timelineScroll.scrollTop =
          timelineScroll.scrollHeight - timelineScroll.clientHeight

        timelineScrollNote.scrollTop =
          timelineScrollNote.scrollHeight - timelineScrollNote.clientHeight
      }, 200)
    },
    async setAttendant() {
      await this.getList(`${this.endpointSetAttendant}/${this.cscId}`)
      
      const defaultConversation = `Olá, o atendimento da sua solicitação de ${this.typeRequest} #${this.cscId} foi iniciado por ${this.userInfo.name}.`
      const conversationFormData = { 
        origin_id: this.userInfo.id,
        request_id: this.cscId,
        content: defaultConversation
      }

      await this.createItem(this.endpointConversation, conversationFormData, { fireSuccessAlert: false })
      
      this.haveAttendant = true
      this.loadForm()
    },
    requestMoreInfo() {
      this.moreInfo = true
    },
    async sendRequestMoreInfo(e) {
      const shift = e.shiftKey
      if(shift) {
        return false
      }

      this.$v.content.$touch()
      if (this.$v.content.$error) {
        this.$swal({
          icon: 'warning',
          html: '<p class="subtitle-1">Digite uma mensagem para prosseguir com a solicitação.</p>',
          showConfirmButton: false,
          showCloseButton: true,
        })
        return
      }

      const conversationFormData = { 
        origin_id: this.userInfo.id,
        request_id: this.cscId,
        content: this.content,
        request_submitter: this.request_submitter
      }
      await this.createItem(this.endpointConversation, conversationFormData, { fireSuccessAlert: false })
      if(this.isSubmitter) {
        await this.$axios.get(`${this.endpointSubmitterReply}/${this.cscId}`)
      }else {
        await this.$axios.get(`${this.endpointEvaluateRequest}/${this.cscId}/more-info`)
      }
      this.loadForm()
      this.content = null
      this.moreInfo = false
    },
    checkAcceptSelection() {
      if(this.typeRequest == 'Transferência') {
        if(!this.selectedCompanys.length) {
          this.$swal({
            icon: 'warning',
            html: '<p class="subtitle-1">Selecione as empresas que deseja aprovar.</p>',
            showConfirmButton: false,
            showCloseButton: true,
          })
        }else {
          this.acceptDialog = true
        }
      }else {
        this.acceptDialog = true
      }
      
    },
    async concludeRequest() {
      if(this.result == 'accept') {
        await this.$axios.get(`${this.endpointEvaluateRequest}/${this.cscId}/accept`)
      }else {
        await this.$axios.get(`${this.endpointEvaluateRequest}/${this.cscId}/deny`)
      }

      this.acceptDialog = false
      this.loadForm()
      
      this.$swal({
        position: 'top-end',
        icon: 'success',
        title: 'Solicitação processada com sucesso!',
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
    },
    async acceptRequest() {
      let processed = false
      if(this.status == 'Aguardando Solicitante') {
        this.$swal({
          icon: 'warning',
          html: '<p class="subtitle-1">Aguarde a resposta do solicitante para encerrar seu atendimento.</p>',
          showConfirmButton: false,
          showCloseButton: true,
        })
      }else {
        if(this.typeRequest == 'Transferência') {
          const oldData = JSON.parse(this.requestData.data)
          const newdata = JSON.stringify({ 
            approved_companies: this.selectedCompanys,
            companys: oldData.companys,
            pipeline_id: oldData.pipeline_id,
            reason: oldData.reason,
          })
          const formData = {
            id: this.cscId,
            data: newdata
          }
          let transferResponse = await this.updateData(this.endpointRequestTransfer, formData, { fireSuccessAlert: false })
          if ('data' in transferResponse) {
            this.postApprovalData = {}
            this.postApprovalData.items = transferResponse.data
            this.transferActions = true
            let resolve
            let modal = new Promise((pResolve) => {
              resolve = pResolve
            })
            this.postApprovalData.resolve = resolve
            await modal
            processed = true
            this.postApprovalSending = true
            await this.$axios.post(`${this.endpointEvaluateRequest}/${this.cscId}/accept`, this.postApprovalData)
            this.postApprovalSending = false
            this.transferActions = false
            this.transfer_bant = false
          }
        }

        if (!processed) {
          await this.$axios.get(`${this.endpointEvaluateRequest}/${this.cscId}/accept`)
        }
        
        this.acceptDialog = false
        this.loadForm()

        this.$swal({
          position: 'top-end',
          icon: 'success',
          title: 'Solicitação processada com sucesso!',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      }
    },
    async denyRequest() {
      if(this.status == 'Aguardando Solicitante') {
        this.$swal({
          icon: 'warning',
          html: `
            <h6>Aviso</h6>
            <p class="mb-0">Aguarde a resposta do solicitante para encerrar seu atendimento.</p>
          `,
          showConfirmButton: false,
          showCloseButton: true,
        })
      }else {
        this.$v.reproved_reason.$touch()
        if (this.$v.reproved_reason.$error) {
          this.$swal({
            icon: 'warning',
            html: '<p class="subtitle-1">Digite uma mensagem para prosseguir com a solicitação.</p>',
            showConfirmButton: false,
            showCloseButton: true,
          })
          return
        }

        const formData = {
          id: this.cscId,
          reproved_reason: this.reproved_reason
        }
        await this.updateData(this.endpointRequestTransfer, formData, { fireSuccessAlert: false })
        
        const conversationFormData = { 
          origin_id: this.userInfo.id,
          request_id: this.cscId,
          content: this.reproved_reason
        }
        await this.createItem(this.endpointConversation, conversationFormData, { fireSuccessAlert: false })
        await this.$axios.get(`${this.endpointEvaluateRequest}/${this.cscId}/deny`)
        
        this.denyDialog = false
        this.loadForm()

        this.$swal({
          position: 'top-end',
          icon: 'success',
          title: 'Solicitação processada com sucesso!',
          toast: true,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      }
    },
    async updateDetailForm() {
      var id = null
      var name = null
      if(this.newAttendant.user_id) {
        id = this.newAttendant.user_id
        name = this.newAttendant.user.name
      }else {
        id = this.newAttendant.id
        name = this.newAttendant.name
      }

      await this.getList(`${this.endpointSetAttendant}/${this.cscId}?user_id=${id}`)

      const defaultConversation = `O atendimento da sua solicitação de ${this.typeRequest} #${this.cscId} foi transferida para o usuário ${name}.`
      const conversationFormData = { 
        user_id: this.userInfo.id,
        request_id: this.cscId,
        content: defaultConversation
      }

      await this.createItem(this.endpointConversation, conversationFormData)
      
      this.detailsEdit = false
      this.newAttendant = null

      this.loadForm()
    },
    async submitAnnotation(e) {
      const shift = e.shiftKey
      if(shift) {
        return false
      }

      this.$v.annotationContent.$touch()
      if (this.$v.annotationContent.$error) {
        this.$swal({
          icon: 'warning',
          html: '<p class="subtitle-1">Digite uma mensagem para prosseguir com a solicitação.</p>',
          showConfirmButton: false,
          showCloseButton: true,
        })
        return
      }

      e.preventDefault()
      const formData = {
        request_id: this.cscId,
        type: 'annotation',
        content: this.annotationContent,
        owner_id: this.userInfo.id
      }
      await this.createItem(this.endpointRequestLog, formData, { fireSuccessAlert: false })
      
      this.annotationContent = null
      this.loadForm()
    },
    redirectPage(item) {
      var { identifier, id } = item
      identifier = identifier.replace(/[^A-Z0-9]/ig, '')
      
      return `${this.redirectTo}/${identifier}?company_id=${id}`
    },
    redirectToOpportunityPage(item) {
      var { id } = item
      return `${this.redirectOppTo}/router/${id}`
    },
    handleCancel() {
      this.$emit('closeDialog')
      this.denyDialog = false
      this.acceptDialog = false
      this.dialog = false
      this.$root.$emit('removeDialogFromTray', this.requestData)
      Object.assign(this.$data, initialState())
    }
  }
}
</script>

<style scoped>
  * {
    scrollbar-width: auto;
    scrollbar-color: #9e9e9e #c2c2c2;
  }
  *::-webkit-scrollbar {
    width: 5px;
  }
  *::-webkit-scrollbar-track {
    background: #c2c2c2;
    border-radius: 6px;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #9e9e9e;
    border-radius: 6px;
    border: 3px solid #9e9e9e;
  }
  .container-progress-circular {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(#f8f9fa, 0.8)
  }
  .left-column {
    height: 610px;
  }
  .right-column {
    height: 610px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .v-sheet-product {
    border: dashed 1px #AEB4C2;
  }
  .v-card-main {
    min-height: 300px;
  }
  .v-expansion-panel-bordered {
    border: 1px solid #D2D6DA;
    border-radius: 8px;
    padding: 2px;
  }
  .v-expansion-panel-no-shadow::before {
    box-shadow: none !important;
  }
  .v-card-text-scrollbar {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    height: 330px;
  }
  .container-textarea {
    position: relative;
  }
  .btn-set-attendant {
    position: absolute;
    top: 46px;
    left: 37%;
  }
  .v-form-details {
    margin-top: -8px;
  }
  .left-reply {
    border-radius: 0px 8px 8px 8px !important;
  }
  .right-reply {
    border-radius: 8px 0px 8px 8px !important;
  }
  .ajust-action-buttons {
    margin-top: -70px;
  }
  .bg-annotation {
    background-color: #FFFAE1;
  }
  .paragraph-link {
    color: var(--v-primary-base);
    cursor: pointer;
  }
  .conversation-warn-customer{
    margin-top: -0.75em;
  }

  .transferbox-check {
    color: red;
    flex-grow: 1;
    align-self: flex-start;
    margin-left: 12px;
  }
</style>