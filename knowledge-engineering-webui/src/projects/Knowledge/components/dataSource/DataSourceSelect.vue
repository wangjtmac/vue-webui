<!--
 数据源下拉框
 @Author: zhanbh
 @Date: 2019-11-08
-->
<template>
    <tree-select class="data-source-select"
                 :value="loading ? '' : value"
                 filterable
                 clearable
                 check-leaf
                 check-strictly
                 :key="version"
                 placeholder="库名"
                 :props="props"
                 :loading="loading"
                 :data="data"
                 v-on="$listeners"
    >
    </tree-select>
</template>

<script>
    import {DataHouse} from '@/projects/Knowledge/api/dataSourceApi';

    import TreeSelect from 'ui-component-v4/lib/tree-select';

    export default {
        name: "DataSourceSelect",
        props: {
            value: { default: '' },
            dataHouse: {
                type: DataHouse,
                required: true
            }
        },
        data() {
            return {
                props: {
                    value: 'id',
                    label: 'name',
                    children: 'datasourceChildren'
                },
                data: [],
                loading: false,
                version: 0,
            }
        },
        watch: {
            dataHouse: {
                handler() {
                    this.initData();
                },
                immediate: true
            },
            loading(now) {
                this.$emit('loading', now);
            }
        },
        methods: {
            async initData() {
                const vm = this;
                let {dataHouse} = vm;
                let tree = [];

                if (dataHouse !== null) {
                    vm.loading = true;
                    let data = await vm.dataHouse.getSources();

                    if (dataHouse === vm.dataHouse) {
                        vm.loading = false;
                        tree = data.result || [];

                        // 下拉树组件需要id
                        let undoList = [...tree];

                        while(undoList.length > 0) {
                            let item = undoList.pop();
                            item.id = item.id === null || item.id === undefined ? item.name : item.id;
                            if (item['datasourceChildren']) {
                                undoList.push(...item['datasourceChildren']);
                            }
                        }
                    }

                } else {
                    vm.loading = false;
                }

                vm.data = tree;
                vm.version++;
                return tree;
            },

            getCurrent() {
                const vm = this;
                return vm.getItem(vm.value);
            },

            getItem(value) {
                let { data = [], props } = this;
                let undo = [...data];

                if (!value && value !== 0) {
                    return null;
                } else {

                    while (undo.length > 0) {
                        let item = undo.shift();

                        if (item[props.value] === value) {
                            return item;
                        }

                        if (Array.isArray(item[props.children])) {
                            undo.push(...item[props.children]);
                        }
                    }
                }
            },
        },
        activated() {
            this.initData();
        },
        components: {
            TreeSelect
        }
    }
</script>

<style scoped>

</style>