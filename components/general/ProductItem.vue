<template>
  <div class="d-flex justify-space-between align-center">
    <div>
      <p
        class="subtitle-2 font-weight-bold mb-0"
        v-tooltip="{
          content: `
                       <div class='v-btn-tooltip'>
                          Oportunidade: ${product.product.name}
                       </div>
                       `,
          placement: 'bottom-center'
        }"
      >
        {{ product.product.name | truncate(30) }}
      </p>
      <p class="mb-0">{{ `Oportunidade: ${product.opportunity_id}` }}</p>
      <p class="mb-0">{{ `Quantidade: ${product.amount}` }}</p>
    </div>
    <div>
      <v-chip color="primary" link>
        {{ `Valor: R$${product.value}` }}
      </v-chip>
    </div>
  </div>
</template>

<script>
export default {
  props: ['product']
}
</script>

