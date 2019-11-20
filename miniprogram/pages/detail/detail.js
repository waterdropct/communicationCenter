// pages/detail/detail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageData: {},
    showStar: true, //默认展示关注按钮
    hasStar: false //默认展示关注按钮-- 未关注状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let _this = this;
    this.queryPageData(options.pageId).then(function (val) {
      _this.setData({
        showStar: val.userId !== app.globalData.userData._id,
        hasStar: app.globalData.userData.star.includes(val._id),
        pageData: val
      })
      wx.hideLoading();
    }, function (err) {
      wx.hideLoading();
      wx.showToast({
        title: '查询失败',
        icon: 'none'
      })
      
    })

  }, 
  //查询单条数据
  queryPageData: function(pageId){
    return new Promise(function (reslove, reject) {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'publish',
        data: {
          type: 'query_pageItem',
          pageId
        },
        success: res => {
          reslove(res.result[0] || {});
        },
        fail: err => {
          console.error('[云函数] [publish] 调用失败', err);
          reject();
        }
      })
    })
  },
  //预览图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.id, // 当前显示图片的http链接
      urls: this.data.pageData.imageList.map(item => {return item.fileID}) // 需要预览的图片http链接列表
    })
  },
  //关注
  onStar: function () {
    const starArr = app.globalData.userData.star.concat(this.data.pageData._id);
    // 调用云函数
    wx.cloud.callFunction({
      name: 'user',
      data: {
        type: 'add_star',
        starArr
      },
      success: res => {
        if (res.result && res.result.type == 'starSuccess'){
          wx.showToast({
            title: '关注成功'
          })
          this.setData({
            hasStar: true
          })
          app.globalData.userData.star = starArr;
          //返回上一个页面，避免先取消关注，后又点击关注，报仇关注列表不变
          let pages = getCurrentPages();
          let prePage = pages[pages.length - 2];
          prePage.setData({
            unStarPageId: ''
          })
        }
      },
      fail: err => {
        console.error('[云函数] [user] 调用失败', err);
        wx.showToast({
          title: '关注失败',
          icon: 'none'
        })
      }
    })
  },
  //取消关注
  onCancelStar: function () {
    const pageId = this.data.pageData._id;
    const starArr = app.globalData.userData.star.filter(function (item) {
      return item !== pageId
    });
    // 调用云函数
    wx.cloud.callFunction({
      name: 'user',
      data: {
        type: 'cancel_star',
        starArr
      },
      success: res => {
        if (res.result && res.result.type == 'cancenStarSuccess'){
          wx.showToast({
            title: '取消关注成功'
          })
          this.setData({
            hasStar: false
          })
          app.globalData.userData.star = starArr;
          //返回上一个页面，如果返回的是已关注列表，需要删除该条数据
          let pages = getCurrentPages();
          let prePage = pages[pages.length - 2];
          prePage.setData({
            unStarPageId: pageId
          })
        }
      },
      fail: err => {
        console.error('[云函数] [user] 调用失败', err);
        wx.showToast({
          title: '取消关注失败',
          icon: 'none'
        })
      }
    })
  },
  //删除
  onDelete: function () {
    const pageId = this.data.pageData._id;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'publish',
      data: {
        type: 'delete_item',
        userId: app.globalData.userData._id,
        pageId
      },
      success: res => {
        if (res.result && res.result.errMsg == 'collection.remove:ok'){
          wx.showToast({
            title: '删除成功'
          })
          //需要删除对应的文件图片,避免内存无限增长
          if(this.data.pageData.imageList.length > 0){
            wx.cloud.deleteFile({
              fileList: this.data.pageData.imageList.map(function(item){return item.fileID}),
              success: res => {},
              fail: err => {
                console.error('云存储调用失败', err)
              }
            })
          }
          //返回上一个页面，如果返回的是已发布列表，需要删除该条数据
          let pages = getCurrentPages();
          let prePage = pages[pages.length - 2];
          prePage.setData({
            deletePageId: pageId
          })
          wx.navigateBack({
            delta: 1
          })
        }
      },
      fail: err => {
        console.error('[云函数] [publish] 调用失败', err);
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})