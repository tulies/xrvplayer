import * as DOM from '@/utils/dom'
import { timeFormat, clamp } from '@/utils/util'
import * as Fn from '@/utils/fn.js'
import FullscreenApi from '@/utils/fullscreen-api'
import * as browser from '@/utils/browser'
import './index.scss'

// get the percent width of a time compared to the total end
const percentify = (time, end) => clamp((time / end) * 100, 0, 100).toFixed(2) + '%'

class ControlBar {
  constructor () {
    // Fn.UPDATE_REFRESH_INTERVAL
    // this.updatePlayProgress = Fn.throttle(Fn.bind(this, this.updatePlayProgress), Fn.UPDATE_REFRESH_INTERVAL)
    this.handleMouseDown = Fn.bind(this, this.handleMouseDown)
    this.handleMouseMove = Fn.throttle(Fn.bind(this, this.handleMouseMove), Fn.UPDATE_REFRESH_INTERVAL)
    this.handleMouseUp = Fn.bind(this, this.handleMouseUp)
  }

  init (player) {
    this.player = player
    this.$root = player.$root
    this.createDomHtml()
    this.addEventListener()
    this.onEventListener()
    this.player.component.ControlBar = this
  }

  createDomHtml () {
    const html = `
      <div class="xrv-control-bar">
        <div class="xrv-control-btn xrv-play-control"><span class="xrv-icon xrvfont xrvicon-bofangqi-bofang"></span></div>
        <div class="xrv-control-txt xrv-remaining-time-display">0:00</div>
        <div class="xrv-progress-control">
          <div class="xrv-progress-slider">
            <div class="xrv-load-progress"></div>
            <div class="xrv-mouse-display"></div>
            <div class="xrv-play-progress">
              <i class="xrv-play-current"></i>
            </div>
          </div>
        </div>
        <div class="xrv-control-txt xrv-live-control">直播</div>
        <div class="xrv-control-txt xrv-duration-display">--:--</div>
        <div class="xrv-control-btn xrv-fullscreen-control"><span class="xrv-icon xrvfont xrvicon-fullscreen"></span></div>
      </div>
    `
    DOM.append(this.player.el, html)
    this.el = this.player.el.querySelector('.xrv-control-bar')
    this.cel = {
      xrvPlayControl: this.el.querySelector('.xrv-play-control'),
      xrvRemainingTimeDisplay: this.el.querySelector('.xrv-remaining-time-display'),
      xrvDurationDisplay: this.el.querySelector('.xrv-duration-display'),
      xrvProgressSlider: this.el.querySelector('.xrv-progress-slider'),
      xrvLoadProgress: this.el.querySelector('.xrv-load-progress'),
      xrvPlayProgress: this.el.querySelector('.xrv-play-progress'),
      xrvPlayCurrent: this.el.querySelector('.xrv-play-current'),
      xrvProgressControl: this.el.querySelector('.xrv-progress-control'),
      xrvFullscreenControl: this.el.querySelector('.xrv-fullscreen-control')
    }
  }

  addEventListener () {
    this.el.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.player.reportUserActivity()
    }, false)
    this.el.addEventListener('mousemove', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.player.reportUserActivity()
    }, false)
    this.el.addEventListener('touchmove', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.player.reportUserActivity()
    }, false)
    this.cel.xrvPlayControl.addEventListener('click', () => {
      if (this.player.video.paused) {
        this.player.video.play()
      } else {
        this.player.video.pause()
      }
    }, false)

    // 得到需要全屏的el对象
    // this.fullEl = this.player.video
    this.fullEl = this.player.el

    // 点击全屏按钮
    this.cel.xrvFullscreenControl.addEventListener('click', () => {
      // 如果是X5内核的话  并且启用了X5全屏属性
      if (browser.IS_TBS) {
        if (this.player.isFullscreen()) {
          this.player.isFullscreen(false)
          DOM.removeClass(this.$root.parentEl, 'xrv-inner-fullscreen-fixed')
        } else {
          this.player.isFullscreen(true)
          DOM.addClass(this.$root.parentEl, 'xrv-inner-fullscreen-fixed')
        }
        return
      }
      if (FullscreenApi.requestFullscreen) {
        this.handleFullscreenChange()
      } else {
        // this.fullEl.enterFullScreen()
        if (this.fullEl.webkitEnterFullscreen || this.fullEl.enterFullScreen) {
          this.fullEl.webkitEnterFullscreen && this.fullEl.webkitEnterFullscreen()
          this.fullEl.enterFullScreen && this.fullEl.enterFullScreen()
        } else {
          // 不支持全屏的回调
          // 不支持全屏的话 我们就把父容器全屏
          if (this.player.isFullscreen()) {
            this.player.isFullscreen(false)
            DOM.removeClass(this.$root.parentEl, 'xrv-inner-fullscreen-fixed')
          } else {
            this.player.isFullscreen(true)
            DOM.addClass(this.$root.parentEl, 'xrv-inner-fullscreen-fixed')
          }
        }
      }
    }, false)

    // 如果支持全屏API的话
    if (FullscreenApi.requestFullscreen) {
      this.fullEl.addEventListener(FullscreenApi.fullscreenchange, () => {
        // this.handleFullscreenChange()
        const el = this.fullEl
        let isFs = document[FullscreenApi.fullscreenElement] === el
        if (!isFs && el.matches) {
          isFs = el.matches(':' + FullscreenApi.fullscreen)
        } else if (!isFs && el.msMatchesSelector) {
          isFs = el.msMatchesSelector(':' + FullscreenApi.fullscreen)
        }
        this.player.isFullscreen(isFs)
      })
    }
  }

  onEventListener () {
    // const { xrvPlayControlEL } = this.cel
    // 更新当前时间
    this.player.video.addEventListener('ended', () => {
      this.updateCurrentTimeContent()
    })
    this.player.video.addEventListener('timeupdate', () => {
      // 更新当前时间
      this.updateCurrentTimeContent()
      // 更新播放进度
      this.updatePlayProgress()
      // this.updateLoadProgress()
    })

    // 更新总时间
    this.player.video.addEventListener('durationchange', () => {
      this.updateDurationTimeContent()
    })
    this.player.video.addEventListener('loadstart', () => {
      this.updateDurationTimeContent()
    })
    this.player.video.addEventListener('loadedmetadata', () => {
      this.updateDurationTimeContent()
    })
    this.player.video.addEventListener('progress', () => {
      this.updateLoadProgress()
    })

    this.cel.xrvProgressControl.addEventListener('mousedown', this.handleMouseDown, false)
    this.cel.xrvProgressControl.addEventListener('touchstart', this.handleMouseDown, false)
  }

  // 更新当前时间
  updateCurrentTimeContent () {
    let time

    if (this.player.ended) {
      time = this.player.duration()
    } else {
      time = (this.player.scrubbing()) ? this.player.getCache().currentTime : this.player.currentTime()
    }

    time = timeFormat(time)
    this.cel.xrvRemainingTimeDisplay.innerHTML = time

    // this.updateTextNode_(time)
  }

  // 更新总时间
  updateDurationTimeContent () {
    let time = this.player.duration()
    time = timeFormat(time)
    console.debug('121')
    // console.debug('updateDurationTimeContent', time)

    this.cel.xrvDurationDisplay.innerHTML = time

    // this.updateTextNode_(time)
  }

  // 更新加载进度
  updateLoadProgress () {
    // console.log('updateProgress')
    // const buffered = this.player.buffered()
    const bufferedEnd = this.player.bufferedEnd()
    // const duration = (liveTracker && liveTracker.isLive()) ? liveTracker.seekableEnd() : this.player_.duration()
    const duration = this.player.duration()
    // console.log(buffered)
    // 这个是加载进度
    const percent = percentify(bufferedEnd, duration)
    this.cel.xrvLoadProgress.style.width = percent
    // console.log(percent)
  }

  // 更新播放进度
  updatePlayProgress () {
    // window.requestAnimationFrame(() => {
    const currentTime = (this.player.scrubbing())
      ? this.player.getCache().currentTime
      : this.player.currentTime()
    const duration = this.player.duration()
    var persent = currentTime / duration

    // console.log('updatePlayProgress', currentTime, persent)
    this.cel.xrvPlayProgress.style.width = persent * 100 + '%'
    // })
    // timeTooltip.updateTime(seekBarRect, seekBarPoint, time)
  }

  /**
   * Creates an instance of this class.
   *
   * @param {EventTarget~Event} event
   *        The `Player` that this class should be attached to.
   *
   * @listens touchstart
   * @listens mousedown
   */
  handleMouseDown (event) {
    event.preventDefault()
    event.stopPropagation()
    // const xrvProgressControlRect = DOM.getBoundingClientRect(this.cel.xrvProgressControl)
    this.player.video.pause()
    const xrvProgressControlPoint = DOM.getPointerPosition(this.cel.xrvProgressControl, event).x
    this.cel.xrvPlayProgress.style.width = `${xrvProgressControlPoint * 100}%`
    this.cel.xrvProgressControl.addEventListener('mousemove', this.handleMouseMove, false)
    this.cel.xrvProgressControl.addEventListener('mouseup', this.handleMouseUp, false)
    this.cel.xrvProgressControl.addEventListener('touchmove', this.handleMouseMove, false)
    this.cel.xrvProgressControl.addEventListener('touchend', this.handleMouseUp, false)
  }

  handleMouseMove (event) {
    // event.preventDefault()
    // event.stopPropagation()
    // const xrvProgressControlRect = DOM.getBoundingClientRect(this.cel.xrvProgressControl)
    const xrvProgressControlPoint = DOM.getPointerPosition(this.cel.xrvProgressControl, event).x
    this.cel.xrvPlayProgress.style.width = `${xrvProgressControlPoint * 100}%`
  }

  handleMouseUp (event) {
    event.preventDefault()
    event.stopPropagation()
    this.player.video.play()
    const duration = this.player.duration()
    // const xrvProgressControlRect = DOM.getBoundingClientRect(this.cel.xrvProgressControl)
    const xrvProgressControlPoint = DOM.getPointerPosition(this.cel.xrvProgressControl, event).x
    const currentTime = xrvProgressControlPoint * duration
    // 设置当前时间播放
    this.player.currentTime(currentTime)
    // this.cel.xrvProgressControl.removeEventListener('mousedown', this.handleMouseDown, false)
    this.cel.xrvProgressControl.removeEventListener('mousemove', this.handleMouseMove, false)
    this.cel.xrvProgressControl.removeEventListener('mouseup', this.handleMouseUp, false)
    this.cel.xrvProgressControl.removeEventListener('touchmove', this.handleMouseMove, false)
    this.cel.xrvProgressControl.removeEventListener('touchend', this.handleMouseUp, false)

    // console.log(xrvProgressControlRect, xrvProgressControlPoint)
    // xrvProgressControlRect.width * xrvProgressControlPoint

    // const totalWidth = this.cel.xrvProgressControl.clientWidth
    // let moveWidth = event.offsetX
    // if (moveWidth < 0) moveWidth = 0
    // if (moveWidth > totalWidth) moveWidth = totalWidth
    // var currtime = moveWidth / totalWidth * duration
    // console.log(totalWidth, moveWidth, currtime)
    // 是否支持提前播放
    // if (this.params.canfast === false) {
    //   if (currtime > video[0].currentTime) return false
    // }
    // this.player.currentTime(currtime)
  }

  handleFullscreenChange () {
    if (!this.player.isFullscreen()) {
      DOM.requestFullscreen(this.fullEl).then(() => {
        this.player.isFullscreen(true)
      }).catch(() => {
        this.player.isFullscreen(false)
      })
    } else {
      DOM.exitFullScreen(this.fullEl).then(() => {
        this.player.isFullscreen(false)
      }).catch(() => {
        this.player.isFullscreen(false)
      })
    }
    // setTimeout(() => {
    //   // alert('hahha')
    //   alert(this.player.isFullscreen())
    // }, 2000)
  }
}
export default ControlBar
