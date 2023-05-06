<template>
  <b-sidebar type="is-light"
             fullheight
             overlay
             v-model="isShown">
    <div class="p-3">
      <b-menu>
        <b-menu-list label="Actions">
          <b-menu-item class="sidebar-item-sep" @click="$emit('new-note-clicked')">
            <template #label>
              <vue-fontawesome icon="plus" size="1x" fixed-width />
              New Note
            </template>
          </b-menu-item>
        </b-menu-list>

        <b-menu-list label="Notes">
          <b-menu-item v-for="item in $appstate.getNotes()" :key="item.id"
                       @click="setActiveNote(item.id)">
            <template #label>
              <vue-fontawesome icon="check" size="1x" fixed-width 
                               v-if="item.id == $appstate.getActiveNoteId()" />
              <span class="empty-icon" v-else></span>
              {{ item.date }}
            </template>
          </b-menu-item>
        </b-menu-list>
      </b-menu>
    </div>
  </b-sidebar>
</template>

<script>
  export default {
    data() {
      return {
        isShown: false,
      }
    },
    methods: {
      show() {
        this.isShown = true
      },

      hide() {
        this.isShown = false
      },

      async setActiveNote(noteId) {
        if (noteId != this.$appstate.getActiveNoteId()) {
          this.$root.$emit('loading', true)
          await this.$appstate.setActiveNote(noteId, true)
          this.$root.$emit('loading', false)
          this.$root.$emit('reload')
          this.hide()
        }
      },
    },
  }
</script>
