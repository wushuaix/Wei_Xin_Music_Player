// components/blog-ctrl/blog-ctrl.js
let userInfo={}
const db=wx.cloud.database()
let content=""
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog:Object
  },
  externalClasses:['iconfont','icon-pinglun','icon-fenxiang'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false,
    modalShow:false,
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {

    onComment(){
      //判断用户是否授权
      wx.getSetting({
        success:(res)=>{
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success:(res)=>{
                userInfo=res.userInfo
                //显示评论弹出层
                this.setData({
                  modalShow:true
                })
              }
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },
    onLoginSuccess(event){
      //授权框消失,评论框显示
      userInfo=event.detail
      this.setData({
        loginShow:false
      },()=>{
        this.setData({
          modalShow:true
        })
      })
    },
    onLoginFail(){
      wx.showModal({
        title:'授权用户才能进行评价',
        content:''
      })
    },
    onInput(e){
      content=e.detail.value
    },
    onSend(){
      wx.requestSubscribeMessage({
        tmplIds: ["3Pqd0Vp3b5ROngmbczDeLRlCx46TE55aNNAjnba9KC8"]
      })
      //插入数据库
      if(content.trim()===''){
        wx.showModal({
          title:'评论内容不能为空',
          content:''
        })
        return
      }
      wx.showLoading({
        title: '评价中...',
        mask:true
      })
      
      db.collection('blog-comment').add({
        data:{
          blogId:this.properties.blogId,
          content,
          createTime:db.serverDate(),
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then(async (res)=>{
        //推送模板消息
        try {
          await wx.cloud.callFunction({
            name: 'sendMessage',
            data: {
              content,
              blogId: this.properties.blogId
            }
          })
        } catch (error) {
          
        }        
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow:false,
          content:''
        })
        //父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })

    }
  }
})
