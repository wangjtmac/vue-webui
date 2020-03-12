<!--
 此处填写文件描述
 @Author: zhanbh
 @Date: 2019-11-03
-->
<template>
    <div class="relate-feature" v-loading="isLoading">
        <el-form  class="mr10"
                  ref="form"
                 label-width="110px"
                 :model="form"
                 :rules="rules"
                 @submit.native.prevent
        >
            <el-form-item label="领域对象">
                <el-input :value="object && object.name" disabled></el-input>
            </el-form-item>
            <el-form-item v-if="parentList.length > 0"
                          label="继承上级特征"
                          prop="isExtendFeature">
                <el-radio-group v-model="form.isExtendFeature"
                                @change="handleChangeIsInherit"
                >
                    <el-radio label="1">是</el-radio>
                    <el-radio label="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-if="parentList.length > 1 && form.isExtendFeature === '1'"
                          prop="featureInheritObjId"
                          label="主要继承对象"
            >
                <el-select v-model="form.featureInheritObjId"
                           filterable
                           clearable
                           placeholder="主要继承对象"
                           @change="handleChangeParent"
                >
                    <el-option
                            v-for="item in parentList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="属性配置" class="feature-setting" prop="newFeatureId">
                <feature-transfer v-model="form.newFeatureId"
                                  ref="transfer"
                                  :data="featureTree"
                                  :dic-map="dicMap"
                                  @change="handleChangeChecked"
                                  @closed-dialog="handleClosedFeatureDialog"
                ></feature-transfer>
                <box-selector v-show="isShowInheritBox"
                              title="继承父类"
                              :data="inheritFeatureList"
                ></box-selector>
            </el-form-item>
            <el-form-item label="分区字段" prop="partitionIdList">
                <el-select v-model="form.partitionIdList"
                           filterable
                           multiple
                           clearable
                           placeholder="请选择分区字段"
                >
                    <el-option
                            v-for="item in partitionOptions"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <div class="tr mb2 mt20">
                <el-button size="small" @click.stop="handleClickCancel"> 取消</el-button>
                <el-button size="small" type="primary" @click.stop="handleClickSave">确定</el-button>
            </div>
        </el-form>
    </div>
</template>
<script>
    import FeatureTransfer from '@/projects/Knowledge/components/FeatureTransfer'
    import BoxSelector from './components/BoxSelector'

    export default {
        name: "RelateFeature",
        props: {
            object: Object,
            domainId: String,
            dicMap: {
                type: Object,
                default() {
                    return {}
                }
            }
        },
        data() {
            const vm = this;
            return {
                form: {
                    objModelId: '',
                    newFeatureId: [],
                    isExtendFeature: '0',
                    featureInheritObjId: '',
                    partitionIdList: []
                },
                rules: {
                    isExtendFeature: [
                        { required: true, message: '请确定是否继承上级特征', trigger: 'blur' },
                    ],
                    featureInheritObjId: [
                        { required: true, message: '请选择主要继承对象', trigger: 'blur' },
                    ],
                    newFeatureId: [
                        { validator: (rule, value, callback) => {
                                // 分区字段就是自身及继承特征项，如果为空，就是没选特征
                                if (vm.partitionOptions.length <= 0) {
                                    callback(new Error('请选择特征项'));
                                } else {
                                    callback();
                                }
                            }, trigger: 'blur' },
                    ],
                    partitionIdList: [
                        { type: 'array', required: true, message: '请选择分区字段', trigger: 'blur' },
                    ],
                },
                featureTree: [],
                partitionOptions: [], // 分区字段列表
                parentList: [], // 父级对象列表
                parentFeatureMap: {}, // 父级特征项映射
                isLoading: false
            };
        },
        computed: {
            inheritFeatureList() {
                let {parentFeatureMap, form} = this;
                if (form.isExtendFeature === '0' || !form.featureInheritObjId) {
                    return [];
                }
                let extendFeatureIdList = parentFeatureMap[form.featureInheritObjId] || [];
                return extendFeatureIdList.filter(item => {
                    return !form.newFeatureId.includes(item.featureId);
                })
            },
            isShowInheritBox() {
                let { form, inheritFeatureList } = this;
                return form.isExtendFeature === '1' && inheritFeatureList.length > 0;
            }
        },
        watch: {
          object: {
              handler() {
                 this.initData();
              },
              immediate: true
          }
        },
        methods: {
            async reqSave(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('saveDomainObjFeatures', params).catch((error) => {
                    vm.$message.error('服务器异常，请联系管理员');
                    return {data: {}}
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    vm.$message.success(data.msg === "" ? '关联特征项成功' : "关联特征项成功,"+data.msg);
                    return true;
                } else {
                    vm.$message.error(data.msg || `关联特征项异常`);
                    return false;
                }
            },
            async reqData() {
                const vm = this;
                let { object, domainId } = vm;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('domainObjFeatures',  {
                    domainId: domainId,
                    objModelId: object.id
                }).catch((error) => {
                    vm.$message.error('服务器异常，请联系管理员');
                    return {data: {}}
                });
                vm.isLoading = false;
                let result = {};
                if (data.code === 200) {
                    result = data.result || {};
                } else {
                    vm.$message.error(data.msg || `查询领域对象特征列表异常`);
                }
                return result;
            },
            async reqParentFeature(id) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('getExtendFeatureList',  {
                    featureInheritObjId: id,
                    objModelId:vm.object.id
                }).catch((error) => {
                    vm.$message.error('服务器异常，请联系管理员');
                    return {data: {}}
                });
                vm.isLoading = false;
                let result = {};
                if (data.code === 200) {
                    result = data.result || {};
                    vm.$set(vm.parentFeatureMap, id, result.objFeatureList || []);
                } else {
                    vm.$message.error(data.msg || `查询继承特征列表异常`);
                }
                vm.handleChangeChecked();
                return result;
            },
            async initData() {
                const vm = this;
                vm.clearForm();
                let data = {};
                if (vm.object) {
                    data = await vm.reqData();
                }
                // 初始化表单
                vm.form.isExtendFeature = data.isExtendFeature || '0';
                vm.form.objModelId = data.objModelId || '';
                vm.form.newFeatureId = [...(new Set((data.ownFeatureIdList || []).map(item => item.id)))]; // 去重
                vm.form.partitionIdList = [...(new Set(data.partitionIdList || []))]; // 去重
                vm.form.featureInheritObjId = data.featureInheritObjId || '';

                // 初始化穿梭框
                vm.featureTree = data.featureIdList;

                // 初始化继承项
                vm.parentFeatureMap = {};
                vm.parentList = data.domainObjVoList || [];
                if (data.isExtendFeature === '1' && data.featureInheritObjId) {
                    vm.reqParentFeature(data.featureInheritObjId);
                } else {
                    vm.$nextTick(() => {
                        vm.handleChangeChecked();
                    })
                }
            },
            /**
             * 是否继承改变，主要继承置空让用户自己确定 只有一个时替用户填充
             * 触发改变已选择特征项，添加了继承的特征项
             **/
            handleChangeIsInherit() {
                const vm = this;
                let {form, parentList} = vm;
                if (form.isExtendFeature === '1' && parentList.length === 1) {
                    vm.form.featureInheritObjId = parentList[0].id;
                    vm.handleChangeParent();
                } else {
                    vm.form.featureInheritObjId = '';
                }
                vm.handleChangeChecked();
            },
            /**
             * 处理当选择的特征项改变
             * 同步已选择特征项id   form.newFeatureId
             * 生成分区字段下拉选项并同步已选的分区字段  partitionIdList
             */
            handleChangeChecked() {
                const vm = this;
                if (vm.$refs.transfer) {
                    vm.$refs.transfer.$nextTick(() => {
                        let acceptData = vm.$refs.transfer.getCheckedData();
                        vm.form.newFeatureId = acceptData.map(item => item.id);
                        vm.partitionOptions = acceptData.concat(vm.inheritFeatureList.map(item => {
                            return {id: item.featureId, name: item.featuresName};
                        }));
                        let partitionIds = vm.partitionOptions.map(item => item.id);
                        vm.form.partitionIdList = vm.form.partitionIdList.filter(item => partitionIds.includes(item));
                    })
                }
            },
            /**
             * 主要继承改变，请求父亲特征项 如果已有 触发总特征项改变事件
             */
            handleChangeParent() {
                const vm = this;
                let {form, parentFeatureMap} = vm;
                let {featureInheritObjId: parentId} = form;
                if (!parentId || parentFeatureMap.hasOwnProperty(parentId)) {
                    vm.handleChangeChecked();
                } else {
                    vm.reqParentFeature(parentId);
                }
            },
            handleClickCancel() {
                this.$emit('cancel')
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let params = Object.assign({
                            objFeatureList: vm.inheritFeatureList.map(item => {
                                return {id: item.id, featuresName: item.featuresName, featureId: item.featureId}
                            }),
                            domainId: vm.domainId
                        }, vm.form);
                        if (params.isExtendFeature === '0') {
                            params.featureInheritObjId = '';
                        }
                        let success = await vm.reqSave(params);
                        if (success) {
                            vm.$emit('saved', vm.form);
                        }
                    }
                })
            },
            handleClosedFeatureDialog() {
                this.initData();
            },
            clearForm() {
                const vm = this;
                if (vm.$refs['form']) {
                    vm.$refs['form'].resetFields();
                }
                if (vm.$refs['transfer']) {
                    vm.$refs['transfer'].resetFields();
                }
            }
        },
        created() {},
        activated() {
            this.initData();
        },
        components: {
            FeatureTransfer,
            BoxSelector
        }
    };
</script>
<style scoped lang="less">
    .relate-feature{
        max-height: calc(85vh - 120px);
        overflow: auto;
    }
    .el-form-item:not(.feature-setting){
        margin-bottom: 10px;
    }
    .box-selector {
        margin-left: 280px;
        margin-top: 10px;
        width: 200px;
    }
    /deep/ .el-transfer-panel {
        min-width: 200px;
        width: calc(50% - 33px);
    }
</style>