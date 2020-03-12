<!--
 关系配置
 @Author: zhanbh
 @Date: 2019-11-08
-->
<template>
    <div class="setting" v-loading="isLoading" style="padding: 0px 0px 0px 10px">
        <el-form  class="mr10"
                  ref="form"
                  label-width="70px"
                  :model="form"
                  :rules="rules"
                  @submit.native.prevent
        >
            <div >
            <el-form-item label="行为类型">
                <el-input :value="behavior.name" disabled></el-input>
            </el-form-item>
            </div>
            <template v-for="(item,index) in form.listColumn">
                <div :class="index !=0 ? 'top':''" style="border:3px solid #BEBEBE; padding: 10px;">
                <el-row>
                <el-col :span="12">
                    <el-form-item label="数据源" :prop="`listColumn.${index}.dataSourceId`">
                        <data-source-select
                                v-model="item.dataSourceId"
                                :data-house="dataHouse"
                                @input="handleChangeDataSource(index)">
                        </data-source-select>
                    </el-form-item>
                </el-col>
                <el-col :span="10">
                    <el-form-item label-width="10px" :prop="`listColumn.${index}.dataObjId`">
                        <data-table-select
                                v-model="item.dataObjId"
                                :data-house="dataHouse"
                                :data-source-id="item.dataSourceId"
                                @input="handleChangeTable(index)">
                        </data-table-select>
                    </el-form-item>
                </el-col>
                    <el-col :span="2">
                        <el-button type="text"
                                   icon="el-icon-circle-plus"
                                   title="添加" @click.stop="handleClickAdd"
                                   :class="form.listColumn.length==1?'el-pad':''"></el-button>
                        <template v-if="form.listColumn.length>1">
                            <el-button type="text"
                                       icon="el-icon-remove"
                                       title="删除" @click.stop="handleClickDelete(index)"></el-button>
                        </template>
                    </el-col>
                </el-row>
                <common-table :columns="columns"
                              :data="listColumn[index]"
                >
                <template slot="name" slot-scope="{value, row}">
                    <span :class="{'dg-required': row.required}">{{value}}</span>
                </template>
                <template slot="field" slot-scope="{row}">
                    <el-form-item
                            :rules="row.rules"
                                  label-width="0"
                    >
                        <data-column-select
                                v-model="row.model[row.modelField]"
                                :data-house="dataHouse"
                                :data-type="row.dataType"
                                :data-table-id="item.dataObjId"
                        ></data-column-select>
                    </el-form-item>
                </template>
            </common-table>
                </div>
            </template>
        </el-form>
        <div class="tr mb2 mt20">
            <el-button size="small" @click.stop="handleClickCancel"> 取消</el-button>
            <el-button size="small" type="primary" @click.stop="handleClickSave">确定</el-button>
        </div>
    </div>
</template>
<script>
    import {DataHouse} from '@/projects/Knowledge/api/dataSourceApi';

    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import * as dataSourceComponents from '@/projects/Knowledge/components/dataSource';

    export default {
        name: "RelationSetting",
        props: {
            behavior: {
                type: Object,
                required: true
            },
            domainId: String
        },
        data() {
            return {
                form: {
                },
                columns: [
                    {label: '行为属性', prop: 'name', align: 'center'},
                    {label: '对应字段', prop: 'field', align: 'center'}
                ],
                listColumn: [[]],
                dataType:{},
                rules: {
                    dataSourceId: [ {required: true, message: '请选择数据源库', trigger: 'blur'} ],
                    dataObjId: [ {required: true, message: '请选择数据源表', trigger: 'blur'} ]
                },
                isLoading: false
            };
        },
        computed: {},
        watch: {
            behavior: {
                handler(behavior) {
                    this.initData();
                },
                immediate: true
            }
        },
        methods: {
            async reqSave(params) {
                const vm = this;
                let {data} = await vm.$axios.post('saveBehaviorConfig', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data.code !== 200) {
                    vm.$message.error(data.msg || `查询关系配置数据异常`);
                }
                return data;
            },
            async reqData(id) {
                const vm = this;
                let {data} = await vm.$axios.post('getDomainBehaviorById', id).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data.code !== 200) {
                    vm.$message.error(data.msg || `查询领域对象特征列表异常`);
                }
                return data;
            },
            async initData() {
                const vm = this;
                vm.dataHouse = new DataHouse();
                let {behavior, domainId} = vm;
                let data = {};

                if (behavior && behavior.id) {
                    let id = behavior.id;
                    vm.isLoading = true;
                    data = await vm.reqData({id});
                    if (!vm.behavior || vm.behavior.id !== id) { // 被篡位，则不交数据
                        return null;
                    }
                    vm.isLoading = false;
                }
                // 初始化表单
                vm.clearForm();
                vm.dataType=[];
                let valueList= data.result || [];
                vm.form.listColumn=[];
                let values = valueList[0];
                for (let key in values) {
                    let value = values[key];
                    if (key === 'relationId') {
                        vm.form['id'] = value;
                    } else if (key === 'inName') {
                        vm.form[key] = value;
                    } else if (key === 'outName') {
                        vm.form[key] = value;
                    }else if (key === 'siteObjName') {
                        vm.form[key] = value;
                    }else if (key==='featureDataTypeMap') {
                        for (let dataType in value) {
                            let val = value[dataType];
                            vm.dataType[dataType] = val;
                        }
                    }
                }
                for (let j=0,len=valueList.length;j<len;j++){
                    vm.initForm(valueList[j] || {},j,false);
                }
                vm.listColumn=[];
                // 初始化列表
                for (let j=0,len = this.form.listColumn.length;j<len;j++){
                    vm.initList(this.form.listColumn[j] || {},j);
                }
            },

            initForm(data = {}, index, flag) {
                const vm = this;
                let {form} = vm;
                let formItem = {};
                let filterList = ["relationId", "siteObjName", "inName", "outName", "listColumn", "featureDataTypeMap"];
                let dataList = vm.copyAttributes(data, filterList);
                for (let key in dataList) {
                    let value = data[key];
                    if (key === 'featureMap') {
                        for (let feature in value) {
                            let val = value[feature];
                            if (flag === true) {
                                formItem[feature] = '';
                            } else {
                                formItem[feature] = val;
                            }
                        }
                    } else if (key === 'cfgDataSourceId') {
                        if (flag === true) {
                            formItem['dataSourceId'] = '';
                        } else {
                            formItem['dataSourceId'] = value;
                        }
                    } else if (key === 'cfgDataObjId') {
                        if (flag === true) {
                            formItem['dataObjId'] = '';
                        } else {
                            formItem['dataObjId'] = value;
                        }
                    } else if (key != 'domainConfigMappingList' && key != 'domainFeaturesList') {
                        if (flag === true) {
                            formItem[key] = '';
                        } else {
                            formItem[key] = value;
                        }
                    }
                }
                form['listColumn'].push(formItem);
            },

            initList(data = {}) {
                const vm = this;
                let {form} = vm;
                let listColumn = [];
                if (form.outName) {
                    listColumn.push({
                        name: `实施者${ form.outName ? ` - ${form.outName}` : ''}`,
                        prop: 'outColumn',
                        required: true,
                        rules: {
                            required: true, message: '实施者不能为空', trigger: 'blur'
                        },
                        model: data,
                        modelField: 'outColumn'
                    });
                }
                if (form.inName) {
                    listColumn.push({
                        name: `承受者${ form.inName ? ` - ${form.inName}` : ''}`,
                        prop: 'inColumn',
                        required: true,
                        rules: {
                            required: true, message: '承受者不能为空', trigger: 'blur'
                        },
                        model: data,
                        modelField: 'inColumn'
                    });
                }
                if (form.siteName) {
                    listColumn.push({
                        name: `发生地理位置${form.siteName ? ` - ${form.siteName}` : ''}`,
                        prop: 'siteObjColumn',
                        model: data,
                        modelField: 'siteObjColumn'
                    });
                }

                listColumn.push({ name: `开始时间`, model: data, modelField: 'startTimeColumn' });
                listColumn.push({ name: `结束时间`, model: data, modelField: 'endTimeColumn' });
                let filterList = ["id", "startTimeColumn", "endTimeColumn", "inColumn", "outColumn", "siteObjColumn", "dataObjId", "dataSourceId","featureDataTypeMap"];
                let dataList = vm.copyAttributes(data, filterList);
                for (let value in dataList) {
                    listColumn.push({name: value, model: data, modelField: value, dataType: vm.dataType[value]});
                }
                vm.listColumn.push(listColumn);
            },

            copyAttributes(data = {}, valueList = []) {
                let dataList = {};
                for (let value in data) {
                    dataList[value] = data[value];
                }
                for (let value in valueList) {
                    delete dataList[valueList[value]];
                }
                return dataList;
            },

            /**
             * 将数据源表名重置
             * @param dataSourceId
             */
            handleChangeDataSource(index) {
                const vm = this;
                let { form } = vm;
                form.listColumn[index].dataObjId = '';
                vm.handleChangeTable(index);
            },
            /**
             * 将字段相关数据重置
             * @param dataSourceId
             */
            handleChangeTable(index) {
                const vm = this;
                let { form } = vm;
                let listColumn =  form.listColumn[index];
                for (let item in listColumn){
                    if (item != 'id' && item!='dataSourceId'&& item!='dataObjId') {
                        listColumn[item]='';
                    }
                }
            },
            handleClickCancel() {
                this.$emit('cancel')
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let params = JSON.parse(JSON.stringify(vm.form));
                        vm.isLoading = true;
                        let data = await vm.reqSave(params);
                        vm.isLoading = false;
                        if (data.code === 200) {
                            vm.$message.success('保存关系配置成功');
                            vm.$emit('saved', params);
                        }
                    }
                })
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].clearValidate();
                }
            },
            handleClickAdd() {
                const vm = this;
                let listColumn = vm.form.listColumn;
                let valueList = vm.listColumn;
                vm.initForm(listColumn[0], listColumn.length, true);
                vm.initList(vm.form.listColumn[listColumn.length-1], valueList.length)
            },
            handleClickDelete(index) {
                const vm = this;
                let dataSourceId = vm.form.listColumn[index].dataSourceId;
                if (dataSourceId != null && dataSourceId.trim().length != 0 ) {
                    vm.$confirm('是否删除整个数据源的值?', '提示', {
                        confirmButtonText: '是',
                        cancelButtonText: '否',
                        type: 'warning'
                    }).then(() => {
                        this.delete(index);
                    }).catch(() => {
                    });
                } else {
                    this.delete(index);
                }
            },
            delete(index){
                const vm = this;
                vm.form.listColumn.splice(index,1);
                vm.listColumn.splice(index,1);
            }
        },
        activated() {
            this.initData();
        },
        components: {
            CommonTable,
            ...dataSourceComponents
        }
    };
</script>
<style scoped>
    .el-form {
        max-height: calc(90vh - 226px);
        overflow: auto;
    }
    .el-table .el-form-item{
        margin: 0;
    }
    .dg-required::before{
        content: '*';
        color: #F56C6C;
        margin-right: 4px;
    }
    .top{
        margin-top: 25px;
    }
    .el-pad{
        padding: 13px 15px;
    }
</style>