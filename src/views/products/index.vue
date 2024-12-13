<template>
  <div class="app-container">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="产品名称">
        <el-input v-model="productName" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="default" @click="search" icon="el-icon-search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="showForm" icon="el-icon-plus">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="list" style="width: 100%" element-loading-text="Loading" border fit
      highlight-current-row>
      <!-- 列 -->
      <el-table-column prop="category" label="产品类目" align="center" width="120"></el-table-column>
      <el-table-column prop="name" label="产品名称" width="250"></el-table-column>
      <el-table-column label="销售卖点" width="*" prop="sales_point">
      </el-table-column>
      <el-table-column label="产品状态" align="center" width="120">
        <template slot-scope="scope">
          {{ statusText(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="example-pagination-block">
      <el-pagination hide-on-single-page align="center" layout="prev, pager, next" :page-size="pageSize"
        v-model:current-page="page" :total="total" @current-change="handleCurrentChange" />
    </div>
    <el-dialog :visible="dialogVisible" :title="formTitle" width="600" :before-close="closeDialog">
      <el-form :model="productEditorForm" ref="productEditorForm" @submit="handleSubmit" :rules="formRules"
        label-width="100px">
        <input type="hidden" v-model="productEditorForm.uid" />
        <el-form-item label="产品分类" prop="category">
          <el-input v-model="productEditorForm.category" name="category" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productEditorForm.name" name="name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="产品别名" prop="nick_name">
          <el-input v-model="productEditorForm.nick_name" name="nick_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="销售卖点" prop="sales_point">
          <el-input v-model="productEditorForm.sales_point" type="textarea" :rows="3" name="sales_point"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="销售策略" prop="sales_strategy">
          <el-input v-model="productEditorForm.sales_strategy" type="textarea" :rows="3" name="sales_strategy"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="产品政策" prop="policy">
          <el-input v-model="productEditorForm.policy" name="policy" type="textarea" :rows="3"
            autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="过期日期" prop="expire_date">
          <el-date-picker v-model="productEditorForm.expire_date" name="expire_date" type="date" placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="产品状态" prop="status">
          <el-select v-model="productEditorForm.status" placeholder="请选择" name="status">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getList, updateProduct, addProduct, delProduct } from "@/api/products";

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
      list: null,
      listLoading: true,
      page: 1,
      pageSize: 15,
      total: 0,
      productName: "",
      dialogVisible: false,
      formRules: {
        category: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        name: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        nick_name: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        status: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ]
      },
      statusOptions: [
        {
          label: "上架",
          value: "1",
        },
        {
          label: "下架",
          value: "0",
        },
      ],
      productEditorForm: {
        uid: "",
        category: "",
        name: "",
        nick_name: "",
        sales_point: "",
        sales_strategy: "",
        policy: "",
        expire_date: "",
        status: "",
      },
      formTitle: "",
    };
  },
  created() {
    this.fetchData();
  },
  computed: {},
  methods: {
    statusText(status) {
      if (status == 1) return "上架";
      else if (status == 0) return "下架";
      else return "未知";
    },
    fetchData() {
      this.listLoading = true;
      const params = {
        page: this.page,
        page_size: this.pageSize,
        product_name: this.productName,
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
    showForm(action) {
      this.dialogVisible = true;
      if (typeof action === 'object') {
        this.clearForm();
        action = '新增';
      }
      this.formTitle = action + "产品";
    },
    search() {
      this.page = 1;
      this.fetchData();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.fetchData();
    },
    handleSubmit() {
      this.$refs.productEditorForm.validate((valid) => {
        if (valid) {
          if (this.productEditorForm.uid === "") {
            addProduct(this.productEditorForm)
              .then((response) => {
                console.log(response);
                this.dialogVisible = false;
                this.$message({
                  message: response.msg,
                  type: "success",
                });
                this.clearForm();
                this.fetchData();
              })
              .catch((error) => {
                console.error(error);
                this.$message({
                  message: error,
                  type: "error",
                });
              });
          } else {
            updateProduct(this.productEditorForm)
              .then((response) => {
                this.dialogVisible = false;
                this.$message({
                  message: response.msg,
                  type: "success",
                });
                this.fetchData();
              })
              .catch((error) => {
                console.error(error);
                this.$message({
                  message: error,
                  type: "error",
                });
              });
          }
        }
      });
    },
    clearForm() {
      this.productEditorForm = {
        uid: "",
        category: "",
        name: "",
        nick_name: "",
        sales_point: "",
        sales_strategy: "",
        policy: "",
        expire_date: "",
        status: "",
      };
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delProduct({
            uid: row.uid
          }).then(resp => {
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            this.fetchData();
          })

        })
    },
    handleEdit(row) {
      row.status = String(row.status);
      this.productEditorForm = row;
      this.showForm('编辑');
    },
  },
};
</script>

<style scoped>
.example-pagination-block+.example-pagination-block {
  margin-top: 10px;
}
</style>
