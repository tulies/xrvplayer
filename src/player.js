/*
 * @description 播放器主体类,我只负责处理播放器的生命周期
 * @Author: 王嘉炀
 * @Date: 2020-04-03 11:50:17
 */
// import Hls from 'hls.js'
import * as DOM from '@/utils/dom'
import ControlBar from '@/components/control-bar'
import LoadingSpinner from '@/components/loading-spinner'
import { createTimeRange } from '@/utils/time-ranges.js'
import * as Fn from '@/utils/fn.js'
import { MimetypesKind, getMimetype } from '@/utils/mimetypes'
// import * as browser from '@/utils/browser.js'
class Player {
  constructor ($root, el, options = {}, ready) {
    this.$root = $root
    this.parentEl = el

    this.options = this.initOptions(options)
    // 初始化属性
    this.initProp(this.options)
    // 初始化子组件
    this.component = {}

    this.resetCache_()

    // 创建完就会得到video对象
    this.createVideoDom()

    // 绑定监听事件
    this.onVideoEvent()
    this.useComponent(new ControlBar())
    this.useComponent(new LoadingSpinner())
    /** init */

    // Update controls className. Can't do this when the controls are initially
    // set because the element doesn't exist yet.
    if (this.controls()) {
      DOM.addClass(this.el, 'xrv-controls-enabled')
    } else {
      DOM.addClass(this.el, 'xrv-controls-disabled')
    }

    this.userActive(true)

    if (this.controls()) {
      this.addControlsListeners_()
    }

    this.listenForUserActivity_ = Fn.bind(this, this.listenForUserActivity_)
    this.video.addEventListener('play', this.listenForUserActivity_, { once: true })

    // this.addControlsListeners_()

    if (this.options.src) {
      // this.video.src = this.options.src
      this.src(this.options.src)
    }
    this.el.querySelector('.xrv-playbtn').addEventListener('click', () => {
      this.video.play()
    })
  }

  initProp (options) {
    this.video = null
    this.isReady_ = false
    this.changingSrc_ = false

    // Init state hasStarted_
    this.hasStarted_ = false

    // Init state userActive_
    this.userActive_ = false

    // 控制条是否使用
    this.controls_ = !!options.controls
  }

  initOptions (options) {
    const defaultOptions = {
      // 是否静音
      muted: false,
      // 是否使用原生控制条
      controls: true,
      // 是否自动播放
      autoplay: false,
      // 预加载
      preload: 'auto',
      // 是否循环播放
      loop: false,
      // 播放流地址
      src: '',
      poster: '',
      // 事件
      on: {}
    }
    return {
      ...defaultOptions,
      ...options
    }
  }

  /**
   * Resets the internal cache object.
   *
   * Using this function outside the player constructor or reset method may
   * have unintended side-effects.
   *
   * @private
   */
  resetCache_ () {
    this.cache_ = {

      // Right now, the currentTime is not _really_ cached because it is always
      // retrieved from the tech (see: currentTime). However, for completeness,
      // we set it to zero here to ensure that if we do start actually caching
      // it, we reset it along with everything else.
      currentTime: 0,
      initTime: 0,
      inactivityTimeout: 2000,
      // inactivityTimeout: this.options_.inactivityTimeout,
      duration: NaN,
      lastVolume: 1,
      // lastPlaybackRate: this.defaultPlaybackRate(),
      media: null,
      src: '',
      source: {},
      sources: [],
      volume: 1,
      isFullscreen: false
    }
  }

  createVideoDom () {
    const videoHtml = `
      <div class="xrv-player">
        <div class="xrv-video"></div>
        <div class="xrv-poster"></div>
        <div class="xrv-playbtn"></div>
      </div>
    `
    DOM.append(this.parentEl, videoHtml)
    this.el = this.parentEl.querySelector('.xrv-player')
    this.cel = {}
    this.cel.xrvPoster = this.el.querySelector('.xrv-poster')

    // 初始化video
    this.video = document.createElement('video')
    this.video.loop = true// 视频是否循环
    this.video.setAttribute('playsinline', '')
    this.video.setAttribute('webkit-playsinline', '')
    this.video.setAttribute('x5-playsinline', '')
    this.video.setAttribute('x5-video-player-type', 'h5')
    this.video.setAttribute('x5-video-player-fullscreen', 'true')
    // this.video.setAttribute('x5-video-orientation', 'portraint')
    this.video.setAttribute('crossorigin', 'anonymous')
    // this.video.style.display = 'none'
    this.el.querySelector('.xrv-video').append(this.video)

    // console.log('this.video.canPlayType', this.video.canPlayType)
    // console.log('this.video.srcObject.type', this.video.srcObject.type)
    // 设置poster图
    if (this.options.poster) {
      this.cel.xrvPoster.style.backgroundImage = `url(${this.options.poster})`
    }
  }

  // 触发了开始
  // handleStarted () {
  //   DOM.addClass(this.el, 'xrv-has-started')
  // }

  onVideoEvent () {
    this.video.addEventListener('canplaythrough', () => {
      console.debug('canplaythrough')
    })
    this.video.addEventListener('loadedmetadata', () => {
      console.debug('loadedmetadata')
      this.triggerReady()
    })
    this.video.addEventListener('loadstart', () => {
      console.debug('loadstart')
    })
    this.video.addEventListener('durationchange', () => {
      console.debug('durationchange')
      this.duration(this.video.duration)
      // duration
      // this.duration(duration)
    })
    this.video.addEventListener('play', () => {
      console.debug('play')
      // 触发第一次
      this.hasStarted(true)

      DOM.removeClass(this.el, 'xrv-pause')
      DOM.addClass(this.el, 'xrv-playing')
    })
    this.video.addEventListener('playing', () => {
      console.debug('playing')
    })
    this.video.addEventListener('canplay', () => {
      console.debug('canplay')
    })
    this.video.addEventListener('pause', () => {
      console.debug('pause')
      DOM.removeClass(this.el, 'xrv-playing')
      DOM.addClass(this.el, 'xrv-pause')
    })
    this.video.addEventListener('ended', () => {
      console.debug('ended')
    })
    this.video.addEventListener('seeking', () => {
      console.debug('seeking')
    })

    this.video.addEventListener('seeked', () => {
      console.debug('seeked')
    })
    this.video.addEventListener('waiting', () => {
      console.debug('waiting')
    })
    this.video.addEventListener('timeupdate', () => {
      // console.debug('timeupdate')
    })

    this.video.addEventListener('abort', () => {
      console.debug('abort')
    })
    this.video.addEventListener('error', () => {
      console.log('error')
    })
  }

  /**
   * Set up click and touch listeners for the playback element
   *
   * - On desktops: a click on the video itself will toggle playback
   * - On mobile devices: a click on the video toggles controls
   *   which is done by toggling the user state between active and
   *   inactive
   * - A tap can signal that a user has become active or has become inactive
   *   e.g. a quick tap on an iPhone movie should reveal the controls. Another
   *   quick tap should hide them again (signaling the user is in an inactive
   *   viewing state)
   * - In addition to this, we still want the user to be considered inactive after
   *   a few seconds of inactivity.
   *
   * > Note: the only part of iOS interaction we can't mimic with this setup
   * is a touch and hold on the video element counting as activity in order to
   * keep the controls showing, but that shouldn't be an issue. A touch and hold
   * on any controls will still keep the user active
   *
   * @private
   */
  addControlsListeners_ () {
    // Make sure to remove all the previous listeners in case we are called multiple times.
    // this.removeTechControlsListeners_()

    // Some browsers (Chrome & IE) don't trigger a click on a flash swf, but do
    // trigger mousedown/up.
    // http://stackoverflow.com/questions/1444562/javascript-onclick-event-over-flash-object
    // Any touch events are set to block the mousedown event from happening
    // this.on(this.tech_, 'mouseup', this.handleTechClick_)
    // this.on(this.tech_, 'dblclick', this.handleTechDoubleClick_)

    // If the controls were hidden we don't want that to change without a tap event
    // so we'll check if the controls were already showing before reporting user
    // activity
    // this.on(this.tech_, 'touchstart', this.handleTechTouchStart_)
    // this.on(this.tech_, 'touchmove', this.handleTechTouchMove_)
    // this.on(this.tech_, 'touchend', this.handleTechTouchEnd_)

    // The tap listener needs to come after the touchend listener because the tap
    // listener cancels out any reportedUserActivity when setting userActive(false)
    // this.on(this.tech_, 'tap', this.handleTechTap_)

    this.el.addEventListener('click', this.handlePlayerClick_.bind(this), false)
    // this.el.addEventListener('touchmove', this.handlePlayerTouchMove_, false)
  }

  /**
   * Remove the listeners used for click and tap controls. This is needed for
   * toggling to controls disabled, where a tap/touch should do nothing.
   *
   * @private
   */
  removeControlsListeners_ () {
    // We don't want to just use `this.off()` because there might be other needed
    // listeners added by techs that extend this.
    // this.off(this.tech_, 'tap', this.handleTechTap_)
    // this.off(this.tech_, 'touchstart', this.handleTechTouchStart_)
    // this.off(this.tech_, 'touchmove', this.handleTechTouchMove_)
    // this.off(this.tech_, 'touchend', this.handleTechTouchEnd_)
    // this.off(this.tech_, 'mouseup', this.handleTechClick_)
    // this.off(this.tech_, 'dblclick', this.handleTechDoubleClick_)
  }

  // 点击播放器
  handlePlayerClick_ () {
    if (!this.hasStarted_) {
      return
    }
    if (!this.controls_) {
      return
    }
    console.log('handlePlayerClick_', this.controls_)
    // if (this.video.paused) {
    //   this.video.play()
    // } else {
    //   this.video.pause()
    // }
  }

  /**
   * Report user activity
   *
   * @param {Object} event
   *        Event object
   */
  reportUserActivity (event) {
    this.userActivity_ = true
  }

  /**
   * Listen for user activity based on timeout value
   *
   * @private
   */
  listenForUserActivity_ () {
    let mouseInProgress = null
    let lastMoveX
    let lastMoveY
    const handleActivity = Fn.bind(this, this.reportUserActivity)

    const handleMouseMove = function (e) {
      // #1068 - Prevent mousemove spamming
      // Chrome Bug: https://code.google.com/p/chromium/issues/detail?id=366970
      if (e.screenX !== lastMoveX || e.screenY !== lastMoveY) {
        lastMoveX = e.screenX
        lastMoveY = e.screenY
        handleActivity()
      }
    }

    const handleMouseDown = function () {
      handleActivity()
      // For as long as the they are touching the device or have their mouse down,
      // we consider them active even if they're not moving their finger or mouse.
      // So we want to continue to update that they are active
      if (mouseInProgress) {
        window.clearInterval(mouseInProgress)
        mouseInProgress = null
      }
      // Setting userActivity=true now and setting the interval to the same time
      // as the activityCheck interval (250) should ensure we never miss the
      // next activityCheck
      mouseInProgress = window.setInterval(handleActivity, 250)
    }

    const handleMouseUpAndMouseLeave = function (event) {
      handleActivity()
      // Stop the interval that maintains activity if the mouse/touch is down
      if (mouseInProgress) {
        window.clearInterval(mouseInProgress)
        mouseInProgress = null
      }
    }

    // Any mouse movement will be considered user activity

    this.el.addEventListener('mousedown', handleMouseDown, false)
    this.el.addEventListener('mousemove', handleMouseMove, false)
    this.el.addEventListener('mouseup', handleMouseUpAndMouseLeave, false)
    this.el.addEventListener('mouseleave', handleMouseUpAndMouseLeave, false)

    // Listen for keyboard navigation
    // Shouldn't need to use inProgress interval because of key repeat
    // this.on('keydown', handleActivity)
    // this.on('keyup', handleActivity)

    // Run an interval every 250 milliseconds instead of stuffing everything into
    // the mousemove/touchmove function itself, to prevent performance degradation.
    // `this.reportUserActivity` simply sets this.userActivity_ to true, which
    // then gets picked up by this loop
    // http://ejohn.org/blog/learning-from-twitter/
    let inactivityTimeout = null

    // 每隔250ms检查一次

    window.setInterval(() => {
      // Check to see if mouse/touch activity has happened
      if (!this.userActivity_) {
        return
      }

      // Reset the activity tracker
      this.userActivity_ = false

      // If the user state was inactive, set the state to active
      this.userActive(true)

      // Clear any existing inactivity timeout to start the timer over
      if (inactivityTimeout) {
        window.clearTimeout(inactivityTimeout)
        inactivityTimeout = null
      }
      const timeout = this.cache_.inactivityTimeout
      if (timeout <= 0) {
        return
      }
      // In <timeout> milliseconds, if no more activity has occurred the
      // user will be considered inactive
      inactivityTimeout = window.setTimeout(() => {
        // Protect against the case where the inactivityTimeout can trigger just
        // before the next user activity is picked up by the activity check loop
        // causing a flicker
        if (!this.userActivity_) {
          this.userActive(false)
        }
      }, timeout)
    }, 250)

    this.video.removeEventListener('play', this.listenForUserActivity_)
  }

  /**
   * Get/set if user is active
   *
   * @fires Player#useractive
   * @fires Player#userinactive
   *
   * @param {boolean} [bool]
   *        - true if the user is active
   *        - false if the user is inactive
   *
   * @return {boolean}
   *         The current value of userActive when getting
   */
  userActive (bool) {
    if (bool === undefined) {
      return this.userActive_
    }

    bool = !!bool

    if (bool === this.userActive_) {
      return
    }

    this.userActive_ = bool

    if (this.userActive_) {
      this.userActivity_ = true
      DOM.removeClass(this.el, 'xrv-user-inactive')
      DOM.addClass(this.el, 'xrv-user-active')
      return
    }

    // Chrome/Safari/IE have bugs where when you change the cursor it can
    // trigger a mousemove event. This causes an issue when you're hiding
    // the cursor when the user is inactive, and a mousemove signals user
    // activity. Making it impossible to go into inactive mode. Specifically
    // this happens in fullscreen when we really need to hide the cursor.
    //
    // When this gets resolved in ALL browsers it can be removed
    // https://code.google.com/p/chromium/issues/detail?id=103041
    // if (this.tech_) {
    //   this.tech_.one('mousemove', function (e) {
    //     e.stopPropagation()
    //     e.preventDefault()
    //   })
    // }

    this.userActivity_ = false
    DOM.removeClass(this.el, 'xrv-user-active')
    DOM.addClass(this.el, 'xrv-user-inactive')
  }

  src (videoSrc) {
    // console.log('getMimetype(videoSrc)', getMimetype(videoSrc))
    const mimetype = getMimetype(videoSrc)
    // window.MediaSource.isTypeSupported
    // application/x-mpegURL
    // application/vnd.apple.mpegurl

    if (this.video.canPlayType(mimetype)) {
      // console.log(`支持 ${mimetype}`)
      this.video.src = videoSrc
    } else if (MimetypesKind.m3u8 === mimetype && this.video.canPlayType('application/vnd.apple.mpegurl')) {
      // console.log('支持 application/vnd.apple.mpegurl')
      this.video.src = videoSrc
      // console.log('this.video.srcObject.type', this.video.srcObject.type)
    } else if (window.Hls && Hls.isSupported()) {
      /**
       * hls的使用说明，注意liveDurationInfinity要设置为true
       * https://github.com/video-dev/hls.js/blob/master/docs/API.md#livedurationinfinity
       */
      var hls = new Hls({
        liveDurationInfinity: true
      })
      hls.loadSource(videoSrc)
      hls.attachMedia(this.video)
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        console.log(`hls installed, ${Hls.Events.MANIFEST_PARSED}`)
      })
    } else {
      console.warn('若您的浏览器不支持hls，你可以引入hls.js对不支持hls h264的浏览器进行自动转码。在页面上添加：<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>。')
      this.video.src = videoSrc
    }
  }

  /**
   * Get or set whether or not the controls are showing.
   *
   * @fires Player#controlsenabled
   *
   * @param {boolean} [bool]
   *        - true to turn controls on
   *        - false to turn controls off
   *
   * @return {boolean}
   *         The current value of controls when getting
   */
  controls (bool) {
    if (bool === undefined) {
      return !!this.controls_
    }
    bool = !!bool
    // Don't trigger a change event unless it actually changed
    if (this.controls_ === bool) {
      return
    }
    this.controls_ = bool

    if (this.controls_) {
      DOM.removeClass(this.el, 'xrv-controls-disabled')
      DOM.addClass(this.el, 'xrv-controls-enabled')
    } else {
      DOM.removeClass(this.el, 'xrv-controls-enabled')
      DOM.addClass(this.el, 'xrv-controls-disabled')
    }
  }

  // 点击播放进度条的时候触发，松手的时候恢复。
  scrubbing (isScrubbing) {
    if (typeof isScrubbing === 'undefined') {
      return this.scrubbing_
    }
    this.scrubbing_ = !!isScrubbing

    if (isScrubbing) {
      DOM.addClass(this.el, 'xrv-scrubbing')
    } else {
      DOM.addClass(this.el, 'xrv-scrubbing')
    }
  }

  currentTime (seconds) {
    if (typeof seconds !== 'undefined') {
      if (seconds < 0) {
        seconds = 0
      }
      // isReady_ 是否reday
      // changingSrc_ 是否正在切换src播放地址
      // 处于这2个情况的话，先把seconds记录下来，等待第一次播放的时候触发把currentTime赋值这个时间
      if (!this.isReady_ || this.changingSrc_) {
        this.cache_.initTime = seconds
        // this.off('canplay', this.applyInitTime_)
        // this.one('canplay', this.applyInitTime_)
        this.video.addEventListener('canplay', () => {
          this.currentTime(this.cache_.initTime)
        }, { once: true })
        return
      }
      // 设置播放器时间
      // this.techCall_('setCurrentTime', seconds)
      this.video.currentTime = seconds
      this.cache_.initTime = 0
      return
    }

    // cache last currentTime and return. default to 0 seconds
    //
    // Caching the currentTime is meant to prevent a massive amount of reads on the tech's
    // currentTime when scrubbing, but may not provide much performance benefit afterall.
    // Should be tested. Also something has to read the actual current time or the cache will
    // never get updated.
    // this.cache_.currentTime = (this.techGet_('currentTime') || 0)
    this.cache_.currentTime = this.video.currentTime || 0
    return this.cache_.currentTime
  }

  duration (seconds) {
    if (seconds === undefined) {
      // return NaN if the duration is not known
      return this.cache_.duration !== undefined ? this.cache_.duration : NaN
    }

    seconds = parseFloat(seconds)

    // Standardize on Infinity for signaling video is live
    if (seconds < 0) {
      seconds = Infinity
    }

    if (seconds !== this.cache_.duration) {
      // Cache the last set value for optimized scrubbing (esp. Flash)
      this.cache_.duration = seconds

      if (seconds === Infinity) {
        DOM.addClass(this.el, 'xrv-live')
      } else {
        DOM.removeClass(this.el, 'xrv-live')
      }
      if (!isNaN(seconds)) {
        // Do not fire durationchange unless the duration value is known.
        // 除非知道持续时间值，否则不要触发durationchange。
        // @see [Spec]{@link https://www.w3.org/TR/2011/WD-html5-20110113/video.html#media-element-load-algorithm}
        /**
         * @event Player#durationchange
         * @type {EventTarget~Event}
         */
        // this.trigger('durationchange')
      }
    }
  }

  /**
   *
   */
  remainingTime () {
    return this.duration() - this.currentTime()
  }

  /**
   * Get a TimeRange object with an array of the times of the video
   * that have been downloaded. If you just want the percent of the
   * video that's been downloaded, use bufferedPercent.
   *
   * @see [Buffered Spec]{@link http://dev.w3.org/html5/spec/video.html#dom-media-buffered}
   *
   * @return {TimeRange}
   *         A mock TimeRange object (following HTML spec)
   */
  buffered () {
    let buffered = this.video.buffered

    if (!buffered || !buffered.length) {
      buffered = createTimeRange(0, 0)
    }

    return buffered
  }

  /**
   * Get the ending time of the last buffered time range
   * This is used in the progress bar to encapsulate all time ranges.
   *
   * @return {number}
   *         The end of the last buffered time range
   */
  bufferedEnd () {
    const buffered = this.buffered()
    const duration = this.duration()
    let end = buffered.end(buffered.length - 1)

    if (end > duration) {
      end = duration
    }
    return end
  }

  hasStarted (request) {
    if (request === undefined) {
      // act as getter, if we have no request to change
      return this.hasStarted_
    }

    if (request === this.hasStarted_) {
      return
    }
    this.hasStarted_ = request
    if (this.hasStarted_) {
      DOM.addClass(this.el, 'xrv-has-started')
      // 触发第一次play
      // this.trigger('firstplay')
    } else {
      DOM.removeClass(this.el, 'xrv-has-started')
    }
  }

  /**
   * Check if the player is in fullscreen mode or tell the player that it
   * is or is not in fullscreen mode.
   *
   * > NOTE: As of the latest HTML5 spec, isFullscreen is no longer an official
   * property and instead document.fullscreenElement is used. But isFullscreen is
   * still a valuable property for internal player workings.
   *
   * @param  {boolean} [isFS]
   *         Set the players current fullscreen state
   *
   * @return {boolean}
   *         - true if fullscreen is on and getting
   *         - false if fullscreen is off and getting
   */
  isFullscreen (isFS) {
    if (isFS !== undefined) {
      // const oldValue = this.cache_.isFullscreen_

      this.cache_.isFullscreen = Boolean(isFS)

      // if we changed fullscreen state and we're in prefixed mode, trigger fullscreenchange
      // this is the only place where we trigger fullscreenchange events for older browsers
      // fullWindow mode is treated as a prefixed event and will get a fullscreenchange event as well
      // if (this.cache_.isFullscreen_ !== oldValue && this.fsApi_.prefixed) {
      /**
           * @event Player#fullscreenchange
           * @type {EventTarget~Event}
           */
      // 回调 全屏change事件
      // this.trigger('fullscreenchange')
      // }
      this.toggleFullscreenClass_()
      return
    }
    return this.cache_.isFullscreen
  }

  /**
   * @private
   */
  toggleFullscreenClass_ () {
    if (this.isFullscreen()) {
      DOM.addClass(this.el, 'xrv-fullscreen')
    } else {
      DOM.removeClass(this.el, 'xrv-fullscreen')
    }
  }

  triggerReady () {
    console.log('triggerReady')
    this.isReady_ = true
  }

  useComponent (cmp) {
    if (cmp && cmp.init) {
      cmp.init(this)
    }
  }

  /**
   * Get object for cached values.
   *
   * @return {Object}
   *         get the current object cache
   */
  getCache () {
    return this.cache_
  }
}

export default Player
