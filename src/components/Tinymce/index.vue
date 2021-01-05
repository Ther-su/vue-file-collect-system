<template>
  <div class="tinymce-box">
    <editor v-model="myValue"
      :init="init"
      >
    </editor>
  </div>
</template>
<script>
import tinymce from 'tinymce/tinymce' // tinymce默认hidden，不引入不显示
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/icons/default/icons'
import 'tinymce/themes/silver'
import 'tinymce/plugins/image'// 插入上传图片插件
import 'tinymce/plugins/media'// 插入视频插件
import 'tinymce/plugins/table'// 插入表格插件
import 'tinymce/plugins/lists'// 列表插件
import 'tinymce/plugins/wordcount'// 字数统计插件
import { upLoadImage } from '../../api/task'
export default {
  components: {
    Editor
  },
  name: 'tinymce',
  props: {
    value: {
      type: String,
      default: ''
    },
    plugins: {
      type: [String, Array],
      default: 'lists image media table wordcount'
    },
    toolbar: {
      type: [String, Array],
      default: 'formatselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | image | removeformat'
    }
  },
  data () {
    return {
      worker: null,
      init: {
        language_url: '/tinymce/langs/zh_CN.js',
        language: 'zh_CN',
        skin_url: '/tinymce/skins/ui/oxide',
        // skin_url: 'tinymce/skins/ui/oxide-dark',//暗色系
        height: 300,
        plugins: this.plugins,
        toolbar: this.toolbar,
        branding: false,
        menubar: false,
        // 此处为图片上传处理函数，这个直接用了base64的图片形式上传图片，
        // 如需ajax上传可参考https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_handler
        images_upload_handler: async (blobInfo, success, failure) => {
          const formData = new FormData()
          const file = blobInfo.blob()
          const hash = await this.calculateHash(file)
          formData.append('file', file)
          formData.append('hash', hash)
          upLoadImage(formData)
            .then((res) => {
              const { data } = res
              success(data.url)
            })
            .catch(err => {
              failure(err)
            })
        }
      },
      myValue: this.value
    }
  },
  mounted () {
    tinymce.init({})
  },
  methods: {
    calculateHash (uploadFile) {
      return new Promise((resolve) => {
        this.worker = new Worker('./hash.js')
        this.worker.postMessage({ uploadFile })
        this.worker.onmessage = (e) => {
          const { hash } = e.data
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    // 添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
    // 需要什么事件可以自己增加
    // onClick (e) {
    //   this.$emit('onClick', e, tinymce)
    //   console.log(tinymce.activeEditor.getContent().length)
    // },
    // 可以添加一些自己的自定义事件，如清空内容
    clear () {
      this.myValue = ''
    }
  },
  watch: {
    value (newValue) {
      this.myValue = newValue
    },
    myValue (newValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>
<style lang="scss">
.tinymce-box {
  width: 1000px;
  max-width: 95%;
}
</style>
