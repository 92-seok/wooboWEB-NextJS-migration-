<template>
  <div class="memo">
    <div class="act">
      <button class="btn btn-primary" @click="add()">+ 추가</button>
    </div>
    <ul>
      <li v-for="d in state.data" :key="d.id" @click="edit(d.id)">
        {{ d.content }}
        <button @click.stop="remove(d.id)">삭제</button>
      </li>
    </ul>
  </div>
</template>
<script>
import { reactive, onMounted } from "vue";
import axios from "axios";

export default {
  name: 'MemoComponent',
  setup() {
    const state = reactive({ data: [] });

    // read
    const fetchdata = async () => {
      const res = await axios.get("/api/memos");
      state.data = res.data;
    };

    // CREATE
    const add = async () => {
      const content = prompt("메모 내용을 입력하세요.");
      if(!content) return;
      const res = await axios.post(`/api/memos/`, { content });
      state.data = res.data;
    };

    // UPDATE
    const edit = async (id) => {
      const target = state.data.find(d => d.id === id);
      const content = prompt("메모 수정.", target?.content);
      if(!content) return;
      const res = await axios.put(`/api/memos/${id}`, { content });
      state.data = res.data;
    };

     // DELETE
    const remove = async (id) => {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      const res = await axios.delete(`/api/memos/${id}`);
      state.data = res.data;
    };
    
    
    onMounted(fetchdata);

    return { state, add, edit, remove }
  }
};
</script>

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