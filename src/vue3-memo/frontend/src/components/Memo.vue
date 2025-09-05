<template>
  <div class="memo">
    <div class="act">
      <button class="btn btn-primary" @click="add()">+ 추가</button>
    </div>
    <ul>
      <li v-for="d in state.data" :key="d.id" @:click="edit(d.id)">{{ d.content }}</li>
    </ul>
  </div>
</template>
<script>
import { reactive } from "vue";
import axios from "axios";

export default {

  name: 'MemoComponent',
  setup() {
    const state = reactive({
      data: []
    });
    
    const add = () => {
      const content = prompt("메모 내용을 입력하세요.");
      if(!content) {
        return alert("메모 내용을 입력하세요.");
      }

      axios.post("/api/memos", { content }).then((res) => {
        state.data = res.data;
      })
    };

    const edit = (id) => {
      const content = prompt("메모 내용을 입력하세요.", state.data.findLast(d => d.id === id).content);

      axios.put("/api/memos/" + id, {content}).then((res) => {
        state.data = res.data;
      });
    }

    axios.get("/api/memos")
    .then((res) => {
      state.data = res.data;
    })

    return { state, add, edit }
  },
}
</script>
<!-- scoped : 현재 컴포넌트에서만 css를 적용하겠다 -->
<style leng="scss" scoped> 
  .memo {
    .act {
      text-align: right;
      padding: 10px 10px 5px 5px;
    }
     ul {
      border-top: 1px solid #eee;
      list-style: none;
      padding: 15px 0;
      margin: 0;
    }

    li {
      padding: 15px;
      margin: 5px;
      border: 1px solid #eee;
    }
  }
</style>