<template>
    <div class="feature-list-view" v-loading="isLoading">
        <div class="ovh">
            <div class="fl mb10 mr15 lh40">
                <el-button type="primary" size="small"
                           @click.stop="ExcelInput"
                           :disabled="!object"
                            >Excel导入对象</el-button>
                <el-button type="primary"
                           size="small"
                           :disabled="!object"
                           @click.stop="handleClickRelateTo"
                >关联特征</el-button>
            </div>
            <el-form :inline="true" ref="form" :model="form" class="fl" @submit.native.prevent>
                <el-form-item v-for="item in selectList"
                              :key="item.field"
                              :prop="item.field">
                    <el-select v-model="form[item.field]"
                               :key="item.field"
                               filterable
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
                <el-form-item  prop="key">
                    <el-autocomplete
                            v-model.trim="form.key"
                            :fetch-suggestions="querySearchAsync"
                            placeholder="特征"
                            @keyup.native.enter="handleClickSearch"
                    ></el-autocomplete>
                </el-form-item>
                <el-form-item class="search-btn">
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
        >
            <span slot="header-dataBaseType"
                  slot-scope="{column}"
                  class="nowrap"
            >
                {{column.label}}
                <i class="ce_link f16"
                   v-show="list.length > 0"
                   :class="isEditingBaseType ? 'el-icon-finished' : 'el-icon-edit-outline'"
                   :title="isEditingBaseType ? '保存' : '编辑'"
                   @click.stop="handleClickEditBaseType"
                ></i>
            </span>
            <template slot="dataBaseType" slot-scope="{value, row}">
                <template v-if="isEditingBaseType">
                    <el-select v-model="row.dataBaseType.code"
                               size="mini"
                               filterable
                               placeholder="请选择基础数据类型"
                    >
                        <el-option v-for="option in optionMap.dataBaseType"
                                   :key="option.code"
                                   :label="option.name"
                                   :value="option.code">
                        </el-option>
                    </el-select>
                </template>
                <template v-else>{{value.name}}</template>
            </template>
            <template slot="operations" slot-scope="{row}">
                <el-dropdown trigger="click"
                             placement="bottom"
                             @command="handleCommand($event, row)">
                    <i class="icon icon-system ce_link f16" title="特征配置"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                                v-for="way in ways"
                                :key="way.name"
                                :command="way">
                            <span class="mr5">{{way.name}}</span>
                            <el-popover
                                    v-if="way.desc"
                                    class="menu__question"
                                    placement="top"
                                    trigger="hover"
                                    :content="way.desc" @click.native.stop>
                                <i slot="reference" class="ce_link f16 el-icon-question"></i>
                            </el-popover>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>
        </common-table>

        <common-dialog
                :title="edit.title"
                :visible.sync="edit.dialogVisible"
                width="650px">
            <relate-feature
                    v-if="edit.dialogVisible"
                    :object="edit.data"
                    :domain-id="domainId"
                    :dic-map="optionMap"
                    @saved="handleFeatureSaved"
                    @cancel="edit.dialogVisible = false">
            </relate-feature>
        </common-dialog>

        <common-dialog
                :title="calcDialog.title"
                :visible.sync="calcDialog.visible"
                :width="calcDialog.width">
            <component v-if="calcDialog.visible"
                       :is="calcDialog.component"
                       :data="calcDialog.data"
                       :domain-id="domainId"
                       @cancel="calcDialog.visible = false"
                       @saved="handleCalcSaved">
            </component>
        </common-dialog>

        <common-dialog
                :title="excelIn.title"
                :visible.sync="excelIn.excelDialog"
                width="620px">
                <el-form class="search-btn">
                    <el-upload class="upload-demo" ref="upload"
                               action="doUpload"
                               :limit="1"
                               :before-upload="beforeUpload">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <el-button size="small" type="success" @click="download()" >
                            下载模板
                        </el-button>
                        <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过1MB</div>
                    </el-upload>
                    <el-input v-model="excelIn.ExcelName"
                              placeholder="选择导入的文件"
                              clearable
                              @cancel="excelIn.excelDialog = false"
                              :disabled="excelIn.isabled"
                             >
                    </el-input>
                    <div class="tr mb2 mt20" style="text-align: center">
                        <el-button @click="excelIn.excelDialog = false">取消</el-button>
                        <el-button type="primary" @click="submitUpload(excelIn,domainId)"
                                   :disabled="excelIn.isDisable"
                                   v-loading="isLoading">确定</el-button>
                    </div>

            </el-form>
        </common-dialog>
    </div>
</template>

<script>
    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'
    import RelateFeature from './RelateFeature'
    import OfflineCalc from './valueCalculators/OfflineCalc'
    import DatabaseImport from './valueCalculators/DatabaseImport'
    import ObjectMenu from './components/ObjectMenu'
    import { getObjFeatureName } from '@/projects/Knowledge/api/featureApi';


    export default {
        name: 'ObjectFeatureList',
        props: {
            object: Object,
            domainId: String
        },
        data() {
            return {
                restaurants: [],
                timeout:  null,
                form: {
                    standardType: '',
                    statusType: '',
                    featuresValType: '',
                    dataLevelType: '',
                    key: ''
                },
                list: [],
                columns: [ // 列表列配置
                    {
                        type: 'index',
                        label: '序号',
                        align: 'center',
                        fixed: 'left'
                    },
                    {
                        prop: 'objName',
                        label: '领域对象',
                        align: 'center'
                    },
                    {
                        prop: 'featuresName',
                        label: '特征项',
                        align: 'center'
                    },
                    {
                        prop: 'featureType',
                        label: '特征类型',
                        align: 'center'
                    },
                    {
                        prop: 'dataLevel',
                        label: '数据等级',
                        align: 'center'
                    },
                    {
                        prop: 'dataBaseType',
                        label: '数据基础类型',
                        align: 'center',
                        'min-width': '90'
                    },
                    {
                        prop: 'dataType',
                        label: '数据类型',
                        align: 'center'
                    },
                    /*{
                        prop: 'status',
                        label: '状态',
                        align: 'center'
                    },*/
                    {
                        prop: 'operations',
                        label: '操作',
                        width: '80',
                        align: 'center',
                        fixed: 'right'
                    }
                ],
                ways: [
                    { name: '数据库导入', desc: '通过数据库直接导入原始特征', code: 0, component: 'DatabaseImport', width: '650px' },
                    { name: '离线计算', desc: '简单定义规则，由后台离线计算生成',code: 1, component: 'OfflineCalc', width: '900px' },
                    //{ name: '流式计算', desc: '定义复杂行为规则，由后台流式计算生成',code: 2 },
                    //{ name: '模型计算', desc: '通过构建机器学习模型完成特征提取',code: 3 }
                ],
                selectList: [
                    {
                        field: 'dataLevelType',
                        placeholder: '数据等级',
                        clearable: true,
                        options: 'dataLevel'
                    },
                    {
                        field: 'standardType',
                        placeholder: '数据类型',
                        clearable: true,
                        options: 'dataType'
                    },
                    {
                        field: 'featuresValType',
                        placeholder: '数据基础类型',
                        clearable: true,
                        options: 'dataBaseType'
                    },
                    /*{
                        field: 'statusType',
                        placeholder: '状态',
                        clearable: true,
                        options: 'statusType'
                    }*/
                ], // 搜索下拉框配置
                edit: {
                    title: '',
                    dialogVisible: false,
                    data: null
                }, // 编辑弹窗配置
                excelIn:{
                  ExcelName:'',
                  title:'',
                  excelDialog:false,
                  data:null,
                  width: '',
                  isabled:true,
                  isDisable:true

                },
                calcDialog: {
                    title: '',
                    visible: false,
                    component: '',
                    width: '',
                    data: null
                },
                optionMap: {
                    dataType: [],
                    dataBaseType: [],
                    dataLevel: [],
                    statusType: []
                }, // 字典数据
                listVersion: 0, // 防止后面的请求先返回
                isEditingBaseType: false,
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
            object() {
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
            async reqList() {
                const vm = this;
                vm.listVersion ++;
                let {object, domainId} = vm;
                if (!domainId) {
                    vm.list = [];
                } else {
                    let params = {domainId};
                    if (object) {
                        params.domainObjIdList = [object.id];
                    }
                    params.conditionVo = Object.assign({}, vm.form);
                    let version = vm.listVersion;
                    vm.isLoading = true;
                    let {data} = await vm.$axios.post('selectDomainObj', params).catch((error) => {
                        return {data: {msg: '服务器异常，请联系管理员'}};
                    });
                    if (version === vm.listVersion) {
                        vm.isLoading = false;
                        let list = [];
                        if (data.code === 200) {
                            list = data.result || [];
                        } else {
                            vm.$message.error(data.msg || `查询领域对象特征列表异常`);
                        }
                        vm.list = list;
                        vm.restaurants=[];
                        let obj = {};
                        for (let value in vm.list) {
                            obj[vm.list[value].name] = {"value": vm.list[value].name};
                        }
                        vm.restaurants = Object.values(obj);
                    }
                }
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
            async reqUpdateDataBaseType(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('updateObjFeature', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    vm.$message.success('修改数据基础类型成功');
                    return true;
                } else {
                    vm.$message.error(data.msg || `修改数据基础类型异常`);
                    return false;
                }
            },
            async saveChangedDataBaseType() {
                const vm = this;
                let codeNameMap = {};
                vm.optionMap.dataBaseType.forEach(item => codeNameMap[item.code] = item.name);
                let changedList = [];
                let toTakeEffect = [];
                vm.list.forEach(item => {
                    let type = item.dataBaseType;
                    if (type.name !== codeNameMap[type.code]) { // 有做修改
                        toTakeEffect.push({typeObj: type, newName: codeNameMap[type.code]});
                        changedList.push({
                            id: item.id,
                            dataBaseType: {code: type.code}
                        })
                    }
                });
                if (changedList.length > 0) {
                    let success = await vm.reqUpdateDataBaseType({objFeatureList: changedList});
                    if (success) {
                        toTakeEffect.forEach(item => {
                            item.typeObj.name = item.newName
                        });
                        vm.isEditingBaseType = false;
                    };
                } else {
                    vm.isEditingBaseType = false;
                }
            },
            initDic() {
                const vm = this;
                vm.reqDic('getEnumDomainDataLevelType', 'dataLevel', '数据等级');
                vm.reqDic('getEnumDomainStandardType', 'dataType', '数据类型');
                vm.reqDic('getEnumDomainFeaturesValType', 'dataBaseType', '数据基础类型');
                vm.reqDic('getEnumDomainStatusType', 'statusType', '状态类型');
            },
            initData() {
                const vm = this;
                vm.$refs.form && vm.$refs.form.resetFields();
                vm.isEditingBaseType = false;
                vm.reqList();
            },
            handleClickRelateTo() {
                const {edit, object} = this;
                edit.dialogVisible = true;
                edit.title = '领域对象关联特征';
                edit.data = object;
            },
            handleClickSetting(data){

            },
            handleFeatureSaved() {
                const vm = this;
                let {edit} = vm;
                edit.dialogVisible = false;
                vm.reqList();
            },

            handleCalcSaved() {
                const vm = this;
                let {calcDialog} = vm;
                calcDialog.visible = false;
                vm.reqList();
            },
            /**
             * 关闭时要把数据设为空，才会刷新组件展示，保证下次展开时新的
             **/
            handleClosedDialog() {
                this.edit.data = null;
            },
            handleClickSearch() {
                this.reqList();
            },
            /**
             * 切换数据基础类型编辑状态
             * @returns {Promise<boolean>}
             */
             handleClickEditBaseType() {
                const vm = this;
                if (vm.isLoading) {
                    return false;
                }
                let doneEdit = vm.isEditingBaseType === true;
                if (doneEdit) {
                    vm.saveChangedDataBaseType();
                } else {
                    vm.isEditingBaseType = true;
                }
            },
            handleCommand(data, row) {
                const vm = this;
                let {calcDialog} = vm;

                calcDialog.title = `${data.name}特征-${row.featuresName || ''}`;
                calcDialog.visible = true;
                calcDialog.component = data.component;
                calcDialog.width = data.width;
                calcDialog.data = row;
            },
            ExcelInput() {
                const {excelIn,object} = this;
                excelIn.ExcelName = null;
                excelIn.data = object;
                excelIn.excelDialog = true;
                excelIn.title = 'Excel导入';
            },
            handleClickReset() {
                const vm = this;
                let { form: formVm } = vm.$refs;
                formVm && formVm.resetFields();
            },
            beforeUpload(file) {
                this.excelIn.isDisable=false;
                this.files = file;
                const extension = file.name.split('.')[file.name.split('.').length-1] === 'xls'
                const extension2 = file.name.split('.')[file.name.split('.').length-1] === 'xlsx'
                const isLt2M = file.size / 1024 / 1024 < 1
                if (!extension && !extension2) {
                    this.$message.warning('上传模板只能是 xls、xlsx格式!')
                    return false

                }
                if (!isLt2M) {
                    this.$message.warning('上传模板大小不能超过 1MB!')
                    return false
                }
                this.excelIn.ExcelName = file.name;
                this.excelIn.isabled = true;
                return false // 返回false不会自动上传

            },
            async  submitUpload(excelIn,domainId) {
                this.excelIn.isDisable=true;
                this.isLoading=true;
                if(this.excelIn.ExcelName == ""||this.excelIn.ExcelName==null){
                    this.$message.warning('请选择要上传的文件！')
                    return false
                }
                let fileFormData = new FormData();
                fileFormData.append('file', this.files, this.excelIn.ExcelName);
                let requestConfig = {
                    headers: { 'Content-Type': 'multipart/form-data' },
                };
                let parentId = excelIn.data.id;
                let{data} = await this.$axios.post('batchAddObj', fileFormData,{
                    params: {
                        parentId: parentId,
                        domainId: domainId
                    }
                }, requestConfig).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data && data.code === 200) {
                    this.$message({
                        message: '操作成功',
                        type: 'success',
                    })
                    this.excelIn.excelDialog = false;
                    this.isLoading=false;
                    this.$emit('excel-input');
                    this.$message.success(data.result);
                } else {
                    this.isLoading=false;
                    this.$message.error(data.msg)
                }
            },
            async download(){
                window.location.href=this.$axios.defaults.baseURL+"/downloadFile";
                this.$message.success("下载成功！");
            },
        },
        created() {
            this.initDic();
        },
        components: {
            CommonTable,
            CommonDialog,
            RelateFeature,
            OfflineCalc,
            DatabaseImport,
            ObjectMenu
        }
    }
</script>

<style scoped lang="less">
    .el-form-item:not(.search-btn){
        max-width: 200px;
        min-width: 130px;
        width: 10vw;
        margin-bottom: 10px;
    }
    .menu__question{
        position: absolute;
        right: 3px;
    }
</style>