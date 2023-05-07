<template>
  <b-modal v-model="isShown"
           has-modal-card
           :can-cancel="true">
    <form action="">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ getTitle() }}</p>
        </header>
        <section class="modal-card-body">
          <b-datepicker inline
                        v-model="date"
                        indicators="dots"
                        size="is-small"
                        :first-day-of-week="0"
                        locale="en-US"
                        :events="getEvents()">
          </b-datepicker>
        </section>
        <footer class="modal-card-foot">
          <b-button label="Cancel" @click="hide()" />
          <b-button label="Save" type="is-primary" @click="saveClicked()" />
          <b-button label="Delete" type="is-danger" @click="deleteClicked()" 
                    v-if="!isNew()" />
        </footer>
      </div>
    </form>
  </b-modal>
</template>

<script>
  import { dateToString } from '@/utils'

  export default {
    data() {
      return {
        isShown: false,
        noteId: null,
        date: new Date(),
      }
    },
    methods: {
      show(noteId) {
        this.isShown = true
        this.noteId = noteId ? noteId : null
        this.date = noteId ? new Date(
          this.$appstate.getNoteById(noteId).date
        ) : new Date()
      },

      hide() {
        this.isShown = false
        this.noteId = null
        this.date = new Date()
      },

      isNew() {
        return this.noteId === null
      },

      getTitle() {
        return this.isNew() ? "New note" : "Edit note"
      },

      getEvents() {
        return this.$appstate.getNotes().map(note => new Date(note.date))
      },

      checkDateExists(date) {
        return this.$appstate.getNotes().some(
          note => note.date == date
        )
      },

      async saveClicked() {
        const date = dateToString(this.date)

        if (this.checkDateExists(date)) {
          this.$buefy.toast.open({
            message: "Such date already exists.",
            type: "is-danger",
          })
          return
        }

        this.$root.$emit('loading', true)

        const noteId = await this.$appstate.saveNote(date, this.noteId)

        if (this.isNew()) {
          await this.$appstate.setActiveNote(noteId, true)
          this.$root.$emit('reload')
        }

        this.$root.$emit('loading', false)

        this.$buefy.toast.open({
          message: "Note has been updated",
          type: "is-dark",
        })
        this.hide()
      },

      async deleteClicked() {
        if (this.noteId) {
          this.$buefy.dialog.confirm({
            title: 'Delete note',
            message: 'Do you want to delete the note?',
            confirmText: 'Yes',
            cancelText: 'No',
            onConfirm: async () => {
              this.$root.$emit('loading', true)
              await this.$appstate.deleteNote(this.noteId)
              this.$root.$emit('loading', false)
              this.$root.$emit('reload')
              this.$buefy.toast.open({
                message: "Note has been deleted",
                type: "is-dark",
              })
              this.hide()
            }
          })
        }
      },
    },
  }
</script>
