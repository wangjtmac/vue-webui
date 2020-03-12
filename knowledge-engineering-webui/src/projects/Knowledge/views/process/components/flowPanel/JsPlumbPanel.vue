<!--
 jsplumb流程图画布
 @Author: zhanbh
 @Date: 2019-11-27
-->
<template>
    <div class="js-plumb-panel" id="js-plumb-panel">
        <template v-for="item in nodeList">
            <slot :data="item"></slot>
        </template>
    </div>
</template>
<script>
    import {jsPlumb} from 'jsplumb';

    export default {
        name: "JsPlumbPanel",
        props: {
            nodeList: {
                type: Array,
                default() {
                    return [];
                }
            },
            lineList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                jsPlumbObj: null,
                // 默认设置参数
                jsPlumbSetting: {
                    Container: 'js-plumb-panel',
                    // 连线的样式 StateMachine、Flowchart、Bezier、Straight
                    Connector: 'Flowchart',
                    // 鼠标不能拖动删除线
                    ConnectionsDetachable: false,
                    // 删除线的时候节点不删除
                    DeleteEndpointsOnDetach: false,
                    // 线端点的样式
                    EndpointStyle: {fill: 'rgba(255,255,255,0)', outlineWidth: 1},
                    LogEnabled: true,//是否打开jsPlumb的内部日志记录
                    // 绘制线
                    PaintStyle: {stroke: '#2d81b3', strokeWidth: 2},
                    // 绘制箭头
                    Overlays: [['Arrow', {width: 12, length: 10, location: 1}]],
                },
                // jsplumb连接参数
                jsPlumbConnectOptions: {
                    // 动态锚点、提供了4个方向 Continuous、AutoDefault
                    anchor: "Continuous"
                }
            };
        },
        computed: {},
        watch: {
            nodeList: {
                handler(newList, oldList) {
                    const vm = this;
                    vm.updateNode(newList, oldList);
                },
                deep: true
            },
            lineList: {
                handler(list) {
                    const vm = this;
                    vm.updateLine(list);
                },
                deep: true
            }
        },
        methods: {
            initJsPlumb() {
                const vm = this;
                vm.jsPlumbObj = jsPlumb.getInstance(vm.jsPlumbSetting);
                vm.updateNode(vm.nodeList);
            },

            /**
             * 更新后会去更新线
             * @param newList 新节点
             * @param oldList 旧节点
             */
            updateNode(newList = [], oldList = []) {
                const vm = this;

                vm.$nextTick(() => {
                    vm.jsPlumbObj.setSuspendDrawing(true);

                    let [newIds, oldIds] = [newList.map(item => item.id), oldList.map(item => item.id)];

                    // 删除节点
                    oldIds.forEach(id => {

                        if (!newIds.includes(id)) {
                            vm.jsPlumbObj.remove(id);
                        }
                    });

                    // 新增节点
                    newIds.forEach(id => {

                        if (!oldIds.includes(id)) {
                            vm.jsPlumbObj.draggable(id, {
                                containment: 'parent'
                            });
                        }
                    });

                    vm.jsPlumbObj.setSuspendDrawing(false,true);
                    vm.updateLine(vm.lineList);
                });
            },

            updateLine(list = []) {
                const vm = this;

                vm.$nextTick(() => {
                    let oldLinks = [...vm.jsPlumbObj.getAllConnections()];
                    vm.jsPlumbObj.setSuspendDrawing(true);

                    // 删除连线
                    oldLinks.forEach(link => {
                        if (!list.find( item => link.sourceId === item.from && link.targetId === item.to)) {
                            vm.jsPlumbObj.deleteConnection(link);
                        }
                    });

                    // 新增连线
                    list.forEach(item => {
                        if (!oldLinks.find(link => link.sourceId === item.from && link.targetId === item.to )) {
                            vm.jsPlumbObj.connect({
                                source: item.from,
                                target: item.to,
                            }, vm.jsPlumbConnectOptions);
                        }
                    });

                    vm.jsPlumbObj.setSuspendDrawing(false,true);

                });
            }
        },
        mounted() {
            this.initJsPlumb();
        }
    };
</script>
<style scoped>
    .js-plumb-panel{
        position: relative;
        overflow: auto;
        height: 100%;
        box-sizing: border-box;
        background-image: linear-gradient(90deg, rgba(10, 15, 15, 0.05) 10%, rgba(0, 0, 0, 0) 10%), linear-gradient(rgba(10, 15, 15, 0.05) 10%, rgba(0, 0, 0, 0) 10%);
        background-size: 10px 10px;
        background-color: #fff;
    }
</style>