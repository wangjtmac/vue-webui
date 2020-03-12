<template>
    <el-dialog
            title="节点信息"
            :close-on-click-modal="false"
            :visible.sync="visible"
            :modal-append-to-body="false"
    >
        <el-form :model="node" ref="dataForm" label-width="80px">
            <el-form-item label="名称">
                <el-input v-model="node.name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer">
            <el-button size="small" dataType="primary" @click="submit" >确定</el-button>
            <el-button size="small" @click="visible = false" >取消</el-button>
        </span>
    </el-dialog>
</template>

<script>
    export default {
        name: "NodeForm",
        data() {
            return {
                visible: false,
                node: {
                    name:'',
                    id :''
                }
            }
        },
        methods: {
            init(data, id) {
                this.visible = true ;
                data.nodeList.forEach((node) => {
                    if (node.id === id) {
                        this.node.name = node.name;
                        this.node.id = node.id;
                    }
                })
            },
            submit(){
                this.visible = false ;
                this.$emit('change',this.node);
            }
        }
    }
</script>

<style scoped>

</style>