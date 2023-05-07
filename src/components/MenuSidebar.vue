<template>
  <b-sidebar type="is-light"
             fullheight
             overlay
             right
             v-model="isShown">
    <div class="p-3">
      <b-menu>
        <b-menu-list label="Menu">
          <b-menu-item @click="$emit('new-diary-clicked')">
            <template #label>
              <b-icon icon="plus" size="is-small" />
              New diary
            </template>
          </b-menu-item>
          <b-menu-item @click="$root.$emit('show-about-modal')">
            <template #label>
              <b-icon icon="information-variant" size="is-small" />
              About
            </template>
          </b-menu-item>
          <b-menu-item @click="logout()">
            <template #label>
              <b-icon icon="logout" size="is-small" />
              Logout
            </template>
          </b-menu-item>
        </b-menu-list>

        <b-menu-list label="Diaries">
          <b-menu-item v-for="item in $appstate.getDiaries()" :key="item.id" 
                       @click="setActiveDiary(item.id)">
            <template #label>
              <b-icon icon="check-bold" size="is-small" 
                      v-if="item.id == $appstate.getActiveDiaryId()" />
              <span class="empty-icon" v-else></span>
              {{ item.name }}
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

      async setActiveDiary(diaryId) {
        if (diaryId != this.$appstate.getActiveDiaryId()) {
          this.$root.$emit('loading', true)
          await this.$appstate.setActiveDiary(diaryId)
          this.$root.$emit('loading', false)
          this.$root.$emit('reload')
          this.hide()
        }
      },

      logout() {
        this.$buefy.dialog.confirm({
          title: 'Leave profile',
          message: 'Are you sure you want to log out? ' +
                   'You will have to enter username and password again.',
          confirmText: 'Leave',
          cancelText: 'Stay',
          type: 'is-danger',
          hasIcon: true,
          onConfirm: () => {
            this.$hscm.profile.clear()
            location.reload()
          }
        })
      },
    },
  }
</script>
