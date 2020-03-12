<!--
 左右两侧布局组件，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="left-main-layout height100 bgwh p10 bsb">
        <div v-show="showLeft" class="left height100 bsb trans fl ova pr10 rel" :style="{width: widthPx}">
            <slot name="left"></slot>
        </div>
        <div class="main height100 bsb trans ova rel" :style="{'margin-left': mainMarginPx}">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "LeftMainLayout",
        props: {
            showLeft: {
                type: Boolean,
                default: true
            },
            leftWidth: {
                type: Number,
                default: 270
            }
        },
        computed: {
            widthPx() {
                const {showLeft, leftWidth} = this;
                if (showLeft && leftWidth > 0) {
                    return `${leftWidth}px`
                } else {
                    return 0;
                }
            },
            mainMarginPx() {
                const {showLeft, leftWidth} = this;
                if (showLeft && leftWidth > 0) {
                    return `${leftWidth + 10}px`
                } else {
                    return 0;
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .left-main-layout {
       border: solid 1px #EBEEF5;
    }
    .left {
        border-right: 1px solid #EBEEF5;
    }
</style>