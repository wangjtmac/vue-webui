<!--
 通用的下拉框
 @Author: zhanbh
 @Date: 2019-12-09
-->
<template>
    <el-select class="common-select"
               v-bind="mergedAttrs"
               ref="select"
               :remote-method="usefulRemoteMethod"
               :loading="loading || isLoading"
               v-on="$listeners">
        <template v-for="item in options">
            <el-option-group
                    v-if="item.isGroup"
                    :key="item.label"
                    :label="item.label">
                <el-option
                        v-for="child in item.children"
                        :key="child.value"
                        :label="child.label"
                        :value="child.value">
                    <slot :data="child.origin">{{child.label}}</slot>
                </el-option>
            </el-option-group>
            <el-option
                    v-else
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                <slot :data="item.origin">{{item.label}}</slot>
            </el-option>
        </template>

        <slot name="prefix" slot="prefix"></slot>
        <slot name="empty" slot="empty"></slot>
    </el-select>
</template>
<script>
    const DEFAULT_ATTRS = {
        filterable: true,
        clearable: true
    };

    const DEFAULT_PROPS = {
        label: 'label',
        value: 'value',
        disabled: 'disabled',
        isGroup: 'isGroup',
        groupLabel: 'label',
        groupDisabled: 'disabled',
        children: 'children'
    };

    export default {
        name: "CommonSelect",
        props: {
            data: {
                default() {
                    return [];
                }
            },
            dataField: [String, Function],
            dataFilter: Function, // 数据过滤
            props: {
                type: Object,
                default() {
                    return {};
                }
            },
            remoteMethod: Function,
            loading: Boolean
        },
        data() {
            return {
                originData: null,
                isLoading: false
            };
        },
        computed: {
            mergedAttrs() {
                return Object.assign({...DEFAULT_ATTRS}, this.$attrs);
            },
            mergedProps() {
                return Object.assign({...DEFAULT_PROPS}, this.props);
            },
            options() {
                const vm = this;
                return vm.geneUsefulOptions(vm.pickData(vm.originData, vm.dataField));
            }
        },
        watch: {
            data: {
                handler() {
                    this.initData();
                },
                immediate: true,
                deep: true
            }
        },
        methods: {

            /**
             * 初始化数据，数据支持Function, Promise，Array
             **/
            async initData() {
                const vm = this;
                vm.isLoading = false;

                let data = vm.data;
                let result = data;

                if (data instanceof Function || data instanceof Promise) {
                    vm.isLoading = true;
                    let resp = data instanceof Function ? await data() : await data;

                    if (vm.data === data) {
                        vm.isLoading = false;
                        result = resp;
                    } else {
                        return false;
                    }
                }

                vm.originData = result || [];
            },

            /**
             * 从对象中获取指定字段
             * @param data
             * @param fieldStr 支持函数，字符串包括.隔开的字符串
             * @returns {*}
             */
            pickData(data, fieldStr) {

                if (typeof fieldStr === 'string') {
                    let fields = fieldStr.split('.');

                    fields.forEach(field => {

                        if (typeof field === 'string' && field.trim() !== '') {

                            if (data !== null && data !== undefined) {
                                data = data[field.trim()];
                            }
                        }
                    });
                    return data;

                } else if ( fieldStr instanceof Function){
                   return  fieldStr(data);

                } else {
                    return data;
                }
            },

            /**
             * 根据props配置生成option
             **/
            geneUsefulOptions(list = []) {
                const vm = this;
                let { mergedProps, dataFilter } = vm;
                let options = [];

                if (Array.isArray(list)) {

                    list.forEach(item => {

                        if (!(dataFilter instanceof Function) || dataFilter(item)) { // 如果有过滤器，则调用过滤器
                            let isGroup = vm.pickData(item, mergedProps.isGroup);

                            if  (isGroup) {
                                options.push({
                                    isGroup: true,
                                    label: vm.pickData(item, mergedProps.groupLabel),
                                    disabled: vm.pickData(item, mergedProps.groupDisabled),
                                    children: vm.geneUsefulOptions(vm.pickData(item, mergedProps.children)),
                                    origin: item
                                });

                            } else {
                                options.push({
                                    label: vm.pickData(item, mergedProps.label),
                                    value: vm.pickData(item, mergedProps.value),
                                    disabled: vm.pickData(item, mergedProps.disabled),
                                    origin: item
                                });
                            }
                        }
                    });
                }

                return options;
            },

            /**
             * 包装一层远程请求数据方法，将数据放到options
             * @param query
             * @returns {Promise<void>}
             */
            async usefulRemoteMethod(query) {
                const vm = this;

                if (vm.remoteMethod instanceof Function) {
                    let data = await vm.remoteMethod(query);
                    vm.options = data || [];
                }
            },

            focus(...args) {
                return this.$refs.select && this.$refs.select.focus(...args);
            },

            blur(...args) {
                return this.$refs.select && this.$refs.select.blur(...args);
            }
        },
        created() {
        }
    };
</script>
<style scoped>

</style>