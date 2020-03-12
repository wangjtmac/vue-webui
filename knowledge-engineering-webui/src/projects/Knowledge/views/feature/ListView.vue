<template>
    <div class="feature-list-view" v-loading="isLoading">
        <div class="ovh">
            <div class="fl mb10 mr15 lh40">
                <el-button type="primary"
                           size="small"
                           :disabled="!catalog"
                           @click.stop="handleClickAdd"
                >新建特征</el-button>
                <el-button type="primary"
                           size="small"
                           :disabled="!catalog"
                           @click.stop="handleClickBatchAdd"
                >批量导入</el-button>
            </div>
            <el-form :inline="true" ref="form" :model="form" class="fl" @submit.native.prevent>
                <el-form-item v-for="item in selectList"
                              :key="item.field"
                              :prop="item.field">
                    <el-select v-model="form[item.field]"
                               :key="item.field"
                               :clearable="item.clearable"
                               :placeholder="item.placeholder"
                    >
                        <el-option v-for="option in optionMap[item.options]"
                                   :key="option.code"
                                   :label="option.name"
                                   :value="option.code">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="name">
                    <el-autocomplete
                            v-model.trim="form.name"
                            :fetch-suggestions="querySearchAsync"
                            placeholder="特征"
                            @keyup.native.enter="handleClickSearch"
                    ></el-autocomplete>
                </el-form-item>
                <el-form-item>
                    <el-button size="small"
                               @click="handleClickReset"
                    >重置</el-button>
                    <el-button type="primary"
                               size="small"
                               @click="handleClickSearch"
                    >查询</el-button>
                </el-form-item>
            </el-form>
        </div>
        <common-table :columns="columns"
                      :data="list"
                      ref="table"
        >
            <template slot="operations" slot-scope="{row}">
                <i class="icon ce_link pl5 pr5 f18"
                   v-for="(opt , index) in operations"
                   v-html="opt.icon"
                   v-show="opt.filter ? opt.filter(row) : true"
                   :key="index"
                   :title="opt.title"
                   :style="{color: opt.color}"
                   @click="opt.handler(row)"
                ></i>
            </template>
        </common-table>

        <common-dialog
                :visible.sync="edit.dialogVisible"
                @closed="handleClosedEditDialog"
                width="700px">
            <template slot="title">
                <span class="el-dialog__title">{{edit.title}} </span>
                <i v-if="edit.disabled" class="ce_link el-icon-edit-outline" title="编辑" @click="handleClickEdit(edit.data)"></i>
            </template>
            <item-edit
                    ref="edit"
                    v-if="edit.dialogVisible"
                    :domain-id="domainId"
                    :data="edit.data"
                    :disabled="edit.disabled"
                    :catalog="catalog"
                    :dicMap="optionMap"
                    @saved="handleEditSaved"
                    @cancel="edit.dialogVisible = false"
            />
        </common-dialog>

        <common-dialog
                :title="batchDialog.title"
                :visible.sync="batchDialog.visible"
                width="900px">
            <db-batch-add
                    v-if="batchDialog.visible"
                    :domain-id="domainId"
                    :dicMap="optionMap"
                    :catalog="catalog"
                    @cancel="batchDialog.visible = false"
                    @saved="handleBatchSaved">
            </db-batch-add>
        </common-dialog>
    </div>
</template>

<script>
    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'
    import ItemEdit from './ItemEdit';
    import DbBatchAdd from './DbBatchAdd';

    export default {
        name: "FeatureListView",
        props: {
            catalog: Object,
            domainId: String
        },
        data() {
            const vm = this;
            return {
                restaurants: [],
                timeout:  null,
                form: {
                    dataType: '',
                    dataBaseType: '',
                    dataLevel: '',
                    name: ''
                },
                list: [],
                columns: [
                    {
                        bind: {
                            type: 'index',
                            label: '序号',
                            align: 'center',
                            fixed: 'left'
                        }
                    }, {
                        bind: {
                            prop: 'name',
                            label: '特征项',
                            align: 'center',
                            fixed: 'left'
                        }
                    }, {
                        prop: 'featureType',
                        translator: ({value}) => {
                            let item = vm.optionMap.featureType.find(item => `${item.code}` === `${value}`);
                            return (item && item.name) || '未知'
                        },
                        bind: {
                            label: '特征类型',
                            align: 'center',
                            fixed: 'right'
                        }
                    }, {
                        prop: 'dataLevel',
                        translator: ({value}) => {
                            let item = vm.optionMap.dataLevel.find(item => item.code === value);
                            return (item && item.name) || '未知'
                        },
                        bind: {
                            label: '数据等级',
                            align: 'center',
                            fixed: 'right'
                        }
                    }, {
                        prop: 'dataBaseType',
                        translator: ({value}) => {
                            let item = vm.optionMap.dataBaseType.find(item => item.code === value);
                            return (item && item.name) || '未知'
                        },
                        bind: {
                            label: '数据基础类型',
                            align: 'center',
                            fixed: 'right'
                        }
                    }, {
                        prop: 'dataType',
                        translator: ({value}) => {
                            let item = vm.optionMap.dataType.find(item => item.code === value);
                            return (item && item.name) || '未知'
                        },
                        bind: {
                            label: '数据类型',
                            align: 'center',
                            fixed: 'right'
                        }
                    }, {
                        prop: 'operations',
                        isSlot: true,
                        bind: {
                            label: '操作',
                            width: '130',
                            align: 'center',
                            fixed: 'right'
                        }
                    }
                ],
                operations: [
                    {
                        title: '编辑',
                        handler: this.handleClickEdit,
                        icon: '&#xe765;',
                    }, {
                        title: '查看',
                        handler: this.handleClickView,
                        filter: row => true,
                        icon: '&#xe6c5;'
                    }, {
                        title: '删除',
                        handler: this.handleClickDelete,
                        filter: row => true,
                        color: '#f56c6c',
                        icon: '&#xe6f9;'
                    }
                ],
                selectList: [
                    {
                        field: 'dataType',
                        placeholder: '数据类型',
                        clearable: true,
                        options: 'dataType'
                    }, {
                        field: 'dataBaseType',
                        placeholder: '数据基础类型',
                        clearable: true,
                        options: 'dataBaseType'
                    }, {
                        field: 'dataLevel',
                        placeholder: '数据等级',
                        clearable: true,
                        options: 'dataLevel'
                    }
                ],
                optionMap: {
                    dataType: [],
                    dataBaseType: [],
                    dataLevel: [],
                    featureType: [
                        { name: '动态类型', code: '0' },
                        { name: '静态类型', code: '1' },
                    ]
                },
                edit: {
                    title: '',
                    dialogVisible: false,
                    data: null,
                    disabled: false
                },
                batchDialog: {
                    title: '批量导入特征',
                    visible: false,
                    classify: null,
                },
                isLoading: false
            }
        },
        watch: {
            domainId: {
                handler() {
                    this.initData();
                },
                immediate: true
            },
            catalog() {
                this.initData();
            }
        },
        methods: {
            querySearchAsync(queryString, cb) {
                let restaurants = this.restaurants;
                let results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants;

                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    cb(results);
                }, 1000 * Math.random());
            },
            createStateFilter(queryString) {
                return (state) => {
                    return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            async reqDelete(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('destoryFeatureClassify',{},{
                    params: {featureClassifyId: params.id}
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '删除特征分类异常');
                    return false;
                }
            },
            async reqList() {
                const vm = this;
                let {form, catalog, domainId} = vm;
                let params = Object.assign({domainId}, form);
                if (catalog) {
                    params.id = catalog.id;
                }
                vm.isLoading = true;
                let {data} = await vm.$axios.post('getFeatureByQuery', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                let list = [];
                if (data.code === 200) {
                    list = data.featuresList || [];
                } else {
                    vm.$message.error(data.msg || `查询特征列表异常`);
                }
                vm.list = list;
                vm.restaurants = [];
                let obj = {};
                for (let value in vm.list) {
                    obj[vm.list[value].name] = {"value": vm.list[value].name};
                }
                vm.restaurants = Object.values(obj);
            },
            async reqDic(url, field, name = '') {
                const vm = this;
                let {data} = await vm.$axios.get(url).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                let list = [];
                if (data.code === 200) {
                    list = data.result || [];
                } else {
                    vm.$message.error(data.msg || `查询${ name }异常`);
                }
                vm.optionMap[field] = list;
            },
            initDic() {
                const vm = this;
                vm.reqDic('getEnumDomainDataLevelType', 'dataLevel', '数据等级');
                vm.reqDic('getEnumDomainStandardType', 'dataType', '数据类型');
                vm.reqDic('getEnumDomainFeaturesValType', 'dataBaseType', '数据基础类型');
            },
            initData() {
                const vm = this;
                vm.$refs.form && vm.$refs.form.resetFields();
                if (vm.domainId) {
                    vm.reqList();
                } else {
                    vm.list = [];
                }
            },
            handleClickAdd() {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '新增特征项';
                edit.disabled = false;
                edit.data = null;
            },
            handleClickBatchAdd() {
                const { batchDialog, catalog } = this;
                batchDialog.visible = true;
                batchDialog.classify = catalog;
            },
            handleClickEdit(data){
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '编辑特征项';
                edit.disabled = false;
                edit.data = data;
            },
            handleClickView(data) {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '查看特征项';
                edit.disabled = true;
                edit.data = data;
            },
            handleClickDelete(data) {
                const vm = this;
                vm.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    let success = await vm.reqDelete(data);
                    if (success) {
                        vm.reqList();
                    }
                }).catch(_ => {});;
            },
            handleEditSaved() {
                const vm = this;
                let {edit} = vm;
                edit.dialogVisible = false;
                vm.reqList();
            },
            handleBatchSaved() {
                const vm = this;
                let { batchDialog } = vm;
                batchDialog.visible = false;
                vm.reqList();
            },
            handleClickReset() {
                const vm = this;
                let { form: formVm } = vm.$refs
                formVm && formVm.resetFields();
            },
            handleClickSearch() {
                this.reqList();
            },
            handleClosedEditDialog() {
                const vm = this;
                vm.edit.data = null;
                vm.$refs.edit && vm.$refs.edit.clearForm();
            },

            resize() {
                const vm = this;
                let { table: tableVm } = vm.$refs
                tableVm && tableVm.doLayout();
            }
        },
        created() {
            this.initDic();
        },
        components: {
            CommonTable,
            CommonDialog,
            ItemEdit,
            DbBatchAdd
        }
    }
</script>

<style scoped lang="less">
    .el-form-item{
        max-width: 200px;
        min-width: 130px;
        width: 10vw;
        margin-bottom: 10px;
    }
</style>