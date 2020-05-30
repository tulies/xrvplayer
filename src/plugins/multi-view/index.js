/*
 * XRV Player 多视角插件
 * @Author: 王嘉炀
 * @Date: 2020-03-29 22:10:38
 */

import * as DOM from '../../utils/dom'
import './index.scss'
import FrameRender from './FrameRender'
import FullscreenApi from '@/utils/fullscreen-api'

// http://117.80.86.239:18000/live/badmin-2160p-12000k.m3u8
class MultiView {
  // constructor () {
  // }

  init (xrvplaer) {
    // 首先我们需要把webgl容器占位好。
    this.$root = xrvplaer
    const videoHtml = `
      <div class="xrv-multi-view">
        <div class="gl-canvas"></div>
      </div>
    `
    console.log(111111111)
    DOM.append(this.$root.el, videoHtml)
    this.el = this.$root.el.querySelector('.xrv-multi-view')
    this.webglFrame = this.el.querySelector('.gl-canvas')
    // this.$root.playerObj.video.style.display = 'none'
    // this.$root.playerObj.el.querySelector('.xrv-video').remove()

    this.cel = {}

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
      },
      onInitRender: (t) => {
      },
      onTouchStart: (t) => {
      },
      onTouchEnd: (t) => {
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
}

export default MultiView
