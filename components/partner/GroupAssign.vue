<template>
  <v-form ref="form">
    <v-row>
      <v-col class="pt-4 px-0">
        <section v-if="!associationsList.length || groupAddition || groupEditing">
          <v-autocomplete
            attach
            v-model="formData.association_type_id"
            :items="associationType"
            item-text="name"
            item-value="id"
            outlined
            label="Tipo de associação"
            dense
            :error="$v.formData.association_type_id.$error"
            :error-messages="
              $v.formData.association_type_id.$error ? 'Esse campo é obrigatório' : ''
            "
          >
          </v-autocomplete>
          <v-autocomplete
            attach
            v-model="formData.left_side_id"
            :items="groups"
            item-text="name"
            item-value="id"
            outlined
            clearable
            label="Grupo econômico"
            dense
            :error="$v.formData.left_side_id.$error"
            :error-messages="
              $v.formData.left_side_id.$error ? 'Esse campo é obrigatório' : ''
            "
          >
          </v-autocomplete>
        </section>
        <section v-else>
          <v-expansion-panels>
            <v-expansion-panel @change="getCompanyAssociations(item.left_side_id)" v-for="item in associationsList" :key="item.id">
              <v-expansion-panel-header disable-icon-rotate>
                <template v-slot:default>
                  <div class="w-100 d-flex justify-start align-center">
                    <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                    <p class="mb-0">
                      {{ item.left_side.name }}
                    </p>
                  </div>
                </template>
                <template v-slot:actions>
                  <v-menu left :offset-x="true">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        v-bind="attrs"
                        v-on="on"
                        class="mr-3"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>
                          <v-btn @click="handleGroup(item.id, item.association_type_id, item.left_side.id)" text class="mt-1">
                            Editar
                          </v-btn>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <v-btn text @click="handleDelete(item)" >
                            Deletar
                          </v-btn>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content eager>
                <ul>
                  <li v-for="item in companyList" :key="item.right_side_id" class="font-body-large">
                    <NuxtLink :to="`/company/${item.right_side_id}`">
                      {{ item.right_side.legalName | truncate(60) }}
                    </NuxtLink>
                  </li>
                </ul>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-btn @click="handleGroup(null, null, null)" text block class="mt-5 rounded-0">
            <v-icon>mdi-plus</v-icon>
            Adicionar novo relacionamento
          </v-btn>
        </section>
      </v-col>
    </v-row>
    <v-row v-if="!associationsList.length || groupAddition || groupEditing" class="mt-0">
      <v-col class="d-flex justify-end pt-0">
        <v-btn v-if="groupAddition || groupEditing" @click="handleCancel" text class="mr-2">
          Cancelar
        </v-btn>
        <v-btn @click="submitForm" color="secondary">
          Salvar
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    deleteAction: 'deleteAssociation',
    routeId: null,
    associationsList: [],
    companyList: [],
    groupEditing: false,
    groupAddition: false,
    formData: {
      id: null,
      association_type_id: null,
      left_side_id: null,
      right_side_id: null
    }
  }),
  validations: {
    formData: {
      association_type_id: { required },
      left_side_id: { required }
    },
  },
  computed: mapGetters(['groups', 'associations', 'associationType']),
  mounted() {
    this.$store.dispatch('fetchGroups')
    this.$store.dispatch('fetchAssociationType', 'category=group')
    
    this.routeId = this.$route.params.id
    
    this.getGroup(this.routeId)

  },
  methods: {
    async getGroup(id) {
      const { data: { data } } =  await this.$axios.get(`/customer/association?includes=left_side,association_type&right_side_id=${id}`)
      this.getGroupAssociations(data)
    },
    getGroupAssociations(associations) {
      this.associationsList = associations.filter(association => {
        return association.association_type.category == 'group'
      })
    },
    async getCompanyAssociations(id){
      this.companyList = null
      const { data: { data } } =  await this.$axios.get(`/customer/association?includes=right_side&left_side_id=${id}`)

      this.companyList = data.filter(company => {
        return company.right_side_id != this.routeId
      })
    },
    handleGroup(itemId, associationId, groupId){
      if(itemId){
        const { id } = this.$route.params

        this.formData.id = itemId
        this.formData.association_type_id = associationId
        this.formData.left_side_id = groupId
        this.formData.right_side_id = id

        this.groupEditing = true
        console.log('Edit')
      }else{
        console.log('Add')
        this.groupAddition = true
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      
      const { id } = this.$route.params
      this.formData.right_side_id = id
      
      let exists = false
      const { data: { data } } = await this.$axios.get(`/customer/association?includes=right_side,association_type&left_side_id=${this.formData.left_side_id}&right_side_id=${this.formData.right_side_id}`)
      exists = data
      
      exists.filter(association => {
        return association.association_type.category == 'group'
      })

      if(exists.length) {
        this.$swal({
          icon: 'warning',
          title: 'Esse grupo já está atribuido.'
        })
      }else{
        if (this.groupEditing) {
          await this.$store.dispatch('updAssociation', this.formData)
        } else {
          this.formData.id = null
          await this.$store.dispatch('addAssociation', this.formData)
        }

        this.getGroup(this.routeId)
        this.handleCancel()
      }

    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.groupAddition = false
      this.groupEditing = false
    },
    async handleDelete(item) {
      await this.$store.dispatch(this.deleteAction, item.id)
      this.getGroup(this.routeId)
    }
  }
}
</script>

<style scoped lang="scss">
  .v-expansion-panel::before {
    box-shadow: none !important;
  }
  // .remove-min-height {
  //   min-height: 40px !important;
  // }
</style>