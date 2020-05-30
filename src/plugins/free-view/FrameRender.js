/*
 * @Author: 王嘉炀
 * @Date: 2020-04-04 15:09:23
 */
import * as THREE from 'three'
import { TOUCH_ENABLED } from '@/utils/browser'

class FrameRender {
  constructor (el, options = {}) {
    this.webglFrame = el
    this.initProps()
    this.options = this.initOptions(options)
    this.activeIndex = this.options.activeIndex
    this.uvs = this.calcuUVS()
    this.renderer = this.initRender()
    this.webglFrame.append(this.renderer.domElement)

    this.camera = this.initCamera()
    this.scene = this.initScene()
    // this.initLight()
    this.initModel()
    if (this.options.onInitReady) this.options.onInitReady(this)
    window.addEventListener('resize', () => {
      this.onWindowResize()
    })
  }

  initProps () {
    this.activeIndex = 0
  }

  initOptions (options) {
    const defaultOptions = {
      splitX: 4,
      splitY: 4,
      activeIndex: 0,
      video: null,
      onViewChange: null,
      onTouchStart: null,
      onTouchEnd: null,
      onInitRender: null,
      onInitReady: null

    }
    return {
      ...defaultOptions,
      ...options
    }
  }

  initRender () {
    // console.log(this.webglFrame.clientWidth)
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(this.webglFrame.clientWidth, this.webglFrame.clientHeight)
    // renderer.shadowMap.enabled = true
    renderer.setClearColor(0x000000)
    return renderer
    // renderer.shadowMap.enabled = true
    // 告诉渲染器需要阴影效果
    // document.body.appendChild(renderer.domElement);
  }

  initCamera () {
    const camera = new THREE.PerspectiveCamera(45, this.webglFrame.clientWidth / this.webglFrame.clientHeight, 0.1, 1000)

    const z = this.calcuCameraZ()
    camera.position.set(0, 0, z)
    return camera
  }

  calcuCameraZ () {
    if ((this.webglFrame.clientHeight / this.webglFrame.clientWidth) > (9 / 16)) {
      return ((this.webglFrame.clientHeight / this.webglFrame.clientWidth) / (9 / 16)) * 10.8
    } else {
      return 10.8
      // return ((this.webglFrame.clientWidth / this.webglFrame.clientHeight) / (16 / 9)) * 10.8
    }
  }

  initScene () {
    const scene = new THREE.Scene()
    return scene
  }

  initModel () {
    // const videoTexture = new THREE.VideoTexture(mvp.playerObj.video)
    const { splitX, splitY, video, activeIndex } = this.options
    const stepX = 1 / splitX
    const stepY = 1 / splitY
    const indexX = this.uvs[activeIndex][0]
    const indexY = this.uvs[activeIndex][1]
    const geometry = new THREE.PlaneGeometry(16, 9)
    // console.log(geometry)
    // geometry.faceVertexUvs[0][0]= [new THREE.Vector2(0,0.5), new THREE.Vector2(0,0.25), new THREE.Vector2(0.25,0.5)]
    // geometry.faceVertexUvs[0][1]= [new THREE.Vector2(0,0.25), new THREE.Vector2(0.25,0.25), new THREE.Vector2(0.25,0.5)]
    geometry.faceVertexUvs[0][0] = [new THREE.Vector2(indexX * stepX, (indexY + 1) * stepY), new THREE.Vector2(indexX * stepX, indexY * stepY), new THREE.Vector2((indexX + 1) * stepX, (indexY + 1) * stepY)]
    geometry.faceVertexUvs[0][1] = [new THREE.Vector2(indexX * stepX, indexY * stepY), new THREE.Vector2((indexX + 1) * stepX, indexY * stepY), new THREE.Vector2((indexX + 1) * stepX, (indexY + 1) * stepY)]
    // 通过video对象实例化纹理
    // video.crossOrigin = "Anonymous"
    var texture = new THREE.VideoTexture(video)
    // texture.setCrossOrigin( "Anonymous" );
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
    texture.matrixAutoUpdate = false // 设置纹理属性matrixAutoUpdate为false以后，纹理将通过matrix属性设置的矩阵更新纹理显示
    // material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping; //设置为可循环
    texture.minFilter = THREE.LinearFilter
    const material = new THREE.MeshBasicMaterial({ map: texture })
    // material.map.matrix.identity()
    //   .scale( 0.25, 0.25 ) //缩放
    //   .translate( 0.75, 0.75 ) //设置中心点
    this.geometry = geometry
    this.scene.add(new THREE.Mesh(geometry, material))
  }

  // 窗口变动触发的函数
  onWindowResize () {
    console.log('onWindowResize-50ms')
    this.camera.aspect = this.webglFrame.clientWidth / this.webglFrame.clientHeight
    const z = this.calcuCameraZ()
    this.camera.position.setZ(z)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.webglFrame.clientWidth, this.webglFrame.clientHeight)

    // 触发2次-  ios上出现resize后界面刷新慢导致狂傲计算错误
    if (!this.resizeTimeout) {
      this.resizeTimeout = setTimeout(() => {
        this.onWindowResize()
        window.clearTimeout(this.resizeTimeout)
        this.resizeTimeout = null
      }, 100)
    }
  }

  calcuUVS () {
    const { splitX, splitY } = this.options
    const uvs = []
    for (let y = splitY - 1; y >= 0; y--) {
      for (let x = 0; x < splitX; x++) {
        uvs.push([x, y])
      }
    }
    return uvs
  }

  bindTouch () {
    const { webglFrame, geometry, uvs } = this

    const { splitX, splitY, activeIndex } = this.options
    const stepX = 1 / splitX
    const stepY = 1 / splitY

    let index = activeIndex
    let absf = 1
    let startX = 0

    const ENV_MOUSEDOWN = TOUCH_ENABLED ? 'touchstart' : 'mousedown'
    const ENV_MOUSEMOVE = TOUCH_ENABLED ? 'touchmove' : 'mousemove'
    const ENV_MOUSEUP = TOUCH_ENABLED ? 'touchend' : 'mouseup'
    const touchstart = (e) => {
      startX = TOUCH_ENABLED ? e.touches[0].clientX : e.clientX
      webglFrame.querySelector('canvas').addEventListener(ENV_MOUSEUP, touchend, false)
      webglFrame.querySelector('canvas').addEventListener(ENV_MOUSEMOVE, touchmove, false)
      this.options.onTouchStart && this.options.onTouchStart(this)
    }
    const touchmove = (e) => {
      // console.log(e.touches[0].clientX)
      // var w = distancex<0?distancex*-1:distancex;
      // var h = distancey<0?distancey*-1:distancey;
      // if (w<h) {e.preventDefault(); }
      var nowClientX = TOUCH_ENABLED ? e.touches[0].clientX : e.clientX
      var disx = nowClientX - startX
      if (Math.abs(disx) < 20) {
        return
      }
      if (disx > 0) { absf = -1 } else if (disx < 0) { absf = 1 }
      startX = nowClientX
      index += absf
      if (index > 15) {
        index = 15
        return
      } else if (index < 0) {
        index = 0
        return
      }
      const indexX = uvs[index][0]
      const indexY = uvs[index][1]
      geometry.faceVertexUvs[0][0][0].x = indexX * stepX
      geometry.faceVertexUvs[0][0][0].y = (indexY + 1) * stepY
      geometry.faceVertexUvs[0][0][1].x = indexX * stepX
      geometry.faceVertexUvs[0][0][1].y = indexY * stepY
      geometry.faceVertexUvs[0][0][2].x = (indexX + 1) * stepX
      geometry.faceVertexUvs[0][0][2].y = (indexY + 1) * stepY
      geometry.faceVertexUvs[0][1][0].x = indexX * stepX
      geometry.faceVertexUvs[0][1][0].y = indexY * stepY
      geometry.faceVertexUvs[0][1][1].x = (indexX + 1) * stepX
      geometry.faceVertexUvs[0][1][1].y = indexY * stepY
      geometry.faceVertexUvs[0][1][2].x = (indexX + 1) * stepX
      geometry.faceVertexUvs[0][1][2].y = (indexY + 1) * stepY
      geometry.uvsNeedUpdate = true

      this.activeIndex = index
      if (this.options.onViewChange) this.options.onViewChange(this)
    }
    const touchend = (e) => {
      startX = 0
      this.options.onTouchEnd && this.options.onTouchEnd(this)
      webglFrame.querySelector('canvas').removeEventListener(ENV_MOUSEMOVE, touchmove, false)
      webglFrame.querySelector('canvas').removeEventListener(ENV_MOUSEUP, touchend, false)
    }
    webglFrame.querySelector('canvas').addEventListener(ENV_MOUSEDOWN, touchstart, false)
  }

  draw () {
    // 只有在改变相机坐标的时候再更新
    // this.camera.updateProjectionMatrix()
    // controls.update();

    this.requestAnimationFrame = requestAnimationFrame(() => {
      this.draw()
    })
    this.renderer.render(this.scene, this.camera)
  }

  render () {
    this.draw()
    this.bindTouch()
    // resize 事件

    this.options.onInitRender && this.options.onInitRender(this)
  }
}

export default FrameRender
