<template>
  <ul class="contextmenu">
    <li
      v-for="item in menu"
      class="contextmenu__item"
      :key="item.action || item.name"
      :id="item.action || item.name"
    >
      <div @click.stop="fnHandler(item)" class="contextmenu_button">
        <i v-if="icon" :class="item.icon"></i>
        <span>{{ item.name }}</span>
        <i
          class="el-icon-arrow-right"
          v-if="item.children && item.children.length > 0"
        ></i>
        <context-menu
          v-if="item.children && item.children.length > 0"
          :menu="item.children"
          :icon="icon"
          :resolve="resolve"
        ></context-menu>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'context-menu',
  props: {
    // customEvent: {
    //   type: Object
    // },
    icon: {
      // 是否显示icon
      type: Boolean,
      default: true
    },
    menu: {
      // 最重要的列表，没有的话直接不显示
      type: Array,
      default() {
        return [];
      }
    },
    resolve: {
      // 点击menu按钮时执行的方法
      type: Function,
      default: function() {

      }
    }
    // reject: { // 不点击按钮点击其他地方关闭时执行的方法 .catch(e => {})
    //   type: Function,
    //   default: function() {}
    // }
  },
  data() {
    return {
      status: false
    };
  },
  methods: {
    fnHandler(item) {
      if(item.children&&item.children.length>0){
        return false;
      }
      this.status = false;
      if (item.fn) item.fn(this.customEvent);
      this.resolve(item.action);
    }
  },
  beforeDestroy() {
    document.body.removeChild(this.$el);
  },
  mounted() {
    // 挂载后才开始计算左右，隐藏挂载后显示不会闪一下
    this.$nextTick(function() {
      this.status = true;
    });
  },
  components: {
  }
};
</script>
<style scoped lang="less">
  @menu-height: 24px;
  .contextmenu {
    margin: 0;
    box-shadow: 1px 2px 4px 2px rgba(0,0,0,.1);
    border: 1px solid #ddd;
  }

  .contextmenu__item {
    width: 140px;
    height: @menu-height;
    line-height: @menu-height;
    background: #fff;
    text-decoration: none;
    list-style: none;
    position: relative;

    .contextmenu_button {
      cursor: pointer;
      height: 100%;
      display: flex;
      align-items: center;
      outline: 0;
      border: 0;
      background: #fff;
      padding: 0 5px;
      color: #555;

      span {
        flex: 1;
        text-align: left;
        margin-left: 10px;
      }

      i {
        text-align: center;
      }

      .contextmenu {
        position: absolute;
        right: calc(-100% - 2px);
        top: -1px;
        display: none;
      }

      &:hover {
        background: #66a6e0;

        > .contextmenu {
          display: block;
        }

        > * {
          color: #fff;
        }
      }
    }
  }
</style>
