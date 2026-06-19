import request from '@/utils/request'

const api = {
  slots: 'schedule/slots',
  dates: 'schedule/dates'
}

// 获取可预约时间段
export function slots(therapistId, date, serviceDuration = 60) {
  return request.get(api.slots, { therapistId, date, serviceDuration })
}

// 获取可预约日期列表
export function dates(therapistId, days = 30) {
  return request.get(api.dates, { therapistId, days })
}