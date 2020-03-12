<!--
 流程图工具栏
 @Author: zhanbh
 @Date: 2019-11-28
-->
<template>
    <div class="toolbar">
        <el-button-group>
            <el-button type="primary" size="mini" plain icon="icon icon-play2" title="执行" @click="handleClickRun"></el-button>
            <el-button type="primary" size="mini" plain icon="icon icon-stop2" title="暂停" @click="handleClickStop"></el-button>
            <el-button type="primary" size="mini" class="icon__delete" plain icon="icon icon-delete2" title="删除" @click="handleClickDelete"></el-button>
            <el-button type="primary" size="mini" plain icon="icon icon-cog2" title="调度配置" @click.stop="handleClickSetting"></el-button>
        </el-button-group>
        <el-button class="btn_status" size="mini" type="info" circle title="状态"></el-button>
            <el-dialog
                    :title="setting.title"
                    :visible.sync="setting.dialogVisible"
                    :close-on-click-modal="false"
                    top="10vh"
                    append-to-body
                    width="900px"
            >
                <keep-alive>
            <setting
                    v-if="setting.dialogVisible"
                    :trans-id="setting.data"
                    ref="setting"
                    @saved="handleSaveSetting"
                    @cancel="handleCloseLog"/>
                </keep-alive>
        </el-dialog>
    </div>


</template>
<script>
    import Setting from './Setting';

    export default {
        name: "Toolbar",
        props: {
            runMethod: Function,
            stopMethod: Function,
            deleteMethod: Function,
            currentData:Object
        },
        data() {
            return {
                setting:{
                    dialogVisible: false,
                    title: '',
                    data: null,
                },
            }
        },
        computed: {},
        methods: {
            handleClickRun() {
                const vm = this;

                vm.$confirm('确定执行该方案?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let { runMethod } = vm;
                    if (runMethod instanceof Function) {
                        runMethod();
                    }
                }).catch(() => {});
            },
            handleClickStop() {
                const vm = this;

                vm.$confirm('确定暂停该方案?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let { stopMethod } = vm;
                    if (stopMethod instanceof Function) {
                        stopMethod();
                    }
                }).catch(() => {});
            },
            handleClickDelete() {
                const vm = this;

                vm.$confirm('确定删除该方案?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let { deleteMethod } = vm;
                    if (deleteMethod instanceof Function) {
                        deleteMethod();
                    }
                }).catch(() => {});
            },
            /**
             * 点击调度按钮
             * @param data
             */
            handleClickSetting() {
                const {setting,currentData} = this;
                setting.dialogVisible = true;
                setting.title = '调度配置';
                setting.data = currentData.origin.transId;
            },
            handleCloseLog() {
                const vm = this;
                let {setting} = vm;
                setting.dialogVisible = false;
            },
            handleSaveSetting() {
                const vm = this;
                let {setting} = vm;
                setting.dialogVisible = false;
            }
        },
        created() {
        },
        components: {
            Setting
        }
    };
</script>
<style scoped>
    .el-button{
        font-size: 16px;
    }
    .icon__delete{
        color: #f56c6c;;
    }
    .btn_status{
        vertical-align: middle;
        margin-left: 10px;
        cursor: auto;
    }
</style>