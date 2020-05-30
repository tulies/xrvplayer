/*
 * @Author: 王嘉炀
 * @Date: 2020-03-29 21:52:10
 */
import computedStyle from './computed-style'
import FullscreenApi from '@/utils/fullscreen-api'
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}
export function hasClass (el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
};

export function addClass (el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else {
      if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName
      }
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
};

export function removeClass (el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else {
      if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ')
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
};

export function append (el, ...args) {
  let newChild
  for (let k = 0; k < args.length; k += 1) {
    newChild = args[k]
    if (typeof newChild === 'string') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = newChild
      while (tempDiv.firstChild) {
        el.appendChild(tempDiv.firstChild)
      }
    } else {
      el.appendChild(newChild)
    }
  }
}

/**
 * Identical to the native `getBoundingClientRect` function, but ensures that
 * the method is supported at all (it is in all browsers we claim to support)
 * and that the element is in the DOM before continuing.
 *
 * This wrapper function also shims properties which are not provided by some
 * older browsers (namely, IE8).
 *
 * Additionally, some browsers do not support adding properties to a
 * `ClientRect`/`DOMRect` object; so, we shallow-copy it with the standard
 * properties (except `x` and `y` which are not widely supported). This helps
 * avoid implementations where keys are non-enumerable.
 *
 * @param  {Element} el
 *         Element whose `ClientRect` we want to calculate.
 *
 * @return {Object|undefined}
 *         Always returns a plain object - or `undefined` if it cannot.
 */
export function getBoundingClientRect (el) {
  if (el && el.getBoundingClientRect && el.parentNode) {
    const rect = el.getBoundingClientRect()
    const result = {};

    ['bottom', 'height', 'left', 'right', 'top', 'width'].forEach(k => {
      if (rect[k] !== undefined) {
        result[k] = rect[k]
      }
    })

    if (!result.height) {
      result.height = parseFloat(computedStyle(el, 'height'))
    }

    if (!result.width) {
      result.width = parseFloat(computedStyle(el, 'width'))
    }

    return result
  }
}

/**
 * Represents x and y coordinates for a DOM element or mouse pointer.
 *
 * @typedef  {Object} module:dom~Coordinates
 *
 * @property {number} x
 *           x coordinate in pixels
 *
 * @property {number} y
 *           y coordinate in pixels
 */

/**
 * Get the pointer position within an element.
 *
 * The base on the coordinates are the bottom left of the element.
 *
 * @param  {Element} el
 *         Element on which to get the pointer position on.
 *
 * @param  {EventTarget~Event} event
 *         Event object.
 *
 * @return {module:dom~Coordinates}
 *         A coordinates object corresponding to the mouse position.
 *
 */
export function getPointerPosition (el, event) {
  const position = {}
  const box = findPosition(el)
  const boxW = el.offsetWidth
  const boxH = el.offsetHeight

  const boxY = box.top
  const boxX = box.left
  let pageY = event.pageY
  let pageX = event.pageX

  if (event.changedTouches) {
    pageX = event.changedTouches[0].pageX
    pageY = event.changedTouches[0].pageY
  }

  position.y = Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH))
  position.x = Math.max(0, Math.min(1, (pageX - boxX) / boxW))

  return position
}

/**
 * Represents the position of a DOM element on the page.
 *
 * @typedef  {Object} module:dom~Position
 *
 * @property {number} left
 *           Pixels to the left.
 *
 * @property {number} top
 *           Pixels from the top.
 */

/**
 * Get the position of an element in the DOM.
 *
 * Uses `getBoundingClientRect` technique from John Resig.
 *
 * @see http://ejohn.org/blog/getboundingclientrect-is-awesome/
 *
 * @param  {Element} el
 *         Element from which to get offset.
 *
 * @return {module:dom~Position}
 *         The position of the element that was passed in.
 */
export function findPosition (el) {
  let box

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect()
  }

  if (!box) {
    return {
      left: 0,
      top: 0
    }
  }

  const docEl = document.documentElement
  const body = document.body

  const clientLeft = docEl.clientLeft || body.clientLeft || 0
  const scrollLeft = window.pageXOffset || body.scrollLeft
  const left = box.left + scrollLeft - clientLeft

  const clientTop = docEl.clientTop || body.clientTop || 0
  const scrollTop = window.pageYOffset || body.scrollTop
  const top = box.top + scrollTop - clientTop

  // Android sometimes returns slightly off decimal values, so need to round
  return {
    left: Math.round(left),
    top: Math.round(top)
  }
}

export function requestFullscreen (element) {
  return new Promise((resolve, reject) => {
    const changeHandler = () => {
      offHandler()
      resolve()
    }
    const errorHandler = (e, err) => {
      offHandler()
      reject(err)
    }

    const offHandler = () => {
      element.removeEventListener(FullscreenApi.fullscreenchange, changeHandler)
      element.removeEventListener(FullscreenApi.fullscreenerror, errorHandler)
    }
    element.addEventListener(FullscreenApi.fullscreenchange, changeHandler, { once: true })
    element.addEventListener(FullscreenApi.fullscreenerror, errorHandler, { once: true })

    if (element[FullscreenApi.requestFullscreen]) element[FullscreenApi.requestFullscreen]()

    // if (element.requestFullscreen) {
    //   element.requestFullscreen()
    // } else if (element.mozRequestFullScreen) {
    //   element.mozRequestFullScreen()
    // } else if (element.msRequestFullscreen) {
    //   element.msRequestFullscreen()
    // } else if (element.webkitRequestFullscreen) {
    //   element.webkitRequestFullScreen()
    // } else {
    //   console.log('不支持全屏相关事件')
    // }
  })
}

export function exitFullScreen (element) {
  return new Promise((resolve, reject) => {
    const changeHandler = () => {
      offHandler()
      resolve()
    }
    const errorHandler = (e, err) => {
      offHandler()
      reject(err)
    }

    const offHandler = () => {
      element.removeEventListener(FullscreenApi.fullscreenchange, changeHandler)
      element.removeEventListener(FullscreenApi.fullscreenerror, errorHandler)
    }
    element.addEventListener(FullscreenApi.fullscreenchange, changeHandler, { once: true })
    element.addEventListener(FullscreenApi.fullscreenerror, errorHandler, { once: true })

    if (document[FullscreenApi.exitFullscreen]) document[FullscreenApi.exitFullscreen]()
    // if (document.exitFullscreen) {
    //   document.exitFullscreen()
    // } else if (document.mozCancelFullScreen) {
    //   document.mozCancelFullScreen()
    // } else if (document.msExitFullscreen) {
    //   document.msExiFullscreen()
    // } else if (document.webkitCancelFullScreen) {
    //   document.webkitCancelFullScreen()
    // } else if (document.webkitExitFullscreen) {
    //   document.webkitExitFullscreen()
    // } else {
    //   console.log('不支持退出全屏相关事件')
    // }
  })
}

/**
 * Whether the current DOM interface appears to be real (i.e. not simulated).
 *
 * @return {boolean}
 *         Will be `true` if the DOM appears to be real, `false` otherwise.
 */
export function isReal () {
  // Both document and window will never be undefined thanks to `global`.
  return document === window.document
}
