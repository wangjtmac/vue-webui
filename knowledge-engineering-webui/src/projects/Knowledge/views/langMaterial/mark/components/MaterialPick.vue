<!--
 语料标注基础配置页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="material-pick" v-loading="isLoading">
        <el-form ref="form"
                 label-width="80px"
                 :model="form"
                 :rules="rules"
                 @submit.native.prevent>
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
            <el-form-item label="字段选择" prop="dataColumn">
                <el-button type="text"
                           icon="el-icon-circle-plus"
                           title="添加"
                           :disabled="!form.dataTable"
                           @click.stop="handleClickAdd">
                </el-button>
                <common-table v-show="form.dataColumn.length > 0"
                              :columns="columns"
                              :data="form.dataColumn"
                              :show-header="false"
                              :global-bind="{'show-overflow-tooltip': false}">
                    <template slot="column" slot-scope="{ row, $index }">
                        <el-form-item :prop="`dataColumn.${$index}`"
                                      required>
                            <data-column-select
                                    v-model="row.$index"
                                    :data-house="dataHouse"
                                    :data-table-id="form.dataTable">
                            </data-column-select>
                        </el-form-item>
                    </template>
                    <template slot="operate" slot-scope="{ row, $index }">
                        <el-button slot="reference"
                                   type="text"
                                   class="btn-icon_delete"
                                   icon="el-icon-remove"
                                   title="删除"
                                   @click="handleClickDelete(row, $index)">
                        </el-button>
                    </template>
                </common-table>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';
    import CommonSelect from '@/projects/Knowledge/components/CommonSelect'
    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import * as dataSource from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "MaterialPick",
        props: {
            data: Object,
            dataHouse: DataHouse
        },
        data() {
            return {
                form: {
                    id: '',
                    dataSource: '',
                    dataTable: '',
                    dataColumn: []
                },
                rules: {
                    dataSource: [
                        { required: true, message: '请选择存储库', trigger: 'blur' }
                    ],
                    dataTable: [
                        { required: true, message: '请选择存储表', trigger: 'blur' }
                    ],
                    dataColumn: [
                        { required: true, message: '请选择存储字段', trigger: 'blur' }
                    ],
                },
                columns: [
                    {
                        prop: 'column',
                        label: '类型名称',
                        align: 'center'
                    }, {
                        prop: 'operate',
                        label: '操作',
                        align: 'center',
                        width: 50,
                    }
                ],
                sourceLoading: false,
                tableLoading: false
            };
        },
        computed:{
            isAdd() {
                let {data} = this;
                return !data || (!data.id && data.id !== 0);
            },
            isLoading() {
                const vm = this;
                return vm.sourceLoading || vm.tableLoading;
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
            initForm(data) {
                const vm = this;
                data = data || {};
                Object.keys(vm.form).forEach(key => {
                    let value = data[key];
                    vm.form[key] = value === null || value === undefined ? '' : value;
                });

                // 初始话字段
                vm.form.dataColumn = [];
            },
            handleChangeDataSource() {
                const vm = this;
                vm.form.dataTable = '';
            },
            handleClickAdd() {
                const vm = this;
                vm.form.dataColumn.push('');
            },
            handleClickDelete(row, index) {
                const vm = this;
                vm.form.dataColumn.splice(index, 1);
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
        },
        activated() {
            const vm = this;
            vm.initForm(vm.data);
        },
        components: {
            CommonSelect,
            CommonTable,
            ...dataSource
        }
    };
</script>
<style scoped lang="less">
    .el-button{
        line-height: 23px;
        font-size: 16px;
        padding: 0;
    }
    .btn-icon_delete{
        color: #f56c6c;
    }
</style>