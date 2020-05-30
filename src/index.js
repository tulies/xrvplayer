/*
 * @Author: 王嘉炀
 * @Date: 2020-03-29 21:52:17
 */
import { version } from '../package.json'
import EventMiddleware from '@tulies/event-middleware'
import './assets/css/index.scss'
import Player from './player'
// import FreeView from './plugins/free-view'

import Plugin from './plugins/plugin'

class XRVPlayer {
  /**
   * 构造函数
   */
  constructor (id, options = {}, ready = null) {
    const parentEl = document.getElementById(id)
    this.parentEl = parentEl
    this.event = EventMiddleware.instance()
    // 初始化插件函数绑定
    this.bindPluginContext()
    // 播放器实例化 => player.js
    this.playerObj = new Player(this, parentEl, options, ready)
    this.el = this.playerObj.el
    // 注册插件
    this.loadPlugins(options.plugins || null)
  }

  bindPluginContext () {
    // 这么做是为了多个xrvplayer实例能够独立pluginStorage
    this.pluginStorage = { ...Plugin.pluginStorage }
    // 注册 plugin
    this.registerPlugin = Plugin.registerPlugin
    // 卸载 plugin
    this.deregisterPlugin = Plugin.deregisterPlugin
    // 获取 plugin
    this.getPlugin = Plugin.getPlugin
    // 判断插件是否存在
    this.pluginExists = Plugin.pluginExists

    this.loadPlugins = (plugins) => {
    // plugin.init(this)
      if (plugins) {
        plugins.forEach(v => {
          const plugin = this.registerPlugin(v)
          plugin.init(this)
        })
      }
    }
  }

  static instance (id, options, ready) {
    return new XRVPlayer(id, options, ready)
  }
}

// 版本号
XRVPlayer.VERSION = version

export default XRVPlayer
