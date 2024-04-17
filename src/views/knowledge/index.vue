<template>
<div class="app-container">
    <el-form :inline="true" :model="search_form" class="demo-form-inline">
        <el-form-item label="产品名称">
            <el-input v-model="search_form.product_name" clearable />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="search">查询</el-button>
        </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" style="width: 100%" element-loading-text="Loading" border fit highlight-current-row>
        <!-- 列 -->
        <el-table-column prop="address" label="产品Code"></el-table-column>
        <el-table-column prop="address" label="产品类目"></el-table-column>
        <el-table-column prop="date" label="产品名称" width="80"></el-table-column>
        <el-table-column prop="name" label="产品别名" width="100"></el-table-column>
        <el-table-column prop="address" label="销售卖点"></el-table-column>
        <el-table-column prop="address" label="产品状态"></el-table-column>
        <el-table-column prop="address" label="创建时间"></el-table-column>
        <el-table-column prop="address" label="操作"></el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="page" :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
</div>
</template>

<script>
import {
    getList
} from '@/api/products'

export default {
    data() {
        return {
            list: null,
            listLoading: true,
            page: 1,
            pageSize: 15,
            total: 0,
            search_form: {
                product_name: ''
            }
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        fetchData() {
            this.listLoading = true
            const params = {
                page: this.page,
                page_size: this.pageSize,
                product_name: this.search_form.product_name
            }
            getList(params).then(response => {
                this.list = response.data
                this.total = response.total
                this.listLoading = false
            }).catch(error => {
                console.error(error)
                this.$message({
                    message: error,
                    type: 'error'
                })
                this.listLoading = false
            })
        },
        search() {

        },
        handleSizeChange(){

        },
        handleCurrentChange(){

        }
    }
}
</script>
