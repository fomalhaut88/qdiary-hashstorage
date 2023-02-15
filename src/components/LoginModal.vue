<template>
  <b-modal v-model="isShown"
           has-modal-card
           :can-cancel="false">
    <form action="">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">Login</p>
        </header>
        <section class="modal-card-body">
          <b-field label="Username">
            <b-input type="text" v-model="username" placeholder="Your username" required />
          </b-field>
          <b-field label="Password">
            <b-input type="password" v-model="password" placeholder="Your password" required />
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button label="Login or Register" type="is-primary" @click="loginClick()" />
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
        username: '',
        password: '',
      }
    },
    methods: {
      show() {
        this.isShown = true
      },

      async loginClick() {
        if (!this.username) {
          this.$buefy.toast.open({
            message: "Empty username",
            type: "is-danger",
          })
          return
        }

        if (!this.password) {
          this.$buefy.toast.open({
            message: "Empty password",
            type: "is-danger",
          })
          return
        }

        const profile = this.$hscm.hsc.Profile.new(
          this.$hscm.appId, this.username, this.password
        )

        if (await this.$appstate.exists(this.$hscm.api, profile)) {
          this.login(profile)
        } else {
          this.$buefy.dialog.confirm({
            title: 'Registration',
            message: 'No record found with the entered username and password. ' + 
                     'Do you want to create a new profile?',
            confirmText: 'Yes, please.',
            cancelText: 'No, back to login.',
            onConfirm: () => {
              this.login(profile)
              this.isShown = false
            }
          })
        }
      },

      login(profile) {
        profile.save()
        location.reload()
      },
    },
  }
</script>
