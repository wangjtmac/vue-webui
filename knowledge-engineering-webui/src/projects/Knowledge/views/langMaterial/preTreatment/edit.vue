<!--
 语料预处理编辑页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="pre-treatment-edit" v-loading="isLoading">
        <el-form ref="form"
                 label-width="120px"
                 :model="form"
                 :rules="rules"
                 @submit.native.prevent>
            <el-form-item label="文本处理描述" prop="desc">
                <el-input v-model="form.desc"
                          placeholder="请输入文本处理描述"
                          maxlength="20"
                          show-word-limit
                ></el-input>
            </el-form-item>
            <el-form-item label="处理类别" prop="type">
                <common-select v-model="form.type"
                               placeholder="请选择处理类别"
                               :data="treatType.data"
                               :props="treatType.props"
                               :loading="treatType.isLoading">
                </common-select>
            </el-form-item>

            <el-form-item label="所属领域" prop="domain">
                <common-select v-model="form.domain"
                               placeholder="请选择所属领域"
                               :data="domain.data"
                               :props="domain.props"
                               :loading="domain.isLoading">
                </common-select>
            </el-form-item>

            <el-form-item label="存储库" prop="dataSource" v-if="!form.dataSource" >
                <data-source-select
                        placeholder="请选择存储库"
                        v-model="form.dataSource"
                        :data-house="dataHouse"
                        ref="dataSource"
                        @input="handleChangeDataSource"
                        @loading="sourceLoading = $event">
                </data-source-select>
            </el-form-item>
            <el-form-item label="是否新建表:" prop="isCreate"  v-if="!form.dataSource" >
                <el-radio-group v-model="form.isCreate">
                    <el-radio :label="1">是</el-radio>
                    <el-radio :label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="存储表" prop="dataTable" v-if="!form.dataSource" >
                <data-table-select
                        v-if="form.isCreate==0"
                        v-model="form.dataTable"
                        placeholder="请选择存储库表"
                        :data-house="dataHouse"
                        ref="dataSource"
                        :data-source-id="form.dataSource"
                        @loading="tableLoading = $event"
                        >
                </data-table-select>
                <el-input
                        v-else
                         v-model="form.dataTableName"
                          placeholder="请输入存储表名"
                          maxlength="20"
                          show-word-limit
                ></el-input>
            </el-form-item >

        </el-form>
        <div class="edit-btns">
            <el-button size="small" @click.stop="handleClickCancel">取消</el-button>
            <el-button size="small"
                       type="primary"
                       @click.stop="handleClickSave"
                       :loading="preSchemeVo.isLoading">确定</el-button>
        </div>
    </div>
</template>
<script>
    import { DataHouse } from '@/projects/Knowledge/api/dataSourceApi';
    import * as domainApi from '@/projects/Knowledge/api/domainApi';
    import * as preTreatmentApi from '@/projects/Knowledge/api/preTreatmentApi';

    import CommonSelect from '@/projects/Knowledge/components/CommonSelect'
    import { DataSourceSelect, DataTableSelect } from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "preTreatmentEdit",
        props: {
            data: Object,
        },
        data() {
            return {
                form: {
                    id: '',
                    desc: '',
                    type: '',
                    domain: '',
                    dataSource: '',
                    isCreate: '0',
                    dataTable: '',
                    dataTableName:''
                },
                rules: {
                    desc: [
                        { required: true, message: '请输入文本处理描述', trigger: 'blur' },
                        { max: 50, message: '不能超过50个字符', trigger: 'blur' }
                    ],
                    type: [
                        { required: true, message: '请选择处理类别', trigger: 'blur' },
                    ],
                    domain: [
                        { required: true, message: '请选择所属领域', trigger: 'blur' },
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
                preSchemeVo: {
                    domainVo:{
                        id: '',
                        name:''
                    },
                    handleType:'',
                    textName:'',
                    dataSourceId:'',
                    dataObjId:'',
                    dataSourceName:'',
                    tableName:'',
                    operateTime:'',
                    isCreateTable:false,
                    isLoading: false,
                },
                dataHouse: new DataHouse(),
                domain: {
                    isLoading: false,
                    data: [],
                    reqCode: '',
                    props: {
                        value: 'id',
                        label: 'name'
                    },
                },
                treatType: {
                    isLoading: false,
                    data: [{
                        id: 1,
                        name: '训练语料'
                    }, {
                        id: 2,
                        name: '词网构建'
                    }],
                    reqCode: '',
                    props: {
                        value: 'id',
                        label: 'name'
                    },
                },
                sourceLoading: false,
                tableLoading: false,
            };
        },
        computed:{
            isAdd() {
                let {data} = this;
                return !data || (!data.id && data.id !== 0);
            },
            isLoading() {
                const vm = this;
                return vm.treatType.isLoading || vm.domain.isLoading || vm.sourceLoading || vm.tableLoading || vm.preSchemeVo.isLoading;
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
                vm.clearForm();
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
                let { preSchemeVo } = vm;
                preSchemeVo.isLoading = true;
                debugger
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        vm.preSchemeVo.textName =  vm.form.desc ;
                        vm.preSchemeVo.handleType =  vm.form.type ;
                        vm.preSchemeVo.dataSourceId =  vm.form.dataSource ;
                        vm.preSchemeVo.dataObjId =  vm.form.dataTable ;
                        vm.preSchemeVo.tableName =  vm.form.dataTableName ;
                        vm.preSchemeVo.domainVo.id =  vm.form.domain ;
                        if(vm.form.isCreate == 1 ){
                            vm.preSchemeVo.isCreateTable = true;
                        }
                        let success = false;
                        if (vm.isAdd) {
                            success =  await preTreatmentApi.addCorpusPreScheme(vm.preSchemeVo);
                            preSchemeVo.isLoading = false;
                            if (success) {
                                vm.$emit('preScheme_saved', vm.form);
                                this.$message.success("保存成功");
                            }else  this.$message.error(success.msg);
                        } else {
                            vm.preSchemeVo.id =  vm.form.id ;
                            success =  await preTreatmentApi.updateCorpusPreScheme(vm.preSchemeVo);
                            preSchemeVo.isLoading = false
                            if (success) {
                                vm.$emit('preScheme_saved', vm.form);
                                this.$message.success("修改成功");
                            }else this.$message.error(success.msg);
                        }
                    }
                });
            },
            handleClickCancel() {
                this.$emit('cancel');
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].resetFields();
                }
            }
        },
        created() {
          this.initConstant();
        },
        activated() {
            const vm = this;
            vm.initForm(vm.data);
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

    .edit-btns {
        text-align: right;
    }
</style>