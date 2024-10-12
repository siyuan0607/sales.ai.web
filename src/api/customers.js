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

export function refreshLabels(params) {
  return request({
    url: '/wechat/labels/refresh',
    method: 'get',
    params
  })
}

export function getLabels(params) {
  return request({
    url: '/wechat/labels',
    method: 'get',
    params
  })
}

export function refreshContacts(params) {
  return request({
    url: '/wechat/contacts',
    method: 'post',
    params
  })
}

// 检查刷新是否完成
export function checkContactsRefresh(params) {
  return request({
    url: '/wechat/contacts',
    method: 'get',
    params
  })
}

export function deleteCustomers(params) {
  return request({
    url: '/customers',
    method: 'delete',
    params
  })
}
