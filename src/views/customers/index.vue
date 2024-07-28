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
    </el-form>
    <el-table v-loading="listLoading" :data="list" style="width: 100%" element-loading-text="Loading" border fit
      highlight-current-row>
      <!-- 列 -->
      <el-table-column prop="nick_name" label="客户姓名" width="180"></el-table-column>
      <el-table-column label="标签" width="*">
        <template slot-scope="scope">
          <el-tag class='user-tag' v-for="item in scope.row.tags" v-bind:key="item">
            {{ item }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="appointment_date" label="预约日期" width="180" align="center"></el-table-column>
      <el-table-column prop="life_cycle" label="生命周期" width="100" align="center">
        <template slot-scope="scope">
          {{ lifeCycleText(scope.row.life_cycle) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          {{ statusText(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="example-pagination-block">
      <el-pagination hide-on-single-page align="center" layout="prev, pager, next" :page-size="pageSize"
        v-model:current-page="page" :total="total" @current-change="handleCurrentChange" />
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
import { getList, updateCustomer } from "@/api/customers";

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
      total: 0,
      showDrawer: false,
      formLabelWidth: "80px",
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
  created() {
    this.fetchData();
  },
  computed: {},
  methods: {
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
          this.total = response.total;
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
      console.log(this.searchForm.appoint_date);
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
