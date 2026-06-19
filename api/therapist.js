import request from '@/utils/request'

const api = {
  list: 'therapist/list',
  detail: 'therapist/detail',
  schedule: 'therapist/schedule',
  match: 'therapist/match'
}

// 理疗师列表
export function list(param, option) {
  return request.get(api.list, param, option)
}

// 理疗师详情
export function detail(therapistId, param) {
  return request.get(api.detail, { therapistId, ...param })
}

// 获取可预约时间段
export function schedule(therapistId, date, serviceDuration = 60) {
  return request.get(api.schedule, { therapistId, date, serviceDuration })
}

// 根据服务匹配理疗师
export function match(serviceId, areaId) {
  return request.get(api.match, { serviceId, areaId })
}