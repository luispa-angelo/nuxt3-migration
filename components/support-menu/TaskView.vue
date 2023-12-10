<template>
  <div>
    <!-- Image Overlay -->
    <ContentOverlay
      :show-overlay="overlay"
      :closeOnClick="true"
      @closeOverlay="overlay = false"
      v-if="overlay && imageOverlay"
    >
      <template v-slot:overlay>
        <v-img
          max-height="80vh"
          :src="imageOverlay"
          style="border-radius: 4px; margin: auto"
        />
      </template>
    </ContentOverlay>

    <v-list
      dense
      height="100%"
      v-if="selectedNews !== ''"
      ref="helpMenuComponent"
    >
      <v-subheader>
        <span v-html="findItemOnArray('title', selectedNews.content)"></span>
      </v-subheader>

      <v-list-item-group>
        <section>
          <span
            v-for="(item, index) in selectedNews.content"
            :key="item.type + index"
          >
            <template v-if="item.type === 'image' && item.content.length >= 1">
              <v-img
                height="160"
                width="100%"
                :src="item.content"
                @click="handleOverlayImage(item.content)"
              />

              <small @click="handleOverlayImage(item.content)">
                Ver em tela cheia
                <i class="icon-presets material-symbols-rounded">fullscreen</i>
              </small>
            </template>

            <v-list-item-title
              class="title-text pt-3"
              v-if="item.type === 'subtitle'"
            >
              <span v-html="item.content"> </span>
            </v-list-item-title>

            <span v-if="item.type.includes('content')" v-html="item.content">
            </span>

            <iframe
              width="100%"
              height="400"
              :src="item.content"
              title="Player de vídeo"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              v-if="item.type === 'video'"
            ></iframe>
          </span>

          <slot name="help-center" />

          <v-divider />
        </section>

        <v-subheader>Ver outras novidades</v-subheader>

        <v-list-item
          class="pt-0 d-flex flex-column"
          v-for="newsItem in getRecentNews"
          :key="newsItem.uuid"
          @click="handleChangeSelectedNews(newsItem.uuid)"
        >
          <v-list-item-content class="pt-0 align-self-start w-100">
            <v-list-item-subtitle>
              <v-tooltip
                bottom
                :z-index="999"
                :disabled="
                  findItemOnArray('title', newsItem.content).length <= 20
                    ? true
                    : false
                "
              >
                <template v-slot:activator="{ on, attrs }">
                  <span
                    v-bind="attrs"
                    v-on="on"
                    v-html="findItemOnArray('title', newsItem.content)"
                    class="truncate_text"
                  >
                  </span>
                </template>

                <span
                  v-html="findItemOnArray('title', newsItem.content)"
                ></span>
              </v-tooltip>

              <i class="ml-2 icon-presets material-symbols-rounded"
                >arrow_forward
              </i>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
export default {
  props: {
    newsID: String,
    news: Array,
  },
  data: () => ({
    overlay: false,
    imageOverlay: '',
  }),
  computed: {
    selectedNews() {
      if (this.newsID !== '')
        return this.news.find((item) => item.uuid === this.newsID)

      return ''
    },
    getRecentNews() {
      return this.news.filter((n) => n.uuid !== this.newsID).slice(0, 2)
    },
  },
  methods: {
    handleOverlayImage(image) {
      this.imageOverlay = image
      this.overlay = true
    },
    handleChangeSelectedNews(id) {
      this.$emit('selectedNews', id)
      this.$refs.helpMenuComponent.$el.scrollTop = 0
    },
  },
}
</script>

<style scoped lang="scss">
.v-list {
  section {
    padding: 0 8px;

    .v-image {
      border-radius: 4px;
      cursor: pointer;
      margin-top: 1rem;
    }
  }

  .v-list-item__title {
    white-space: normal;
    font-weight: 600;
  }

  .title-text,
  p {
    font-size: 1rem;
    padding: 8px 0;
    color: var(--v-default-text-base);
  }

  small {
    text-align: right;
    opacity: 0.7;
    cursor: pointer;

    padding: 4px 0;

    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
  }

  .v-list-item {
    margin: 0 !important;
    min-height: auto;
    padding: 0 8px;

    &::before {
      border: unset !important;
    }

    .v-list-item__subtitle {
      display: flex;
      align-items: center;
    }
  }

  .v-list-item__subtitle {
    padding: 0.2rem 0 !important;
    font-size: 14px !important;
    font-weight: 400;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    .truncate_text {
      height: auto;
      line-height: 1.2rem;
      max-width: 80%;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-height: 20px;
    }

    &,
    i {
      color: #0346f2 !important;
    }
  }

  .nav-link {
    padding: 3rem 0 1rem !important;
  }
}
</style>
