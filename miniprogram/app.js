//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
      this.globalData = {};
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                this.globalData.userInfo = res.userInfo;
                this.getCloudUserData();
              }
            })
          }
        }
      })
    }
  },
  //获取用户相关的数据信息
  getCloudUserData: function(callBack){
    // 调用云函数
    wx.cloud.callFunction({
      name: 'user',
      data: {
        type: 'query'
      },
      success: res => {
        if(res.type == 'registerOk'){
          this.getCloudUserData();
        }else{
          this.globalData.userData = res.result[0];
          this.globalData.logged = true;
          if(callBack){
            callBack(res.result[0])
          }
        }
      },
      fail: err => {
        console.error('[云函数] [user] 调用失败', err);
        this.globalData.logged = false;
      }
    })
  },
})
