<template>
<div class="mat_tree">
  <div class="name"
    :class="{ usedby: !p_tree.under }"
  ><span v-if="p_isTarget" class="target">목표</span>{{ s_database.items[p_tree.target].name }}<span v-if="!p_tree.under" class="mat">재료</span></div>
  <div class="child" v-if="p_tree.under">
    <div class="treeicon"/>
    <PathFinderMatTree
      :tree="p_tree.under"
    />
  </div>
</div>
</template>

<script setup>
const p_tree = defineProp('tree')
const p_isTarget = defineProp('isTarget')

const s_database = useState('database')
</script>

<style lang="scss" scoped>
.mat_tree {
  margin-bottom: 1px;
  .name {
    margin-bottom: 3px;
    color: rgb(182, 186, 192);
    display: flex;
    align-items: center;
    font-size: 12px;
    &.usedby {
      color: white;
    }
    .target {
      color: rgb(217, 94, 71);
      margin-right: 5px;
      font-size: 10px;
    }
    .mat {
      color: rgb(94, 103, 234);
      margin-left: 5px;
      font-size: 10px;
    }
  }
  .child {
    padding-left: 5px;
    display: flex;
    .treeicon {
      width: 5px;
      height: 5px;
      border-bottom: 1px solid rgb(43, 45, 49);
      border-left: 1px solid rgb(43, 45, 49);
      margin-top: 4px;
      margin-right: 5px;
    }
  }
}
</style>
