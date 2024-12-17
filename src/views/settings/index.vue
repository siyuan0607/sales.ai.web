<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="助理ID">
        <el-input v-model="form.agent_uid" />
      </el-form-item>
      <el-form-item label="助理配置">
        <el-input v-model="form.agent_config" type="textarea" rows="20" />
      </el-form-item>
      <el-form-item>
        <el-button :loading="loading" type="primary" @click="onSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getConfig, updateConfig } from "@/api/user_settings";

export default {
  data() {
    return {
      form: {
        agent_uid: "",
        agent_config: "",
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
        });
    },
    loadConfig() {
      getConfig().then((response) => {
        this.form = response.data;
        let config = this.form.agent_config
        this.form.agent_config = JSON.stringify(config, null, 2);
      });
    },
  },
};
</script>

<style scoped></style>
