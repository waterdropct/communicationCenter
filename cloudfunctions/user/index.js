// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
//数据库调用
const dataDB = cloud.database()

//需要把操作数据库的方法都拆出来

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'query':
      return await queryUserData()
    case 'add_star':
      return await userEditStar(event.starArr, event.type)
    case 'cancel_star':
      return await userEditStar(event.starArr, event.type)
  }
}
//查询用户信息
function queryUserData() {
  const wxContext = cloud.getWXContext();
  return new Promise(function (resolve, reject) {
    dataDB.collection('userList').where({
      _openId: 'cy' + wxContext.OPENID
    }).get().then(res => {
      //判断用户是否存在
      if (res.data.length > 0) {
        resolve(res.data);
      } else {
        userRegister().then(res => {
          resolve(res);
        })
          .catch(err => reject(err))
      }
    })
      .catch(err => reject(err))
  })
}
//用户注册
function userRegister() {
  const wxContext = cloud.getWXContext();
  return new Promise(function (resolveR, rejectR) {
    dataDB.collection('userList').add({
      data: {
        _openId: 'cy' + wxContext.OPENID,
        createDate: new Date().getTime(),
        star: [],
        publish: [],
        participate: []
      }
    }).then(res => {
      res.type = 'registerOk';
      resolveR(res);
    })
      .catch(err => rejectR(err))
  })
}
//关注--取消关注
function userEditStar(star, requestType) {
  const wxContext = cloud.getWXContext();
  return new Promise(function (resolve, reject) {
    dataDB.collection('userList')
      .where({
        _openId: 'cy' + wxContext.OPENID
      })
      .update({ data: { star } })
      .then(res => {
        res.type = requestType == 'add_star' ? 'starSuccess' : 'cancenStarSuccess';
        resolve(res);
      })
      .catch(err => reject(err))
  })
}