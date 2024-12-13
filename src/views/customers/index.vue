<template>
  <div class="app-container">

    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="客户">
        <el-input v-model="searchForm.keywords" placeholder="名称/电话/标签" clearable />
      </el-form-item>
      <el-form-item label="预约日期">
        <el-date-picker v-model="searchForm.appoint_date" type="daterange" unlink-panels range-separator="—"
          start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item label="生命周期">
        <el-select v-model="searchForm.life_cycle" placeholder="请选择">
          <el-option v-for="item in leftCycleOptions" :key="item.value" :value="item.value"
            :label="item.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search" icon="el-icon-search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-dropdown @command="handleCommand">
          <el-button>
            更多<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="refreshLabels" icon="el-icon-refresh">同步标签</el-dropdown-item>
            <el-dropdown-item command="syncContacts" icon="el-icon-refresh">同步WX好友</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="list" style="width: 100%" element-loading-text="Loading" border fit
      highlight-current-row @selection-change="handleSelectionChange" height="800">
      <!-- 列 -->
      <el-table-column type="selection" width="55" align="center">
      </el-table-column>
      <el-table-column label="头像" width="75" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" style="width:50px; height:50px;" />
        </template>
      </el-table-column>
      <el-table-column label="名称" width="300">
        <template slot-scope="scope">
          <span v-if="scope.row.remark != ''">{{ scope.row.remark }} ({{ scope.row.nick_name }})</span>
          <span v-if="scope.row.remark == ''">{{ scope.row.nick_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80" align="center">
        <template slot-scope="scope">
          {{ scope.row.sex == 1 ? '男' : scope.row.sex == 2 ? '女' : '未知' }}
        </template>
      </el-table-column>
      <el-table-column label="地区" width="200">
        <template slot-scope="scope">
          {{ scope.row.province }}/{{ scope.row.city }}
        </template>
      </el-table-column>
      <el-table-column label="标签" width="*">
        <template slot-scope="scope">
          <el-tag class='user-tag' v-for="item in scope.row.tags" v-bind:key="item">
            {{ showTag(item) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="appointment_date" label="预约日期" width="180" align="center"></el-table-column>
      <el-table-column prop="life_cycle" label="生命周期" width="100" align="center">
        <template slot-scope="scope">
          {{ lifeCycleText(scope.row.life_cycle) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="example-pagination-block" style="margin-top:14px;">
      <div style="display:inline-block">
        <el-button type="danger" @click="selectedDelete()" v-bind:disabled="multipleFlag">删除</el-button>
      </div>
      <div style=" float:right;">
        <el-pagination hide-on-single-page align="right" layout="prev, pager, next" :page-size="pageSize"
          :current-page.sync="page" :total="total" @current-change="handleCurrentChange" />
      </div>
    </div>
    <el-drawer :visible.sync="showDrawer" title="客户详情" :direction="direction" :before-close="handleDrawClose"
      ref="drawer">
      <div class="drawer__content">
        <el-form :model="editForm">
          <el-form-item label="客户备注" :label-width="formLabelWidth">
            <el-input v-model="editForm.remark" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="微信昵称" :label-width="formLabelWidth">
            <el-input v-model="editForm.nick_name" readonly autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="联系电话" :label-width="formLabelWidth">
            <el-input v-model="editForm.phone" readonly autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="客户说明" :label-width="formLabelWidth">
            <el-input v-model="editForm.desc" autocomplete="off" type="textarea" autosize
              :autosize="{ minRows: 2, maxRows: 4 }"></el-input>
          </el-form-item>
          <el-form-item label="预约日期" :label-width="formLabelWidth">
            <el-date-picker v-model="editForm.appointment_date" type="date" placeholder="预约日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="所属周期" :label-width="formLabelWidth">
            <el-select v-model="editForm.life_cycle">
              <el-option label="有意向" value="1"></el-option>
              <el-option label="跟进中" value="2"></el-option>
              <el-option label="成交过" value="3"></el-option>
              <el-option label="失败过" value="4"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户标签" :label-width="formLabelWidth">
            <el-input v-model="editForm.tag" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div class="drawer__footer">
          <el-button @click="$refs.drawer.closeDrawer()">取 消</el-button>
          <el-button type="primary" @click="submitEditForm" :loading="loading">{{ loading ? '提交中 ...' : '确定'
            }}</el-button>
        </div>
      </div>

    </el-drawer>
  </div>
</template>

<script>
import { getList, updateCustomer, refreshContacts, checkContactsRefresh, deleteCustomers } from "@/api/customers";
import { mapGetters } from 'vuex'

export default {
  data() {
    const validateNotNull = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error("内容不能为空"));
      } else {
        callback();
      }
    };
    return {
      direction: "rtl",
      list: null,
      listLoading: true,
      loading: false,
      page: 1,
      pageSize: 15,
      multipleSelection: null,
      multipleFlag: true,
      total: 0,
      showDrawer: false,
      formLabelWidth: "80px",
      checkTimer: null,
      searchForm: {
        keywords: "",
        life_cycle: "",
        appoint_date: "",
      },
      editForm: {
      },
      fetchParam: {
        keywords: "",
        life_cycle: "",
        appoint_date_start: "",
        appoint_date_end: "",
      },
      leftCycleOptions: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "有意向",
          value: "1",
        },
        {
          label: "跟进中",
          value: "2",
        },
        {
          label: "成交过",
          value: "3",
        },
        {
          label: "失败过",
          value: "4",
        },
      ],
      customerTypeOptions: [
        {
          label: "",
          value: "",
        },
        {
          label: "",
          value: "",
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      'labels_dict'
    ])
  },
  created() {
    this.fetchData();
  },
  methods: {
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.multipleFlag = false
      } else {
        this.multipleFlag = true
      }
      this.multipleSelection = val;
    },
    selectedDelete(id) {
      let ids = []
      if (!id) {
        this.multipleSelection.forEach(item => {
          ids.push(item.id)
        })
      } else {
        ids.push(id)
      }
      ids = ids.join(',')
      this.$confirm('一旦删除将无法恢复，请问是否确定删除？', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCustomers({ ids: ids })
          .then((resp) => {
            this.$message({
              type: 'success',
              message: '删除成功'
            });
            this.fetchData()
          })
          .catch((err) => {
            console.error(err)
            this.$message({
              type: 'info',
              message: '删除失败'
            });
          })
      })
    },
    handleDelete(row) {
      this.selectedDelete(row.id)
    },
    handleCommand(command) {
      if (command === 'refreshLabels') {
        this.refreshLabels()
      } else if (command === 'syncContacts') {
        this.syncContacts()
      }
    },
    showTag(tagInfo) {
      let tagId = tagInfo.split(':')[0]
      if (this.labels_dict[tagId]) {
        tagId = parseInt(tagId)
        return this.labels_dict[tagId]
      }
      else {
        return '未知'
      }
    },
    syncContacts() {
      if (this.checkTimer) {
        this.$message({ 'message': '已经在同步，请勿重复操作', 'type': 'error' })
        return
      }
      refreshContacts()
        .then((resp) => {
          this.$message({ 'message': '开始同步通讯录信息', 'type': 'success' })
          this.checkTimer = setInterval(() => {
            checkContactsRefresh().then((resp) => {
              if (resp.code === 200 && resp.data === "done") {
                clearInterval(this.checkTimer)
                this.checkTimer = null
                this.$message({ 'message': '同步完成', 'type': 'success' })
                this.page = 1
                this.fetchData()
              }
            })
          }, 5000)
        })
        .catch((err) => {
          console.error(err)
          this.$message({ 'message': err, 'type': 'error' })
        })
    },
    refreshLabels() {
      this.$store.dispatch('labels/refreshLabels').then((data) => {
        this.$message({ 'message': '标签刷新成功', 'type': 'success' })
      }).catch((err) => {
        console.error(err)
        this.$message({ 'message': err, 'type': 'error' })
      })
    },
    handleDrawClose() {
      this.showDrawer = false
    },
    handleEdit(row) {
      this.editForm = row
      this.showDrawer = true
    },
    submitEditForm() {
      this.loading = true
      this.editForm.tag = this.editForm.tag.replace("，", ",")
      this.editForm.tag = this.editForm.tag.replace("、", ",")
      updateCustomer(this.editForm)
        .then((response) => {
          this.loading = false;
          this.showDrawer = false;

          this.$message({
            message: "提交成功",
            type: "success",
          });
          this.fetchData();
        })
        .catch((err) => {
          this.loading = false;
          console.error(err);
          this.$message({
            message: err,
            type: "error",
          });
        });
    },
    lifeCycleText(lifeCycle) {
      if (lifeCycle === '1')
        return "有意向"
      else if (lifeCycle === '2')
        return "跟进中"
      else if (lifeCycle === '3')
        return "成交过"
      else if (lifeCycle === '4')
        return "失败过"

    },
    statusText(status) {
      if (status == 1) return "正常";
      else return "已删除";
    },
    fetchData() {
      this.listLoading = true;
      const params = {
        page: this.page,
        page_size: this.pageSize,
        keywords: this.fetchParam.keywords,
        life_cycle: this.fetchParam.life_cycle,
        appoint_date_start: this.fetchParam.appoint_date_start,
        appoint_date_end: this.fetchParam.appoint_date_end,
      };
      getList(params)
        .then((response) => {
          this.listLoading = false;
          this.list = response.data;
          this.total = response.count;
        })
        .catch((error) => {
          this.listLoading = false;
          console.error(error);
          this.$message({
            message: error,
            type: "error",
          });
        });
    },
    search() {
      this.fetchParam.keywords = this.searchForm.keywords;
      this.fetchParam.life_cycle = this.searchForm.life_cycle;
      if (this.searchForm.appoint_date.length === 2) {
        this.fetchParam.appoint_date_start =
          this.searchForm.appoint_date[0].toLocaleDateString() + " 00:00:00";
        this.fetchParam.appoint_date_end =
          this.searchForm.appoint_date[1].toLocaleDateString() + " 23:59:59";
      }
      this.page = 1;
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.fetchData();
    },
  },
};
</script>

<style scoped>
.example-pagination-block+.example-pagination-block {
  margin-top: 10px;
}

.user-tag {
  margin-left: 5px;
}

.drawer__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
}

.drawer__content form {
  flex: 1;
}

.drawer__footer {
  display: flex;
}

.drawer__footer button {
  flex: 1;
}
</style>
