<template>
  <div class="pdfViewer">
    <div class="box" v-for="item in num" :key="item.id">
      <canvas class="page" :id="'page' + item.v"></canvas>
    </div>
  </div>
</template>

<script>
import render from './render.js'

export default {
  name: 'vue-pdf',
  props: {
    'src': {
      required: true,
      type: String
    }
  },
  data () {
    return {
      num: []
    }
  },
  mounted () {
    if (this.src) {
      render.call(this, this.src)
    }
  },
  watch: {
    src: function (n, o) {
      this.num = []
      render.call(this, n)
    }
  }
}
</script>

<style lang="css" scoped>
  .pdfViewer {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  .pdfViewer .box {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: visible;
      background-clip: content-box;
      background-color: white;
      margin-bottom: 10px;
    }
    .pdfViewer .box:last-child {
      margin: 0;
    }
    .pdfViewer .box .page {
      border: 1px solid black;
    }
</style>
