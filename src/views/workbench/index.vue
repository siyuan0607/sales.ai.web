<template>
    <div class="app-container">
        <el-row>
            <el-col :span="4" class="customers-list">
                <div class="search-area">
                    <el-input v-model="searchForm.name" class='search-input' placeholder="客户名称" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <div class="customer-list-area" ref="customersContainer">
                    <div v-for="item in chatSessions" class="customer-item" @click="changeFocusCustomer(item)"
                        :data-id="item.id">
                        <div class="avatar">
                            <el-avatar shape="square" :size="50">
                                <img :src="item.avatar" style="width:50px; height:50px;" />
                            </el-avatar>
                        </div>
                        <div class="customer-brief">
                            <div class="customer-name"><i class="el-icon-s-flag need-help-icon"
                                    v-if="item.need_help == 1"></i>{{ showName(item) }}
                            </div>
                            <div class="last-message">{{ item.last_message }}</div>

                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :span="20" class="customer-main-view">
                <div v-if="focusCustomer">
                    <div class="customer-info">
                        <el-row :gutter="2">
                            <el-col :span="10">
                                <div class="customer-name">
                                    {{ showName(focusCustomer) }}
                                </div>
                            </el-col>
                            <el-col :span="14" class="action-area">
                                <el-button v-if="focusCustomer.need_help == 1" type="info" size="small"
                                    icon="el-icon-s-flag" @click="toggleHelpFlag(focusCustomer)">取消商机提醒</el-button>
                                <el-divider direction="vertical" v-if="focusCustomer.need_help == 1"></el-divider>

                            </el-col>
                        </el-row>
                    </div>
                    <el-row>
                        <el-col :span="14">
                            <div class="chatlog-container" ref="chatContainer">
                                <div v-for="item in focusLogs">
                                    <ChatContent :chatLog="item" :customer="focusCustomer">
                                    </ChatContent>
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="10" class="profile-container">
                            <div class="profile-area">
                                <el-form ref="form" :model="focusCustomer" label-width="100px">
                                    <el-form-item label="客户名称">
                                        <el-input v-model="focusCustomer.fullName" readonly></el-input>
                                    </el-form-item>
                                    <el-form-item label="性别">
                                        <el-select v-model="focusCustomer.strSex" readonly disabled>
                                            <el-option label="男" value="1"></el-option>
                                            <el-option label="女" value="2"></el-option>
                                            <el-option label="未知" value="0"></el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="所在地">
                                        <el-input v-model="focusCustomer.fullArea" readonly></el-input>
                                    </el-form-item>
                                    <el-form-item label="预约日期">
                                        <el-date-picker @change="modifyAppointmentDate"
                                            v-model="focusCustomer.appointment_date" format="yyyy/MM/dd" type="date"
                                            placeholder="选择预约日期" :picker-options="pickerOptions">
                                        </el-date-picker>
                                    </el-form-item>
                                </el-form>
                                <div class="tags-area">

                                </div>
                                <el-divider>商机信息</el-divider>
                            </div>
                            <div class="operate-area">
                                <el-button type="primary" icon="el-icon-plus">创建商机</el-button>
                                <el-button type="success" icon="el-icon-success">已成交</el-button>
                                <el-button type="danger" icon="el-icon-error">已输单</el-button>

                            </div>
                        </el-col>
                    </el-row>
                </div>
                <div v-else style="height:100%;">
                    <div style=" text-align:center; margin-top:20vh;">
                        <img src="/images/empty_user.png"></img>
                    </div>
                    <div style="text-align:center; color: #cccccc;margin-top:8px;">
                        选择查看的客户
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { getChatLog } from '@/api/chat_logs.js'
import ChatContent from '@/components/ChatContent'
import { updateCustomer } from '@/api/customers.js'

export default {
    computed: {
        ...mapGetters([
            'chatSessions',
            'last_message_time'
        ])
    },
    mounted() {
    },
    data() {
        return {
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
                shortcuts: [{
                    text: '明天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() + 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '后天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() + 3600 * 1000 * 48);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '大后天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() + 3600 * 1000 * 72);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '一周后',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() + 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                    }
                }]
            },
            searchForm: {
                name: ''
            },
            focusCustomer: null,
            focusLogs: [],
            customerChatLogs: {}
        }
    },
    components: {
        ChatContent
    },
    watch: {
        chatSessions(newVal, oldVal) {
            console.log('chatSessions changed')
            // check each session's last message time, update the session which has new message
            for (let i = 0; i < newVal.length; i++) {
                for (let j = 0; j < oldVal.length; j++) {
                    if (newVal[i].uid === oldVal[j].uid) {
                        // convert the last meessage string to timestamp
                        const newTime = Date.parse(newVal[i].last_message_time)
                        const oldTime = Date.parse(oldVal[j].last_message_time)
                        if (!oldTime || newTime > oldTime) {
                            if (this.customerChatLogs[newVal[i].uid]) {
                                const data = {
                                    customer_uid: newVal[i].uid,
                                    force: true
                                }
                                this.refreshChatLog(data)
                            }
                            break
                        }
                    }
                }
            }
        },
        focusCustomer(newVal, oldVal) {
            if (newVal) {
                let focus = this.$refs.customersContainer.querySelector('.customer-item.active')
                if (focus) {
                    focus.classList.remove('active')
                }
                this.$refs.customersContainer.querySelector('.customer-item[data-id="' + newVal.id + '"]').classList.add('active')
                const data = {
                    customer_uid: newVal.uid
                }
                // get the chat logs only in the first time, otherwise just use the data in memory
                this.refreshChatLog(data).then((logs) => {
                    this.focusLogs = logs
                    this.$nextTick(() => {
                        const container = this.$refs.chatContainer;
                        container.scrollTop = container.scrollHeight;
                    });
                })
            }
        }
    },
    methods: {
        refreshChatLog(params) {
            return new Promise((resolve, reject) => {
                if (params.force || !this.customerChatLogs[params.customer_uid]) {
                    // only update when the data is not exist or force update
                    getChatLog(params).then((resp) => {
                        const { data, code } = resp
                        let result;
                        if (code === 200) {
                            result = this.customerChatLogs[params.customer_uid] = data
                        }
                        else {
                            result = this.customerChatLogs[params.customer_uid]
                        }

                        const newVal = this.focusCustomer
                        newVal.fullName = newVal.remark.length == 0 ? newVal.nick_name : newVal.remark + " (" + newVal.nick_name + ")"
                        newVal.fullArea = newVal.country + " " + newVal.province + " " + newVal.city
                        newVal.strSex = newVal.sex + ""
                        resolve(result)
                    }).catch((err) => {
                        console.log(err)
                        this.$message({
                            message: err,
                            type: 'error'
                        })
                        reject(err)
                    })
                } else {
                    this.focusLogs = this.customerChatLogs[params.customer_uid]
                    resolve(this.focusLogs)
                }
            })


        },
        toggleHelpFlag(customer) {
            customer.need_help = customer.need_help == 1 ? 0 : 1
            this.workbenchUpdateCustomer(customer)
        },
        modifyAppointmentDate() {
            const customer = this.focusCustomer
            this.workbenchUpdateCustomer(customer)
        },
        workbenchUpdateCustomer(customer) {
            updateCustomer(customer).then((response) => {
                if (response.code === 200) {
                    this.$message({
                        message: "操作成功",
                        type: "success"
                    })
                }
            }).catch((err) => {
                console.log(err)
                this.$message({
                    message: err,
                    type: 'error'
                })
            })
        },
        changeFocusCustomer(customer) {
            this.focusCustomer = customer;
        },
        showName(item) {
            if (item.remark) {
                return item.remark;
            }
            return item.nick_name;
        }
    }
}
</script>
<style scoped lang="scss">
.operate-area {
    height: 8rem;
    padding: 12px 8px 0 14px;
    text-align: center;
}

.profile-area {
    height: calc(100vh - 50px - 8rem);
    padding: 25px 20px 0 0px;

    overflow-y: auto;
}

.profile-container {
    background-color: #f3f3f3;
    height: calc(100vh - 50px);
}

.customer-info {
    height: 59px;
    border-bottom: 1px solid #eaeaea;
    background-color: #f3f3f3;
}

.customer-info .customer-name {
    padding: 22px 0 0 14px;
}

.customer-info .action-area {
    padding-top: 14px;
    text-align: right;
    padding-right: 14px;
}

.customer-item {
    border-bottom: 1px solid #eaeaea;
    padding: 8px 8px 8px 10px;
    margin: 0;
    font-size: 14px;
    cursor: pointer;
}

.customer-brief .need-help-icon {
    color: #ED2F2F;
    position: relative;
    right: 3px;
}

.customer-item:hover,
.customer-item.active {
    background-color: #fefefe;
}

.customer-item .customer-name {
    margin-bottom: 5px;
    white-space: nowrap;
    /* 规定文本不进行换行 */
    overflow: hidden;
    /* 超出部分隐藏 */
    text-overflow: ellipsis;
    /* 用省略号显示超出的文本 */
}

.customer-item .last-message {
    color: #aaaaaa;
    white-space: nowrap;
    /* 规定文本不进行换行 */
    overflow: hidden;
    /* 超出部分隐藏 */
    text-overflow: ellipsis;
    /* 用省略号显示超出的文本 */
}

.customer-item .avatar {
    width: 50px;
    height: 50px;
    display: inline-block;
}

.customer-item .customer-brief {
    height: 50px;
    margin-left: 10px;
    width: calc(100% - 60px);
    display: inline-block;
}



.app-container {
    overflow-y: hidden;
    padding: 0;
    height: calc(100vh - 50px);
}

.customer-main-view {
    height: calc(100vh - 50px);
}

.customers-list {
    height: calc(100vh - 50px);
    background-color: #f3f3f3;
}

.search-area {
    height: 60px;
    width: 90%;
    margin: 0 5% 0 5%;
    padding: 12px 0 12px 0;
}

.search-input .el-input {
    width: 100%;
    margin: 0 auto 0 auto;
}

.chatlog-container {
    height: calc(100vh - 50px);
    overflow-y: auto;
}
</style>