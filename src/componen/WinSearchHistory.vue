<template>

</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import useWindowResize from '../useWindowResize'
const storageKey = 'winex.searchHistory'

const { width, height } = useWindowResize()
let observer

// const storageKey = 'winex.console'
// let status = ref<boolean>(GM_getValue(storageKey, false))
// watch(status, (newStatus) => {
//   GM_setValue(storageKey, newStatus)
// })
onMounted(()=>{
	let searchInput = document.querySelector('.win-remote__patient')
  function showHistoryPannel(e) {
    e.target.removeEventListener('click', showHistoryPannel)
    console.log(localStorage.getItem(storageKey))
  }
	observer = new MutationObserver((mutationsList) => {
    console.log(444)
      console.log(mutationsList)
      let mutations = mutationsList.find(item => item.target.className === 'el-input__inner' && item.target.nodeName === 'INPUT')
      if (mutations) {
        let target = mutations.target
        target.addEventListener('click', showHistoryPannel)
      }
	})

  if (searchInput) {
    observer.observe(searchInput, {
      attributes: true,
      childList: true,
      subtree: true
    })
  }
})

onBeforeUnmount(() => {
  observer.disconnect()
	observer= null
})
</script>
