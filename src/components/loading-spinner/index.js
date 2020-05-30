import * as DOM from '@/utils/dom'
import './index.scss'
// import { timeFormat, clamp } from '@/utils/util'
// import * as Fn from '@/utils/fn.js'
// import FullscreenApi from '@/utils/fullscreen-api'

class LoadingSpinner {
  constructor () {
    console.debug('LoadingSpinner -- constructor')
  }

  init (player) {
    this.player = player
    this.$root = player.$root
    this.createDomHtml()
    // this.addEventListener()
    this.onEventListener()
  }

  createDomHtml () {
    const html = '<div class="xrv-loading-spinner"><span class="loading-icon xrvfont xrvicon-loading2"></span></div>'
    DOM.append(this.player.el, html)
    this.el = this.player.el.querySelector('.xrv-loading-spinner')
    this.cel = {}
  }

  onEventListener () {
    // this.player.video.addEventListener('play', () => {
    //   this.showLoading()
    // })
    this.player.video.addEventListener('waiting', () => {
      this.showLoading()
    })
    this.player.video.addEventListener('seeking', () => {
      this.showLoading()
    })

    this.player.video.addEventListener('seeked', () => {
      this.hideLoading()
    })
    this.player.video.addEventListener('canplaythrough', () => {
      this.hideLoading()
    })
    this.player.video.addEventListener('playing', () => {
      this.hideLoading()
    })
  }

  showLoading () {
    this.el.style.display = ''
  }

  hideLoading () {
    this.el.style.display = 'none'
  }
}
export default LoadingSpinner
