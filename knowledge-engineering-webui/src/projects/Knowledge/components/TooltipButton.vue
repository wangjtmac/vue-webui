<!--
 此处填写文件描述
 @Author: zhanbh
 @Date: 2019-11-21
-->
<template>
    <el-tooltip
            v-if="isTooltip"
            v-show="item.isShow"
            :disabled="!item.isTooltip"
            v-bind="item.tooltipBind"
            v-on="item.tooltipEvents"
            @click.native.stop>
        <span v-html="item.desc"></span>
        <span slot="reference"
              :class="item.class"
              :style="item.style"
              :title="item.isTooltip ? '' : item.desc"
              v-bind="item.bind"
              v-on="item.events"
        >{{item.isIcon ? '' : item.name}}
                </span>
    </el-tooltip>
</template>
<script>
    export default {
        name: "TooltipButton",
        inheritAttrs: false,
        props: {
            isTooltip: {
                type: Boolean,
                default: true
            },
            tooltipProps: Object
        },
        data() {
            return {};
        },
        computed: {},
        methods: {},
        created() {
        }
    };
</script>
<style scoped>

</style>