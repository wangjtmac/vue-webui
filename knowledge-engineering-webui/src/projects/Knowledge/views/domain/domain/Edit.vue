<!--
 领域编辑页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <el-form class="domain-edit"
             ref="form"
             :model="form"
             :rules="rules"
             label-width="100px"
             @submit.native.prevent
             v-loading="isLoading"
    >
        <el-form-item label="领域名称" prop="name">
            <el-input v-model.trim="form.name"
                      placeholder="请输入领域名称"
                      maxlength="20"
                      show-word-limit
            ></el-input>
        </el-form-item>
        <el-form-item label="存放概念库" prop="domainDatasourceId">
            <tree-select v-model="form.domainDatasourceId"
                         filterable
                         clearable
                         check-leaf
                         check-strictly
                         placeholder="请选择存放概念库"
                         v-bind="esDataSource"
            >
            </tree-select>
        </el-form-item>
        <el-form-item label="存放实例库" prop="instanceDatasourceId">
            <tree-select v-model="form.instanceDatasourceId"
                         filterable
                         clearable
                         check-leaf
                         check-strictly
                         placeholder="请选择存放实例库"
                         v-bind="esDataSource"
            >
            </tree-select>
        </el-form-item>
        <el-form-item label="存放矩阵库" prop="matrixDatasourceId">
            <tree-select v-model="form.matrixDatasourceId"
                         filterable
                         clearable
                         check-leaf
                         check-strictly
                         placeholder="请选择存放矩阵库"
                         v-bind="hBaseDataSource"
            >
            </tree-select>
        </el-form-item>
        <el-form-item class="edit-btns">
            <el-button size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button size="small" type="primary" @click.stop="handleClickSave">确定</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
    import * as domainApi from '@/projects/Knowledge/api/domainApi';

    import TreeSelect from 'ui-component-v4/lib/tree-select'
    import {info} from "../../../assets/js/utils/messageUtil";

    export default {
        name: "DomainEdit",
        props: {
            'data': Object
        },
        data() {
            this.isAdd = true; // 是否是新增
            return {
                dataHouse: null,
                form: {
                    id: '',
                    name: '',
                    domainDatasourceId: '',
                    instanceDatasourceId: '',
                    matrixDatasourceId:''
                },
                rules: {
                    name: [
                        { required: true, message: '请输入领域名', trigger: 'blur' },
                        { max: 20, message: '不能超过20个字符', trigger: 'blur' }
                    ],
                    domainDatasourceId: [
                        { required: true, message: '请选择存放概念库', trigger: 'blur' }
                    ],
                    instanceDatasourceId: [
                        { required: true, message: '请选择存放实例库', trigger: 'blur' }
                    ],
                    matrixDatasourceId: [
                        { required: true, message: '请选择存放实例库', trigger: 'blur' }
                    ]
                },
                dataSource: {
                    props: {
                        value: 'id',
                        label: 'name',
                        children: 'datasourceChildren'
                    },
                    loading: false,
                    data: []
                },
                hBaseDataSource: {
                    props: {
                        value: 'id',
                        label: 'name',
                        children: 'datasourceChildren'
                    },
                    loading: false,
                    data: []
                },
                esDataSource: {
                    props: {
                        value: 'id',
                        label: 'name',
                        children: 'datasourceChildren'
                    },
                    loading: false,
                    data: []
                },
                isLoading: false
            };
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
            async reqAdd() {
                const vm = this;
                let params = Object.assign({}, vm.form);
                delete params.id;
                vm.isLoading = true;
                let data = await domainApi.add(params);
                vm.isLoading = false;
                if (data.code === 200) {
                    vm.clearForm();
                    vm.$emit('saved', params);
                }
            },
              hBaseFilter(){
                  const vm = this;
                  let {hBaseDataSource} = vm;
                  hBaseDataSource.loading = true;
                  let tree = [];
                  vm.dataSource.data.forEach(function (item) {
                    if (item.name == 'hbase') {
                        tree.push(item);
                    }
                });
                  hBaseDataSource.data = tree;
                  hBaseDataSource.loading = false;
            },
            esFilter(){
                const vm = this;
                let {esDataSource} = vm;
                esDataSource.loading = true;
                let tree = [];
                vm.dataSource.data.forEach(function (item) {
                    if (item.name == 'Elasticsearch') {
                        tree.push(item);
                    }
                });
                esDataSource.data = tree;
                esDataSource.loading = false;
            },
            async reqUpdate() {
                const vm = this;
                let params = Object.assign({}, vm.form);
                vm.isLoading = true;
                let data = await domainApi.update(params);
                vm.isLoading = false;
                if (data.code === 200) {
                    vm.clearForm();
                    vm.$emit('saved', params);
                }
               this.hBaseFilter();
            },
            async  reqDataSource() {
                const vm = this;
                let {dataSource} = vm;
                dataSource.loading = true;
                let {data : respData} = await vm.$axios.get('getDatasourceTree').catch((error) => {
                    vm.isLoading = false;
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let tree = respData.dataSourceList || [];
                dataSource.data = tree;
                this.esFilter();
                this.hBaseFilter();
            },
            initForm(data) {
                const vm = this;
                let form = vm.form;
                vm.clearForm();
                data = data || {};
                vm.isAdd = !data.hasOwnProperty('id');
                Object.keys(form).forEach(key => {
                    form[key] = data[key] || '';
                })
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate((valid) => {
                    if (valid) {
                        if (vm.isAdd) {
                            vm.reqAdd();
                        } else {
                            vm.reqUpdate()
                        }
                    }
                });
            },
            handleClickCancel() {
                this.$emit('cancel');
            },
            clearForm() {
                const vm = this;
                let {form} = vm;
                for (let key in form) {
                    form[key] = '';
                }
                if (vm.$refs['form']) {
                    vm.$refs['form'].clearValidate();
                }
            }
        },
        created() {
            this.reqDataSource();
        },
        components: {
            TreeSelect
        }
    };
</script>
<style scoped lang="less">
    .el-form {
        max-width: 460px;
    }

    .edit-btns {
        text-align: right;
    }
</style>