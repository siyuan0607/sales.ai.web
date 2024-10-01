<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-button type="danger" v-if="wx_alive == false" size="small" @click="showWXLoginDialog"
        style="position:relative; display:inline-block; margin:0 15px; bottom:10px;">
        WX未登录
      </el-button>
      <el-button v-if="wx_alive" type="success" size="small" disabled="disabled"
        style="position:relative; display:inline-block; margin:0 15px; bottom:10px;">
        WX已登录
      </el-button>
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img v-show="avatar != ''" style="width:30px; height:30px; margin-top:5px;" :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item>
            {{ name }}
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog :visible.sync="dialogLoginVisible" width="350px" :before-close="handleClose" center title="扫描二维码登录">
      <div>
        <img :src="loginQrcode"
          style="width:200px; height:200px; cursor:pointer; display:block; margin:0 auto 15px auto;" title="点击刷新"
          @click="flushQrcode" />
        <el-input :model="captchaCode" placeholder="请输入验证码（选填）" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="checkLogin">确 定</el-button>
      </span>
    </el-dialog>
  </div>


</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { WXlogin, WXCheckLogin } from '@/api/user'

export default {
  data() {
    return {
      dialogLoginVisible: false,
      dialogContactsVisible: false,
      captchaCode: '',
      loginQrcode: '',
      timer: null,
      reloadTimer: null
    }
  },
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'wx_alive'
    ])
  },
  mounted() {
    // 定时执行心跳程序，确定WX登录状态
    this.timer = setInterval(() => {
      this.$store.dispatch('user/WXHeartbeat')
    }, 30000)
  },
  destroyed() {
    if (this.timer != null)
      clearInterval(this.timer)
  },
  watch: {
    // 监听 data 中的 username 属性
    wx_alive(newVal, oldVal) {
      // 在这里执行你想要的操作，例如验证用户名
      if (newVal === true) {
        this.dialogLoginVisible = false
      }
    }
  },
  methods: {
    showWXLoginDialog() {
      WXlogin().then((resp) => {
        this.loginQrcode = resp.data.qrcode
        this.dialogLoginVisible = true

        // 30秒内不得刷新
        this.reloadTimer = setTimeout(() => {
          clearTimeout(this.reloadTimer)
          this.reloadTimer = null
        }, 30000)
      })
        .catch((err) => {
          console.error(err)
          this.$message({ 'message': err, 'type': 'error' })
        })
    },
    flushQrcode() {
      if (this.reloadTimer != null) {
        this.$message({
          message: "您的刷新太频繁了，请稍后刷新二维码",
          type: "info"
        })
        return
      }
      WXlogin().then((resp) => {
        this.loginQrcode = resp.data.qrcode
        this.dialogLoginVisible = true
        // 30秒内不得刷新
        this.reloadTimer = setTimeout(() => {
          clearTimeout(this.reloadTimer)
          this.reloadTimer = null
        }, 30000)
      })
        .catch((err) => {
          console.error(err)
          this.$message({ 'message': err, 'type': 'error' })
        })
    },
    checkLogin() {
      if (this.captchaCode == "") {
        this.$message({
          message: "请输入验证码",
          type: "error"
        })
        return
      }
      WXCheckLogin({
        captcha: this.captchaCode
      }).then((resp) => {
        if (resp.data.code == 200) {
          this.$message({
            message: "WX登录成功",
            type: "success"
          })
          this.handleClose()
        }
      }).catch((err) => {
        this.$message({
          message: "登录失败, " + err,
          type: "error"
        })
      })
    },
    handleClose() {
      this.captchaCode = ""
      this.dialogLoginVisible = false
      if (this.reloadTimer != null) {
        clearTimeout(this.reloadTimer)
        this.reloadTimer = null
      }
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
