<template>
  <div id="app">
    <div v-if="isReady">
      <div>
        <b-navbar type="is-primary has-background-primary-dark">
          <template #start>
            <b-navbar-item href="#" @click="$refs.refNotesSidebar.show()">
              <vue-fontawesome icon="bars" size="1x" fixed-width />
            </b-navbar-item>
            <b-navbar-item href="#" @click="$refs.refDiaryEditModal.show(diary.id)">
              <strong>{{ diary.name }}</strong>
            </b-navbar-item>
            <b-navbar-item href="#" @click="$refs.redNoteEditModal.show(note.id)">
              <vue-fontawesome icon="calendar" size="1x" fixed-width />
              <strong>{{ note.date }}</strong>
            </b-navbar-item>
          </template>
          
          <template #end>
            <b-navbar-item href="#" @click="saveText()">
              <vue-fontawesome icon="save" size="1x" fixed-width />
              <span v-if="text != textOld">*</span>
            </b-navbar-item>
            <b-navbar-item href="#" @click="$refs.refMenuSidebar.show()">
              <vue-fontawesome icon="ellipsis-v" size="1x" fixed-width />
              <!-- <b-loading :is-full-page="false" v-model="isLoading">
                <vue-fontawesome icon="sync-alt" size="1x" fixed-width spin />
              </b-loading> -->
            </b-navbar-item>
          </template>
        </b-navbar>

        <notes-sidebar ref="refNotesSidebar"
                       @new-note-clicked="$refs.redNoteEditModal.show()" />
        <menu-sidebar ref="refMenuSidebar"
                      @new-diary-clicked="$refs.refDiaryEditModal.show()" />

        <diary-edit-modal ref="refDiaryEditModal" />
        <note-edit-modal ref="redNoteEditModal" />
        <about-modal ref="refAboutModal" />
      </div>

      <div>
        <textarea class="main-text" spellcheck="false" v-model="text" @blur="saveText()" />
      </div>

      <b-loading :is-full-page="true" v-model="isLoading" />
    </div>

    <login-modal ref="refLoginModal" />
  </div>
</template>

<script>
  import NotesSidebar from '@/components/NotesSidebar'
  import MenuSidebar from '@/components/MenuSidebar'
  import LoginModal from '@/components/LoginModal'
  import DiaryEditModal from '@/components/DiaryEditModal'
  import NoteEditModal from '@/components/NoteEditModal'
  import AboutModal from '@/components/AboutModal'

  export default {
    name: 'App',
    components: {
      NotesSidebar,
      MenuSidebar,
      LoginModal,
      DiaryEditModal,
      NoteEditModal,
      AboutModal,
    },
    data() {
      return {
        isReady: false,
        isLoading: false,
        textOld: "",
        text: "",
        diary: null,
        note: null,
      }
    },
    methods: {
      load() {
        this.diary = this.$appstate.getActiveDiary()
        this.note = this.$appstate.getActiveNote()
        this.textOld = this.$appstate.getActiveText()
        this.text = this.textOld
      },

      async saveText() {
        if (this.textOld != this.text) {
          await this.$appstate.saveActiveText(this.text)
          this.$buefy.toast.open({
            message: "Text has been saved",
            type: "is-dark",
          })
          this.textOld = this.text
        }
      },
    },
    async mounted() {
      setTimeout(() => {
        if (this.$hscm.profile === null) {
          this.$refs.refLoginModal.show()
        } else {
          const intervalId = setInterval(() => {
            if (this.$appstate.isInitialized) {
              clearInterval(intervalId)
              this.load()
              this.isReady = true
            }
          }, 100)
        }
      }, 100)

      this.$root.$on('reload', () => {
        this.load()
      })

      this.$root.$on('loading', value => {
        this.isLoading = value
      })

      this.$root.$on('show-about-modal', () => {
        this.$refs.refAboutModal.show()
      })
    },
  }
</script>

<style lang="scss" scoped>
  .main-text {
    width: 100vw;
    height: calc(100vh - 50px);
    padding: 6px;
    
    font-family: "Tahoma";
    font-size: 16px;

    border: none;
    outline: none;
    resize: none;
  }

  .empty-icon {
    width: 20px; 
    display: inline-block;
  }

  .sidebar-item-sep {
    border-bottom: 1px solid #ddd;
  }
</style>
