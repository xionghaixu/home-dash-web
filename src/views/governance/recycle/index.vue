<template>
  <div class="recycle-bin-container">
    <div class="header-actions">
      <h2>回收站</h2>
      <el-button type="danger" @click="handleEmptyBin" :loading="emptyLoading">清空回收站</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%" class="recycle-table">
      <el-table-column prop="name" label="文件名" min-width="200" />
      <el-table-column prop="deletedAt" label="删除时间" width="180" />
      <el-table-column prop="size" label="大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleRestore(row)">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecycleBinList, restoreFiles, emptyRecycleBin } from '@/apis/recycleBin'
import { formatFileSize } from '@/utils/file'

const tableData = ref([])
const loading = ref(false)
const emptyLoading = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getRecycleBinList()
    tableData.value = res.data?.items || res.data || []
  } catch (error) {
    console.error('Failed to fetch recycle bin:', error)
    ElMessage.error('获取回收站列表失败')
  } finally {
    loading.value = false
  }
}

const handleRestore = async (row) => {
  try {
    await restoreFiles([row.id])
    ElMessage.success('恢复成功')
    fetchList()
  } catch (error) {
    ElMessage.error('恢复失败')
  }
}

const handleEmptyBin = async () => {
  try {
    await ElMessageBox.confirm('确定要清空回收站吗？此操作不可逆！', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    emptyLoading.value = true
    await emptyRecycleBin()
    ElMessage.success('已清空回收站')
    fetchList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  } finally {
    emptyLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.recycle-bin-container {
  padding: 24px;
  background-color: var(--color-bg-base);
  height: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}
</style>
