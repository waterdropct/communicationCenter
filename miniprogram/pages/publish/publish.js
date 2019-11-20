// publish.js

const app = getApp()

let title = "";
let content = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    submitDisabel: true,
    title: '',
    content: '',
    imgNum: 0,
    imgList: [],
    uploadDisabel: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  /**
   * 输入框监听函数
   */
  onGetInput: function (e) {
    title = e.detail.value;
    this.buttonActive();
  },
  onGetContent: function (e) {
    content = e.detail.value;
    this.buttonActive();
  },
  /**
   * 提交操作
   */
  onSubmit: function () {
    this.uploadCloudBase();
  },
  buttonActive: function () { //提交按钮是否激活
    if (title && content) {
      this.setData({
        submitDisabel: false
      })
    } else {
      this.setData({
        submitDisabel: true
      })
    }
  },
  /**
   * 选择图片操作
   */
  doUpload: function () {
    let _this = this;
    wx.chooseImage({
      count: 4 - this.data.imgNum,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var addImgs = _this.data.imgList.concat(res.tempFilePaths.map(item => {
          return {
            cloudPath: (Math.random() + '').slice(2, 10) + item.slice(-10), //文件路径需要保证不重名
            filePath: item
          }
        }))
        _this.setData({
          imgNum: addImgs.length,
          imgList: addImgs,
          uploadDisabel: addImgs.length > 3
        })
      },
      fail: e => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      }
    })
  },
  /**
   * 上传图片到云存储
   */
  uploadCloudBase() {
    let postData = {
      userId: app.globalData.userData._id,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      userName: app.globalData.userInfo.nickName,
      publishTime: this.transDate(new Date()),
      viewCount: 0,
      hasDone: false,
      title: title,
      content: content
    }
    let _this = this;
    wx.showLoading({
      title: '上传中',
      mask: true
    });
    this.uploadCloudImg(this.data.imgList).then(function (val) {
      postData.imageList = val;
      _this.uploadPublishPage(postData);
    })
      .catch(function (err) {
        wx.hideLoading();
        wx.showToast({
          title: '上传图片失败',
          icon: 'none'
        })
      })
  },
  //先上传图片,然后获取云端地址
  uploadCloudImg: async function (imageList) {
    var fileIdList = [];
    for (let k in imageList) {
      await wx.cloud.uploadFile({
        cloudPath: imageList[k].cloudPath,
        filePath: imageList[k].filePath
      }).then(res => {
        fileIdList.push({
          fileID: res.fileID,
          cloudPath: imageList[k].cloudPath
        })
      })
        .catch(err => { })
    }
    return fileIdList
  },
  //预览图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.dataset.id, // 当前显示图片的http链接
      urls: this.data.imgList.map(item => { return item.filePath }) // 需要预览的图片http链接列表
    })
  },
  //删除图片
  deleteImg: function (e) {
    const deleteIndex = e.currentTarget.dataset.index;
    let filterData = this.data.imgList.filter((item, index) => { return index !== deleteIndex });
    this.setData({
      imgNum: filterData.length,
      imgList: filterData,
      uploadDisabel: filterData.length > 3
    })
  },
  //上传发布内容
  uploadPublishPage: function (data) {
    let _this = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'publish',
      data: {
        type: 'add',
        data: data
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        })
        if (res.result && res.result.type == 'addSuccess' && res.result._id) {
          //初始化
          _this.setData({
            submitDisabel: true,
            title: '',
            content: '',
            imgNum: 0,
            imgList: [],
            uploadDisabel: false
          })
          setTimeout(function () {
            wx.navigateTo({
              url: '../detail/detail?pageId=' + res.result._id
            })
          }, 500)
        }
      },
      fail: err => {
        console.error('[云函数] [publish] 调用失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '发布失败',
          icon: 'none'
        })
      }
    })
  },
  transDate: function (value) { //时间转换
    if (!value) {
      return '1970-01-01 00:00:00'
    }
    let year = value.getFullYear();
    let month = this.transLen(value.getMonth() + 1);
    let date = this.transLen(value.getDate());
    let hours = this.transLen(value.getHours());
    let minutes = this.transLen(value.getMinutes());
    let second = this.transLen(value.getSeconds());
    return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + second
  },
  transLen: function (val) {
    if (typeof Number(val) == 'number') {
      if ((val + '').length == 1) {
        return '0' + val
      }
      return val
    }
    return '00'
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
    if (!app.globalData.logged) {
      wx.showToast({
        mask: true,
        title: '请先登陆',
        icon: 'none'
      })
      setTimeout(function () {
        wx.switchTab({
          url: '../user/user'
        })
      }, 1000)
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