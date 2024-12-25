import request from '@/utils/request'



export function refreshChatSessions(params) {
    return request({
        url: '/workbench',
        method: 'get',
        params
    })
}


