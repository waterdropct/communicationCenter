//index.js
const app = getApp()

Page({
  data: {
    indicatorDots: true, //swiper
    autoplay: true,
    circular: true,
    interval: 5000,
    duration: 500,
    swiperList: ['/images/index_swiper1.jpg', '/images/index_swiper2.jpg', '/images/index_swiper3.jpg'],
    filterType: [//过滤类型
      {id: 'publishTime', text: '发布时间'},
      {id: 'viewCount', text: '阅读次数'}
    ],
    activeFilter: 'publishTime',
    listData: [],
    hasQueryAll: false,
    start: 0, //起始条数下标
    limit: 10, //每次加载10条
    deletePageId: ''
  },
  onLoad: function() {
    this.queryPageData();
  },
  filterChange: function(e){
    const filterType = e.currentTarget.dataset.filterType;
    if(filterType !== this.data.activeFilter){
      this.setData({
        activeFilter: filterType,
        listData: [],
        start: 0
      })
      this.queryPageData();
    }
  },
  openDetail: function (e) { //打开详情界面
    if(!app.globalData.logged){
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
      return
    }
    const itemId = e.currentTarget.dataset.showId;
    this.updateViewCount(itemId); //更新访问次数
    wx.navigateTo({
      url: '../detail/detail?pageId=' + itemId
    })
  },
  //查询内容(滚动到底继续查询)
  queryPageData: function(callBack){
    wx.showLoading({
      title: '查询中',
      mask: true
    });
    // 调用云函数
    wx.cloud.callFunction({
      name: 'publish',
      data: {
        type: 'query_index',
        datafield: this.data.activeFilter,
        order: 'desc', //默认降序
        start: this.data.start,
        limit: this.data.limit
      },
      success: res => {
        let newData = res.result || [];
        this.setData({
          hasQueryAll: newData.length < this.data.limit ? true : false,
          start: this.data.start + newData.length,
          listData: this.data.listData.concat(newData)
        })
        wx.hideLoading();
        if(callBack){
          callBack();
        }
      },
      fail: err => {
        console.error('[云函数] [user] 调用失败', err);
        wx.hideLoading();
        wx.showToast({
          title: '查询失败',
          icon: 'none'
        })
      }
    })
  },
  onReachBottom: function (e) { //滚动到底部继续加载
    if(!this.data.hasQueryAll){
      this.queryPageData();
    }
  },
  onPullDownRefresh: function (e) { //下拉刷新
    this.setData({
      listData: [],
      start: 0
    })
    this.queryPageData(function() {
      wx.stopPullDownRefresh(); //关闭下拉刷新
    });
  },
  updateViewCount: function (targetId) { //更新访问次数
    // 调用云函数
    wx.cloud.callFunction({
      name: 'publish',
      data: {
        type: 'viewCount',
        targetId
      },
      success: res => {},
      fail: err => {
        console.error('[云函数] [user] 调用失败', err);
      }
    })
  },
  onShow: function (){
    //用于删除数据后回退的时候更新列表
    const deletePageId = this.data.deletePageId;
    if(deletePageId){
      let newList = this.data.listData.filter(function(item){
        return item._id !== deletePageId
      })
      this.setData({
        listData: newList,
        deletePageId: ''
      })
    }
  }

})
