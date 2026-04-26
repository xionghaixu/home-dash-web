<template>
  <div class="text-preview">
    <div class="preview-toolbar">
      <el-button-group>
        <el-button size="small" @click="toggleLineNumbers">
          <el-icon><Document /></el-icon>
          行号
        </el-button>
        <el-button size="small" @click="toggleWordWrap">
          <el-icon><Reading /></el-icon>
          换行
        </el-button>
        <el-button size="small" @click="copyContent">
          <el-icon><CopyDocument /></el-icon>
          复制
        </el-button>
      </el-button-group>
      <span v-if="fileName" class="file-name">{{ fileName }}</span>
    </div>
    <div ref="containerRef" class="text-content" :class="{ 'wrap-text': wordWrap }">
      <pre><code ref="codeRef" class="code-block">{{ displayContent }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Reading, CopyDocument } from '@element-plus/icons-vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  highlightKeyword: {
    type: String,
    default: ''
  }
})

const containerRef = ref(null)
const codeRef = ref(null)
const showLineNumbers = ref(true)
const wordWrap = ref(true)

const displayContent = computed(() => {
  if (!props.content) return ''

  let content = props.content

  // 关键词高亮
  if (props.highlightKeyword) {
    const regex = new RegExp(`(${escapeRegExp(props.highlightKeyword)})`, 'gi')
    content = content.replace(regex, '<mark class="keyword-highlight">$1</mark>')
  }

  return content
})

const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const toggleLineNumbers = () => {
  showLineNumbers.value = !showLineNumbers.value
  applyLineNumbers()
}

const toggleWordWrap = () => {
  wordWrap.value = !wordWrap.value
}

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    ElMessage.success('内容已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

const applyLineNumbers = () => {
  nextTick(() => {
    if (!codeRef.value) return

    const codeElement = codeRef.value
    const lines = props.content.split('\n')

    if (showLineNumbers.value) {
      let html = '<table class="line-number-table"><tbody>'
      lines.forEach((line, index) => {
        const lineNum = index + 1
        const lineContent = escapeHtml(line) || '&nbsp;'
        html += `<tr><td class="line-number">${lineNum}</td><td class="line-content">${lineContent}</td></tr>`
      })
      html += '</tbody></table>'
      codeElement.innerHTML = html
    } else {
      codeElement.textContent = props.content
    }
  })
}

const escapeHtml = text => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

watch(
  () => props.content,
  () => {
    applyLineNumbers()
  },
  { immediate: true }
)

watch(
  () => props.highlightKeyword,
  () => {
    applyLineNumbers()
  }
)
</script>

<style lang="scss" scoped>
.text-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-fill-base);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-fill-light);
  border-bottom: 1px solid var(--color-border-lighter);
}

.file-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.text-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-md);
}

.code-block {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  color: var(--color-text-primary);
}

.wrap-text .line-content {
  white-space: pre-wrap;
  word-break: break-all;
}

:deep(.line-number-table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.line-number) {
  width: 50px;
  padding-right: var(--spacing-md);
  text-align: right;
  color: var(--color-text-placeholder);
  font-size: var(--font-size-sm);
  user-select: none;
  border-right: 1px solid var(--color-border-lighter);
  vertical-align: top;
}

:deep(.line-content) {
  padding-left: var(--spacing-md);
  white-space: pre;
  word-break: break-all;
}

:deep(.keyword-highlight) {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
  padding: 1px 2px;
  border-radius: 2px;
}
</style>
