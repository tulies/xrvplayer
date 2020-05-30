declare class XRVPlayer {
  /**
   * 版本号
   */
  static VERSION: string;
  /**
   * 返回一个实例化MVPlayer对象.
   * @param id 播放器容器.
   * @param options 播放器初始化参数.
   * @param ready 初始化完成之后的回调函数
   */
  static instance(id?: string, options?: object, ready?: any): XRVPlayer;

  /**
   * 实例化构造函数.
   * @param id 播放器容器.
   * @param options 播放器初始化参数.
   * @param ready 初始化完成之后的回调函数
   */
  constructor(id?: string, options?: object, ready?: any): void;

  // someProperty: string[];
  // myMethod(opts: MyClass.MyClassMethodOptions): number;
}

// declare namespace UUU{
//  let a:number
// }

// declare module "UUU" {
//  export =UUU
// }

export default XRVPlayer
