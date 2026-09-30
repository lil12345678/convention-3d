// 创建用户信息仓库
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
export const userStore = defineStore('user', () => {
  let name = ref('张三')
  let age = ref(18)
  let obj = reactive({
    username: '韩梅梅',
    address: '北京',
  })

  const changeName = (val) => {
    name.value = val
  }

  return {
    name,
    age,
    obj,
    changeName,
  }
})
