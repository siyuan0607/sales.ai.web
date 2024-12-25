<template>
    <div>
        <div v-if="chatLog.role == 'sales'" class="chat-log sales-chat">
            <el-avatar :size="50" :src="avatar" shape="square"></el-avatar>
            <div class="chat-content">
                <ContentCard :chatLog="chatLog"></ContentCard>
            </div>
        </div>
        <div v-else class="chat-log customer-chat">
            <el-avatar :size="50" :src="customer.avatar" shape="square"></el-avatar>
            <div class="chat-content">
                <ContentCard :chatLog="chatLog"></ContentCard>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ContentCard from '@/components/ContentCard'
export default {
    name: 'ChatContent',
    props: {
        chatLog: {
            type: Object,
            required: true
        },
        customer: {
            type: Object,
            required: true
        }
    },
    components: {
        ContentCard
    },
    computed: {
        ...mapGetters([
            'avatar'
        ])
    },
    mounted() {
    }
}
</script>

<style scoped lang="scss">
.chat-log {
    padding: 14px 10px 10px 14px;
    font-size: 14px;
    margin: 0;
    min-height: 80px;
    display: flex;
}

.chat-content {
    padding: 5px 14px 0 14px;
    max-width: calc(100% - 85px);
    font-size: 14px;
}

.chat-log.customer-chat {
    background-color: #ffffff;
}

.chat-log.sales-chat {
    flex-direction: row-reverse;
    background-color: #F8F8F8;
}
</style>