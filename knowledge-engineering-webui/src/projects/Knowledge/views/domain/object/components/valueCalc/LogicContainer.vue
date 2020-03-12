<!--
 逻辑容器
 @Author: zhanbh
 @Date: 2019-11-21
-->
<template>
    <div class="logic-container">
        <div class="container__left" :style="leftCss">
            <span class="left__divider"></span>
            <span class="left__main" v-if="showLeft">
                <slot name="logic"></slot>
            </span>
            <span class="left__divider"></span>
        </div>
        <div class="container__main">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "LogicContainer",
        props: {
            showLeft: {
                type: Boolean,
                default: true
            },
            keepSpace: Boolean,
            leftWidth: [Number, String]
        },
        data() {
            return {}
        },
        computed: {

            /**
             * 左侧样式，目前包括是否显示与宽度样式设置
             */
            leftCss() {
                let { showLeft, keepSpace = false, leftWidth } = this;
                let style = {};

                // 是否显示
                if (!showLeft) {

                    if (keepSpace) {
                        style['visibility'] = 'hidden';
                    } else {
                        style['display'] = 'none';
                    }
                }

                // 宽度样式
                if (typeof leftWidth === 'number') {
                    style['width'] = `${leftWidth}px`;

                } else if (typeof leftWidth === 'string' && leftWidth.trim() !== '') {

                    if (/^\d+(\.\d+)?$/ig.test(leftWidth.trim())) { // 纯数字
                        style['width'] = `${leftWidth}px`;
                    } else {
                        style['width'] = leftWidth;
                    }
                }

                return style;
            }
        }
    }
</script>

<style scoped lang="less">
    .logic-container{
        display: flex;
        .container__left{
            margin-right: 10px;
            flex-shrink: 0;
            display:flex;
            flex-direction: column;
            .left__divider{
                margin: 0 auto;
                width: 1px;
                background-color: #dcdfe6;
                flex-grow: 1;
            }
            .left__main{
                margin: 5px 0;
                flex-shrink: 0;
            }
        }
        .container__main{
            flex-grow: 1;
        }
    }
</style>