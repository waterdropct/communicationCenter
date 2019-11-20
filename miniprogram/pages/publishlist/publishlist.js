// pages/publishlist/publishlist.js
const app = getApp();
let pageType = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    showNoData: false,
    listData: [],
    deletePageId: '', //用于页面后退
    unStarPageId: '' //用于页面后退
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    pageType = options.type;
    const title = pageType == "publish" ? '发布列表' : '关注列表';
    this.setData({
      title
    }),
    this.initQuery();
  },
  initQuery: function () {
    let _this = this;
    return new Promise(function(resolve, reject){
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      let queryFun = pageType == "publish" ? _this.queryPublishData : _this.queryStarData;
      queryFun().then(function (val) {
        _this.setData({
          listData: val,
          showNoData: val.length == 0
        })
        wx.hideLoading();
        resolve();
      }, function (err) {
        wx.hideLoading();
        wx.showToast({
          title: '查询失败',
          icon: 'none'
        })
        reject();
      })
    })
  },
  
  //查询发布列表
  queryPublishData: function(){
    return new Promise(function (reslove, reject) {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'publish',
        data: {
          type: 'query_publish',
          userId: app.globalData.userData._id
        },
        success: res => {
          reslove(res.result || []);
        },
        fail: err => {
          console.error('[云函数] [publish] 调用失败', err);
          reject();
        }
      })
    })
  },
  //查询关注列表
  queryStarData: function(){
    return new Promise(function (reslove, reject) {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'publish',
        data: {
          type: 'query_star',
          starList: app.globalData.userData.star || []
        },
        success: res => {
          reslove(res.result || []);
        },
        fail: err => {
          console.error('[云函数] [publish] 调用失败', err);
          reject();
        }
      })
    })
  },
  openDetailPage: function (e) {
    wx.navigateTo({
      url: '../detail/detail?pageId=' + e.currentTarget.dataset.pageId
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
    //用于删除数据后回退的时候更新列表
    const deletePageId = this.data.deletePageId;
    if(deletePageId){
      let newList = this.data.listData.filter(function(item){
        return item._id !== deletePageId
      })
      this.setData({
        listData: newList,
        showNoData: newList.length == 0,
        deletePageId: ''
      })
    }
    //用于取消关注后回退的时候更新列表
    const unStarPageId = this.data.unStarPageId;
    if(unStarPageId){
      let newList = this.data.listData.filter(function(item){
        return item._id !== unStarPageId
      })
      this.setData({
        listData: newList,
        showNoData: newList.length == 0,
        unStarPageId: ''
      })
    }
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
  onPullDownRefresh: function (e) { //下拉刷新
    this.initQuery().then(function() {
      wx.stopPullDownRefresh(); //关闭下拉刷新
    }, function(){
      wx.stopPullDownRefresh(); //关闭下拉刷新
    });
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