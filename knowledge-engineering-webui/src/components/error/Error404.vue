<template>
    <dg-page-code
            is-advice
            :title="title"
            :en="en"
            :msg-list="msgList"
            :advice="advice"
            :type="type" ></dg-page-code>
</template>

<script>
    import dgPageCode from 'ui-component-v4/packages/page-code'
    export default {
        name: "error404",
        components : {
            dgPageCode
        },
        data(){
            return {
                type : '404' ,
                title : '抱歉！您要找的页面不存在',
                en: ' ',
                msgList: ['输入网址不正确', '页面已被删除'],
                advice: [
                  /*  {
                        label: '返回上一页',
                        link: '/'
                    },*/
                    {
                        label: '返回首页',
                        link: '/'
                    }
                ]

            }
        },
        created() {

        }
    }
</script>

<style scoped>

</style>