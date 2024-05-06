<template>
  <div class="farm_tree">
    <div class="name" :class="{ makeable: c_makeable }">{{ p_tree[0].name }}<span class="target" v-if="p_tree.length == 1">목표</span>
    </div>
    <div class="child" v-if="p_tree.length > 1">
      <div class="treeicon"/>
      <PathFinderFarmTree
        :mat="p_tree[0].id"
        :tree="p_tree.slice(1)"
        :handle="[ ...p_handle, p_tree[0].id ]"
      />
    </div>
  </div>
</template>

<script setup>
const p_tree = defineProp('tree')
const p_isStart = defineProp('isStart')
const p_handle = defineProp('handle')
const p_mat = defineProp('mat')

const c_makeable = computed(() => {
  return p_tree.value[0].recipies.some(r => {
    return r.every(e => {
      if ([ ...p_handle.value, p_mat.value ].includes(e.item)) return true
    })
  })
})
</script>

<style lang="scss" scoped>
.farm_tree {
  margin-bottom: 1px;
  flex-shrink: 0;
  .name {
    margin-bottom: 3px;
    color: rgb(182, 186, 192);
    display: flex;
    align-items: center;
    font-size: 12px;
    flex-shrink: 0;
    &.makeable {
      color: rgb(94, 103, 234);
    }
    .target {
      color: rgb(217, 94, 71);
      margin-left: 5px;
      font-size: 10px;
      flex-shrink: 0;
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
