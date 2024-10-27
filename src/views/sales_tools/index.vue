<template>
  <div class="app-container">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="工具状态">
        <el-select v-model="searchStatus" placeholder="全部">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="search">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleShowAddForm" icon="el-icon-plus">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="list" style="width: 100%" element-loading-text="Loading" border fit
      highlight-current-row>
      <!-- 列 -->
      <el-table-column label="工具类型" align="center" width="100">
        <template slot-scope="scope">
          {{ toolTypeText(scope.row.tool_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="tool_name" label="工具名称" width="*"></el-table-column>
      <el-table-column prop="product.name" label="所属产品" width="180"></el-table-column>
      <el-table-column label="素材类型" width="120" align="center">
        <template slot-scope="scope">
          {{ resourceTypeText(scope.row.resource_type) }}
        </template>
      </el-table-column>
      <el-table-column label="素材展示" width="140" align="center">
        <template slot-scope="scope">
          <a :href="scope.row.signed_url" target="_blank" v-show="scope.row.resource_type == 'image'">
            <img :src="scope.row.signed_url" style="width: 100px; height: 100px;" /></a>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          {{ statusText(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建日期" width="120" align="center"></el-table-column>
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible="dialogVisible" width="600" :before-close="closeDialog">
      <el-form :model="salesToolsForm" ref="salesToolsForm" @submit="handleSubmit" :rules="formRules"
        label-width="100px">
        <input type="hidden" v-model="salesToolsForm.uid" />
        <el-form-item label="工具名称">
          <el-input v-model="salesToolsForm.tool_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="工具类型">
          <el-select v-model="salesToolsForm.tool_type" placeholder="请选择" name="status">
            <el-option v-for="item in toolTypeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属产品">
          <el-select v-model="salesToolsForm.product_uid" placeholder="请输入关键词" filterable remote reserve-keyword
            :remote-method="filterProduct" :loading="filterLoading">
            <el-option v-for="item in productOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工具状态">
          <el-select v-model="salesToolsForm.status" placeholder="请选择" name="status">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="素材类型">
          <el-select v-model="salesToolsForm.resource_type" placeholder="请选择">
            <el-option v-for="item in resourceTypeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="销售素材">
          <el-upload :on-error="uploadError" :on-success="uploadSuccess" drag :action="upload_url"
            :before-upload="beforeUpload" :auto-upload="true" v-show="salesToolsForm.resource_type == 'image'"
            ref="upload" :data="upload_data">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过5mb</div>
          </el-upload>
          <img :src="salesToolsForm.signed_url"
            v-show="salesToolsForm.resource_type == 'image' && salesToolsForm.signed_url != ''"
            style="width:100px; height:100px;" />
          <el-input type="textarea" rows="5" v-show="salesToolsForm.resource_type == 'text'"
            v-model="salesToolsForm.resource"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" rows="4" v-model="salesToolsForm.remark" autocomplete="off"></el-input>
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
import { getList, saveTools, delTool } from "@/api/sales_tools";
import { getProductList } from "@/api/products";
import store from "@/store";
import { getToken } from "@/utils/auth";
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
      upload_url: process.env.VUE_APP_BASE_API + "upload",
      upload_data: { action: 'images' },
      list: null,
      productOptions: [],
      listLoading: true,
      filterLoading: false,
      dialogVisible: false,
      searchStatus: '',
      formRules: {
        tool_name: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        tool_type: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        resource_type: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        resource: [
          {
            required: true,
            trigger: "blur",
            validator: validateNotNull,
          },
        ],
        product_uid: [
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
        ],
      },
      statusOptions: [
        {
          label: "正常",
          value: "1",
        },
        {
          label: "禁用",
          value: "0",
        },
      ],
      toolTypeOptions: [
        {
          label: "销售海报",
          value: "销售海报",
        },
        {
          label: "卖点总结",
          value: "卖点总结",
        },
        {
          label: "案例说明",
          value: "案例说明",
        },
      ],
      resourceTypeOptions: [
        {
          label: "图片",
          value: "image",
        },
        {
          label: "文本",
          value: "text",
        },
      ],
      salesToolsForm: {
        id: 0,
        uid: "",
        tool_name: "",
        tool_type: "",
        resource: "",
        status: "",
        product_uid: "",
        resource_type: "image",
        remark: "",
        signed_url: ""
      }
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    handleDelete(row) {
      // 确认删除操作后执行delSalesTool函数
      this.$confirm('一旦删除将无法恢复，请问是否确定删除？', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delTool({
          uid: row.uid
        }).then(resp => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.fetchData();
        })
      })
    },
    filterProduct(query) {
      if (query !== '') {
        this.filterLoading = true;
        getProductList({
          page: 1,
          page_size: 10,
          product_name: query
        }).then(resp => {
          this.productOptions.length = 0
          for (let i = 0; i < resp.data.length; i++) {
            let item = resp.data[i]
            this.productOptions.push({
              label: item.name,
              value: item.uid
            })
          }
          this.filterLoading = false
        })
      }
    },
    uploadError(err) {
      if (err.status === 413) {
        this.$message.error("文件过大，请重新上传")
      } else if (err.status === 400) {
        this.$message.error("文件格式错误，请上传jpg/png文件")
      } else {
        this.$message.error("上传失败，请稍后重试")
      }
    },
    uploadSuccess(resp, file, fileList) {
      if (resp.code === 200) {
        this.salesToolsForm.signed_url = resp.data.signed_url;
        this.salesToolsForm.resource = resp.data.resource;
      } else {
        this.$message.error(resp.msg)
      }
    },
    beforeUpload() {
      if (store.getters.token) {
        let token = getToken();
        this.$refs.upload.headers["Authorization"] = `Bearer ${token}`;
        return true
      }
      return false
    },
    statusText(status) {
      if (status == "1") return "正常";
      else if (status == "0") return "禁用";
      else return "未知";
    },
    toolTypeText(toolType) {
      if (toolType == "销售海报") return "销售海报";
      else if (toolType == "卖点总结") return "卖点总结";
      else if (toolType == "案例说明") return "案例说明";
      else return "未知";
    },
    resourceTypeText(resourceType) {
      if (resourceType == "image") return "图片";
      else if (resourceType == "text") return "文本";
      else return "未知";
    },
    fetchData() {
      this.listLoading = true;
      const params = {
        status: this.searchStatus,
      };
      getList(params)
        .then((response) => {
          this.listLoading = false;
          this.list = response.data;
        })
        .catch((error) => {
          this.listLoading = false;
        });
    },
    handleShowAddForm() {
      this.dialogVisible = true;
    },
    search() {
      this.fetchData();
    },
    handleSubmit() {
      this.$refs.salesToolsForm.validate((valid) => {
        if (valid) {
          saveTools(this.salesToolsForm)
            .then((response) => {
              this.dialogVisible = false;
              this.$message({
                message: "销售工具添加成功",
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

      });
    },
    clearForm() {
      this.salesToolsForm = {
        id: 0,
        uid: "",
        tool_name: "",
        tool_type: "",
        resource: "",
        resource_type: "image",
        status: 0,
        product_uid: 0,
        remark: ""
      }
    },
    closeDialog() {
      this.dialogVisible = false;
      this.clearForm();
    },
    handleEdit(row) {
      row.status = row.status.toString();
      this.salesToolsForm = row;
      this.dialogVisible = true;
    },
  },
};
</script>
