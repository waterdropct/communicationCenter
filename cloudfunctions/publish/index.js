// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
//数据库调用
const dataDB = cloud.database()
const _ = dataDB.command
//需要把操作数据库的方法都拆出来

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    //查询发布内容
    case 'query_index':
      return await queryContent(event.datafield, event.order, event.start, event.limit)
    //新增发布内容
    case 'add':
      return await addContent(event.data)
    //更新访问次数
    case 'viewCount':
      return await updateViewCount(event.targetId)
    //查询本人已发布列表
    case 'query_publish':
      return await queryPublishContent(event.userId)
    //查询本人已关注列表
    case 'query_star':
      return await queryStarContent(event.starList)
    //查询单条数据
    case 'query_pageItem':
      return await queryPageItem(event.pageId)
    //删除单条数据
    case 'delete_item':
      return await deletePageItem(event.userId, event.pageId)
  }
}
//查询发布内容
function queryContent(datafield, order, start, limit) {
  return new Promise(function (resolve, reject) {
    dataDB.collection('taskList')
      .orderBy(datafield, order)
      .skip(start).limit(limit)
      .get().then(res => {
        resolve(res.data);
      })
      .catch(err => reject(err))
  })
}
//新增发布内容
function addContent(addData) {
  return new Promise(function (resolve, reject) {
    dataDB.collection('taskList').add({
      data: addData
    }).then(res => {
      res.type = 'addSuccess';
      resolve(res);
    })
      .catch(err => reject(err))
  })
}
//更新访问次数
function updateViewCount(targetId) {
  return new Promise(function (resolve, reject) {
    dataDB.collection('taskList')
      .where({ _id: targetId })
      .update({
        data: {
          viewCount: _.inc(1)
        }
      }).then(res => {
        res.type = 'addSuccess';
        resolve(res);
      })
      .catch(err => reject(err))
  })
}
//查询本人已发布列表
function queryPublishContent(userId) {
  return new Promise(function (resolve, reject) {
    dataDB.collection('taskList')
      .where({ userId })
      .get().then(res => {
        resolve(res.data);
      })
      .catch(err => reject(err))
  })
}
//查询本人已关注列表
function queryStarContent(starList) {
  return new Promise(function (resolve, reject) {
    dataDB.collection('taskList')
      .where({
        _id: _.in(starList)
      })
      .get().then(res => {
        resolve(res.data);
      })
      .catch(err => reject(err))
  })
}
//查询单条数据
function queryPageItem(_id) {
  return new Promise(function (resolve, reject) {
    dataDB.collection('taskList')
      .where({ _id })
      .get().then(res => {
        resolve(res.data);
      })
      .catch(err => reject(err))
  })
}
//删除单条数据
function deletePageItem(userId, _id) {
  return dataDB.collection('taskList')
    .where({ userId, _id })
    .remove()
}