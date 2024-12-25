<template>
    <div v-if="chatLog.content_type == 'text'" class="text-content">
        {{ chatLog.content }}
    </div>
    <div v-else-if="chatLog.content_type == 'image'" class="image-content">
        <a :href="chatLog.content" target="_blank">
            <img :src="chatLog.content" style="width:200px;">
        </a>
    </div>
    <div v-else-if="chatLog.content_type == 'link'" class="link-content" @click="gotoUrl(structed_content.url)">
        <div class="thumb-image">
            <img :src="structed_content.thumb_url" />
        </div>
        <div class="title">
            {{ structed_content.title }}
        </div>
    </div>
    <div v-else-if="chatLog.content_type == 'quote'" class="quote-content">
        <div>
            {{ structed_content.content }}
        </div>
        <div>
            {{ structed_content.refer_content }}
        </div>
    </div>

</template>
<script>
export default {
    name: 'ContentCard',
    data() {
        return {
            structed_content: null
        }
    },
    props: {
        chatLog: {
            type: Object,
            required: true
        }
    },
    created() {
        if (this.chatLog.content_type === 'link') {
            this.structed_content = JSON.parse(this.chatLog.content)
        } else if (this.chatLog.content_type === 'quote') {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(this.chatLog.content, "text/xml");
            let title = this.getElementsByXPath("/msg/appmsg/title", xmlDoc)
            title = title.iterateNext()
            title = title.textContent

            let refer_content = this.getElementsByXPath("/msg/appmsg/refermsg/content", xmlDoc)
            refer_content = refer_content.iterateNext()
            refer_content = refer_content.textContent

            refer_content = refer_content.replace("&lt;", "<")
            refer_content = refer_content.replace("&gt;", ">")

            let referDoc = parser.parseFromString(refer_content, "text/xml");


            refer_content = this.getElementsByXPath("/msg/appmsg/title", referDoc)
            refer_content = refer_content.iterateNext().textContent
            this.structed_content = {
                content: title,
                refer_content: refer_content
            }
        }
    },
    methods: {
        gotoUrl(url) {
            window.open(url)
        },
        getElementsByXPath(xpath, xmlDoc) {
            return document.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE, null)
        }
    }
}
</script>

<style scoped lang="scss">
.text-content {
    line-height: 20px;
}

.link-content {
    cursor: pointer;
}
</style>