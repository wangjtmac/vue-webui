<!--
 特征项编辑页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="feature-item-edit" v-loading="isLoading">
        <el-form ref="form"
                 label-width="120px"
                 :model="form"
                 :rules="rules"
                 :disabled="disabled"
                 @submit.native.prevent>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="特征项名称" prop="name">
                        <el-input v-model="form.name"
                                  placeholder="请输入特征项名称"
                                  maxlength="50"
                                  show-word-limit
                        ></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="所属分类" prop="parentId">
                        <el-input :value="catalogName" disabled></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="数据等级" prop="dataLevel">
                        <el-select v-model="form.dataLevel"
                                   filterable
                                   clearable
                                   placeholder="请选择数据等级"
                        >
                            <el-option
                                    v-for="item in dicMap.dataLevel"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="特征类型" prop="featureType">
                        <el-radio-group v-model="form.featureType">
                            <el-radio v-for="item in dicMap.featureType"
                                      :label="item.code"
                                      :key="item.code"
                            >{{item.name}}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="数据基础类型" prop="dataBaseType">
                        <el-select v-model="form.dataBaseType"
                                   filterable
                                   clearable
                                   placeholder="请选择数据基础类型"
                        >
                            <el-option
                                    v-for="item in dicMap.dataBaseType"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="数据类型" prop="dataType">
                        <el-select v-model="form.dataType"
                                   filterable
                                   clearable
                                   placeholder="请选择数据类型"
                        >
                            <el-option
                                    v-for="item in dicMap.dataType"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col>
                    <el-form-item label="备注" prop="remark">
                        <el-input v-model="form.remark"
                                  type="textarea"
                                  :rows="2"
                                  :placeholder="!disabled && '请输入内容'"
                        >
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div class="edit-btns">
            <el-button size="small" @click.stop="handleClickCancel"> {{disabled | cancelText}}</el-button>
            <el-button v-if="!disabled"
                       size="small"
                       type="primary"
                       @click.stop="handleClickSave">确定</el-button>
        </div>
    </div>
</template>
<script>
    export default {
        name: "FeatureItemEdit",
        props: {
            data: Object,
            disabled: Boolean,
            domainId: String,
            catalog: Object,
            dicMap: Object
        },
        data() {
            return {
                form: {
                    id: '',
                    domainId: '',
                    parentId: '',
                    name: '',
                    dataLevel: '',
                    featureType: '',
                    dataBaseType: '',
                    dataType: '',
                    remark: ''
                },
                flag:false,
                dataType:'',
                rules: {
                    name: [
                        { required: true, message: '请输入特征项名称', trigger: 'blur' },
                        { max: 50, message: '不能超过50个字符', trigger: 'blur' }
                    ],
                    parentId: [
                        { required: true, message: '缺失所属分类', trigger: 'blur' },
                    ],
                    dataLevel: [
                        { required: true, message: '请选择数据等级', trigger: 'blur' },
                    ],
                    featureType: [
                        { required: true, message: '请选择特征类型', trigger: 'blur' }
                    ],
                    dataBaseType: [
                        { required: true, message: '请选择基础数据类型', trigger: 'blur' }
                    ],
                    dataType: [
                        { required: true, message: '请选择数据类型', trigger: 'blur' }
                    ]
                },
                classify: null,
                isLoading: false
            };
        },
        computed:{
            isAdd() {
                let {data} = this;
                return !data || (!data.id && data.id !== 0);
            },
            catalogName() {
                let {catalog, isAdd, classify} = this;
                if (isAdd) {
                    return catalog && catalog.name;
                } else {
                    return classify && classify.name;
                }
            }
        },
        watch: {
            data: {
                handler(data) {
                    this.initForm(data);
                },
                immediate: true
            },
            catalog() {
                const vm = this;
                if (vm.isAdd) {
                    vm.initForm(vm.data);
                }
            }
        },
        methods: {
            async reqAdd() {
                const vm = this;
                let params = Object.assign({}, vm.form);
                vm.isLoading = true;
                let {data} = await vm.$axios.post('createDomainFeature', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                   return true;
                } else {
                    vm.$message.error(data.msg || `新增特征项异常`);
                    return false;
                }
            },
            async reqUpdate() {
                const vm = this;
                let params = Object.assign({}, vm.form);
                vm.isLoading = true;
                let {data} = await vm.$axios.post('changeFeature', params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || `修改特征项异常`);
                    return false;
                }
            },
            async reqFeatureClassify(id) {
                const vm = this;
                vm.classify = null;
                let {data} = await vm.$axios.get('getParentByFeatureId', {
                    params: {
                        featureId: id
                    }
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (data.code === 200 && vm.data && vm.data.id === id) {
                    vm.classify = data.featureParent;
                    vm.flag=data.featureParent.flag;
                }
            },
            initForm(data) {
                const vm = this;
                vm.clearForm();
                data = data || {};
                Object.keys(vm.form).forEach(key => {
                    let value = data[key];
                    vm.form[key] = value === null || value === undefined ? '' : value;
                });
                if (vm.isAdd) {
                    let parentId = vm.catalog && vm.catalog.id;
                    vm.form.parentId = parentId || '';
                    vm.form.domainId = vm.domainId;
                    vm.classify = null;
                    vm.dataType = '';
                } else {
                    vm.dataType = data['dataType'];
                    vm.reqFeatureClassify(data.id);
                }
            },
            handleClickSave() {
                const vm = this;
                vm.$refs['form'].validate(async (valid) => {
                    if (valid) {
                        let success = false;
                        if (vm.isAdd) {
                            success = await vm.reqAdd();
                        } else {
                            if (vm.dataType != vm.form.dataType) {
                                if (vm.classify.flag == true) {
                                    alert("该特征项已在建模中被关联")
                                }
                            }
                            success = await vm.reqUpdate()
                        }
                        if (success) {
                            vm.$emit('saved', vm.form);
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
        activated() {
            const vm = this;
            vm.initForm(vm.data);
        },
        filters: {
            cancelText(disabled) {
                return disabled ? '关闭' : '取消'
            }
        },
        components: {
        }
    };
</script>
<style scoped lang="less">

    .edit-btns {
        text-align: right;
    }
</style>