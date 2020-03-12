<!--
 操作按钮组  还在改进中
 @Author: zhanbh
 @Date: 2019-11-20
-->
<template>
    <div class="operations">
        <template v-for="(item, index) in test">
            <el-dropdown  v-if="item.isGroup"
                          v-show="item.isShow"
                          v-bind="item.dropdownBind"
                          v-on="item.dropdownEvents"
                          :key="index">
                <el-tooltip
                        :disabled="!item.isTooltip"
                        v-bind="item.tooltipBind"
                        v-on="item.tooltipEvents"
                        @click.native.stop>
                    <span slot="content" v-html="item.desc"></span>
                    <template>
                        <span :class="item.class"
                              :style="item.style"
                              :title="item.isTooltip ? '' : item.desc"
                              v-bind="item.bind"
                              v-on="item.events">
                            {{item.isIcon ? '' : item.name}}
                        </span>
                        <i v-if="!item.isIcon" class="el-icon-arrow-down el-icon--right"></i>
                    </template>
                </el-tooltip>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                            v-for="(downItem, index) in item.children"
                            :key="index"
                            :command="downItem"
                            v-bind="downItem.dropdownBind"
                            v-on="downItem.dropdownEvents">
                        <el-tooltip
                                :disabled="!downItem.isTooltip || !downItem.isIcon"
                                v-bind="downItem.tooltipBind"
                                v-on="downItem.tooltipEvents"
                                @click.native.stop>
                            <span slot="content" v-html="downItem.desc"></span>
                            <span :class="downItem.class"
                                  :style="downItem.style"
                                  :title="downItem.isTooltip ? '' : downItem.desc"
                                  v-bind="downItem.bind"
                                  v-on="downItem.events">
                                {{downItem.isIcon ? '' : downItem.name}}
                            </span>
                        </el-tooltip>
                        <el-tooltip
                                v-if="downItem.isTooltip && !downItem.isIcon"
                                v-bind="downItem.tooltipBind"
                                v-on="downItem.tooltipEvents"
                                @click.native.stop>
                            <span slot="content" v-html="downItem.desc"></span>
                            <i class="ce_link f16 el-icon-question"></i>
                        </el-tooltip>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-tooltip
                    v-else
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
    </div>
</template>
<script>
    export default {
        name: "Operations",
        props: {
            list: {
                type: Array,
                default() {
                    return [];
                }
            },
            payload: {},
            isIcon: {
                type: Boolean,
                default: true
            },
            subIsIcon: {
                type: Boolean,
                default: false
            },
            isTooltip: {
                type: Boolean,
                default: false
            },
            subIsTooltip: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                test: [
                    {
                        name: 'test',
                        isIcon: false,
                        isPopover: true,
                        desc: 'tessdsdt',
                        isShow: true,
                        class: ['el-icon-eleme']
                    }, {
                        name: 'test',
                        isIcon: true,isShow: true,
                        desc: 'testdsd',
                        class: ['el-icon-eleme']
                    } , {
                        name: 'test',
                        isGroup: true,isShow: true,
                        isIcon: true,
                        desc: 'test',
                        class: ['el-icon-eleme'],
                        children: [
                            {
                                name: 'test',
                                isIcon: false,isShow: true,
                                isPopover: true,
                                desc: 'test',
                                class: ['el-icon-eleme']
                            }, {
                                name: 'test',
                                isIcon: true,isShow: true,
                                desc: 'test',
                                class: ['el-icon-eleme']
                            }, {
                                name: 'test',
                                isIcon: true,isShow: true,
                                isPopover: true,
                                desc: 'test',
                                class: ['el-icon-eleme']
                            }
                        ]
                    },
                ]
            };
        },
        computed: {
            treatedData() {
                const vm = this;
                let {data} = vm;
                return data.map(item => vm.treatData(item));
            }
        },
        methods: {
            treatData(item) {
                let data = Object.assign({}, item);

            }
        },
        created() {
        }
    };
</script>
<style scoped>
    .operations {
        display: inline-block;
    }
</style>