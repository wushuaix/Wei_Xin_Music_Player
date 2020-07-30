// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {OPENID}=cloud.getWXContext()
  let result=await cloud.openapi.subscribeMessage.send({
    touser:OPENID,
    page:`/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data:{
      thing1:{
        value:'评价完成'
      },
      thing2:{
        value:event.content
      }
    },
    templateId:"3Pqd0Vp3b5ROngmbczDeLRlCx46TE55aNNAjnba9KC8"
  })
  return result
}