import { refreshLabels, getLabels } from '@/api/customers'

const defaultState = () => {
    return { labels_dict: {} }
}

const state = defaultState()

const mutations = {
    SET_LABELS: (state, labels_dict) => {
        state.labels_dict = labels_dict
    }
}

const actions = {
    refreshLabels({ commit }) {
        return new Promise((resolve, reject) => {
            refreshLabels().then(response => {
                const { data } = response
                if (response.code === 200) {
                    let labels_dict = {}
                    for (let i = 0; i < data.length; i++) {
                        let item = data[i]
                        labels_dict[item.label_id] = item.label
                    }
                    commit('SET_LABELS', labels_dict)
                }
                resolve(data)
            }).catch(error => {
                commit('SET_LABELS', {})
                console.error(error)
                reject(error)
            })
        })
    },
    getUserLabels({ commit }) {
        return new Promise((resolve, reject) => {
            getLabels().then(response => {
                const { data } = response
                if (response.code === 200) {
                    let labels_dict = {}
                    for (let i = 0; i < data.length; i++) {
                        let item = data[i]
                        labels_dict[item.label_id] = item.label
                    }
                    commit('SET_LABELS', labels_dict)
                }
                resolve(data)
            }).catch(error => {
                commit('SET_LABELS', {})
                console.error(error)
                reject(error)
            })
        })
    }

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}