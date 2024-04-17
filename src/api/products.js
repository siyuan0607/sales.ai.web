import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}