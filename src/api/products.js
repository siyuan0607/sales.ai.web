import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}
export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}


export function updateProduct(params) {
  return request({
    url: '/products',
    method: 'post',
    params
  })
}

export function addProduct(params) {
  return request({
    url: '/products',
    method: 'put',
    params
  })
}