<template>
    <div class="app-container">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
            <el-form-item label="客户">
                <el-select v-model="searchForm.customers" multiple filterable remote reserve-keyword placeholder="请选择客户"
                    remote-show-suffix :remote-method="searchCustomers" :loading="loading" style="width: 240px">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="商机状态">
                <el-select v-model="searchForm.strategy" multiple collapse-tags collapse-tags-tooltip
                    style="width: 240px">
                    <el-option v-for="item in strategyOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="searchOpportunities" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>
        <el-table v-loading="listLoading" :data="list" style="width: 100%" element-loading-text="Loading" border fit
            highlight-current-row>
            <!-- 列 -->
            <el-table-column prop="customer.nick_name" label="客户姓名" width="180"></el-table-column>
            <el-table-column prop="product.name" label="产品名称" width="180"></el-table-column>
            <el-table-column label="标签" width="*">
                <template slot-scope="scope">
                    <el-tag class='user-tag' v-for="item in scope.row.customer.tags" v-bind:key="item">
                        {{ item }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="customer.appointment_date" label="预约日期" width="180" align="center"></el-table-column>
            <el-table-column prop="strategy" label="生命周期" width="100" align="center">
                <template slot-scope="scope">
                    {{ strategyText(scope.row.strategy) }}
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
    </div>
</template>

<script>
import { getList, updateOpportunity } from "@/api/opportunities";

export default {
    data() {
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
            options: [],
            searchForm: {
                customers: [],
                strategy: "",
            },
            editForm: {
            },
            fetchParam: {
                customers: [],
                strategy: "",
            },
            strategyOptions: [
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
                }
            ]
        };
    },
    created() {
        this.fetchData();
    },
    methods: {
        searchOpportunities(query) {
            if (query) {
                this.loading = true
                getList({
                    page_size: 20,
                    keywords: query
                }).then((response) => {
                    let temp = []
                    for (let i = 0; i < response.data.length; i++) {
                        let label;
                        let item = response.data[i]
                        if (item.remark && item.remark.length > 0)
                            label = item.remark + " (" + item.nick_name + ")"
                        else
                            label = item.nick_name
                        temp.push({
                            label: label,
                            key: item.uid,
                            value: item.uid
                        })
                    }
                    this.options = temp
                    this.loading = false
                }).catch((error) => {
                    console.error(error);
                    this.$message({
                        message: error,
                        type: "error",
                    });
                    this.loading = false
                })
            } else {
                this.options = []
            }
        },
        handleDrawClose() {
            this.showDrawer = false
        },
        handleEdit(row) {
            this.editForm = row
            this.showDrawer = true
        },
        submitEditForm() {
        },
        fetchData() {
            this.listLoading = true;
            const params = {
                page: this.page,
                page_size: this.pageSize,
                customers: this.fetchParam.customers,
                strategy: this.fetchParam.strategy,
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
            this.fetchParam.customers = this.searchForm.customers;
            this.fetchParam.strategy = this.searchForm.strategy;
            this.page = 1;
            this.fetchData();
        },
        handleCurrentChange(val) {
            this.page = val;
            this.fetchData();
        },
        statusText(val) {
            if (val == 1) return "正常";
            else return "已删除";
        },
        strategyText(val) {
            if (val === '1')
                return "有意向"
            else if (val === '2')
                return "跟进中"
            else if (val === '3')
                return "成交过"
            else if (val === '4')
                return "失败过"
        }
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