<!--
 库表配置
 @Author: zhanbh
 @Date: 2020-02-06
-->
<template>
    <el-form class="table-config"
             size="small"
             ref="form"
             :model="form"
             :rules="editable ? rules : {}"
             :validate-on-rule-change="false"
             label-width="100px"
             @submit.native.prevent>
        <el-form-item label="数据库:" prop="dataSource">
            <template v-if="editable">
                <data-source-select
                        v-model="form.dataSource"
                        :data-house="dataHouse"
                        ref="dataSource"
                        @input="handleChangeDataSource">
                </data-source-select>
            </template>
            <template v-else>
                <span>{{sourceName}}</span>
            </template>
        </el-form-item>
        <el-form-item label="是否新建表:" prop="isCreate">
            <template v-if="editable">
                <el-radio-group v-model="form.isCreate">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                </el-radio-group>
            </template>
            <template v-else>
                <span>{{isCreateName}}</span>
            </template>
        </el-form-item>
        <el-form-item label="表名:" prop="dataTable">
            <template v-if="editable">
                <data-table-select
                        v-model="form.dataTable"
                        :data-house="dataHouse"
                        ref="dataSource"
                        :data-source-id="form.dataSource">
                </data-table-select>
            </template>
            <template v-else>
                <span>{{tableName}}</span>
            </template>
        </el-form-item>
    </el-form>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';
    import { DataSourceSelect, DataTableSelect } from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "TableConfig",
        props: {
            data: {
                type: Object,
                default() {
                    return {}
                }
            },
            dataHouse: {
                type: DataHouse,
                required: true
            },
            editable: {
                type: Boolean
            }
        },
        data() {
            return {
                form: {
                    dataSource: '',
                    isCreate: '',
                    dataTable: ''
                },
                dataSource: {
                    data: [],
                    isLoaded: false
                },
                dataTable: {
                    data: [],
                    isLoaded: false
                },
                rules: {
                    dataSource: [
                        { required: true, message: '请选择数据库', trigger: 'blur' },
                    ],
                    isCreate: [
                        { required: true, message: '请确定是否创建表', trigger: 'blur' },
                    ],
                    dataTable: [
                        { required: true, message: '请选择数据表', trigger: 'blur' },
                    ],
                }
            };
        },
        computed: {
            sourceName() {
                return this.transSourceName({
                    dataProp: 'dataSource',
                    stateProp: 'dataSource',
                    idProp: 'id',
                    nameProp: 'name'
                });
            },
            isCreateName() {
              const vm = this;
              const map = {
                  '0': '否',
                  '1': '是'
              };

              return map[`${vm.data.isCreate}`] || '--';
            },
            tableName() {
                return this.transSourceName({
                    dataProp: 'dataTable',
                    stateProp: 'dataTable',
                    idProp: 'id',
                    nameProp: 'name'
                });
            }
        },
        watch: {
            editable(now, old) {
                const vm = this;
                if (now) {
                    vm.initForm();
                    vm.initDataSource();
                    vm.initDataTable();
                }
                vm.clearValidate();
            },
            dataHouse: {
                handler() {
                    this.initDataSource();
                    this.initDataTable();
                },
                immediate: true
            },
            data() {
                const vm = this;
                vm.initDataSource();
                vm.initDataTable();
            },
            'dataSource.isLoaded': {
                handler(now) {
                    const vm = this;
                    vm.$emit('loading', !now || !vm.dataTable.isLoaded);
                },
                immediate: true
            },
            'dataTable.isLoaded': {
                handler(now) {
                    const vm = this;
                    vm.$emit('loading', !now || !vm.dataSource.isLoaded);
                },
                immediate: true
            }
        },
        methods: {
            async initDataSource() {
                const vm = this;
                const { dataHouse, dataSource } = vm;

                dataSource.isLoaded = false;
                let result = await dataHouse.getSources();
                dataSource.isLoaded = true;

                dataSource.data = result.result || [];
            },
            async initDataTable() {
                const vm = this;
                const { dataHouse, dataTable, data } = vm;

                dataTable.isLoaded = false;
                let result = await dataHouse.getTables(data.dataSource);
                dataTable.isLoaded = true;

                dataTable.data = result.result || [];
            },
            initForm() {
                const vm = this;
                const { data } = vm;
                Object.keys(vm.form).forEach(key => {
                    vm.form[key] = data[key] || '';
                });
            },

            /**
             * 将库表数据转成名称
             * @param dataProp
             * @param stateProp
             * @param idProp
             * @param nameProp
             * @returns {*}
             */
            transSourceName({ dataProp, stateProp, idProp, nameProp }) {
                const vm = this;
                const { [stateProp]: state, data } = vm;

                if (!data[dataProp] || !state.isLoaded) {
                    return '--';
                }

                let record = state.data.find(item => item[idProp] === data[dataProp]);

                return record ? record[nameProp] : data[dataProp];
            },

            handleChangeDataSource() {
                const vm = this;
                vm.form.dataTable = '';
                vm.initDataTable();
            },

            // 以下为公共接口
            getData() {
                const vm = this;
                return vm.form;
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
        components: {
            DataSourceSelect,
            DataTableSelect
        }
    };
</script>
<style scoped>

</style>