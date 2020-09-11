// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

//const rp = require('request-promise')
const axios=require('axios')

const URL = 'https://apis.imooc.com/personalized?icode=66E7BBF2D9E56A32'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
  // const list = await playlistCollection.get()
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  // const playlist = await rp(URL).then((res) => {
  //   return JSON.parse(res).result
  // })
  const {data}=await axios.get(URL)
  const playlist=plRes.data.result
  if(data.code>=1000){
    console.log(data.msg)
    return 0
  }
  const playlist=data.result
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      // 更新代码: 给每个歌单信息增加createTime属性
      let pl = playlist[i]
      pl.createTime = db.serverDate()
      // newData.push(playlist[i])
      newData.push(pl)
    }
  }
  if(playlist.length>0){
    await playlistCollection.add({
      data: [...playlist]
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }
  return newData.length
}