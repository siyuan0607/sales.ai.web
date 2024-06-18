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
      <el-form-item label="客群类型">
        <el-select v-model="searchForm.customer_type" placeholder="请选择">
          <el-option v-for="item in customerTypeOptions" :key="item.key" :value="item.value"
            :label="item.key"></el-option>
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
      <el-table-column prop="tag" label="标签" width="400"></el-table-column>
      <el-table-column prop="appointment_date" label="预约日期" width="180" align="center"></el-table-column>
      <el-table-column prop="life_cycle" label="生命周期" width="100" align="center">
      </el-table-column>
      <el-table-column prop="customer_type" label="客群类型" width="100" align="center">
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          {{ statusText(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="*">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="example-pagination-block">
      <el-pagination hide-on-single-page align="center" layout="prev, pager, next" :page-size="pageSize"
        v-model:current-page="page" :total="total" @current-change="handleCurrentChange" />
    </div>
    <el-drawer v-model="drawer" title="I am the title" :direction="direction">
      <span>Hi, there!</span>
    </el-drawer>
  </div>
</template>

<script>
import { getList } from "@/api/customers";

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
      page: 1,
      pageSize: 15,
      total: 0,
      drawer: false,
      searchForm: {
        keywords: "",
        life_cycle: "",
        customer_type: "",
        appoint_date: "",
      },
      fetchParam: {
        keywords: "",
        life_cycle: "",
        customer_type: "",
        appoint_date_start: "",
        appoint_date_end: "",
      },
      leftCycleOptions: [
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
    handleEdit(row) { },
    statusText(status) {
      if (status == 1) return "上架";
      else return "下架";
    },
    fetchData() {
      this.listLoading = true;
      const params = {
        page: this.page,
        page_size: this.pageSize,
        keywords: this.fetchParam.keywords,
        life_cycle: this.fetchParam.life_cycle,
        customer_type: this.fetchParam.customer_type,
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
      this.fetchParam.customer_type = this.searchForm.customer_type;
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
</style>
