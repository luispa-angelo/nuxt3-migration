<template>
	<v-expansion-panels>
		<slot name="panel">
			<v-expansion-panel-header disable-icon-rotate>
        <template v-slot:default>
          <div class="w-100 d-flex justify-start align-center">
            <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
            <p class="mb-0">Grupos</p>
          </div>
        </template>
        <template v-slot:actions>
          <v-btn x-small fab color="secondary">
            <v-icon color="primary">mdi-plus</v-icon>
          </v-btn>
        </template>
      </v-expansion-panel-header>
		</slot>
	</v-expansion-panels>
</template>
