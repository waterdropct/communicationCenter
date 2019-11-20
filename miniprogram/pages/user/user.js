// user.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: './user-unlogin.png',
    userName: '请点击头像登陆',
    userData: {},
    update: false,
    logged: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //不支持云函数
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return
    }
    //已经登陆
    if (app.globalData.logged) {
      this.setData({
        avatarUrl: app.globalData.userInfo.avatarUrl,
        userName: app.globalData.userInfo.nickName,
        userData: app.globalData.userData,
        update: true,
        logged: true
      });
    }
  },
  //点击头像--微信原生接口调用用户授权
  onGetUserInfo: function (e) {
    if (!app.globalData.logged && e.detail.userInfo) {
      let userInfo = e.detail.userInfo;
      app.globalData.userInfo = userInfo
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        userName: userInfo.nickName,
        userData: {}
      })
      //调用全局的获取用户信息接口
      let _this = this;
      app.getCloudUserData(function (data) {
        _this.setData({
          userData: data,
          update: true,
          logged: true
        })
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.update) {
      let _this = this;
      app.getCloudUserData(function (data) {
        _this.setData({
          userData: data,
          update: true,
          logged: true
        })
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { }
})