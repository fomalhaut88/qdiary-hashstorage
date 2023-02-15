<template>
  <b-modal v-model="isShown"
           has-modal-card
           :can-cancel="true">
    <form action="">
      <div class="modal-card" style="width: auto">
        <header class="modal-card-head">
          <p class="modal-card-title">About Qdiary</p>
        </header>
        <section class="modal-card-body">
          <p>
            Qdiary is a web service that allows users to make diary notes. 
            The data is saved in a special cloud service called 
            <a href="https://github.com/fomalhaut88/hashstorage" target="blank">Hashstorage</a>
            that provides an extrememly high safety. It uses 
            <a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" target="blank">AES-256</a>
            encryption so nobody can view the original data including the owner of the cloud.
            The website has minimalistic and friendly interface, it supports multiple diaries.
          </p>

          <br>

          <p>
            Hashstorage instance: {{ $hscm.root }}
          </p>

          <br>

          <p>
            Source code: 
            <a href="https://github.com/fomalhaut88/qdiary-hashstorage" target="blank">
              https://github.com/fomalhaut88/qdiary-hashstorage
            </a>
          </p>

          <br>

          <p>&copy; Alexander Khlebushchev</p>
        </section>
        <footer class="modal-card-foot">
          <b-button label="Close" @click="hide()" />
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

      hide() {
        this.isShown = false
      },
    },
  }
</script>
