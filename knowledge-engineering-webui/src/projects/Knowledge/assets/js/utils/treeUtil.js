/**
 * 树相关工具 根据需要自行增强
 * @Author: zhanbh
 * @Date: 2019-11-08
 * @Project knowledge-engineering-webui
 */

/**
 * 将树转为列表接口  先序
 * @param tree
 * @param isAllowDuplicate  是否允许重复  去重 主要场景是对象等的多继承
 * @returns {Array}
 */
export function treeToList(tree = [], isAllowDuplicate = false) {
    if (tree === null) {
        tree = [];
    }
    let result = [];
    let idSet = new Set();
    let undo = Array.from(tree);
    while (undo.length > 0) {
        let item = undo.shift();
        if (item) {
            if (isAllowDuplicate || !idSet.has(item.id)) {
                idSet.add(item.id);
                result.push(item);
            }
            if (item.children && item.children.length > 0 ) {
                undo.unshift(...item.children);
            }
        }
    }
    return result;
}

export function getNode(tree = [], id, isAllowDuplicate = false) {
    let list = treeToList(tree, isAllowDuplicate);
    return list.filter(item => item.id === id);
}
