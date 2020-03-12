<!--
 普通流节点
 @Author: zhanbh
 @Date: 2019-11-27
-->
<template>
    <div class="flow-node"
         :class="nodeClass"
         :id="data.id"
         :style="style"
         v-on="$listeners">
        {{data.name}}
    </div>
</template>
<script>
    export default {
        name: "FlowNode",
        props: {
            data: {
                type: Object,
                default() {
                    return {};
                }
            },
            isActive: Boolean
        },
        data() {
            return {};
        },
        computed: {
            nodeClass() {
                const vm = this;
                let { isActive, data = {} } = vm;
                return{
                    'is-active': isActive,
                    'allow-click': data.isClick
                }
            },
            style() {
                const vm = this;
                let { data = {} } = vm;
                return{
                    'left': `${data.x}px`,
                    'top': `${data.y}px`,
                }
            }
        },
        methods: {
        },
        created() {
        }
    };
</script>
<style scoped lang="less">
    .flow-node{
        position: absolute;
        box-sizing: border-box;
        padding: 15px;
        border-radius: 4px;
        background-color: rgb(242, 246, 252);
        user-select: none;
        white-space: nowrap;
    }

    .allow-click{
        border: 1px solid #b3d8ff;
        cursor: pointer;;
    }

    .is-active,
    .allow-click:hover{
        border-color: #2d81b3;
    }
</style>