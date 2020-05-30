// import FreeViewPlugin from './free-view'
// import MultiViewPlugin from './multi-view'
class Plugin {
  /**
   * Get the version of the plugin that was set on <pluginName>.VERSION
   */
  version () {
    return this.constructor.VERSION
  }

  /**
   * Register a Video.js plugin.
   *
   * @param   {string} name
   *          The name of the plugin to be registered. Must be a string and
   *          must not match an existing plugin or a method on the `Player`
   *          prototype.
   *
   * @param   {Function} plugin
   *          A sub-class of `Plugin` or a function for basic plugins.
   *
   * @return {Function}
   *          For advanced plugins, a factory function for that plugin. For
   *          basic plugins, a wrapper function that initializes the plugin.
   */
  static registerPlugin ({ name, PluginClass, options }) {
    if (typeof name !== 'string') {
      throw new Error(`Illegal plugin name, "${name}", must be a string, was ${typeof name}.`)
    }
    // 如果已经注册过，就直接返回已经注册过的插件
    if (this.pluginExists(name)) {
      console.warn(`A plugin named "${name}" already exists. You may want to avoid re-registering plugins!`)
      return this.getPlugin(name)
    }
    // if (typeof plugin !== 'function') {
    //   throw new Error(`Illegal plugin for "${name}", must be a function, was ${typeof plugin}.`)
    // }
    //
    let plugin = null
    if (!PluginClass) {
      PluginClass = Plugin.getBasicPlugin(name)
    }
    if (PluginClass) {
      plugin = new PluginClass(options)
    }
    this.pluginStorage[name] = plugin
    return plugin
  }

  /**
   * 删除插件
   * @param {string} name
   */
  static deregisterPlugin (name) {

  }

  /**
   * 获取已经注册过的plugin
   *
   * @param {stting}} name
   */
  static getPlugin (name) {
    if (!this.pluginExists(name)) {
      console.warn(`A plugin named "${name}" is not exists.`)
      return null
    }
    return this.pluginStorage[name]
  }

  /**
   * 如果是基础插件，则会返回插件类
   * @param {string} name
   */
  static getBasicPlugin (name) {
    const plugins = Plugin.basicPlugins.filter(p => p.name === name)
    if (plugins.length > 0) {
      return plugins[0].class
    }
    return null
  }

  /**
   * 判断是否存在
   * @param {string} name
   */
  static pluginExists (name) {
    return Object.prototype.hasOwnProperty.call(this.pluginStorage, name)
  }
}

Plugin.pluginStorage = {}
Plugin.basicPlugins = [{
//   name: 'freeView',
//   class: FreeViewPlugin
// }, {
//   name: 'multiView',
//   class: MultiViewPlugin
}]
export default Plugin
