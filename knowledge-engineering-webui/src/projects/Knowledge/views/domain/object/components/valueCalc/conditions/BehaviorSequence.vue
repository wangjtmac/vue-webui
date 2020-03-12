<!--
 行为条件
 @Author: zhanbh
 @Date: 2019-12-10
-->
<template>
    <el-form class="behavior-sequence"
             :model="form"
             ref="form"
             :rules="rules"
             hide-required-asterisk
             v-bind="$attrs"
             @submit.native.prevent>
        <el-form-item label="对象在" label-width="60px" prop="periodTime">
            <time-selector class="item-time" v-model="form.periodTime"></time-selector>
        </el-form-item>
        <el-form-item class="item-behavior" prop="behavior">
            <common-select
                    v-model="form.behavior"
                    placeholder="行为类型"
                    :data="behaviorData"
                    :props="behaviorProp">
            </common-select>
        </el-form-item>
    </el-form>
</template>
<script>
    import commonMixin from './mixin';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';
    import TimeSelector from '../TimeSelector';
    import TreeSelect from 'ui-component-v4/lib/tree-select';

    export default {
        name: "BehaviorSequence",
        mixins: [commonMixin],
        props: {
            behaviorData: [Promise, Array, Function],
            value: Object, // {timeType startTime startTimeUnit endTime endTimeUnit, behavior}
        },
        data() {
            const vm = this;
            return {
                behaviorProp: {
                    label: 'behaviorName',
                    value: 'behaviorName'
                },
                form: {
                    periodTime: {
                        timeType: '',
                        startTime: '',
                        endTime:'',
                        startTimeUnit: '',
                        endTimeUnit: '',
                    },
                    behavior: ''
                },
                rules: {
                    periodTime: { validator: vm.periodTimeValidater, trigger: 'input' },
                    behavior: { required: true, message: '行为不能为空', trigger: 'blur' },
                },
            };
        },
        methods: {
            initSpecialFormField(value = {}) {
                const vm = this;
                let { form } = vm;

                form.behavior = value['behavior'] || '';
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
<style scoped>
    .el-form-item{
        display: inline-block;
        margin-bottom: 0;
    }
    .el-form-item+.el-form-item {
        margin-left: 10px;
    }
    .item-time{
        width: 332px;
    }
    .item-behavior{
        width: calc(100% - 402px);
    }
</style>