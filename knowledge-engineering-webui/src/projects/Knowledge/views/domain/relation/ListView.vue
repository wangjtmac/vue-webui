<template>
    <div class="feature-list-view" v-loading="isLoading">
        <div class="ovh">
            <div class="fl mb10 mr15 lh40">
                <el-button type="primary" size="small"
                           @click.stop="ExcelInput"
                           :disabled="!relation"
                >Excel导入关系</el-button>
                <el-button type="primary" size="small"
                           @click.stop="RdbInput()"
                           :disabled="!relation"
                >库导入</el-button>
                <el-button type="primary"
                           size="small"
                           :disabled="!relation"
                           @click.stop="handleClickRelateTo"
                >关联特征</el-button>
            </div>
            <el-form :inline="true" :model="form" class="fl" @submit.native.prevent>
                <el-form-item>
                    <el-input v-model.trim="form.key"
                              placeholder="领域对象或领域关系"
                              clearable
                              @keyup.native.enter="handleClickSearch"
                    ></el-input>
                </el-form-item>
                <el-form-item class="search-btn">
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
            <template slot="operations" slot-scope="scope">
                <i class="icon ce_link pl5 pr5 f18"
                   v-for="(opt , index) in operations"
                   v-html="opt.icon"
                   v-show="opt.filter ? opt.filter(scope.row) : true"
                   :key="index"
                   :title="opt.title"
                   :style="{color: opt.color}"
                   @click="opt.handler(scope.row)"
                ></i>
            </template>
        </common-table>

        <el-dialog
                :title="editDialog.title"
                :visible.sync="editDialog.visible"
                :close-on-click-modal="false"
                top="10vh"
                append-to-body
                width="620px"
        >
            <transition name="el-fade-in-linear">
                <keep-alive>
                    <relate-feature v-if="editDialog.visible"
                                    :relation="editDialog.data"
                                    :domain-id="domainId"
                                    @saved="handleFeatureSaved"
                                    @cancel="editDialog.visible = false"
                    ></relate-feature>
                </keep-alive>
            </transition>
        </el-dialog>
        <el-dialog
                :title="settingDialog.title"
                :visible.sync="settingDialog.visible"
                :close-on-click-modal="false"
                top="10vh"
                append-to-body
                width="620px"
        >
            <transition name="el-fade-in-linear">
                <keep-alive>
                    <setting v-if="settingDialog.visible"
                             :relation="settingDialog.data"
                             :domain-id="domainId"
                             @cancel="settingDialog.visible = false"
                             @saved="settingDialog.visible = false"
                    ></setting>
                </keep-alive>
            </transition>
        </el-dialog>
        <el-dialog
                :title="excelIn.title"
                :visible.sync="excelIn.excelDialog"
                :close-on-click-modal="false"
                top="20vh"
                append-to-body
                width="620px"
        >
            <transition name="el-fade-in-linear">
                <el-form class="search-btn">
                    <el-upload class="upload-demo" ref="upload"
                               action="doUpload"
                               :limit="1"
                               :before-upload="beforeUpload">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                        <el-button size="small" type="success" @click="download()" >
                            下载模板
                        </el-button>
                        <span slot="tip" class="el-upload__tip">只能上传excel文件，且不超过1MB</span>
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
            </transition>
        </el-dialog>
        <common-dialog
                :title="rdbData.title"
                :visible.sync="rdbData.rdbDialog"
                width="620px">
            <keep-alive>
                <dbInput v-if="rdbData.rdbDialog"
                         :relation="rdbData.data"
                         :domain-id="domainId"
                         ref="rdbData"
                         @cancel="rdbData.rdbDialog = false"
                         @dbInput-save="reqDbInput()"
                ></dbInput>
            </keep-alive>
        </common-dialog>
    </div>
</template>

<script>
    import CommonTable from '@/projects/Knowledge/components/CommonTable'
    import RelateFeature from './RelateFeature'
    import Setting from './Setting'
    import DbInput from './DbInput'
    import RelationMenu from './components/RelationMenu'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'

    export default {
        name: "RelationFeatureList",
        props: {
            relation: Object,
            domainId: String
        },
        data() {
            return {
                form: {
                    key: ''
                },
                list: [],
                columns: [
                    {
                        type: 'index',
                        label: '序号',
                        align: 'center',
                        fixed: 'left'
                    }, {
                        prop: 'outName',
                        label: '左顶点(出)',
                        align: 'center'
                    },{
                        prop: 'name',
                        label: '领域关系',
                        align: 'center'
                    },  {
                        prop: 'inName',
                        label: '右顶点(入)',
                        align: 'center',
                    }/*,{
                        prop: 'isReverse',
                        translator: val => val.value || '未知',
                        label: '对应逆向领域关系',
                        align: 'center',
                    }*/, {
                        prop: 'operations',
                        label: '操作',
                        width: '80',
                        align: 'center',
                        fixed: 'right'
                    }
                ],
                operations: [
                    {
                        title: '配置',
                        handler: this.handleClickSetting,
                        icon: '&#xe656;',
                    }
                ],
                editDialog: {
                    title: '',
                    visible: false,
                    data: null
                },
                settingDialog: {
                    title: '',
                    visible: false,
                    data: null
                },
                excelIn:{
                    ExcelName:'',
                    title:'',
                    excelDialog:false,
                    data:null,
                    width: '',
                    isabled:true,
                    isDisable:true
                },
                rdbData:{
                    title:'',
                    rdbDialog:false,
                    data:null,
                    width: ''
                },
                listVersion: 0,
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
            relation() {
                this.initData();
            }
        },
        methods: {
            async reqList() {
                const vm = this;
                let {form, relation, domainId} = vm;
                let params = Object.assign({domainId}, form);
                if (relation) {
                    params.domainObjIdList = [relation.id];
                }
                vm.listVersion ++;
                let version = vm.listVersion;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('queryDomainObjRelationTyList', params).catch((error) => {
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
                }
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
            handleClickRelateTo() {
                const {editDialog, relation} = this;
                editDialog.visible = true;
                editDialog.title = '领域关系关联特征';
                editDialog.data = relation;
            },
            handleFeatureSaved() {
                const vm = this;
                let {editDialog} = vm;
                editDialog.visible = false;
                vm.reqList();
            },
            handleClickSetting(data){
                const {settingDialog} = this;
                settingDialog.visible = true;
                settingDialog.title = '关系配置';
                settingDialog.data = data;
            },
            handleClickSearch() {
                this.reqList();
            },
            ExcelInput() {
                const {excelIn, relation} = this;
                excelIn.data = relation;
                excelIn.ExcelName = null;
                excelIn.excelDialog = true;
                excelIn.title = 'Excel导入--'+relation.name;
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
                let{data} = await this.$axios.post('batchAddRelationType', fileFormData,{
                    params: {
                        parentId: parentId,
                        domainId: domainId
                    }
                }, requestConfig).catch((error) => {
                    vm.isLoading=false;
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data && data.code === 200) {
                    this.isLoading=false;
                    this.excelIn.excelDialog = false
                    this.$emit('excel-input');
                    this.$message.success(data.result);
                } else {
                    this.isLoading=false;
                    this.$message.error(data.msg)
                }
            },
            RdbInput(){
                const {rdbData, relation} = this;
                rdbData.data = relation;
                rdbData.rdbDialog = true;
                rdbData.title = '库导入--'+relation.name;
            },
            reqDbInput(){
                this.rdbData.rdbDialog = false
                this.$emit('dbInput');
            },
            async download(){
                window.location.href=this.$axios.defaults.baseURL+"/downloadFile";
                this.$message.success("下载成功！");
            },
        },
        created() {
            this.initData();
        },
        activated() {
            const vm = this;
            vm.initData();
        },
        components: {
            CommonTable,
            RelateFeature,
            Setting,
            DbInput,
            RelationMenu,
            CommonDialog
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