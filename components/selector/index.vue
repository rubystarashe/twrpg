<template>
  <div>
    TARGETS
    {{ p_accounts }}
    {{ p_jobs }}
    {{ p_targets }}
    {{ p_target }}
    {{ p_focus }}
  </div>
</template>

<script setup>
const p_accounts = defineProp('accounts')
const p_jobs = defineProp('jobs')
const p_targets = defineProp('targets')
const p_target = defineProp('target')
const p_focus = defineProp('focus')
</script>
