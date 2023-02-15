<template>
  <b-modal v-model="isShown"
           has-modal-card
           :can-cancel="false">
    <form action="">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ getTitle() }}</p>
        </header>
        <section class="modal-card-body">
          <b-field label="Name">
            <b-input type="text" v-model="name" placeholder="Name" />
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button label="Cancel" @click="hide()" />
          <b-button label="Save" type="is-primary" @click="saveClicked()" />
          <b-button label="Delete" type="is-danger" @click="deleteClicked()" v-if="!isNew()" />
        </footer>
      </div>
    </form>
  </b-modal>
</template>

<script>
  export default {
    data() {
      return {
        isShown: false,
        diaryId: null,
        name: '',
      }
    },
    methods: {
      show(diaryId) {
        this.isShown = true
        this.diaryId = diaryId ? diaryId : null
        this.name = diaryId ? this.$appstate.getDiaryById(diaryId).name : ''
      },

      hide() {
        this.isShown = false
        this.diaryId = null
        this.name = ''
      },

      isNew() {
        return this.diaryId === null
      },

      getTitle() {
        return this.isNew() ? "New diary" : "Edit diary"
      },

      async saveClicked() {
        const name = this.name.trim()

        if (!name) {
          this.$buefy.toast.open({
            message: "Empty name",
            type: "is-danger",
          })
          return
        }

        this.$root.$emit('loading', false)

        const diaryId = await this.$appstate.saveDiary(name, this.diaryId)
        
        if (this.isNew()) {
          await this.$appstate.setActiveDiary(diaryId)
          this.$root.$emit('reload')
        }

        this.$root.$emit('loading', false)

        this.$buefy.toast.open({
          message: "Diary has been updated",
          type: "is-dark",
        })
        this.hide()
      },

      async deleteClicked() {
        if (this.diaryId) {
          this.$buefy.dialog.confirm({
            title: 'Delete diary',
            message: 'Do you want to delete the note? ' + 
                     'All notes will be removed permanently.',
            confirmText: 'Yes',
            cancelText: 'No',
            onConfirm: async () => {
              this.$root.$emit('loading', true)
              await this.$appstate.deleteDiary(this.diaryId)
              this.$root.$emit('loading', false)
              this.$root.$emit('reload')
              this.$buefy.toast.open({
                message: "Diary has been deleted",
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
