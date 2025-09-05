<template>
  <div class="ground">
    <Header />
    <Memo />
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue'
import Memo from './Memo.vue';
import Footer from './Footer.vue'

export default {
  name: 'GroundComponent',
  components: {Header, Footer, Memo},
};
</script>


