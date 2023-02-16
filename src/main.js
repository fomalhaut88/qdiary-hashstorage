import Vue from 'vue'
import Buefy from 'buefy'

import '@/assets/scss/main.scss'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
Vue.component('vue-fontawesome', FontAwesomeIcon)

Vue.use(Buefy, {
  defaultIconComponent: 'vue-fontawesome',
  defaultIconPack: 'fas',
  customIconPacks: {
        'fas': {
            sizes: {
                'is-xsmall': 'xs',
                'is-small': 'sm',
                'default': '',
                'is-large': 'lg',
                'is-xlarge': '2x'
            }
        },
        'far': {
            sizes: {
                'is-xsmall': 'xs',
                'is-small': 'sm',
                'default': '',
                'is-large': 'lg',
                'is-xlarge': '2x'
            }
        },
        'fab': {
            sizes: {
                'is-xsmall': 'xs',
                'is-small': 'sm',
                'default': '',
                'is-large': 'lg',
                'is-xlarge': '2x'
            }
        },
    },
})

import config from './config'
import AppState from './appstate'
import App from './App.vue'

Vue.config.productionTip = false

// A manager to keep hashstorage-cli entities
Vue.prototype.$hscm = {
  appId: config.APP_ID,
  root: config.HASHSTORAGE_ROOT,
  hsc: undefined,
  api: undefined,
  profile: undefined,
}

// AppState object
Vue.prototype.$appstate = new AppState()

new Vue({
  render: h => h(App),
  async beforeCreate() {
    // Define the imported library and api instance
    this.$hscm.hsc = await import('hashstorage-cli')
    this.$hscm.api = this.$hscm.hsc.Api.new(this.$hscm.root)

    // Check profile
    if (this.$hscm.hsc.Profile.exists()) {
      // Load profile from localStorage
      const profile = this.$hscm.hsc.Profile.load()

      // Check whether the profile is valid
      if (profile.check()) {
        // Set the profile entity
        this.$hscm.profile = profile
      }
      else {
        // Clear if it is not valid
        profile.clear()

        // Set profile to null
        this.$hscm.profile = null
      }
    } else {
      // Set profile to null
      this.$hscm.profile = null
    }

    // Prepare appstate
    if (this.$hscm.profile !== null) {
      // Initialize appstate
      this.$appstate.initialize(
        this.$hscm.hsc, this.$hscm.api, this.$hscm.profile
      )

      // Load data
      await this.$appstate.load()
    }
  },
}).$mount('#app')
