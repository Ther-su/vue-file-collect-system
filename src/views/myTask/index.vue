<template>
  <div class="my-task-container">
    <el-timeline>
      <el-timeline-item :timestamp="item.publishTime | dateFormat" placement="top" v-for="item in tasks" :key="item.id">
        <el-card>
          <div class="title-box">
            <h3>{{item.taskName}}</h3>
            <el-tag :type="item.status | statusTagFormat">{{item.status | statusFormat}}</el-tag>
          </div>
          <div class="deadline-box">
            <h4>截止日期</h4>
            <el-tag type="danger" effect="dark">{{item.deadline | dateFormat}}</el-tag>
          </div>
          <p>{{item.taskContent}}</p>
        </el-card>
      </el-timeline-item>
  </el-timeline>

    <el-pagination
      background
      layout="prev, pager, next"
      :total="1000">
    </el-pagination>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'myTask',
  methods: {
    getMyTask () {
      this.$store.dispatch('task/getMyTask')
        .then(() => {
        })
        .catch((e) => {
        })
    }
  },
  created () {
    this.getMyTask()
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      count: state => state.task.count
    })
  }
}
</script>
<style lang="scss" scoped>
.my-task-container {
  max-width:95%;
  width: 1000px;
  margin: 20px auto;
}
.title-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.deadline-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
