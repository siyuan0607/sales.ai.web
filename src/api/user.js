import request from '@/utils/request'
import store from "@/store";

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user_info',
    method: 'get'
  })
}

export function logout() {
  store.setters.token = ""
}

export function WXlogin() {
  return request({
    url: '/wechat/login',
    method: 'get'
  })
}

export function WXHeartbeat() {
  return request({
    url: '/wechat/heartbeat',
    method: 'get'
  })
}

export function WXCheckLogin(data) {
  return request({
    url: '/wechat/login',
    method: 'post',
    data
  })
}
