import { login, getInfo, WXHeartbeat } from '@/api/user'
import { refreshChatSessions } from '@/api/workbench'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    nick_name: '',
    wx_alive: false,
    notify_count: 0,
    chatSessions: [],
    last_message_time: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_NICK_NAME: (state, nick_name) => {
    state.nick_name = nick_name
  },
  SET_WX_ALIVE: (state, alive) => {
    state.wx_alive = alive
  },
  SET_NOTIFY_COUNT: (state, count) => {
    state.notify_count = count
  },
  SET_CHAT_SESSIONS: (state, sessions) => {
    state.chatSessions = sessions
  },
  SET_LAST_MESSAGE_TIME: (state, time) => {
    state.last_message_time = time
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }
        const { name, avatar, nick_name } = data
        let avatar1 = ''
        if (avatar) {
          avatar1 = avatar
        } else {
          avatar1 = '/images/avator.png'
        }
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar1)
        commit('SET_NICK_NAME', nick_name)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },
  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },
  WXHeartbeat({ commit }) {
    return new Promise((resolve, reject) => {
      WXHeartbeat().then(response => {
        const { data } = response
        if (response.code === 200 && data === true) {
          commit('SET_WX_ALIVE', true)
        }
        else {
          commit('SET_WX_ALIVE', false)
        }
      }).catch(error => {
        commit('SET_WX_ALIVE', false)
        console.error(error)
        reject(error)
      })
    })
  },
  refreshChatSessions({ commit }) {
    return new Promise((resolve, reject) => {

      const params = { last_message_time: null }
      if (state.last_message_time) {
        params.last_message_time = state.last_message_time
      }
      refreshChatSessions(params).then(response => {
        const { data, need_helps_count, last_message_time } = response
        if (response.code === 200) {
          commit('SET_NOTIFY_COUNT', need_helps_count)
          commit('SET_CHAT_SESSIONS', data)
          commit('SET_LAST_MESSAGE_TIME', last_message_time)
          resolve(response)
        } else if (response.code === 304) {
          // do nothing
          console.log('304 not changed')
        }
        else {
          commit('SET_NOTIFY_COUNT', 0)
          commit('SET_CHAT_SESSIONS', [])
        }
      }).catch(error => {
        console.error(error)
        reject(error)
      })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

