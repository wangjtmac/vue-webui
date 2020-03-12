<!--
 语料标注基础配置页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <el-form ref="form"
             v-loading="isLoading"
             class="base-setting"
             label-width="120px"
             :model="form"
             :rules="rules"
             @submit.native.prevent>
        <el-form-item label="方案名称" prop="name">
            <el-input v-model="form.name"
                      placeholder="请输入方案名称"
                      maxlength="50"
                      show-word-limit
            ></el-input>
        </el-form-item>
        <el-form-item label="所属领域" prop="domain">
            <common-select v-model="form.domain"
                           placeholder="请选择所属领域"
                           :data="domain.data"
                           :props="domain.props"
                           :loading="domain.isLoading">
            </common-select>
        </el-form-item>
        <el-form-item label="是否新建语料" prop="isNew">
            <el-radio-group v-model="form.isNew">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
            </el-radio-group>
        </el-form-item>

        <el-form-item label="存储库" prop="dataSource">
            <data-source-select
                    placeholder="请选择存储库"
                    v-model="form.dataSource"
                    :data-house="dataHouse"
                    ref="dataSource"
                    @input="handleChangeDataSource"
                    @loading="sourceLoading = $event">
            </data-source-select>
        </el-form-item>
        <el-form-item label="是否新建表:" prop="isCreate">
            <el-radio-group v-model="form.isCreate">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="存储表" prop="dataTable">
            <data-table-select
                    v-model="form.dataTable"
                    placeholder="请选择存储库表"
                    :data-house="dataHouse"
                    ref="dataSource"
                    :data-source-id="form.dataSource"
                    @loading="tableLoading = $event">
            </data-table-select>
        </el-form-item>
    </el-form>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';
    import * as domainApi from '@/projects/Knowledge/api/domainApi';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect'
    import { DataSourceSelect, DataTableSelect } from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "BaseSetting",
        props: {
            data: Object,
            dataHouse: DataHouse
        },
        data() {
            return {
                form: {
                    id: '',
                    name: '',
                    type: '',
                    domain: '',
                    dataSource: '',
                    isCreate: '',
                    dataTable: '',
                },
                rules: {
                    name: [
                        { required: true, message: '请输入方案名称', trigger: 'blur' },
                        { max: 50, message: '不能超过50个字符', trigger: 'blur' }
                    ],
                    isNew: [
                        { required: true, message: '请选择是否创建语料', trigger: 'blur' },
                    ],
                    domain: [
                        { required: true, message: '请选择所属领域', trigger: 'change' },
                    ],
                    dataSource: [
                        { required: true, message: '请选择存储库', trigger: 'blur' }
                    ],
                    isCreate: [
                        { required: true, message: '请选择是否创建表', trigger: 'blur' }
                    ],
                    dataTable: [
                        { required: true, message: '请选择存储表', trigger: 'blur' }
                    ]
                },
                domain: {
                    isLoading: false,
                    data: [],
                    reqCode: '',
                    props: {
                        value: 'id',
                        label: 'name'
                    },
                },
                sourceLoading: false,
                tableLoading: false
            };
        },
        computed:{
            isLoading() {
                const vm = this;
                return vm.domain.isLoading || vm.sourceLoading || vm.tableLoading;
            }
        },
        watch: {
            data: {
                handler(data) {
                    this.initForm(data);
                },
                immediate: true
            }
        },
        methods: {
            initConstant() {
                const vm = this;
                vm.initDomain();
            },
            async initDomain() {
                const vm = this;
                let { domain } = vm;

                if (domain.reqCode !== 200) {
                    domain.isLoading = true;
                    let result = await domainApi.getAll();
                    domain.isLoading = false;

                    domain.reqCode = result.code;
                    domain.data = result.domainTree || [];
                }

                return domain.data;
            },
            initForm(data) {
                const vm = this;
                data = data || {};
                Object.keys(vm.form).forEach(key => {
                    let value = data[key];
                    vm.form[key] = value === null || value === undefined ? '' : value;
                });
            },
            handleChangeDataSource() {
                const vm = this;
                vm.form.dataTable = '';
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let success = false;
                        if (vm.isAdd) {
                            success = await vm.reqAdd();
                        } else {
                            success = await vm.reqUpdate()
                        }
                        if (success) {
                            vm.$emit('saved', vm.form);
                        }
                    }
                });
            },

            getData() {
                return this.form;
            },

            validate(...args) {
                this.$refs.form.validate(...args);
            },
            validateField(...args) {
                this.$refs.form.validateField(...args);
            },
            resetField(...args) {
                this.$refs.form.resetField(...args);
            },
            clearValidate(...args) {
                this.$refs.form.clearValidate(...args);
            }
        },
        created() {
            this.initConstant();
        },
        activated() {
            const vm = this;
            vm.initConstant();
        },
        components: {
            CommonSelect,
            DataSourceSelect,
            DataTableSelect
        }
    };
</script>
<style scoped lang="less">
</style>