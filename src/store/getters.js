const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  wx_alive: state => state.user.wx_alive,
  nick_name: state => state.user.nick_name,
  labels_dict: state => state.labels.labels_dict,
  // roles: state => state.user.roles
}
export default getters