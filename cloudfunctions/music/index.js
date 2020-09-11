// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter=require('tcb-router')
//const rp=require('request-promise')
const axios=require('axios')
const BASE_URL='http://apis.imooc.com'
const ICODE ='icode=66E7BBF2D9E56A32'
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app=new TcbRouter({event})
  app.router('playlist',async (ctx,next)=>{
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy("createTime", 'desc')
      .get()
      .then((response) => {
        return response
      })
  })
  app.router('musiclist',async (ctx,next)=>{
    // ctx.body=await rp(BASE_URL+'/playlist/detail?id='+parseInt(event.playlistId))
    // .then((res)=>{
    //   return JSON.parse(res)
    // })
    const res = await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`)
    ctx.body = res.data
  })
  app.router('musicUrl', async(ctx, next) => {
    // ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then((res) => {
    //   return res
    // })
    const res = await axios.get(`${BASE_URL}/song/url?id=${event.musicId}&${ICODE}`)
    ctx.body = JSON.stringify(res.data)
  })
  app.router('lyric',async (ctx,next)=>{
    // ctx.body=await rp(BASE_URL+`/lyric?id=${event.musicId}`).then((res)=>{
    //   return res
    // })
    const res = await axios.get(`${BASE_URL}/lyric?id=${event.musicId}&${ICODE}`)
    ctx.body = JSON.stringify(res.data)
  })

  return app.serve()
}