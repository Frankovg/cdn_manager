import { postcssIsolateStyles } from 'vitepress'

export default {
  plugins: [
    postcssIsolateStyles({
      includeFiles: [/vp-doc\.css/, /base\.css/],
      prefix: ':not(:where(.demo, .demo *, [data-reka-popper-content-wrapper], [data-reka-popper-content-wrapper] *))',
    }),
  ],
}
