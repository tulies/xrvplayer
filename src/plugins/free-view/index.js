/*
 * @Author: 王嘉炀
 * @Date: 2020-03-29 22:10:38
 */

import * as DOM from '../../utils/dom'
import './index.scss'
import FrameRender from './FrameRender'
import FullscreenApi from '@/utils/fullscreen-api'

// http://117.80.86.239:18000/live/badmin-2160p-12000k.m3u8
class FreeView {
  // constructor () {
  // }

  init (xrvplaer) {
    // 首先我们需要把webgl容器占位好。
    this.$root = xrvplaer
    // this.$root.plugin.mvf = this
    const videoHtml = `
      <div class="xrv-free-view">
        <div class="gl-canvas"></div>
        <div class="view-dots">
          <i class="active"></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </div>
      </div>
    `
    DOM.append(this.$root.el, videoHtml)
    this.el = this.$root.el.querySelector('.xrv-free-view')
    this.webglFrame = this.el.querySelector('.gl-canvas')
    this.$root.playerObj.video.style.display = 'none'
    // this.$root.playerObj.el.querySelector('.xrv-video').style.display = 'none'
    this.$root.playerObj.el.querySelector('.xrv-video').remove()
    this.cel = {}
    this.cel.viewBots = this.el.querySelector('.view-dots')
    this.allViewBots_ = this.cel.viewBots.querySelectorAll('i')

    // // $root.playerObj.video.setAttribute('playsinline', 'playsinline')
    // // $root.playerObj.video.setAttribute('webkit-playsinline', 'true')
    // // $root.playerObj.video.setAttribute('x5-playsinline', 'true')
    // this.$root.playerObj.video.setAttribute('x5-video-player-type', 'h5')
    // this.$root.playerObj.video.setAttribute('x5-video-player-fullscreen', 'ture')
    // // video.setAttribute( 'x5-video-orientation', 'portraint' );
    // this.$root.playerObj.video.setAttribute('crossorigin', 'anonymous')
    // this.$root.playerObj.video.style.display = 'none'

    // console.log('canplay')
    // console.log('视频宽高：', this.$root.playerObj.video.videoWidth, this.$root.playerObj.video.videoHeight)
    // 我需要先拿到播放器的流
    const frameRender = new FrameRender(this.webglFrame, {
      video: this.$root.playerObj.video,
      onViewChange: (t) => {
        this.activeViewDot(t.activeIndex)
      },
      onInitRender: (t) => {
        this.activeViewDot(t.activeIndex)
        setTimeout(() => {
          this.cel.viewBots.style.display = 'none'
        }, 2000)
      },
      onTouchStart: (t) => {
        this.cel.viewBots.style.display = ''
      },
      onTouchEnd: (t) => {
        this.cel.viewBots.style.display = 'none'
      }
    })
    const initrender = () => {
      this.$root.playerObj.video.removeEventListener('playing', initrender)
      // frameRender.render()
      setTimeout(() => {
        frameRender.render()
      }, 100)

      // TODO 这给应该走消息通知 绑定一下全屏切换事件
      this.$root.playerObj.el.addEventListener(FullscreenApi.fullscreenchange, () => {
        frameRender.onWindowResize()
      })
      // TODO 这给应该走消息通知
      this.$root.playerObj.component.ControlBar.cel.xrvFullscreenControl.addEventListener('click', function () {
        //   监听一下
        setTimeout(() => {
          frameRender.onWindowResize()
        }, 50)
      })
    }
    this.$root.playerObj.video.addEventListener('playing', initrender, { once: true })
    // const videoTexture = new THREE.VideoTexture(mvp.playerObj.video)
    // console.log(frameRender)
    // console.log('MVFrame')

    // 添加监听事件
    this.addListeners()
  }

  addListeners () {
    // 如果是 X5内核浏览器的话需要监听
    // this.$root.playerObj.video.addEventListener('x5videoenterfullscreen', () => {
    //   console.log('x5videoenterfullscreen')
    // })

    // this.$root.playerObj.video.addEventListener('x5videoexitfullscreen', () => {
    //   console.log('x5videoexitfullscreen')
    // })
  }

  activeViewDot (activeIndex) {
    this.allViewBots_.forEach((el, index) => {
      if (index === activeIndex) {
        if (!DOM.hasClass(el, 'active')) {
          DOM.addClass(el, 'active')
        }
      } else {
        if (DOM.hasClass(el, 'active')) {
          DOM.removeClass(el, 'active')
        }
      }
    })
  }
}

export default FreeView
