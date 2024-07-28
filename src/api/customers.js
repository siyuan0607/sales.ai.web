import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/customers',
    method: 'get',
    params
  })
}


export function updateCustomer(params) {
  return request({
    url: '/customers',
    method: 'post',
    params
  })
}

