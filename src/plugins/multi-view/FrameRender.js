/*
 * @Author: 王嘉炀
 * @Date: 2020-04-04 15:09:23
 */
import * as THREE from 'three'
class FrameRender {
  constructor (el, options = {}) {
    this.webglFrame = el
    this.initProps()
    this.options = this.initOptions(options)
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
    this.axiosMap = [
      [
        // 0,0
        {
          position: {
            x: -4,
            y: -2.25,
            z: 0
          },
          mesh: null
        },
        // 0,1
        {
          position: {
            x: -4,
            y: 2.25,
            z: 0
          },
          mesh: null
        }
      ],
      [
        // 1,0
        {
          position: {
            x: 4,
            y: -2.25,
            z: 0
          },
          mesh: null
        },
        // 1,1
        {
          position: {
            x: 4,
            y: 2.25,
            z: 0
          },
          mesh: null
        }
      ]
    ]
    this.fullscreen = false
    this.splitX = 2
    this.splitY = 2
    // this.indexX = 0
    // this.indexY = 1
    this.stepX = 1 / this.splitX
    this.stepY = 1 / this.splitY
    this.selectObject = null
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
    // { antialias: true, alpha: true }
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
    camera.lookAt(0, 0, 0)

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

  initMaterial () {
    const { video } = this.options

    const videoTexture = new THREE.VideoTexture(video)
    // texture.setCrossOrigin( "Anonymous" );
    // videoTexture.wrapS = videoTexture.wrapT = THREE.ClampToEdgeWrapping
    // videoTexture.matrixAutoUpdate = false; // 设置纹理属性matrixAutoUpdate为false以后，纹理将通过matrix属性设置的矩阵更新纹理显示
    // material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping; //设置为可循环
    // videoTexture.minFilter = THREE.LinearFilter
    // videoTexture.magFilter = THREE.LinearFilter
    // videoTexture.format = THREE.RGBFormat
    var mat = new THREE.MeshBasicMaterial({
      // side: THREE.DoubleSide,
      map: videoTexture
    })
    // var mat = new THREE.MeshBasicMaterial({
    //   side: THREE.DoubleSide,
    //   map: videoTexture
    // });
    // material.map.matrix.identity()
    //   .scale( 0.25, 0.25 ) //缩放
    //   .translate( 0.75, 0.75 ) //设置中心点
    return mat
  }

  initMesh (indexX, indexY, stepX, stepY) {
    // var geom = new THREE.PlaneGeometry( 16,9 );
    // var geom = new THREE.PlaneGeometry( 16*stepX, 9*stepY );
    var geom = new THREE.PlaneGeometry(8, 4.5)

    geom.faceVertexUvs[0][0] = [new THREE.Vector2(indexX * stepX, (indexY + 1) * stepY), new THREE.Vector2(indexX * stepX, indexY * stepY), new THREE.Vector2((indexX + 1) * stepX, (indexY + 1) * stepY)]
    geom.faceVertexUvs[0][1] = [new THREE.Vector2(indexX * stepX, indexY * stepY), new THREE.Vector2((indexX + 1) * stepX, indexY * stepY), new THREE.Vector2((indexX + 1) * stepX, (indexY + 1) * stepY)]

    var mesh = new THREE.Mesh(geom, this.material)
    // mesh.position.set(8, 4.5, 0 );
    // mesh.position.set(8,4,5, 0);

    // mesh.position.set( ( (16*stepX) / 2)*(indexX+1),  ((9*stepY) / 2)*(indexY+1), 0 );
    mesh.position.set(this.axiosMap[indexX][indexY].position.x, this.axiosMap[indexX][indexY].position.y, this.axiosMap[indexX][indexY].position.z)

    // var geom = new THREE.PlaneGeometry(16, 9)
    // var mesh = new THREE.Mesh(geom, this.material)
    // mesh.position.set(0, 0, 0)

    // console.log()
    return mesh
  }

  initModel () {
    // 添加立方体
    // geometry = new initGeometry();
    this.material = this.initMaterial()
    var mesh00 = this.axiosMap[0][0].mesh = this.initMesh(0, 0, this.stepX, this.stepY)
    var mesh01 = this.axiosMap[0][1].mesh = this.initMesh(0, 1, this.stepX, this.stepY)
    var mesh10 = this.axiosMap[1][0].mesh = this.initMesh(1, 0, this.stepX, this.stepY)
    var mesh11 = this.axiosMap[1][1].mesh = this.initMesh(1, 1, this.stepX, this.stepY)

    this.scene.add(mesh00)
    this.scene.add(mesh01)
    this.scene.add(mesh10)
    this.scene.add(mesh11)
    // mesh.position.set(8,4.5,0)
    // var group = new THREE.Group()
  }

  initObjectStatus () {
    for (var i = 0; i < this.axiosMap.length; i++) {
      for (var j = 0; j < this.axiosMap.length; j++) {
        var obj = this.axiosMap[i][j]
        obj.mesh.scale.set(1, 1, 1)
        obj.mesh.position.set(obj.position.x, obj.position.y, obj.position.z)
        obj.mesh.visible = true
      }
    }
    // axiosMap[0][0].mesh.scale.set(1,1,1);
    // axiosMap[0][0].mesh.scale.set(1,1,1);
    // selectObject.object.scale.set(2, 2, 1);
    // selectObject.object.scale.set(2, 2, 1);
  }

  initRaycaster () {
    var raycaster = new THREE.Raycaster()
    var mouse = new THREE.Vector2()

    const onMouseClick = (event) => {
      if (this.fullscreen) {
        this.initObjectStatus()
        this.fullscreen = false
        return
      }
      // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1
      mouse.x = (event.offsetX / this.webglFrame.clientWidth) * 2 - 1
      mouse.y = -(event.offsetY / this.webglFrame.clientHeight) * 2 + 1
      // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
      raycaster.setFromCamera(mouse, this.camera)
      // 获取raycaster直线和所有模型相交的数组集合
      var intersects = raycaster.intersectObjects(this.scene.children)
      console.log(intersects)
      if (!intersects || intersects.length <= 0) {
        return
      }
      // 将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
      this.initObjectStatus()
      for (let i = 0; i < this.axiosMap.length; i++) {
        for (let j = 0; j < this.axiosMap.length; j++) {
          var obj = this.axiosMap[i][j]
          obj.mesh.scale.set(1, 1, 1)
          obj.mesh.position.set(obj.position.x, obj.position.y, obj.position.z)
          obj.mesh.visible = false
        }
      }
      for (let i = 0; i < intersects.length; i++) {
        // intersects[ i ].object.material.color.set( 0xff0000 );
        this.selectObject = intersects[i].object
        this.selectObject.scale.set(2, 2, 1)
        this.selectObject.position.set(0, 0, 0)
        this.selectObject.visible = true
        this.fullscreen = true
      }
    }
    this.webglFrame.addEventListener('click', onMouseClick.bind(this), false)
  }

  // 窗口变动触发的函数
  onWindowResize () {
    console.log('onWindowResize')
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
    console.log('改了之后的')
    this.draw()
    this.initRaycaster()
    // resize 事件
    this.options.onInitRender && this.options.onInitRender(this)
  }
}

export default FrameRender
