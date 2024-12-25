import request from '@/utils/request'

export function getChatLog(params) {
    return request({
        url: '/chat_logs',
        method: 'get',
        params
    })
}
