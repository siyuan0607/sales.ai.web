<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="业务背景">
        <el-input v-model="form.business_background" type="textarea" rows="8" />
      </el-form-item>
      <el-form-item label="生命周期追踪">
        <el-input v-model="form.lifecycle_strategy" type="textarea" rows="8" />
      </el-form-item>
      <el-form-item label="客群应对策略">
        <el-input v-model="form.customer_strategy" type="textarea" rows="8" />
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" @click="onSubmit"
          >保存</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getConfig, updateConfig } from "@/api/assistants";

export default {
  data() {
    return {
      form: {
        business_background: "",
        lifecycle_strategy: "",
        customer_strategy: "",
      },
      loading: false,
    };
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    onSubmit() {
      this.loading = true;
      updateConfig(this.form)
        .then((response) => {
          this.loading = false;
          this.$message({
            message: "保存成功",
            type: "success",
          });
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
    loadConfig() {
      getConfig().then((response) => {
        this.form = response.data;
      });
    },
  },
};
</script>

<style scoped></style>
