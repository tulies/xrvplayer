// 1）羽毛球：  刚才播放地址；http://public.vod5g.nty.tv189.com/vod/demo/merge/badminton-4k-4x1080p.mp4.m3u8
// 2） 上海电信自由视角：  C42645169
// 3)   武术自由视角：  http://liveplay.ctx.tv189.com/live/kungfu.m3u8"

// http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-1800s.mp4.m3u8
// http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-30s-m42.mp4.m3u8
var xrvplaer = new XRVPlayer('xrvplaer',{
  // src:'http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-1800s.mp4.m3u8'
  // src:'http://liveplay.ctx.tv189.com/live/kungfu.m3u8',
  // src: 'assets/video/kungfu-free-30s-m42.mp4'
  // src: 'http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-30s-m42.mp4',
  src:'http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-1800s.mp4.m3u8',
  // src:'http://replay1.nty.tv189.com/tm-cctvnewstm-800k.m3u8?playseek=20200503210000-20200503213000&sign=6f63040ef846bed5612648021ce8150e&qualityCode=&version=1&guid=be6820f4-c881-7bac-a5c3-e0cb9ca0ef3a&app=115010310149&cookie=92a06723d962d98f259cb001edc9d5a3&session=92a06723d962d98f259cb001edc9d5a3&uid=104411291322844141215&uname=18012679460&time=20200503221756&videotype=3&cid=C8000000000000000001428997801622&cname=&cateid=&dev=000001&ep=1&os=30&ps=0099&clienttype=android&appver=&res=&channelid=01833310&pid=1000000432&orderid=&nid=&cp=00000014&sp=00000014&ip=127.0.0.1&ipSign=725b4ae3a76a23e54d5bacdd97c27dbe&cdntoken=api_5eaed2944ae9d&a=PQSiSVQnq6%2FJ24FzRrax2ZMGHZAnm9n0&pvv=',
  // src:'http://live3.nty.tv189.com/tm-cctvnewstm-800k.m3u8?sign=015cd841418d00e8cfaeaa0955b46485&qualityCode=&version=1&guid=0ff76f4a-a884-48ba-d759-934671b3ab73&app=115010310149&cookie=92a06723d962d98f259cb001edc9d5a3&session=92a06723d962d98f259cb001edc9d5a3&uid=104411291322844141215&uname=18012679460&time=20200503222233&videotype=1&cid=C8000000000000000001428997801622&cname=&cateid=&dev=000001&ep=1&os=30&ps=0099&clienttype=android&appver=&res=&channelid=01833310&pid=1000000432&orderid=&nid=&cp=00000014&sp=00000014&ip=127.0.0.1&ipSign=f007490175b814db2108b8b198b99d87&cdntoken=api_5eaed3a990a86&a=hM%2BYX9PlD%2Br9I4a855Xefj3Jk%2FKQ7EME&pvv=&playseek=1',
  poster:'http://tp.nty.tv189.com/image/tmpl/2019/10/21/7008335698.jpg',
  plugins:[{
    name: 'freeView',
    options: {
    }
  }]
})
console.log(xrvplaer)


// var xrvplaer2 = new XRVPlayer('xrvplaer2',{
//   // src:'http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-1800s.mp4.m3u8'
//   // src:'http://liveplay.ctx.tv189.com/live/kungfu.m3u8',
//   // src: 'assets/video/kungfu-free-30s-m42.mp4'
//   src: 'http://public.vod5g.nty.tv189.com/vod/demo/free/kungfu-free-30s-m42.mp4',
//   poster:'http://tp.nty.tv189.com/image/tmpl/2019/10/21/7008335698.jpg',
//   // plugins:[{
//   //   name: 'freeView',
//   //   class: SubClass,
//   //   options: {
//   //     haha: ''
//   //   }
//   // }]
// })