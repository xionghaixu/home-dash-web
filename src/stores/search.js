import { defineStore } from 'pinia'
import {
  getSearchHistory,
  clearSearchHistory as clearHistoryApi,
  getHotFilters,
  searchFilesAdvanced,
  getSearchSuggestions
} from '@/apis/file'

/**
 * 搜索状态管理
 */
export const useSearchStore = defineStore('search', {
  state: () => ({
    keyword: '',
    filters: {
      types: [],
      dateRange: null,
      sizeRange: null,
      directoryPath: null,
      favorite: false,
      tags: []
    },
    results: [],
    total: 0,
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    loading: false,
    history: [],
    hotSearches: [],
    suggestions: [],
    selectedFiles: [],
    layoutMode: 'list'
  }),

  getters: {
    hasActiveFilters: state => {
      const f = state.filters
      return (
        f.types.length > 0 ||
        f.dateRange !== null ||
        f.sizeRange !== null ||
        Boolean(f.directoryPath) ||
        f.favorite ||
        f.tags.length > 0
      )
    },

    offset: state => (state.page - 1) * state.pageSize,

    hasSelectedFiles: state => state.selectedFiles.length > 0,

    selectedFileIds: state => state.selectedFiles
  },

  actions: {
    setKeyword(keyword) {
      this.keyword = keyword
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        types: [],
        dateRange: null,
        sizeRange: null,
        directoryPath: null,
        favorite: false,
        tags: []
      }
    },

    setPage(page) {
      this.page = page
    },

    setPageSize(size) {
      this.pageSize = size
      this.page = 1
    },

    setSort(sortBy, sortOrder) {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },

    setResults(results, total) {
      this.results = results
      this.total = total
    },

    setLoading(loading) {
      this.loading = loading
    },

    setHistory(history) {
      this.history = history
    },

    setHotSearches(hotSearches) {
      this.hotSearches = hotSearches
    },

    setSuggestions(suggestions) {
      this.suggestions = suggestions
    },

    setLayoutMode(mode) {
      this.layoutMode = mode
    },

    toggleFileSelection(fileId) {
      const index = this.selectedFiles.indexOf(fileId)
      if (index > -1) {
        this.selectedFiles.splice(index, 1)
      } else {
        this.selectedFiles.push(fileId)
      }
    },

    clearSelection() {
      this.selectedFiles = []
    },

    selectAll(fileIds) {
      this.selectedFiles = [...fileIds]
    },

    async loadHistory() {
      try {
        const response = await getSearchHistory()
        this.history = response.data || []
      } catch {
        this.history = []
      }
    },

    async clearHistory() {
      try {
        await clearHistoryApi()
        this.history = []
      } catch {
        // ignore
      }
    },

    async loadHotSearches() {
      try {
        const response = await getHotFilters()
        this.hotSearches = response.data || []
      } catch {
        this.hotSearches = []
      }
    },

    async loadSuggestions(keyword) {
      if (!keyword || keyword.length < 1) {
        this.suggestions = []
        return
      }
      try {
        const response = await getSearchSuggestions(keyword)
        this.suggestions = response.data || []
      } catch {
        this.suggestions = []
      }
    },

    async executeSearch() {
      this.loading = true
      this.results = []

      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          ...this.buildFilterParams()
        }

        const response = await searchFilesAdvanced(this.keyword, params)
        const resultData = response.data || {}
        this.results = Array.isArray(resultData.files) ? resultData.files : []
        this.total = resultData.total || this.results.length
      } catch {
        this.results = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    buildFilterParams() {
      const params = {}
      const f = this.filters

      if (f.types && f.types.length > 0) {
        params.fileTypes = f.types
      }
      if (f.dateRange && f.dateRange.length === 2) {
        params.startDate = f.dateRange[0]
        params.endDate = f.dateRange[1]
      }
      if (f.sizeRange) {
        params.minSize = f.sizeRange.min
        params.maxSize = f.sizeRange.max
      }
      if (f.directoryPath) {
        params.directoryPath = f.directoryPath
      }
      if (f.favorite) {
        params.favoritesOnly = true
      }
      if (f.tags && f.tags.length > 0) {
        params.tags = f.tags
      }

      return params
    },

    resetSearch() {
      this.keyword = ''
      this.results = []
      this.total = 0
      this.page = 1
      this.selectedFiles = []
      this.resetFilters()
    }
  }
})
