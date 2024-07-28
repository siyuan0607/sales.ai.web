import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/opportunities',
    method: 'get',
    params
  })
}


export function getCustomerList(params) {
  return request({
    url: '/customers',
    method: 'get',
    params
  })
}

export function updateOpportunity(params) {
  return request({
    url: '/opportunities',
    method: 'post',
    params
  })
}

