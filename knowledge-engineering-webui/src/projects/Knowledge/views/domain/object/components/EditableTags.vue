<!--
 可编辑的标签列表
 @Author: zhanbh
 @Date: 2019-11-21
-->
<template>
    <div class="editable-tags">
        <ul class="tags__list dib">
            <li v-for="(item, index) in list"
                :key="index"
                class="tags__item">
                <div v-if="item !== editingItem"
                     class="label-tag"
                     :ref="`tag-${item[mergedProps.key]}`"
                     :class="{'tags__item_active': item === value}"
                     @click.prevent="handleClickItem(item)">
                    <template>
                        {{item[mergedProps.label]}}
                    </template>
                    <el-popover
                            v-if="!disabled"
                            placement="top"
                            :disabled="deleteMsg === false"
                            v-model="delPopover[item[mergedProps.key]]">
                        {{deleteMsg}}
                        <div style="text-align: right; margin: 0">
                            <el-button size="mini"
                                       type="text"
                                       @click.native.stop
                                       @click.stop="delPopover[item[mergedProps.key]] = false">取消</el-button>
                            <el-button type="primary"
                                       size="mini"
                                       @click.native.stop
                                       @click.stop="handleConfirmClose(item)">确定</el-button>
                        </div>
                        <i class="el-icon-close" @click.stop="handleClickCloseItem(item)" slot="reference"></i>
                    </el-popover>
                </div>
                <el-input
                        class="input-tag"
                        v-else
                        v-model.trim="editingValue"
                        :style="{width: `${editorWidth}px`}"
                        ref="editTagInput"
                        size="small"
                        maxlength="20"
                        @keyup.enter.native="handleEditConfirm(item)"
                        @blur="handleEditConfirm(item)">
                </el-input>
            </li>
        </ul>
        <template v-if="!disabled">
            <el-input
                    class="input-tag input-tag_new"
                    v-if="addVisible"
                    v-model.trim="addValue"
                    ref="addTagInput"
                    size="small"
                    maxlength="20"
                    @keyup.enter.native="handleAddConfirm"
                    @blur="handleAddConfirm">
            </el-input>
            <el-button v-else
                       class="button-new-tag"
                       size="small"
                       :disabled="editingItem !== null"
                       type="primary"
                       @click="handleClickAdd">+ 新增</el-button>
        </template>
    </div>
</template>
<script>
    import * as $message from '@/projects/Knowledge/assets/js/utils/messageUtil'

    export default {
        name: 'editableTags',
        model: {
            event: 'change'
        },
        props: {
            value: {},
            list: {
                type: Array,
                default() {
                    return []
                }
            },
            props: Object,
            beforeChange: Function, // 钩子函数
            beforeAdd: Function, // 钩子函数
            deleteMsg: {
                type: [String, Boolean],
                default: '确定删除吗？'
            },
            disabled: Boolean
        },
        data() {
            return {
                addVisible: false,
                addValue: '',
                editingItem: null,
                editingValue: '',
                editorWidth: '',
                delPopover: {}, // 控制删除弹窗，以数据值为键，true为展示弹窗   {0: false}
            };
        },
        computed: {
            mergedProps() {
                const vm = this;
                let props = Object.assign({
                    key: 'code',
                    label: 'name'
                }, vm.props);
                return props;
            }
        },
        watch: {
            list: {
                handler(list) {
                    const vm = this;
                    let {mergedProps} = vm;
                    let delPopover = {};
                    list.forEach(item => delPopover[item[mergedProps.key]] = false);
                    vm.delPopover = delPopover;
                },
                immediate: true,
                deep: true
            }
        },
        methods: {

            /**
             * 点击项，第一次点击进行当前项切换，第二次点击进入项名称编辑模式
             * 有beforeChange钩子
             * @param item
             */
            handleClickItem(item) {
                const vm = this;
                let { mergedProps, beforeChange, disabled } = vm;

                if (item !== vm.value) {

                    let allowChange = true;

                    if (beforeChange instanceof Function) {
                        allowChange = beforeChange(item) !== false;
                    }

                    if (allowChange) {
                        vm.$emit('change', item);

                    }
                } else if (!disabled){ // 点击已选中的，则进入编辑状态
                    vm.editingItem = item;
                    vm.editingValue =  item[mergedProps.label];
                    vm.editorWidth = vm.$refs[`tag-${item[mergedProps.key]}`][0].offsetWidth;
                    vm.$nextTick(_ => {
                        vm.$refs.editTagInput[0].$refs.input.select();
                    });
                }
            },

            /**
             * 如果启用popover 清除其他的popover
             * 不启用确定删除
             **/
            handleClickCloseItem(item) {
                const vm = this;

                if (vm.deleteMsg !== false) {
                    Object.keys(vm.delPopover).forEach(key => {
                        vm.delPopover[key] = false;
                    });
                } else {
                    vm.handleConfirmClose(item);
                }
            },

            /**
             * 向外部抛删除事件
             * @param item
             */
            handleConfirmClose(item) {
                const vm = this;
                vm.delPopover[item[vm.mergedProps.key]] = false;
                vm.$emit('delete', item);
            },

            /**
             * 进入新增模式
             * 具有beforeAdd钩子
             */
            handleClickAdd() {
                const vm = this;
                let { beforeAdd } = vm;
                let allowAdd = true;

                if (beforeAdd instanceof Function) {
                    allowAdd = beforeAdd() !== false;
                }

                if (allowAdd) {
                    vm.addVisible = true;
                    vm.$nextTick(_ => {
                        vm.$refs.addTagInput.$refs.input.focus();
                    });
                }
            },

            /**
             * 对名称进行判重
             */
            handleAddConfirm() {
                const vm = this;
                const {mergedProps, list} = this;
                let value = vm.addValue;
                let error = false;

                if (value) {
                    if (list.some(item => `${item[mergedProps.label]}`.trim() === value)){
                        $message.error('名称重复');
                        vm.$refs.addTagInput.$refs.input.select();
                        error = true;
                    } else {
                        vm.$emit('add', value);
                    }

                } else {
                    vm.$emit('cancelAdd');
                }

                if (!error){
                    vm.addVisible = false;
                    vm.addValue = '';
                }
            },

            /**
             * 对名称进行判空及判重
             * @param self
             */
            handleEditConfirm(self) {
                const vm = this;
                const {mergedProps, list} = this;
                let value = vm.editingValue;
                let error = false;

                if (!value){
                    $message.error('名称不能为空');
                    vm.$refs.editTagInput[0].$refs.input.select();
                    error = true;

                } else if (value !== self[mergedProps.label]) {

                    if (list.some(item => item !== self && `${item[mergedProps.label]}`.trim() === value)){
                        $message.error('名称重复');
                        vm.$refs.editTagInput[0].$refs.input.select();
                        error = true;

                    } else {
                        vm.$emit('edit', self, value);
                    }
                }

                if (!error) {
                    vm.editingItem = null;
                    vm.editingValue = '';
                }
            },
        }
    }
</script>
<style scoped lang="less">
    .tags__item {
        display: inline-block;
        margin-right: 10px;
    }
    .label-tag{
        display: inline-block;
        box-sizing: border-box;
        height: 32px;
        padding: 0 10px;
        margin-bottom: 5px;
        border: 1px solid #DCDFE6;
        border-radius: 4px;
        line-height: 30px;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
        i{
            height: 16px;
            width: 16px;
            border-radius: 50%;
            text-align: center;
            font-size: 12px;
            line-height: 16px;
            vertical-align: middle;
        }
        i:hover{
            background-color: #409eff;
            color: #fff;
        }
    }
    .tags__item:hover{
        color: #409eff;
        border-color: #d9ecff;
    }
    .tags__item_active{
        color: #409eff;
        border-color: #d9ecff;
        cursor: text;
    }
    .el-icon-close{
        cursor: pointer;
    }
    .input-tag {
        margin-bottom: 5px;
    }
    .input-tag_new {
        width: 80px;
    }
    .button-new-tag {
        height: 32px;
        width: 80px;
        padding-top: 0;
        padding-bottom: 0;
        margin-bottom: 5px;
        vertical-align: top;
        line-height: 30px;
    }
</style>