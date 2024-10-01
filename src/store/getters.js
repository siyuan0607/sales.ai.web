const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  wx_alive: state => state.user.wx_alive,
  // roles: state => state.user.roles
}
export default getters