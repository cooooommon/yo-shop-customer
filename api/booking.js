import request from '@/utils/request'

const api = {
  create: 'booking/create',
  list: 'booking/list',
  detail: 'booking/detail',
  cancel: 'booking/cancel',
  confirmComplete: 'booking/confirmComplete'
}

// 创建预约
export function create(data, option) {
  return request.post(api.create, data, option)
}

// 我的预约列表
export function list(param, option) {
  return request.get(api.list, param, option)
}

// 预约详情
export function detail(orderId, param) {
  return request.get(api.detail, { orderId, ...param })
}

// 取消预约
export function cancel(orderId, data) {
  return request.post(api.cancel, { orderId, ...data })
}

// 确认完成
export function confirmComplete(orderId, data) {
  return request.post(api.confirmComplete, { orderId, ...data })
}