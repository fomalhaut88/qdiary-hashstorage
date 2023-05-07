<template>
  <div id="app">
    <div v-if="isReady">
      <div>
        <b-navbar type="is-primary" class="has-background-primary-dark" fixed-top>
          <template #start>
            <b-navbar-item href="#" @click="$refs.refNotesSidebar.show()">
              <b-icon icon="menu" />
            </b-navbar-item>
            <b-navbar-item href="#" @click="$refs.refDiaryEditModal.show(diary.id)">
              <strong>{{ diary.name }}</strong>
            </b-navbar-item>
            <b-navbar-item href="#" @click="$refs.redNoteEditModal.show(note.id)">
              <b-icon icon="calendar-range" size="is-small" />
              &nbsp;
              <strong>{{ note.date }}</strong>
            </b-navbar-item>
          </template>
          
          <template #end>
            <b-navbar-item href="#" @click="saveText()" v-if="text != textOld">
              <b-icon icon="content-save" />
            </b-navbar-item>
            <b-navbar-item href="#" @click="$refs.refMenuSidebar.show()">
              <b-icon icon="dots-vertical" />
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
        <textarea ref="refTextarea" class="main-text" spellcheck="false" 
                  v-model="text" @input="textChanged()" @blur="saveText()" />
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

  const TEXTAREA_BOTTOM_OFFSET = 6

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
        isSaving: false,
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

      textChanged() {
        // Get last characters
        const idxFrom = (this.text.length > TEXTAREA_BOTTOM_OFFSET) ? 
          (this.text.length - TEXTAREA_BOTTOM_OFFSET) : 0
        const ending = this.text.substring(idxFrom).split("").reverse()

        // Calculate the necessary extra new lines to add in the end
        let extra = TEXTAREA_BOTTOM_OFFSET
        for (const c of ending) {
          if (c == '\n') {
            extra -= 1
          } else {
            break
          }
        }

        // If there are new lines to add
        if (extra > 0) {
          // Get current cursor position
          const cursorPos = this.$refs.refTextarea.selectionStart

          // Add new lines to the end
          let tail = ''
          for (let i = 0; i < extra; i++) {
            tail += '\n'
          }
          this.text += tail

          // Return cursor back to its old position
          this.$nextTick(() => {
            this.$refs.refTextarea.selectionStart = cursorPos
            this.$refs.refTextarea.selectionEnd = cursorPos
          })
        }
      },

      async saveText() {
        if (!this.isSaving) {
          if (this.textOld != this.text) {
            this.isSaving = true

            try {
              await this.$appstate.saveActiveText(this.text)
            } finally {
              this.isSaving = false
            }

            this.$buefy.toast.open({
              message: "Text has been saved",
              type: "is-dark",
            })
            this.textOld = this.text
          }
        }
      },
    },
    async mounted() {
      const profileIntervalId = setInterval(() => {
        if (this.$hscm.profile !== undefined) {
          clearInterval(profileIntervalId)

          if (this.$hscm.profile === null) {
            this.$refs.refLoginModal.show()
          } else {
            const loadIntervalId = setInterval(() => {
              if (this.$appstate.isInitialized) {
                clearInterval(loadIntervalId)
                this.load()
                this.isReady = true
              }
            }, 100)
          }
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

      window.onbeforeunload = () => {
        return (this.textOld != this.text) ? 
          "There are unsaved changes on the page." : null
      }

      document.addEventListener(
        "hs-invalid-version",
        () => {
          this.isLoading = false

          this.$buefy.dialog.alert({
            title: 'Server error',
            message: 'Data on the server was updated. ' + 
                     'Reload the page to pull the changes.',
            type: 'is-danger',
            hasIcon: true,
            ariaRole: 'alertdialog',
            ariaModal: true,
            confirmText: 'Reload',
            cancelText: 'Cancel',
            canCancel: true,
            onConfirm: () => {
              window.location.reload()
            },
          })
        },
        false
      )
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
