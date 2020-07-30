// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const w={}

const TcbRouter=require('tcb-router')

const db=cloud.database()
const blogCollection=db.collection('blog')
const MAX_LIMT=100
// 云函数入口函数
exports.main = async (event, context) => {
  const app=new TcbRouter({
    event
  })
  app.router('list',async (ctx,next)=>{
    const keyword=event.keyword
    if(keyword.trim()!=''){
      w={
        content:db.RegExp({
          regexp:keyword,
          options:'i'
        })
      }
    }
    let blogList=await blogCollection.where(w).skip(event.start).limit(event.count)
    .orderBy("createTime","desc")
    .get().then((res)=>{
      console.log(res)
      return res.data
    })
    ctx.body=blogList
  })
  app.router('detail',async (ctx,next)=>{
    let blogId=event.blogId
    //详情查询
    let detail=await blogCollection.where({
      _id:blogId
    }).get().then((res)=>{
      return res.data
    })
    //评论查询
    const countResult=await blogCollection.count()
    const total=countResult.total
    let commentList={
      data:[]
    }
    if(total>0){
      let batchTimes=Math.ceil(total/MAX_LIMT)
      let tasks=[]
      for(let i=0;i<batchTimes;i++){
        let promise=db.collection('blog-comment').skip(i*MAX_LIMT).limit(MAX_LIMT)
        .where({
          blogId
        }).orderBy('createTime','desc').get()
        tasks.push(promise)
      }
      if(tasks.length>0){
        commentList=(await Promise.all(tasks)).reduce((acc,cur)=>{
          return {
            data:acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body={
      commentList,
      detail
    }
  })
  const wxContent=cloud.getWXContext()
  app.router('getListByOpenid',async (ctx,body)=>{
    let blogList1=await blogCollection.where({
      _openid:wxContent.OPENID
    }).skip(event.start).limit(event.count).orderBy('createTime','desc')
    .get().then((res)=>{
      return res.data
    })
    ctx.body=blogList1
  })  
  return app.serve()
}