<template>
    <div class="feature-list-view">
        <div class="ovh">
            <div class="fl mb10 mr15 lh40">
                <el-button type="primary" size="small"
                           @click.stop="ExcelInput"
                           :disabled="!behavior || !domainId"
                >Excel导入行为</el-button>
                <el-button type="primary" size="small"
                           @click.stop="RdbInput()"
                           :disabled="!behavior"
                >库导入</el-button>
                <el-button type="primary"
                           size="small"
                           :disabled="!behavior || !domainId"
                           @click.stop="handleClickRelateTo"
                >关联特征</el-button>
            </div>
            <el-form :inline="true" :model="form" class="fl" @submit.native.prevent>
                <el-form-item>
                    <el-input v-model.trim="form.name"
                              placeholder="领域对象或领域行为"
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

        <el-dialog
                :title="editDialog.title"
                :visible.sync="editDialog.visible"
                :close-on-click-modal="false"
                top="10vh"
                append-to-body
                width="650px"
        >
            <transition name="el-fade-in-linear">
                <keep-alive>
                    <relate-feature v-if="editDialog.visible"
                                    :behavior="editDialog.data"
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
                             :behavior="settingDialog.data"
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
                width="620px">
            <transition name="el-fade-in-linear">
                <el-form class="search-btn">
                    <el-upload class="upload-demo" ref="upload"
                               action="doUpload"
                               :limit="1"
                               :before-upload="beforeUpload">
                        <el-button slot="trigger" size="small" type="primary" class="tr mb2 mt20">选取文件</el-button>
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
                width="620px"
                >
            <keep-alive>
                <dbInput v-if="rdbData.rdbDialog"
                         :behavior="rdbData.data"
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
    import BehaviorMenu from './components/BehaviorMenu'
    import CommonDialog from '@/projects/Knowledge/components/CommonDialog'
    export default {
        name: "BehaviorFeatureList",
        props: {
            behavior: Object,
            domainId: String
        },
        data() {
            return {
                form: {
                    name: ''
                },
                list: [],
                columns: [
                    {
                        type: 'index',
                        label: '序号',
                        align: 'center',
                        fixed: 'left'
                    }, {
                        prop: 'name',
                        label: '行为类型',
                        align: 'center'
                    }, {
                        prop: 'activeObjName',
                        label: '行为实施对象',
                        align: 'center'
                    }, {
                        prop: 'passiveObjName',
                        label: '行为承受对象',
                        align: 'center'
                    }, {
                        prop: 'siteObjName',
                        label: '发生地理位置',
                        align: 'center'
                    }, {
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
                    isabled :true,
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
                    const vm = this;
                    vm.clearForm();
                    vm.initData();
                },
                immediate: true
            },
            behavior() {
                const vm = this;
                vm.clearForm();
                vm.initData();
            }
        },
        methods: {
            async reqList(params) {
                const vm = this;
                let {data} = await vm.$axios.post('getDomainBehaviorByLike', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data.code !== 200) {
                    vm.$message.error(data.msg || `查询领域对象特征列表异常`);
                }
                return data;
            },
            async initData() {
                const vm = this;
                vm.listVersion++;
                let version = vm.listVersion;
                vm.isLoading = true;

                let {form, behavior, domainId} = vm;
                let data = {};
                if (vm.domainId) {
                    let params = Object.assign({domainId}, form);
                    if (behavior) {
                        params.id = behavior.id;
                    }
                    data = await vm.reqList(params);
                }
                if (version === vm.listVersion) {
                    vm.isLoading = false;
                    let list = data.domainBehaviorVoList || [];
                    list.forEach((item, index) => {
                        list[index] = {
                            id: item.id,
                            name: item.name,
                            activeObjName: item.activeObj && item.activeObj.name,
                            passiveObjName: item.passiveObj && item.passiveObj.name,
                            siteObjName: item.siteObj && item.siteObj.name,
                        }
                    });
                    vm.list = list;
                }
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].resetFields();
                }
            },
            handleClickRelateTo() {
                const {editDialog, behavior} = this;
                editDialog.visible = true;
                editDialog.title = '领域行为关联特征';
                editDialog.data = behavior;
            },
            handleFeatureSaved() {
                const vm = this;
                let {editDialog} = vm;
                editDialog.visible = false;
                vm.initData();
            },
            handleClickSetting(data) {
                const {settingDialog} = this;
                settingDialog.visible = true;
                settingDialog.title = '行为配置';
                settingDialog.data = data;
            },
            handleClickSearch() {
                this.initData();
            },
            ExcelInput() {
                const {excelIn, behavior} = this;

                excelIn.ExcelName = null;
                excelIn.data = behavior;
                excelIn.excelDialog = true;
                excelIn.title = 'Excel导入--' + behavior.name;
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
            async submitUpload(excelIn, domainId) {
                this.excelIn.isDisable=true;
                this.isLoading = true;
                if (this.excelIn.ExcelName == "" || this.excelIn.ExcelName == null) {
                    this.$message.warning('请选择要上传的文件！')
                    return false
                }
                let fileFormData = new FormData();
                fileFormData.append('file', this.files, this.excelIn.ExcelName);
                let requestConfig = {
                    headers: {'Content-Type': 'multipart/form-data'},
                };
                let parentId = excelIn.data.id;
                let {data} = await this.$axios.post('batchAddBehavior', fileFormData, {
                    params: {
                        parentId: parentId,
                        domainId: domainId
                    }
                }, requestConfig).catch((error) => {
                    this.isLoading = false;
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
                    //this.$message.success('保存成功--'+'总数'+data.result.countSize+'条--新增'+data.result.countSuccess+'条--失败'+data.result.countFailure+'条');
                    this.$message.success(data.result);

                } else {
                    this.isLoading=false;
                    this.$message.error(data.msg)
                }
            },
            RdbInput() {
                const {rdbData, behavior} = this;
                rdbData.data = behavior;
                rdbData.rdbDialog = true;
                rdbData.title = '库导入--' + behavior.name;
            },
            reqDbInput(){
                this.rdbData.rdbDialog = false;
                this.$emit('dbInput');
            },
            async download(){
                window.location.href=this.$axios.defaults.baseURL+"/downloadFile";
                this.$message.success("下载成功！");
            },
        },
        created() {
        },
        components: {
            CommonTable,
            RelateFeature,
            Setting,
            DbInput,
            BehaviorMenu,
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