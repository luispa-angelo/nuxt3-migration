<template>
  <main>
    <PageHeadline class="headline" :showBreadCrumb="true">
      <template #breadcrumb>
        <div class="headline_title">
          <RouterBreadCrump :show-match-url="false" hasTitle :pageTitle="pageTitle"/>
        </div>
      </template>
      <v-menu offset-y left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            data-test="btnBureauCreate"
            color="secondary"
            class="mr-2"
            v-bind="attrs"
            v-on="on"
          >
            Criar
            <v-icon class="material-symbols-rounded">arrow_drop_down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>
              <Sheet
                :isEditing="false"
                isDropdown
                @submit="$refs.myForm.submitForm()"
                @cancel="$refs.myForm.handleCancel()"
                title="Criar Empresa"
              >
              <template v-slot="{ sheet, closed }">
                <CompanyForm ref="myForm" :sheet="sheet" @closeForm="closed"/>
              </template>
              </Sheet>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <CompanyTransfer companies-transfer :companies-to-transfer="selectedCompanies" @clearSelected="handleReset" />
    </PageHeadline>
    <v-row>
      <v-col xl="12" lg="12" class="pb-0">
        <v-form ref="baseFilter" class="d-flex">
          <v-row>
            <v-col class="pb-0">
              <TextField
                data-test="inputBureauCnpjOrName"
                label="CNPJ ou Nome da Empresa"
                outlined
                dense
                append-icon="search"
                hint="Utilize espaço, vírgula ou ponto e vírgula entre os CNPJs."
                v-model.trim="filters.identifier_name"
                @keyup.enter="loadData(true)"
                @change="loadData(true)"
                :error-messages="identifier_name_hasError ? 'Utilize espaço, vírgula ou ponto e vírgula entre os CNPJs' : ''"
                :error="identifier_name_hasError"
              ></TextField>
            </v-col>
            <v-col class="pb-0">
              <v-autocomplete
                data-test="selectBureauStatus"
                attach
                label="Status"
                outlined
                dense
                clearable
                multiple
                :items="legalState"
                item-text="name"
                item-value="value"
                v-model="filters.status"
                @change="loadData(true)"
                @click:clear="checkObject"
              >
                <template v-slot:selection="{ item, parent, index }">
                  <AutocompleteSelectionSlot
                    :maxLength="22"
                    :parent="parent"
                    :item="item"
                    :counter="filters.status ? filters.status.length : 0"
                    :index="index"
                  />
                </template>
              </v-autocomplete>
            </v-col>
            <v-col class="pb-0">
              <v-select
                data-test="selectBureauAvailable"
                attach
                label="Disponibilidade"
                outlined
                dense
                clearable
                :items="listAvailable"
                item-text="name"
                item-value="value"
                v-model="filters.available"
                @change="loadData(true)"
                @click:clear="checkObject"
              ></v-select>
            </v-col>
            <v-col class="pb-0">
              <NewAutocomplete
                :key="segmentKey"
                data-test="selectBureauSegment"
                label="Segmento"
                outlined
                dense
                multiple
                clearable
                :endpoint="url.segment"
                :preLoadedItems="preLoadedSegment"
                search-key="description"
                item-text="description"
                item-value="code"
                :customSelection="true"
                slotFieldName="description"
                v-model="filters.segment"
                @change="loadData(true)"
                @click:clear="checkObject"
              ></NewAutocomplete>
            </v-col>
            <v-col class="d-flex justify-end pb-0">
              <v-btn
                data-test="btnBureauClearFilter"
                @click="clearFilter"
                :disabled="disableBtn"
                color="secondary"
                class="mr-2"
              >
                Limpar filtros
              </v-btn>
              <v-btn
                data-test="btnBureauMoreFilter"
                @click="moreFilter = !moreFilter"
                fab
                color="secondary"
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                      Mais filtros
                    </div>
                    `,
                  placement: 'left'
                }"
              >
                <v-icon class="material-symbols-rounded" color="primary">
                  {{ moreFilter ? 'close' : 'tune' }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <TableFilter :active="moreFilter">
      <template>
        <v-form ref="moreFilter">
          <v-row>
            <v-col xl="3" lg="3">
              <NewAutocomplete
                :key="primaryKey"
                data-test="selectBureauPrimaryCnae"
                label="CNAE Primária"
                dense
                hide-details
                clearable
                multiple
                :endpoint="url.cnae"
                query="order=description"
                :preLoadedItems="preLoadedPrimary"
                :search-key="cnae_primary_key"
                :item-text="item => `${item.description} - ${item.code}`"
                item-value="code"
                return-object
                :customSelection="true"
                slotFieldName="description"
                v-model="moreFilters.primary_cnae"
                @change="loadData(true)"
                @click:clear="checkObject"
                @onSearchUpdate="setSearchKeyCnaePrimary"
              ></NewAutocomplete>
            </v-col>
            <v-col xl="3" lg="3">
              <NewAutocomplete
                :key="secondaryKey"
                data-test="selectBureauSecondaryCnae"
                label="CNAE Secundária"
                dense
                hide-details
                clearable
                multiple
                :endpoint="url.cnae"
                query="order=description"
                :preLoadedItems="preLoadedSecondary"
                :search-key="cnae_secondary_key"
                :item-text="item => `${item.description} - ${item.code}`"
                item-value="code"
                return-object
                :customSelection="true"
                slotFieldName="description"
                v-model="moreFilters.secondary_cnae"
                @change="loadData(true)"
                @click:clear="checkObject"
                @onSearchUpdate="setSearchKeyCnaeSecondary"
              ></NewAutocomplete>
            </v-col>
            <v-col xl="3" lg="3">
              <v-autocomplete
                data-test="selectBureauState"
                attach
                label="Estado"
                dense
                hide-details
                clearable
                multiple
                :items="listState"
                item-text="name"
                item-value="value"
                return-object
                v-model="moreFilters.uf"
                @click:clear="checkObject"
              >
                <template v-slot:selection="{ item, parent, index }">
                  <AutocompleteSelectionSlot
                    :maxLength="22"
                    :parent="parent"
                    :item="item"
                    :counter="moreFilters.uf ? moreFilters.uf.length : 0"
                    :index="index"
                  />
                </template>
              </v-autocomplete>
            </v-col>
            <v-col xl="3" lg="3">
              <v-tooltip v-if="stateList.length == 0" top>
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on">
                    <NewAutocomplete
                      data-test="selectBureauCity"
                      v-bind="attrs"
                      label="Cidade"
                      dense
                      hide-details
                      clearable
                      removeSpecialChars
                      :endpoint="url.city"
                      :query="`uf=in(${stateList})`"
                      :disabled="stateList.length == 0"
                    ></NewAutocomplete>
                  </div>
                </template>
                <span>Selecione o(s) Estado(s) para selecionar a Cidade.</span>
              </v-tooltip>
              <NewAutocomplete
                data-test="selectBureauCity"
                v-else
                :key="keyCity"
                label="Cidade"
                dense
                hide-details
                clearable
                :endpoint="url.city"
                :query="`uf=in(${stateList})`"
                :disabled="stateList.length == 0"
                search-key="city"
                :item-text="item => `${item.uf} - ${item.city}`"
                item-value="code"
                return-object
                removeSpecialChars
                v-model="moreFilters.city"
                @change="loadData(true)"
                @click:clear="checkObject"
              ></NewAutocomplete>
            </v-col>
            <v-col xl="3" lg="3">
              <v-autocomplete
                data-test="selectBureauFoundationDate"
                attach
                label="Data de criação"
                dense
                item-text="name"
                item-value="value"
                no-data-text=""
                return-object
                clearable
                v-model="moreFilters.foundation_date"
                :items="generateItemsList(pastDateRange, tabFoundationDate, customItem)"
                @input="loadData(true)"
              >
                <template v-slot:prepend-item>
                  <AutocompletePrependItemSlot
                    v-bind:dateChip.sync="tabFoundationDate"
                    :custom-value-item="customItem"
                    @onDateChosen="(value) => { customItem = value }"
                    @onChipChange="(value) => { tabFoundationDate = tabFoundationDate }"
                  />
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-form>
      </template>
    </TableFilter>
    <v-row v-if="showMoreFilters" class="mt-0">
      <v-col class="d-flex justify-start align-center flex-wrap mt-0 mb-1 pt-0">
        <div
          v-for="(value, name, index) in moreFilters"
          :key="index"
          class="d-flex align-center mb-2 mr-3"
        >
          <p v-if="value && index == 0" class="mr-3 mb-0">Filtros aplicados:</p>
          <label v-if="value" class="sub-text--text mr-1 mb-0">{{ getFilterName(name) }}:</label>
          <v-chip
            data-test="chipRemoveFilter"
            v-if="value"
            label
            color="blue lighten-5"
            close
            close-icon="close"
            @click:close="removeFilter(name)"
          >
            <div v-if="Array.isArray(value)">
              <span v-for="(item, index) in value" :key="index">
                <span v-if="index <= 1">
                  {{
                    getItemName(name, item)
                  }}<span v-if="index + 1 < value.length">, </span>
                </span>
                <span v-if="index == value.length - 1">
                  <span v-if="index >= 2">(+{{ value.length - 2 }})</span>
                </span>
              </span>
            </div>
            <div v-else>
              <span v-if="name == 'city'">{{ value.city }}</span>
              <span v-else-if="name == 'foundation_date'">{{ value.name }}</span>
            </div>
          </v-chip>
        </div>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col class="pt-0">
        <v-data-table
          data-test="tableBureau"
          ref="dataTableWrapper"
          :loading="isLoading"
          v-model="selectedCompanies"
          :headers="headers"
          :items="listItems"
          :item-key="itemKey"
          :footer-props="footerProps"
          show-select
          @click:row="redirectPage"
          @pagination="handlePagination"
          class="v-data-table"
        >
          <template v-slot:[`header.actions`]="{ header }">
            <v-menu
              v-if="header"
              max-width="300"
              min-width="250"
              max-height="400"
              bottom
              left
              eager
              offset-y
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  data-test="btnBureauMenuActions"
                  v-bind="attrs"
                  v-on="on"
                  small
                  class="material-symbols-outlined"
                >
                  add
                </v-icon>
              </template>
              <v-list>
                <v-subheader>Exibir</v-subheader>
                <v-list-item v-for="(field, index) in fields" :key="index">
                  <v-checkbox
                    v-model="selectedFields"
                    :label="field.label"
                    :value="field"
                    dense
                  />
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <p class="mb-0">{{ item.name | truncate(35) }}</p>
            <small class="sub-text--text mb-0">
              {{ item.cnpj }}
              <v-btn data-test="btnBureauCopyToClipboard" @click.native.stop="copyToClipboard(item.cnpj)" icon small color="primary">
                <v-icon small class="material-symbols-rounded">
                  content_copy
                </v-icon>
              </v-btn>
            </small>
          </template>
          <template v-slot:[`item.available`]="{ item }">
            <v-chip :color="item.available == 'Sim' ? 'success' : 'stroke darken-1'" outlined small>
              {{ item.available == 'Sim' ? 'Disponível' : 'Indisponível' }}
            </v-chip>
          </template>
          <template v-slot:[`item.primary_cnae`]="{ item }">
            <p class="mb-0">{{ item.segment_description | truncate(35) }}</p>
            <v-divider></v-divider>
            <p
              v-tooltip="{
                content: `
                  <div class='v-btn-tooltip'>
                    ${item.primary_cnae_description}
                  </div>
                  `,
                placement: 'top'
              }"
              class="mb-0"
            >
              {{ item.primary_cnae_description | truncate(30) }}
            </p>
            <small class="sub-text--text mb-0">{{ item.primary_cnae | VMask('####-#/##') }}</small>
          </template>
          <template v-slot:[`item.secondary_cnae`]="{ item }">
            <div v-if="item.secondary_cnae_description">
              <p
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                      ${item.secondary_cnae_description}
                    </div>
                    `,
                  placement: 'top'
                }"
                class="mb-0"
              >
                {{ item.secondary_cnae_description | truncate(30) }}
              </p>
              <small class="sub-text--text mb-0">{{ item.secondary_cnae | VMask('####-#/##') }}</small>
            </div>
            <p v-else class="sub-text--text">Não possui</p>
          </template>
          <template v-slot:[`item.uf`]="{ item }">
            <p class="mb-0">
              {{ item.city ? `${item.city} /` : '' }}
              {{ item.uf }}
            </p>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex justify-end align-center">
              <v-btn
                data-test="btnBureauOpenQuickView"
                @click.stop.native="handleDrawer({ itemId: item.id, itemName: item.name, item: item }, false, $event)"
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                      Visualização rápida
                    </div>
                    `,
                  placement: 'left'
                }"
                icon
                class="mr-3"
              >
                <Preview :width="21" :height="21" color="grey" />
              </v-btn>
              <CustomDropdown :item="item">
                <template slot="custom-list-item">
                  <div class="custom-list-item">
                    <Sheet
                      isEditing
                      :title="`Editar ${item.partnership =='partners' ? 'Parceiro' : 'Empresa'}`"
                      @submit="$refs[`config-${item.local_company_id}`].submitForm()"
                      @cancel="$refs[`config-${item.local_company_id}`].handleCancel()"
                    >
                      <template v-slot="{ sheet, closed }">
                        <CompanyForm
                          isEditing
                          :sheet="sheet"
                          :item-id="item.local_company_id"
                          :item="item"
                          :ref="`config-${item.local_company_id}`"
                          @updateCompany="loadData(true)"
                          @closeForm="closed"
                        />
                      </template>
                    </Sheet>
                  </div>
                  <div v-if="item.is_local_company" class="custom-list-item">
                    <DeleteModal
                      hasForm
                      menuButton
                      :endpoint="url.customerCompany"
                      :item-id="item.local_company_id"
                      :item-name="item.name"
                      @update-parent="loadData(true)"
                    >
                      <template v-slot:title>Excluir a Empresa</template>
                      <template v-slot:sub-title-1>Essa ação é irreversível, você tem certeza que deseja excluir essa Empresa?</template>
                      <template v-slot:sub-title-2>Digite “excluir” para confirmar a ação:</template>
                    </DeleteModal>
                  </div>
                </template>
              </CustomDropdown>
            </div>
          </template>
          <template #no-data>
            <div class="text-center py-10">
              <img src="~static/no-result.png" alt="Nenhum dado encontrado" width="115" />
              <p class="font-weight-bold mb-0">Nenhum resultado encontrado</p>
              <p>Não foram encontrados resultados com base na pesquisa realizada</p>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <CompanySideView
      :data="selectedData"
      :open-drawer="drawer"
      @changeData="updateData"
      @closeDrawer="() => { drawer = false }"
    />
  </main>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    disableBtn: true,
    moreFilter: false,
    isLoading: false,
    itemKey: 'cnpj',
    clearCnpj: /\.|-|\//g,
    clearOnRedir: /[^A-Z0-9]/ig,
    isNumeric: /^\d+$/,
    isAlphabet: /^[a-zA-Z]+$/,
    isAlphanumeric: /^[a-zA-Z0-9]+$/,
    checkFormat: /(\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b|\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|\b\d{14}\b|\b\d{11}\b|\b\d{2,14}\b)/g,
    checkBetween: /^[0-9]{2,14}$/,
    removeSpecialChars: /[^a-zA-Z0-9]/g,
    legalState: [
      { value: 'Ativa', name: 'Ativa'},
      { value: 'Baixada', name: 'Baixada'},
      { value: 'Nula', name: 'Nula'},
      { value: 'Suspensa', name: 'Suspensa'},
      { value: 'Inapta', name: 'Inapta'},
    ],
    filters: {},
    tabFoundationDate: 0,
    customItem: null,
    moreFilters: {
      foundation_date: null
    },
    query: null,
    stateList: [],
    segmentKey: 0,
    primaryKey: 0,
    secondaryKey: 0,
    preLoadedSegment: [],
    preLoadedPrimary: [],
    preLoadedSecondary: [],
    cnae_primary_key: null,
    cnae_secondary_key: null,
    drawer: false,
    showMoreFilters: false,
    selectedData: null,
    listItems: [],
    keyCity: 0,
    availableListCount: 3,
    availableList: Array.from({ length: 10 }).map((_, i) => i + 1),
    listAvailable: [
      { value: 's', name: 'Disponível' },
      { value: 'n', name: 'Indisponível' },
    ],
    headers: [
      { text: 'Empresa', value: 'name', entity: 'bureau-company', sortable: false, pos: 1 },
      { text: 'Disponível', value: 'available', entity: 'bureau-company', sortable: false, pos: 2 },
      { text: 'Segmento e CNAE Primários', value: 'primary_cnae', entity: 'bureau-company', sortable: false, pos: 3 },
      { text: 'CNAE Secundária', value: 'secondary_cnae', entity: 'bureau-company', sortable: false, pos: 4 },
      { text: 'Cidade/Estado', value: 'uf', entity: 'bureau-company', sortable: false, pos: 5 },
      { text: '', value: 'actions', entity: 'bureau-company', align: 'right', sortable: false, pos: 6 }
    ],
    footerProps: {
      'items-per-page-options': [5, 10, 15],
    },
    identifier_name_hasError: false,
    mainEntity: 'bureau-company',
    usedEntities: { ['bureau-company']: '' },
    mutation: 'BureauCompany/SET_LIST_DETAILS',
    redirectTo: 'business-companies-item-identifier',
    headerConfig: 'bureauCompanyHeaders',
    filterConfig: 'bureauCompany',
    deleteAction: 'deleteCompany',
    fields: [],
    selectedFields: [],
    selectedCompanies: [],
    indicators: [],
    listState: [],
    url: {
      customerCompany: '/customer/company',
      bureauCompany: '/bureau/company',
      cnae: '/customer/cnae',
      segment: '/customer/segment',
      city: '/customer/city',
      state: '/customer/get-states',
    },
    indexDB: {
      database: 'cromie',
      version: 1,
      objectStore: 'bureau-data-table',
    },
    requestDB: null,
    indexedList: [],
  }),
  computed: {
    ...mapGetters({
      list: 'BureauCompany/list',
      listDetails: 'BureauCompany/listDetails',
      refresh: 'BureauCompany/refreshData',
      meta: 'meta'
    }),
    pastDateRange() {
      return this.dateRange.filter((date) => !date.future)
    },
    pageTitle() {
      return 'Diretório de Empresas'
    },
    entitiesQuery: function () {
      const entities = Object.keys(this.usedEntities)
      return entities.join()
    },
  },
  watch: {
    list(newValue) {
      if(newValue) {
        this.listItems = this.formatData(newValue)
      }
    },
    'filters.identifier_name'(newValue) {
      if(newValue) {
        if(this.isNumeric.test(newValue)) {
          if(this.checkFormat.test(newValue)) {
            this.identifier_name_hasError = false
          }else {
            if(this.checkBetween.test(newValue)) {
              this.identifier_name_hasError = false
            }else {
              this.identifier_name_hasError = true
            }            
          }
        }else if (this.isAlphabet.test(newValue)) {
          this.identifier_name_hasError = false
        }else if (this.isAlphanumeric.test(newValue)) {
          this.identifier_name_hasError = false
        }else {
          const newValueWithoutSpecialCharacters = newValue.replace(this.removeSpecialChars, '')
          if(this.isNumeric.test(newValueWithoutSpecialCharacters)) {
            this.identifier_name_hasError = false
          }else if (this.isAlphabet.test(newValueWithoutSpecialCharacters)) {
            this.identifier_name_hasError = false
          }else {
            this.identifier_name_hasError = true
          }
        }
      }else {
        this.identifier_name_hasError = false
      }
    },
    async 'moreFilters.uf'(newValue) {
      this.keyCity += 1
      this.stateList = []
      if(newValue) {
        newValue.forEach(element => {
          this.stateList.push(element.value.toLowerCase())
        })
        if(newValue.length == 0 || newValue == null) {
          this.moreFilters.city = null
        }
        await this.loadData(true)
      }else {
        this.moreFilters.city = null
      }
    },
    'moreFilters.foundation_date'(newValue) {
      if(newValue) {
        const result = this.pastDateRange.find( ({ value }) => value === newValue.value )
        if(!result) {
          this.customItem = []
          this.customItem = newValue
          if(this.customItem.length > 0) {
            this.moreFilters.foundation_date = this.customItem[0]
          }
        }
      }
    },
    selectedFields(newValue) {
      this.saveHeaders(newValue)
    },
    filters: {
      handler(newValue){
        this.saveFilters(newValue, 'Filters')
        if(newValue) {
          for(var key in newValue) {
            if(newValue[key] === '' || newValue[key] === null || newValue[key].length === 0) {
              this.disableBtn = true
            }else {
              this.disableBtn = false
              break
            }
          }
        }else {
          this.disableBtn = true
        }
      },
      deep: true
    },
    moreFilters: {
      handler(newValue){
        this.saveFilters(newValue, 'MoreFilters')
        if(newValue) {
          for(var key in newValue) {
            if(newValue[key] === '' || newValue[key] === null || newValue[key].length === 0) {
              this.disableBtn = true
              this.showMoreFilters = false
            }else {
              this.disableBtn = false
              this.showMoreFilters = true
            }
          }
        }else {
          this.disableBtn = true
          this.showMoreFilters = false
        }
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadPage()
    await this.loadData(true)
  },
  methods: {
    async translateValue(key, value) {
      let result = null
      if(key == 'primary_cnae') {
        const list = value.map(i => { return i.code })
        const { data } = await this.getList(this.url.cnae, `code=in(${list})`)
        result = data.map(i => { return i })
      }else if(key == 'secondary_cnae') {
        const list = value.map(i => { return i.code })
        const { data } = await this.getList(this.url.cnae, `code=in(${list})`)
        result = data.map(i => { return i })
      }else if(key == 'segment') {
        const { data } = await this.getList(this.url.segment, `code=in(${value})`)
        result = data.map(i => { return i })
      }
      return result
    },
    setSearchKeyCnaePrimary(value) {
      this.isNumeric.test(value) ? this.cnae_primary_key = 'code' : this.cnae_primary_key = 'description'
    },
    setSearchKeyCnaeSecondary(value) {
      this.isNumeric.test(value) ? this.cnae_secondary_key = 'code' : this.cnae_secondary_key = 'description'
    },
    generateItemsList(items, chip, item) {
      if(chip == 1) {
        if(item) {
          return [item]
        }
      }else {
        return items
      }
    },
    ...mapActions({
      fetchList: 'BureauCompany/fetchList',
      refreshData: 'BureauCompany/refreshData',
    }),
    async loadPage() {
      await this.getState()
      await this.getEntitiesFields()
      await this.getHeaders()
      await this.loadFilters()
      this.selectedFields = this.headers.map((header) => {
        if(header.entity == this.mainEntity) {
          return this.fields.find(field => field.value == header.value)
        }else {
          return this.fields.find(
            (field) =>
              (field.entity
                ? `${field.entity}.${field.value}`
                : `${field.value}`) == header.value
          )
        }
      }).filter((field) => field)
    },
    searchCnpj(el) {
      var cnpjs = []
      const result = el.replace(this.clearCnpj, '')
      if(result.length < 14) {
        cnpjs.push(result)
      }else {
        cnpjs = el.match(this.checkFormat)
        if (!cnpjs) {
          return []
        }
      }
      
      const list = cnpjs.map((cnpj) => {
        const clearedCnpj = cnpj.replace(this.clearCnpj, '')
        return clearedCnpj
      })
      if(list.length == 1 && this.checkBetween.test(list[0])) {
        this.query.append('cnpj', `like(${list})`)
      }else {
        this.query.append('cnpj', `in(${list})`)
      }
    },
    async loadData(reset) {
      this.isLoading = true
      var page = this.listDetails.page
      this.query = new URLSearchParams()
      
      if(reset) {
        page = 0
      }

      for (let filter in this.filters) {
        let el = this.filters[filter]
        if(el) {
          if(filter == 'identifier_name') {
            if(!this.identifier_name_hasError) {
              if(this.isNumeric.test(el)) {
                this.searchCnpj(el)
              }else if(this.isAlphabet.test(el)) {
                this.query.append('name', `like(${el})`)
              }else if(this.isAlphanumeric.test(el)) {
                if(this.checkFormat.test(el)) {
                  this.searchCnpj(el)
                }else {
                  this.query.append('name', `like(${el})`)
                }
              }else {
                if(this.checkFormat.test(el)) {
                  this.searchCnpj(el)
                }else {
                  this.query.append('name', `like(${el})`)
                }
              }
            }
          }else if(filter == 'available') {
            this.query.append(filter, el)
          }else {
            if(filter == 'segment') {
              const items = await this.translateValue(filter, el)
              this.preLoadedSegment = items
              this.segmentKey ++
            }
            if(el.length === 0) {
              this.query.delete(filter)
            }else {
              if(Array.isArray(el)) {
                this.query.append(filter, `in(${el})`)
              }else {
                this.query.append(filter, el)
              }
            }
          }
        }
      }
      
      for (let filter in this.moreFilters) {
        let el = this.moreFilters[filter]
        if(el) {
          if(filter == 'city') {
            this.query.append(filter, el.code)
          }else if(filter == 'foundation_date') {
            const { value } = el
            const filterValue = this.setDateRangeList(value, 'foundation_date', false)
            this.query.append(filter, filterValue)
          }else {
            if(filter == 'primary_cnae') {
              const items = await this.translateValue(filter, el)
              this.preLoadedPrimary = items
              this.primaryKey ++
            }
            if(filter == 'secondary_cnae') {
              const items = await this.translateValue(filter, el)
              this.preLoadedSecondary = items
              this.secondaryKey ++
            }
            if(el.length === 0) {
              this.query.delete(filter)
              delete this.moreFilters[filter]
            }else {
              var values = null
              if(filter == 'uf') {
                values = el.map(item => { return item.value })
              }else {
                values = el.map(item => { return item.code })
              }
              this.query.append(filter, `in(${values})`)
            }
          }
        }
      }
      await this.fetchList({ url: this.url.bureauCompany, query: `${this.query}&page=${page}`, reset: reset })
      this.isLoading = false
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && page * itemsPerPage >= itemsLength) {
        if (this.listDetails.hasNext) {
          const page = this.listDetails.page + 1
          this.$store.commit(this.mutation, { page })
          await this.loadData(false)
        }
      }
    },
    async getState() {
      var data = await this.getList(this.url.state)
      this.listState = data.map(item => {
        const uf = item.uf
        const name = this.getUfName(uf)
        return {
          value: uf,
          name: name
        }
      })
    },
    async getEntitiesFields() {
      let fields = []
      const entities = await this.getList(
        '/meta/entity-dictionary',
        `entity=in(${this.entitiesQuery})`
      )
      entities.forEach((entity) => {
        fields = [
          ...fields,
          ...entity.data.map((field) => {
            return {
              ...field,
              value: field.field,
              entity: this.mainEntity,
            }
          }),
        ]
      })
      fields.forEach((element, index) => {
        const { value } = element
        if(value === 'cnpj' || value === 'city') {
          fields.splice(index, 1)
        }
        fields.map((field) => {
          if(field.value == 'name') {
            field.label = 'Nome/CNPJ'
          }else if(field.value == 'primary_cnae') {
            field.label = 'Segmento e CNAE Primários'
          }else if(field.value == 'secondary_cnae') {
            field.label = 'CNAE Secundária'
          }else if(field.value == 'uf') {
            field.label = 'Cidade/Estado'
          }
        })
      })
      this.fields = fields
    },
    async getHeaders() {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      if(pageSettings) {
        if(pageSettings[`${this.headerConfig}`]) {
          const headers = pageSettings[`${this.headerConfig}`].map((header) => {
            if(header.value[0] === '.') {
              header.value = header.value.substring(1)
            }
            return {
              ...header
            }
          })
          this.headers = headers.filter(
            (header) => header.value !== 'company.origin'
          )
        }
      }
    },
    saveHeaders(headers) {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      var formattedHeaders = headers.map((header, index) => {
        if(header.value[0] === '.') {
          header.value = header.value.substring(1)
        }
        return {
          text: header.label,
          ...header,
          sortable: false,
          pos: index + 1
        }
      }).sort((a, b) => a.pos < b.pos)
      formattedHeaders.push({ text: '', value: 'actions', entity: 'bureau-company', align: 'right', sortable: false, pos: formattedHeaders.length + 1 })

      localStorage.setItem(
        'page_settings',
        JSON.stringify({
          ...pageSettings,
          [`${this.headerConfig}`]: formattedHeaders,
        })
      )
      this.headers = formattedHeaders
    },
    loadFilters() {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      if(pageSettings) {
        if(pageSettings[`${this.filterConfig}Filters`]) {
          this.filters = pageSettings[`${this.filterConfig}Filters`]
        }
        if(pageSettings[`${this.filterConfig}MoreFilters`]) {
          this.moreFilters = pageSettings[`${this.filterConfig}MoreFilters`]
        }
      }
    },
    saveFilters(newFilters, type) {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      localStorage.setItem(
        'page_settings',
        JSON.stringify({
          ...pageSettings,
          [`${this.filterConfig}${type}`]: newFilters,
        })
      )
    },
    async updateData(obj) {
      const { action, identifier } = obj
      const cnpj = this.maskCnpj(identifier)
      const index = this.listItems.findIndex((company) => company.cnpj == cnpj)

      if(action == 'prev') {
        const data = this.listItems.at(index - 1)
        if(data) {
          const obj = { item: data, length: this.listItems.length, index: index }
          this.handleDrawer(obj, true)
        }
      }else if(action == 'next'){
        const data = this.listItems.at(index + 1)
        if(data) {
          const obj = { item: data, length: this.listItems.length, index: index }
          this.handleDrawer(obj, true)
        }
      }
    },
    async handleDrawer(item, update, e) {
      e && e.preventDefault()
      const index = await this.listItems.findIndex((company) => company.cnpj == item.item.cnpj)
      const obj = { ...item, length: this.listItems.length, index: index }
      this.selectedData = obj
      if(!update)
        this.drawer = true
    },
    getFilterName(key) {
      if(key == 'primary_cnae') {
        return 'CNAE Primária'
      }else if(key == 'secondary_cnae') {
        return 'CNAE Secundária'
      }else if(key == 'uf') {
        return 'Estado'
      }else if(key == 'city') {
        return 'Cidade'
      }else if(key == 'foundation_date') {
        return 'Data de Criação'
      }
    },
    getItemName(filter, item) {
      if(filter == 'primary_cnae' || filter == 'secondary_cnae') {
        return item.description
      }else if(filter == 'uf') {
        return item.name
      }else if(filter == 'city') {
        return item
      }
    },
    async removeFilter(value) {
      this.moreFilters = Object.keys(this.moreFilters).filter(key => key !== value).reduce((obj, key) => {
        obj[key] = this.moreFilters[key]
        return obj
      }, {}
      )
      await this.checkObject()
      await this.loadData(true)
    },
    formatData(data) {
      const formattedArray = data.map(company => {
        company.cnpj = this.maskCnpj(company.cnpj)
        return company
      })
      return formattedArray
    },
    checkObject() {
      setTimeout(() => {
        if(
          (
            Object.keys(this.filters).every(key => this.filters[key] == undefined ||
            this.filters[key] == '' ||
            this.filters[key] == null ||
            (Array.isArray(this.filters[key]) && this.filters[key].length == 0))
          ) &&
          (
            Object.keys(this.moreFilters).every(key => this.moreFilters[key] == undefined ||
            this.moreFilters[key] == '' ||
            this.moreFilters[key] == null ||
            (Array.isArray(this.moreFilters[key]) && this.moreFilters[key].length == 0))
          )
        ) {
          this.disableBtn = true
        }else {
          this.disableBtn = false
        }
      }, 250)
    },
    async redirectPage(item) {
      const { cnpj } = item
      const { local_company_id } = await this.getItem(this.url.bureauCompany, `cnpj=${cnpj}`)
      const { params, query } = this.$route
      const identifier = cnpj.replace(this.clearOnRedir, '')
      this.$router.push({
        name: `${this.redirectTo}`,
        params: { ...params, item: 'bureau', identifier },
        query: { ...query, company_id: local_company_id }
      })
    },
    handleAvailableList() {
      if(this.availableList.length >= this.availableListCount) {
        this.availableListCount += 3
      }else {
        this.availableListCount = 3
      }
    },
    handleReset() {
      this.selectedCompanies = []
    },
    async clearFilter() {
      this.$refs.baseFilter.reset()
      this.filters = {}
      this.moreFilters = {}
      await this.loadData(true)
      this.disableBtn = true
    }
  }
}
</script>

<style lang="scss" scoped>
.v-data-table {
  cursor: pointer !important;
}
.headline {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .options_button {
    display: flex;
    align-items: center;

    .v-input {
      margin-right: 1rem;
      width: 244px;
    }
  }

  ::v-deep button {
    margin: 0 0.4rem;
    &:last-child {
      margin-right: 0;
    }
  }

  .headline_title {
    display: flex;
    flex-direction: column;

    h6 {
      line-height: 5px;
      font-size: 1rem !important;
      font-weight: 500;
    }
  }

  ::v-deep .v-input {
    margin-right: 1rem;
    .v-input__control {
      .v-input__slot {
        fieldset {
          border: 1px solid #d2d6da;
          background: var(--v-shape-lighten1);
        }

        .v-select__slot .v-select__selections {
          color: var(--v-sub-text-base);
          font-weight: 500 !important;
          font-size: 1rem;
        }

        i {
          color: var(--v-primary-base);
        }
      }
    }
  }
}
</style>