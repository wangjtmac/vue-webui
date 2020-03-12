<!--
 领域发布页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div>
        <el-button size="small" type="primary" @click.stop="reqReFreshLog">刷新</el-button>
        <el-card shadow="never">
            <p v-for="(log, index) in list" :key="index">{{log}}</p>
        </el-card>
    </div>
</template>
<script>
    export default {
        name: "DomainReleaseLog",
        props: {
            'data': Object,
            flag:Number
        },
        data() {
            return {
                isLoading: false,
                form: {
                    id:''
                },
                listVersion: 0,
                list: []
            };
        },
        computed: {
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
            async reqReleaseLog() {
                const vm = this;
                let { form,flag} = vm;
               /* let params ={
                    id:form.id
                    flag
                };*/
                vm.listVersion ++;
                let version = vm.listVersion;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('getReleaseLog',{
                        id: form.id,
                        flag: flag
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (version === vm.listVersion) {
                    vm.isLoading = false;
                    let list = [];
                    if (data.code === 200) {
                        list = data.result || [];
                    } else {
                        vm.$message.error(data.msg || `查询日志异常`);
                    }
                    vm.list = list;
                }
            },
            /**
             * 刷新日志
             * @returns {Promise<void>}
             */
            async reqReFreshLog() {
                const vm = this;
                vm.listVersion ++;
                let version = vm.listVersion;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('refreshLog').catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                if (version === vm.listVersion) {
                    vm.isLoading = false;
                    let list = [];
                    if (data.code === 200) {
                        list = data.result || [];
                    } else {
                        vm.$message.error(data.msg || `查询日志异常`);
                    }
                    vm.list = list;
                }
            },
            initForm(data) {
                const vm = this;
                let form = vm.form;
                vm.clearForm();
                data = data || {};
                Object.keys(form).forEach(key => {
                    form[key] = data[key] || '';
                }),
                vm.reqReleaseLog();
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
            },
        },
        created() {
            const vm = this;
            vm.initForm(vm.data);
        },
        activated() {
            const vm = this;
            vm.initForm(vm.data);
        }
    };
</script>
<style scoped lang="less">
    .el-form {
        max-width: 460px;
    }
    .el-cascader{
        display: initial;
    }
    .edit-btns {
        text-align: right;
    }
</style>