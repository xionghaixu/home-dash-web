export const uploaderMixin = {
  inject: ['uploader']
}

export const supportMixin = {
  inject: ['uploader'],
  data() {
    return {
      support: true
    }
  },
  mounted() {
    this.support = this.uploader.uploader.support
  }
}
