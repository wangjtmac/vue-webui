/**
 * 流程图自动布局 （未做充分的测试）
 * 核心算法  取一个节点作为起点0，沿着路径标记其他节点，通过每个节点只处理一次来处理闭环问题。
 *           根据处理后的节点路径长度标记分层展示 尽量按树展示
 *           由于如果闭环，那谁先谁后就无关紧要（展示上看起来都不错），故只在第一次到达节点处理一次
 *           所有离散节点作为一个特殊图展示（直线图）
 * @Author: zhanbh
 * @Date: 2020-01-08
 * @Project knowledge-engineering-webui
 */

const defaultProps = {

    // 数据属性
    nodeList: 'nodeList',
    lineList: 'lineList',

    // 节点属性
    id: 'id',
    x: 'x',
    y: 'y',
    from: 'from',
    to: 'to',

    // vue引用配置
    flowRef: 'flow',
    nodeRefPre: 'node_',

    // 位置相关配置
    missHeight: 50,
    missWidth: 100,
    minDiff: 20,
    maxDiff: 100,
    startX: 50,
    startY: 50,
};

function mergeProps(props) {
    let dataProps = defaultProps;

    if (typeof props === 'object') {
        dataProps = Object.assign({}, defaultProps, props);
    }

    return dataProps;
}


/**
 * 给节点加上from to 信息
 * @param nodeList
 * @param lineList
 * @param dp   dataProps
 */
function addFromTo({ nodeList, lineList, dp }) {
    let data = {};
    nodeList.forEach((node, index) => {
        data[node[dp.id]] = { from: [], to: [], node, index };
    });

    if (Array.isArray(lineList)) {
        lineList.forEach(line => {
            let { [dp.from]: from, [dp.to]: to } = line;

            if (data[from] && data[to]) { // 连线有效
                data[from].from.push(data[to]); // 从data[from] 触发的点为 data[to];
                data[to].to.push(data[from]);
            }
        });
    }

    return data;
}

/**
 * 核心  按路径长度给数据打标签 已打过的不再打标签来解开闭环
 *       尽量按树展示
 * @param data 经过addFromTo处理了的数据
 */
function addTag(data, first) {
    let set = new Set();
    first.tag = 0;
    set.add(first);

    // 两个方向分开走完，才能尽量按树展示
    // 下一级方向
    let undo = [first]; // 还未对下一度进行打标签的节点
    while(undo.length > 0) {
        let now = undo.shift();

        now['from'].forEach(node => {

            if (!node.hasOwnProperty('tag')) {
                node.tag = now.tag + 1;
                set.add(node);
                undo.push(node);
            }
        });
    }

    // 上一级方向
    undo = [first]; // 还未对下一度进行打标签的节点
    while(undo.length > 0) {
        let now = undo.shift();

        now['to'].forEach(node => {

            if (!node.hasOwnProperty('tag')) {
                node.tag = now.tag - 1;
                set.add(node);
                undo.push(node);
            }
        });
    }

    // 返回排完序后的
    return sortNodes([...set]);
}

/**
 * 排序 先按tag排序，再按index排序
 * @param list 经过addFromTo及addTag处理了的数据
 */
function sortNodes(list) {
    return list.sort((a, b) => {
        if ( a.tag === b.tag) {
            return a.index - b.index;
        } else {
            return a.tag - b.tag;
        }
    });
}

/**
 * 将数据按路径层级切割
 * @param nodeList
 * @param lineList
 * @param dp
 */
function splitFlow({ nodeList, lineList, dp }) {
    let data = addFromTo({ nodeList, lineList, dp });
    let flows = [];
    let discreteNodes = []; // 离散的节点放一起，作为一个系列

    while (Object.keys(data).length > 0) {

        // 以原始数据的开始节点作为标记路径的入口，可尽可能按业务顺序展示节点顺序
        let start = nodeList.find(node => !data[node[dp.id].hasOwnProperty('tag')]);

        let subData = addTag(data, data[start[dp.id]]);

        // 从data中删除已打标签的节点
        subData.forEach(item => delete data[item.node[dp.id]]);

        if (subData.length === 1) { // 离散的
            discreteNodes.push({ nodes: subData });
        } else {

            // 根据标签分层
            let levels = [];
            let tag = NaN;
            let nodes = [];

            while(subData.length > 0) {
                let now = subData.shift();

                if (tag !== now.tag) {
                    nodes = [];
                    tag = now.tag;
                    levels.push({ nodes });
                }

                nodes.push(now);
            }

            flows.push({ levels });
        }
    }

    if (discreteNodes.length > 0) {
        flows.push({ levels: discreteNodes });
    }

    return flows;
}

/**
 * 进行布局定位
 * @param vm
 * @param flows [{levels: [{ nodes: [], width, height}], width: height:}]
 * @param dp
 */
function doLayout({ vm, flows, dp }) {
    let panelSize = {
        width: vm.$refs[dp.flowRef].$el.clientWidth - dp.startX * 2,
        height: vm.$refs[dp.flowRef].$el.clientHeight - dp.startY * 2
    };

    // 所有流的实际最小总高度
    let totalHeight = 0;
    flows.forEach((flow, index) => {
        addSizeInfo({ flow, vm, dp });
        totalHeight += flow.height;

        if (index !== 0) {
            totalHeight += dp.minDiff;
        }
    });

    // 计算每个流可多分配的高度
    let perMore = 0;
    if (panelSize.height > totalHeight) {
        perMore = (panelSize.height - totalHeight) / flows.length;
    }

    let flowY = dp.startY;
    flows.forEach((flow, index) => {
        let [flowX, flowHeight, flowWidth] = [dp.startX, flow.height + perMore, flow.width];

        // 重新计算层的间距
        let levelGap = dp.minDiff;
        if (flow.levels.length > 1 && panelSize.width > flowWidth) {
            levelGap += (panelSize.width - flowWidth) / (flow.levels.length - 1);
            if (levelGap > dp.maxDiff) {
                levelGap = dp.maxDiff;
            }
        }

        let levelX = flowX;
        flow.levels.forEach((levelObj, level) => {
            let levelY = flowY;
            let { height: levelHeight, width: levelWidth } = levelObj;

            // 重新计算层的节点间距及层的实际高度
            let gap = dp.minDiff;
            if (levelObj.nodes.length > 1 && flowHeight > levelHeight) {
                gap += (flowHeight - levelHeight) / (levelObj.nodes.length - 1);
                if (gap > dp.maxDiff) {
                    gap = dp.maxDiff;
                }
                levelHeight += (gap - dp.minDiff) * (levelObj.nodes.length - 1);
            }

            // 确定节点的x,y位置
            let nodeY = (flowHeight - levelHeight) / 2 + levelY;
            levelObj.nodes.forEach((now, index) => {
                let { height: nodeHeight, node } = now;

                // 确定 x
                vm.$set(node, dp.x, levelX);

                // 确定y
                vm.$set(node, dp.y, nodeY);

                // 更新 nodeY
                nodeY += nodeHeight + gap;
            });

            // 更新 levelX
            levelX += levelWidth + levelGap;
        });

        // 更新 flowY
        flowY += flowHeight;
    });
}

/**
 * 添加节点最小尺寸信息
 * 都按最小间距来算最小尺寸
 * @param flow [{levels: [{ nodes: [], width, height}], width: height:}]
 * @param vm
 * @param dp
 */
function addSizeInfo({ flow, vm, dp }) {
    let { levels } = flow;
    flow.width = 0;
    flow.height = 0;

    levels.forEach((levelObj, level) => {
        levelObj.width = 0;
        levelObj.height = 0;

        levelObj.nodes.forEach((now, index) => {

            if (!now.hasOwnProperty('width')) {
                let nodeVm = vm.$refs[`${dp.nodeRefPre}${now.node[dp.id]}`] || {};
                let nodeEl = nodeVm.$el || {};
                now.width = nodeEl.offsetWidth || dp.missWidth;
                now.height = nodeEl.offsetHeight || dp.missHeight;
            }

            if (now.width > levelObj.width) { // 层级宽度由最宽的决定
                levelObj.width = now.width;
            }

            levelObj.height += now.height;
            if (index !== 0) {
                levelObj.height += dp.minDiff;
            }
        });

        if (levelObj.height > flow.height) { // 流程图高度就层级最高的决定
            flow.height = levelObj.height;
        }

        flow.width += levelObj.width;
        if (level !== 0) {
            flow.width += dp.minDiff;
        }
    });
}

export default {
    methods: {
        autoLayout(props) {
            const vm = this;
            let dp = mergeProps(props); // dataProps

            let { [dp.nodeList]: nodeList = [], [dp.lineList]: lineList = [] } = vm;

            if (!Array.isArray(nodeList) || nodeList.length === 0) {
                return false;
            }

            let flows = splitFlow({ nodeList, lineList, dp });


            // 节点完成渲染 才能获取节点宽高
            vm.$nextTick(() => {
                doLayout({ vm, flows, dp });
            });
        }
    }
}