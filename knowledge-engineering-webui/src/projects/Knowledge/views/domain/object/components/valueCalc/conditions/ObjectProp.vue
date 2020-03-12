<!--
 对象属性条件
 @Author: zhanbh
 @Date: 2019-12-09
-->
<template>
    <el-form class="object-prop"
             :model="form"
             ref="form"
             :rules="rules"
             v-bind="$attrs"
             @submit.native.prevent>
        <el-form-item prop="feature">
            <common-select
                    v-model="form.feature"
                    :data="featureData"
                    :props="featureProp"
                    placeholder="请选择对象特征">
            </common-select>
        </el-form-item>
        <el-form-item class="item-operations">
            <common-select
                    v-model="form.operation"
                    :data="operOptions"
                    :clearable="false">
            </common-select>
        </el-form-item>
        <el-form-item prop="featureValue">
            <el-input v-model="form.featureValue"
                      placeholder="请输入值">
            </el-input>
        </el-form-item>
    </el-form>
</template>
<script>
    import { operOptions, OPERTIONS,inOutOptions } from '../constant';
    import commonMixin from './mixin';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect';

    export default {
        name: "ObjectProp",
        mixins: [commonMixin],
        props: {
            featureData: [Promise, Array, Function],
            value: Object, // {feature, operation, featureValue}
        },
        data() {
            return {
                operOptions:[...operOptions, ...inOutOptions],
                form: {
                    feature: '',
                    operation: '',
                    featureValue: ''
                },
                rules: {
                    feature: { required: true, message: '属性不能为空', trigger: 'change' },
                    featureValue: { required: true, message: '值不能为空', trigger: 'blur' },
                },
                featureProp: {
                    label: 'name',
                    value: 'name'
                }
            };
        },
        computed: {},
        methods: {
            initSpecialFormField(value = {}) {
                const vm = this;

                let { form } = vm;
                form.feature = value['feature'] || '';
                form.operation = value['operation'] || OPERTIONS.EQ;
                form.featureValue = value['featureValue'] || '';
            }

        },
        created() {
        },
        components: {
            CommonSelect
        }
    };
</script>
<style scoped lang="less">
    .el-form-item{
        display: inline-block;
        margin-bottom: 0;
        width: calc(50% - 63px);
    }
    .el-form-item+.el-form-item {
        margin-left: 10px;
    }
    .item-operations{
        width: 105px;
    }
</style>