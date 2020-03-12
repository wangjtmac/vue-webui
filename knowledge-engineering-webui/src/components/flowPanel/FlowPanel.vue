<template>
    <div v-if="easyFlowVisible" class="flowPanel" @dragover.prevent="allowDrop" @drop="drop"
         :style="{marginRight : marginRight + 'px'}">
        <flow-node
                v-for="node in data.nodeList"
                :key="node.id"
                v-show="node.show"
                :id="node.id"
                :node="node"
                @deleteNode="deleteNode"
                @changeNodeSite="changeNodeSite"
                @editNode="editNode"
                @editAttr="editAttr"
                @edaFun="edaFun"
        />


        <NodeForm v-if="nodeFormVisible" ref="nodeForm" @change="changeVal"/>

    </div>
</template>

<script>
    import {jsPlumb} from 'jsplumb'

    import flowNode from './flow/Node'
    import NodeForm from './flow/NodeForm'
    import {getDataN} from '@/assets/data/flow-data/data_N'


    export default {
        name: "FlowPanel",
        components: {
            flowNode,
            NodeForm
        },
        props: {
            schemeId: String,
            varData: Object
        },
        data() {
            return {
                stepId: '',
                operatorCode: String,
                easyFlowVisible: true,
                menuNode: {},
                marginRight: 0,
                index: 1,
                jsPlumb: null,// jsPlumb 实例
                nodeFormVisible: false,
                // 默认设置参数
                jsplumbSetting: {
                    // 动态锚点、位置自适应
                    Anchors: ['Top', 'TopCenter', 'TopRight', 'TopLeft', 'Right', 'RightMiddle', 'Bottom', 'BottomCenter', 'BottomRight', 'BottomLeft', 'Left', 'LeftMiddle'],
                    Container: 'flowContainer',
                    // 连线的样式 StateMachine、Flowchart、Bezier、Straight
                    Connector: 'Flowchart',
                    // 鼠标不能拖动删除线
                    ConnectionsDetachable: false,
                    // 删除线的时候节点不删除
                    DeleteEndpointsOnDetach: false,

                    // 连线的端点
                    // Endpoint: ["Dot", {radius: 5}],
                    //Endpoint: ["Rectangle", {height: 5, width: 5}],
                    // 线端点的样式
                    EndpointStyle: {fill: 'rgba(255,255,255,0)', outlineWidth: 1},
                    LogEnabled: true,//是否打开jsPlumb的内部日志记录
                    // 绘制线
                    PaintStyle: {stroke: '#2d81b3', strokeWidth: 2},
                    // 绘制箭头
                    Overlays: [['Arrow', {width: 12, length: 10, location: 1}]],
                    RenderMode: "svg",
                },
                // jsplumb连接参数
                jsplumbConnectOptions: {
                    isSource: true,
                    isTarget: true,
                    maxConnections: 1,
                    // 动态锚点、提供了4个方向 Continuous、AutoDefault
                    anchor: "Continuous"
                },
                jsplumbSourceOptions: {
                    filter: ".flow-node-drag", /*"span"表示标签，".className"表示类，"#id"表示元素id*/
                    filterExclude: false,
                    anchor: "Continuous",
                    allowLoopback: false
                },
                jsplumbTargetOptions: {
                    filter: ".flow-node-drag", /*"span"表示标签，".className"表示类，"#id"表示元素id*/
                    filterExclude: false,
                    anchor: "Continuous",
                    allowLoopback: false
                },
                // 是否加载完毕
                loadEasyFlowFinish: false,
                // 数据
                data: {
                    nodeList: [],
                    lineList: []
                },

            }
        },
        methods: {
            saveEdaData(edaInfo) {//修改 eda 数据
                this.$refs.edaList.saveData(edaInfo);
            },
            addEdaData(edaInfo) {//新增 eda 数据
                this.$refs.edaList.addData(edaInfo);
            },
            addEda(stepId, stepName, row, isAdd) {//eda 操作页
                this.$refs.EdaO.show(row, stepId, stepName, isAdd);
            },
            edaFun(stepId, stepName) {//eda 日志列表
                this.$refs.edaList.show(stepId, stepName);
            },
            editAttr(stepId) {
                const $this = this;
                $this.$axios.get('operatorConfig/getMethods?stepId=' + stepId).then(function (response) {
                    // console.log(response.data.data[0]["code"]);
                    if (response.data.code === 0) {
                        $this.operatorCode = response.data.data[0]["code"];
                        let data = null;//请求存储的数据
                        if ($this.operatorCode === "multiOperator") {
                            $this.$refs.Polynomial.show(data, stepId, $this.schemeId);
                        } else if ($this.operatorCode === "pcaTransform") {
                            $this.$refs.Pca.show(data, stepId, $this.schemeId);
                        } else {//通用模板
                            $this.$refs.EditA.show(data, stepId, $this.schemeId);
                        }
                    } else {
                        $this.$message.error('获取方法失败');
                    }
                }).catch(function (error) {
                    console.error(error);
                    $this.$message.error('获取方法失败');
                });


            },
            isSpecialOperator(val) {
                if (val.indexOf('pca降维transform') != -1 || val.indexOf('特征多项式') != -1) {
                    return true;
                } else {
                    return false;
                }
            },
            getRowByEdaCode(edaCode, callback) {
                let rowByEdaCode = this.$refs.edaList.getRowByEdaCode(edaCode);
                callback(rowByEdaCode);
                return rowByEdaCode;
            },
            initData() {
                this.data.nodeList = [];
                this.data.lineList = [];
                this.$nextTick(() => {
                    this.jsPlumb = jsPlumb.getInstance();
                    this.$nextTick(() => {
                        this.jsPlumbInit();
                    });
                })
            },
            changeVal(node) {
                console.log("修改步骤名称： FlowPanel.vue-changeVal");
                this.data.nodeList.filter(item => {
                    if (item.id === node.id) {
                        this.$axios.get('/modelingConfig/renameStep?stepName=' + node.name + '&stepId=' + node.id).then(result => {
                            if (result.data.code === 0) {
                                item.name = node.name;
                                this.$message.success("步骤名称修改成功!");
                            } else {
                                this.$message.error("步骤名称修改失败!");
                            }
                        })
                    }
                })
            },
            getMenuNode(menu) { //拖拽
                this.menuNode = menu;
            },
            allowDrop() {
                return true;
            },
            drop(e) {
                this.addNode(e, this.menuNode);
            },
            initMargin(is_show) {
                this.marginRight = is_show ? 400 : 0;
            },
            jsPlumbInit() {
                const _this = this;
                this.jsPlumb.ready(function () {
                    // 导入默认配置
                    _this.jsPlumb.importDefaults(_this.jsplumbSetting);
                    // 会使整个jsPlumb立即重绘。
                    _this.jsPlumb.setSuspendDrawing(false, true);
                    // 初始化节点
                    _this.loadEasyFlow();

                    // 单点击了连接线,
                    _this.jsPlumb.bind('click', function (conn, originalEvent) {
                        // console.log("click", conn)

                        _this.$confirm('确定删除所点击的线吗?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            _this.jsPlumb.deleteConnection(conn)
                        }).catch(() => {

                        })

                    });
                    // 连线
                    _this.jsPlumb.bind("connection", function (evt) {
                        // console.log('connection', evt)
                        let from = evt.source.id;
                        let to = evt.target.id;
                        _this.$axios.get('/modelingConfig/addRelation?fromStepId=' + from + "&toStepId=" + to).then(result => {
                            if (result.data.code === 0) {
                                if (_this.loadEasyFlowFinish) {
                                    _this.data.lineList.push({
                                        from: from,
                                        to: to
                                    })
                                }
                            }
                        })
                    });

                    // 删除连线
                    _this.jsPlumb.bind("connectionDetached", function (evt) {
                        console.log('connectionDetached', evt);
                        _this.deleteLine(evt.sourceId, evt.targetId)
                    });

                    // 改变线的连接节点
                    _this.jsPlumb.bind("connectionMoved", function (evt) {
                        // console.log('connectionMoved', evt)
                        _this.changeLine(evt.originalSourceId, evt.originalTargetId)
                    });


                    // contextmenu
                    _this.jsPlumb.bind("contextmenu", function (evt) {
                        console.log('contextmenu', evt)
                    });


                    // beforeDrop
                    _this.jsPlumb.bind("beforeDrop", function (evt) {
                        // console.log('beforeDrop', evt)
                        let from = evt.sourceId;
                        let to = evt.targetId;
                        if (from === to) {
                            _this.$message.error('不能连接自己');
                            return false;
                        }
                        for (var i = 0; i < _this.data.lineList.length; i++) {
                            var line = _this.data.lineList[i];
                            if (line.from === from) {
                                _this.$message.error('只能有一个输出哦');
                                return false;
                            }
                            if (line.to === to) {
                                _this.$message.error('只能有一个输入哦');
                                return false;
                            }
                            if (line.from === from && line.to === to) {
                                _this.$message.error('不能重复连线');
                                return false;
                            }
                            if (line.from === to && line.to === from) {
                                _this.$message.error('不能回环哦');
                                return false;
                            }
                            if (_this.checkOneRoad(from, to)) {
                                _this.$message.error('不允许存在多条链路');
                                return false;
                            }
                        }
                        return true;
                    });

                    // beforeDetach
                    _this.jsPlumb.bind("beforeDetach", function (evt) {
                        console.log('beforeDetach', evt)
                    })
                })
            },

            checkOneRoad(from, to) {
                let lineArr = [];
                this.data.lineList.forEach(l => {
                    if (lineArr.indexOf(l.from) === -1) {
                        lineArr.push(l.from);
                    }
                    if (lineArr.indexOf(l.to) === -1) {
                        lineArr.push(l.to);
                    }
                });
                if (lineArr.indexOf(to) === -1 && lineArr.indexOf(from) === -1) {
                    return true;
                } else {
                    return false;
                }
            },


            // 加载流程图
            loadEasyFlow() {
                // 初始化节点
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i];
                    // 设置源点，可以拖出线连接其他节点
                    this.jsPlumb.makeSource(node.id, this.jsplumbSourceOptions);
                    // // 设置目标点，其他源点拖出的线可以连接该节点
                    this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions);
                    // jsPlumb.addEndpoint(node.id)
                    // 设置可拖拽
                    // jsPlumb.draggable(node.id, {
                    //     containment: 'parent',
                    //     grid: [10, 10]
                    // })

                    this.jsPlumb.draggable(node.id, {
                        containment: 'parent'
                    })

                    // jsPlumb.draggable(node.id)
                }
                // 初始化连线
                for (let i = 0; i < this.data.lineList.length; i++) {
                    let line = this.data.lineList[i];
                    this.jsPlumb.connect({
                        source: line.from,
                        target: line.to,
                    }, this.jsplumbConnectOptions)
                }
                this.$nextTick(function () {
                    this.loadEasyFlowFinish = true;
                });
            },
            getNodes() {
                console.log(jsPlumb);
                console.log(jsPlumb.Defaults);
            },
            getLines() {
                console.log('线', jsPlumb.getConnections())
            },
            // 删除线
            deleteLine(from, to) {
                this.$axios.get('/modelingConfig/removeRelation?fromStepId=' + from + "&toStepId=" + to).then(result => {
                    if (result.data.code === 0) {
                        this.data.lineList = this.data.lineList.filter(function (line) {
                            return line.from !== from && line.to !== to
                        })
                        this.$message.success("步骤连线删除成功!");
                    }
                })
            },
            // 改变连线
            changeLine(oldFrom, oldTo) {
                this.deleteLine(oldFrom, oldTo);
            },
            // 改变节点的位置
            changeNodeSite(data) {
                this.data.nodeList.forEach(node => {
                    if (node.id === data.nodeId) {
                        let x = parseInt(data.left.replace('px', ''));
                        let y = parseInt(data.top.replace('px', ''));
                        this.$axios.get('/modelingConfig/moveStep?stepId=' + data.nodeId + '&x=' + x + '&y=' + y).then();
                        node.left = data.left;
                        node.top = data.top;
                        console.log("修改节点位置： x->" + data.left + ", y->" + data.top);
                    }
                })
            },
            // 添加新的节点
            addNode(evt, nodeMenu) {
                // console.log("算子拖拽生成方案步骤: FlowPanel.vue-addNode(evt, nodeMenu)")
                const index = this.index++;
                let x = evt.offsetX - 80;
                let y = evt.offsetY - 25;
                let stepVO = JSON.stringify({
                    schemeId: this.schemeId, // 方案ID
                    stepName: nodeMenu.label + '_' + index, // 步骤名称
                    x: x, // x轴
                    y: y, // y轴
                    operatorId: nodeMenu.id  // 算子ID
                });
                let nodeId = '';
                this.$axios.post('/modelingConfig/addStep', stepVO, {headers: {"Content-Type": "application/json;charset=utf-8"}}).then(result => {
                    if (result.data.code === 0) {
                        nodeId = result.data.data;
                        // let width = 80;
                        this.data.nodeList.push({
                            id: nodeId,
                            name: nodeMenu.label + '_' + index,
                            left: x + 'px',
                            top: y + 'px',
                            ico: nodeMenu.icon,
                            show: true
                        });
                        this.$nextTick(function () {
                            this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions);
                            this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions);
                            this.jsPlumb.draggable(nodeId, {
                                containment: 'parent'
                            })
                        })
                    }
                }).catch(error => {
                    console.log(error);
                    this.$message.error("新增方案步骤失败!");
                })
            },

            nodeRightMenu(nodeId, evt) {
                this.menu.show = true;
                this.menu.curNodeId = nodeId;
                this.menu.left = evt.x + 'px';
                this.menu.top = evt.y + 'px'
            },

            // 删除方案步骤
            deleteNode(selectedNode) {
                let nodeId = selectedNode.id;
                let nodeName = selectedNode.name;
                this.$confirm('确定要删除步骤[' + nodeName + ']?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    this.$axios.get('/modelingConfig/removeStep?stepId=' + nodeId).then(result => {
                        if (result.data.code === 0) {
                            this.data.nodeList = this.data.nodeList.filter(function (node) {
                                if (node.id === nodeId) {
                                    node.show = false;
                                }
                                return true;
                            });
                            this.$nextTick(function () {
                                console.log('删除' + nodeId)
                                this.jsPlumb.removeAllEndpoints(nodeId);
                            })
                            this.$message.success("步骤删除成功!");
                        } else {
                            this.$message.error("步骤删除失败!");
                        }
                    })

                }).catch(() => {
                })
                return true
            },

            editNode(nodeId) {
                // console.log('编辑节点', nodeId);
                this.nodeFormVisible = true;
                this.$nextTick(function () {
                    this.$refs.nodeForm.init(this.data, nodeId)
                });
            },

            // 初始化JsPlumb，获取后台数据
            dataReload() {
                this.easyFlowVisible = false;
                this.data.nodeList = [];
                this.data.lineList = [];
                const $this = this;
                this.$nextTick(() => {
                    this.$axios.get('/modelingConfig/queryStep?schemeId=' + this.schemeId).then(result => {
                        if (result.data.code === 0) {
                            result.data.data.nodeList.forEach(n => {
                                // 修改步骤所在x轴
                                n.left = n.left + 'px';
                                // 修改步骤所在y轴
                                n.top = n.top + 'px';
                                // 获取所用算子图标
                                n.ico = operatorIcon[n.operatorName];
                                // 移除算子名称属性
                                delete n.operatorName;
                            });
                            this.data = result.data.data;
                        } else {
                            this.$message.error("请求后台数据失败!");
                            this.data = getDataN();
                        }
                        this.easyFlowVisible = true;
                        this.$nextTick(() => {
                            this.jsPlumb = jsPlumb.getInstance();
                            this.$nextTick(() => {
                                this.jsPlumbInit()
                            })
                        });
                    });


                })
            },
            changeLabel() {
                var lines = this.jsPlumb.getConnections({
                    source: 'nodeA',
                    target: 'nodeB'
                });
                lines[0].setLabel({
                    label: '   ',
                    cssClass: 'labelClass'
                });
            },

            getAttr(result) {//获取
                console.log(result)
            },
            pushEdaTaskListTable(table) {
                this.$emit('pushEdaTaskListTable', table);
            },
            deleteEdaTaskListTable(stepId, edaId) {
                this.$emit('deleteEdaTaskListTable', stepId, edaId);
            }
        },
        created() {

        }
    }
</script>

<style scoped>
    .flowPanel {
        margin-left: 2px;
        margin-right: auto;
        transition: 300ms;
        height: calc(100vh - 14px );
        background-image: linear-gradient(90deg, rgba(10, 15, 15, 0.05) 10%, rgba(0, 0, 0, 0) 10%), linear-gradient(rgba(10, 15, 15, 0.05) 10%, rgba(0, 0, 0, 0) 10%);
        background-size: 10px 10px;
        background-color: #fff;
        position: relative;
        overflow: hidden;
    }

</style>