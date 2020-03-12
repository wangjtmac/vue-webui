<!--
 词典类型配置
 @Author: zhanbh
 @Date: 2020-02-06
-->
<template>
    <el-form class="word-type-config"
             size="small"
             ref="form"
             inline-message
             :model="{ list: tableData }"
             @submit.native.prevent>
        <common-table :columns="columns"
                      :data="tableData"
                      :global-bind="{'show-overflow-tooltip': false}">
            <template slot="name" slot-scope="{ row, $index }">
                <el-form-item v-if="editable"
                              :prop="`list.${$index}.name`"
                              :rules="rules.name">
                    <el-input v-model="row.name"
                              maxlength="50"
                              show-word-limit
                              placeholder="自定义词典类型">
                    </el-input>
                </el-form-item>
                <span v-else>{{row.name}}</span>
            </template>
            <template slot="domain" slot-scope="{ row, $index }">
                <el-form-item v-if="editable"
                              :prop="`list.${$index}.domain`"
                              :rules="rules.domain">
                    <common-select v-model="row.domain"
                                   placeholder="领域选择"
                                   multiple
                                   :data="domain.data"
                                   :props="domain.props"
                                   :loading="!domain.isLoaded">
                    </common-select>
                </el-form-item>
                <span v-else>{{transDomainName(row.domain)}}</span>
            </template>
            <template slot="status" slot-scope="{ row, $index }">
                <el-form-item v-if="editable"
                              :prop="`list.${$index}.status`">
                    <el-radio-group v-model="row.status">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <span v-else>{{row.status | statusName}}</span>
            </template>
            <template slot="header-operate">
                <el-button type="text"
                           icon="el-icon-circle-plus"
                           title="添加"
                           @click.stop="handleClickAdd">
                </el-button>
            </template>
            <template slot="operate" slot-scope="{ row, $index }">
                <el-popover
                        placement="top"
                        width="160"
                        :disabled="isRowDeletable(row)"
                        v-model="row.popVisible">
                    <template>
                        <div class="tr" style="text-align: center">
                            <p class="mb5">确定删除？</p>
                            <el-button @click="row.popVisible = false">取消</el-button>
                            <el-button type="primary" @click="handleConfirmDelete(row, $index)">确定</el-button>
                        </div>
                    </template>
                    <el-button slot="reference"
                               type="text"
                               class="btn-icon_delete"
                               icon="el-icon-remove"
                               title="删除"
                               @click="handleClickDelete(row, $index)">
                    </el-button>
                </el-popover>
            </template>
        </common-table>
    </el-form>
</template>
<script>
    import * as domainApi from '@/projects/Knowledge/api/domainApi';

    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import CommonSelect from '@/projects/Knowledge/components/CommonSelect'

    export default {
        name: "WordTypeConfig",
        props: {
            data: {
                type: Array,
                default() {
                    return []
                }
            },
            editable: {
                type: Boolean
            }
        },
        data() {
            const vm = this;

            return {
                columns: [
                    {
                        prop: 'name',
                        label: '类型名称',
                        align: 'center'
                    }, {
                        prop: 'domain',
                        label: '对应领域',
                        align: 'center'
                    }, {
                        prop: 'status',
                        label: '状态',
                        align: 'center'
                    }, {
                        prop: 'operate',
                        label: '操作',
                        align: 'center',
                        width: 50,
                        isHidden: !vm.editable
                    }
                ],
                rules: {
                    name: [
                        { required: true, message: '请输入词典类型', trigger: 'blur' }
                    ],
                    domain: [
                        { required: true, message: '请选择领域', trigger: 'blur' }
                    ]
                },
                list: [],
                domain: {
                    data: [],
                    props: {
                        value: 'id',
                        label: 'name'
                    },
                    isLoaded: false,
                    reqCode: 200
                }
            };
        },
        computed: {
            tableData() {
                const vm = this;
                return vm.editable ? vm.list: vm.data
            }
        },
        watch: {
            editable(now) {
                const vm = this;

                vm.columns[vm.columns.length - 1].isHidden = !now;

                if (now) {
                    vm.initList();
                    vm.initDomain();
                }
                vm.clearValidate();
            },
            data() {
                const vm = this;
                if (vm.editable) {
                    vm.initList();
                }
            },
            'domain.isLoaded':{
                handler(now) {
                    const vm = this;
                    vm.$emit('loading', !now);
                },
                immediate: true
            }
        },
        methods: {
            initList() {
                const vm = this;
                let { data } = vm;

                vm.list = data.map(item => {
                    return {
                        popVisible: false,
                        ...item
                    }
                });
            },
            async initDomain() {
                const vm = this;
                let { domain } = vm;

                if (!domain.isLoaded || domain.reqCode !== 200) {
                    let result = await domainApi.getAll();

                    domain.isLoaded = true;
                    domain.reqCode = result.code;
                    domain.data = result.domainTree || [];
                }

                return domain.data;
            },
            transDomainName(idList = []) {
                const vm = this;

                if (!idList || idList.length === 0) {
                    return '';
                }

                let { data } = vm.domain;
                let str = '';

                idList.forEach(id => {
                    if (!id) {
                        return false;
                    }
                    if (str) {
                        str += ', ';
                    }
                    let domainItem = data.find(item => item.id === id);

                    if (domainItem) {
                        str += domainItem ? domainItem.name : id;
                    }
                });

                return str;
            },
            handleClickAdd() {
                const vm = this;
                vm.list.push({
                    name: '',
                    domain: [],
                    status: 0,
                    popVisible: false
                });
            },
            isRowDeletable(row) {
                return !row.name && (!row.domain || row.domain.length === 0);
            },
            handleClickDelete(row, index) {
                const vm = this;
                if (vm.isRowDeletable(row)) {
                    vm.handleConfirmDelete(row, index);
                }
            },
            handleConfirmDelete(row, index) {
                const vm = this;
                vm.list.splice(index, 1);

                // 对数据源重新校验
            },

            getData() {
                const vm = this;
                return vm.list.map(item => {
                    let copy = {...item};
                    delete copy.popVisible;
                    return copy;
                });
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
        filters: {
            statusName(status) {
                let map = {
                    '0': '禁用',
                    '1': '启用'
                };

                return map[`${status}`] || '';
            }
        },
        created() {
            this.initDomain();
        },
        components: {
            CommonTable,
            CommonSelect
        }
    };
</script>
<style scoped lang="less">
    .el-form-item{
        margin-bottom: 0;

        /deep/ .el-form-item__error--inline{
            display: block;
            text-align: left;
            margin-left: 0;
            /* word-break: break-all; */
            white-space: initial
        }
    }
    .el-table{
        .el-button{
            line-height: 23px;
            font-size: 16px;
            padding: 0;
        }
        .btn-icon_delete{
            color: #f56c6c;
        }
    }
</style>