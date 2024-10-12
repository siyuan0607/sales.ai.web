import request from '@/utils/request'

export function getList(params) {
    return request({
        url: '/sales_tools',
        method: 'get',
        params
    })
}

export function saveTools(params) {
    return request({
        url: '/sales_tools',
        method: 'post',
        data: params
    })
}

export function delTool(params) {
    return request({
        url: '/sales_tools',
        method: 'DELETE',
        params
    })
}

