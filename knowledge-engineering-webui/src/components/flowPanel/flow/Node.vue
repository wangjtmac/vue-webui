<template>
    <div class="node selectn"
         ref="node"
         :style="flowNodeContainer"
         @mouseenter="showDelete"
         @mouseleave="hideDelete"
         @mouseup="changeNodeSite"
    >
        <div class="flow-node-header">
            <i class="el-icon-link pl6" :class="nodeClass" ></i>
            <div class="edit-icon" v-show="mouseEnter">
                <i class="el-icon-eleme" @click="EdaFun"></i>&nbsp;
                <i class="el-icon-edit" @click="editNode"></i>&nbsp;
                <i class="el-icon-close" @click="deleteNode"></i>&nbsp;
            </div>
        </div>
        <div class="flow-node-body"  @dblclick="editAttr">
            <i class="eda_icon f20" v-html="nodeIco" ></i>
            <div class="flow-name">
                {{node.name}}
            </div>

        </div>
    </div>
</template>

<script>
    export default {
        name: "Node",
        props: {
            node: Object
        },
        data() {
            return {
                // 控制节点操作显示
                mouseEnter: false ,
                timer : null
            }
        },
        computed: {
            // 节点容器样式
            flowNodeContainer: {
                get() {
                    return {
                        position: 'absolute',
                        width: '160px',
                        top: this.node.top,
                        left: this.node.left,
                        boxShadow: this.mouseEnter ? '#66a6e0 0px 0px 12px 0px' : ''
                    }
                }
            },
            nodeClass() {
                var nodeclass = {};
                nodeclass['flow-node-drag'] = true;
                return nodeclass
            },
            nodeIco(){
                return this.node.ico;
            }

        },
        methods: {
            // 删除节点
            deleteNode() {
                this.$emit('deleteNode', this.node)
            },
            // 编辑节点
            editNode() {
                this.$emit('editNode', this.node.id)
            },
            // 鼠标进入
            showDelete() {
                this.mouseEnter = true
            },
            // 鼠标离开
            hideDelete() {
                this.mouseEnter = false
            },
            // 鼠标移动后抬起
            changeNodeSite() {
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.$emit('changeNodeSite', {
                        nodeId: this.node.id,
                        left: this.$refs.node.style.left,
                        top: this.$refs.node.style.top,
                    })
                },300)

            },
            //EDA操作
            EdaFun(){
                this.$emit('edaFun',this.node.id,this.node.name);
            },
            editAttr(){
                this.timer && clearTimeout(this.timer);
                this.$emit('editAttr',this.node.id);
            }
        },
        created(){
        }
    }
</script>

<style scoped>

    .edit-icon {
        position: absolute;
        right: 0;
        top: 0;
        line-height: 26px;
    }
    .node {
        border-radius:6px;
    }
    .flow-node-header {
        background-color: #66a6e0;
        height: 26px;
        cursor: pointer;
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        color: #fff;
    }

    .flow-node-header i {
        line-height: 26px;
        vertical-align: middle;
    }


    .flow-node-body {
        padding-top: 5px;
        background-color: #fff;
        text-align: center;
        cursor: pointer;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
        border:2px solid #66a6e0;
        border-top: none;
    }
    .node:hover .flow-name,.node:hover .eda_icon {
        color: #289bf1;
    }

    .flow-name {
        padding: 0 5px 10px 5px;
    }
</style>