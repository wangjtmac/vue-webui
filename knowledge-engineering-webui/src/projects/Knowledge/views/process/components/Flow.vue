<!--
 流程图
 @Author: zhanbh
 @Date: 2019-11-27
-->
<template>
    <div class="flow">
        <div class="flow__main">
            <div class="flow-toolbar">
                <slot name="toolbar"></slot>
            </div>
            <js-plumb-panel :node-list="nodeList"
                            :line-list="lineList"
                            v-on="$listeners">
                <slot slot-scope="{data}" :data="data"></slot>
            </js-plumb-panel>
        </div>
        <div class="flow__form">
            <slot name="form"></slot>
        </div>
    </div>
</template>
<script>
    import JsPlumbPanel from './flowPanel/JsPlumbPanel';

    export default {
        name: "Flow",
        props: {
            nodeList: {
                type: Array,
                default() {
                    return [];
                }
            },
            lineList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {};
        },
        computed: {},
        methods: {},
        created() {
        },
        components: {
            JsPlumbPanel
        }
    };
</script>
<style scoped lang="less">
    .flow{
        position: relative;
        display: flex;
        justify-content: stretch;
        width: 100%;
        height: 100%;
        overflow: auto;

        .flow__main{
            flex-grow: 1;

            .flow-toolbar{
                position:absolute;
                top:10px;
                z-index: 1;
            }
        }

        .flow__form{
            flex-shrink: 0;
        }
    }
</style>