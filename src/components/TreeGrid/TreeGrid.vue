<script lang="ts" setup>
import { AgGridVue } from "ag-grid-vue3";

import { useTreeGrid } from "./composables/useTreeGrid";

import { DEFAULT_COL_DEF, AUTO_GROUP_COLUMN_DEF } from "./TreeGrid.constants";

const { rowData, columnDefs, getDataPath } = useTreeGrid();
</script>

<template>
  <ag-grid-vue
    class="ag-theme-alpine"
    style="width: 100%; height: 600px"
    :rowData="rowData"
    :columnDefs="columnDefs"
    :treeData="true"
    :getDataPath="getDataPath"
    :autoGroupColumnDef="AUTO_GROUP_COLUMN_DEF"
    :defaultColDef="DEFAULT_COL_DEF"
  />
</template>
