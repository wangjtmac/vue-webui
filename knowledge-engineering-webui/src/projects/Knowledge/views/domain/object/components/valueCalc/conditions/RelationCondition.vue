<!--
 对象关系条件
 @Author: zhanbh
 @Date: 2019-12-10
-->
<template>
    <el-form class="relation-condition"
             :model="form"
             ref="form"
             :rules="rules"
             v-bind="$attrs"
             @submit.native.prevent>
        <el-form-item class="item-time" prop="periodTime">
            <time-selector v-model="form.periodTime"></time-selector>
        </el-form-item>
        <el-form-item class="item-operations">
            <common-select
                    v-model="form.operation"
                    :props="{label: 'relLabel'}"
                    :data="inOutOptions"
                    :clearable="false">
            </common-select>
        </el-form-item>
        <el-form-item class="item-depth" label="深度上限:" label-width="75px">
            <common-select
                    v-model="form.depth"
                    :data="depthOptions"
                    :clearable="false"
                    disabled>
            </common-select>
        </el-form-item>
        <el-form-item class="item-relation" prop="relation">
            <tree-select v-model="form.relation"
                         filterable
                         clearable
                         placeholder="关系类型"
                         :props="relationProps"
                         :tree-props="treeProps"
                         :loading="isLoading"
                         :data="relationTreeData">
            </tree-select>
        </el-form-item>
    </el-form>
</template>
<script>
    import { inOutOptions, IN_OUT, depthOptions, DEPTH, } from '../constant';
    import commonMixin from './mixin';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';
    import TimeSelector from '../TimeSelector';
    import TreeSelect from 'ui-component-v4/lib/tree-select';

    export default {
        name: "RelationCondition",
        mixins: [commonMixin],
        props: {
            relationData: [Promise, Array, Function],
            value: Object, // {timeType startTime startTimeUnit endTime endTimeUnit, operation, relation}
        },
        data() {
            const vm = this;

            return {
                inOutOptions,
                depthOptions,
                treeProps: {
                    'default-expand-all': true,
                    'highlight-current': true,
                    'expand-on-click-node': false
                },
                relationProps: {
                    value: 'name',
                    label: 'name',
                    children: 'children'
                },
                rules: {
                    relation: { required: true, message: '关系不能为空', trigger: 'blur' },
                    periodTime: { validator: vm.periodTimeValidater, trigger: 'input' }
                },
                form: {
                    periodTime: {
                        timeType: '',
                        startTime: '',
                        endTime:'',
                        startTimeUnit: '',
                        endTimeUnit: '',
                    },
                    operation: '',
                    depth: '',
                    relation: ''
                },
                isLoading: false,
                relationTreeData: []
            };
        },
        computed: {},
        watch: {
            relationData: {
                handler() {
                    this.initRelationTreeData();
                },
                immediate: true,
            }
        },
        methods: {
            initSpecialFormField(value) {
                const vm = this;
                let { form } = vm;

                form.depth = value['depth'] || DEPTH.ONE;

                form.operation = value['operation'] || IN_OUT.IN;
                form.relation = value['relation'] || '';

            },

            /**
             * 初始化数据，数据支持Function, Promise，Array
             **/
            async initRelationTreeData() {
                const vm = this;
                vm.isLoading = false;

                let data = vm.relationData;
                let result = data;

                if (data instanceof Function || data instanceof Promise) {
                    vm.isLoading = true;
                    let resp = data instanceof Function ? await data() : await data;

                    if (vm.relationData === data) {
                        vm.isLoading = false;
                        result = resp;
                    }else {
                        return false;
                    }
                }

                vm.relationTreeData = result || [];
            },
        },
        created() {
        },
        components: {
            CommonSelect,
            TimeSelector,
            TreeSelect
        }
    };
</script>
<style scoped lang="less">
    .el-form-item{
        display: inline-block;
        margin-bottom: 0;
    }
    .el-form-item+.el-form-item {
        margin-left: 5px;
    }
    .item-time{
        width: 332px;
    }
    .item-operations{
        width: 86px;
    }
    .item-depth{
        width: 130px;
    }
    .item-relation{
        width: calc(100% - 563px);
    }
</style>