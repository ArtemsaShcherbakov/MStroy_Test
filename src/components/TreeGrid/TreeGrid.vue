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

<script lang="ts" setup>
import { computed } from "vue";
import { AgGridVue } from "ag-grid-vue3";
import { TreeStore } from "@/tree/TreeStore/TreeStore";
import type { ITreeItem, TTreeItemId } from "../../types";
import { ITEMS } from "../../data/constants";
import {
  DEFAULT_COL_DEF,
  AUTO_GROUP_COLUMN_DEF,
  COLUMN_NAME,
  CATEGORY_VALUE,
} from "./TreeGrid.constants";

const store = new TreeStore(ITEMS);

const rowData = computed<ITreeItem[]>(() => store.getAll());

const getDataPath = (data: ITreeItem): string[] =>
  store
    .getAllParents(data.id)
    .map((item) => String(item.id))
    .reverse();

const valueGetterCategory = (id: TTreeItemId) =>
  store.getChildren(id).length > 0
    ? CATEGORY_VALUE.GROUP
    : CATEGORY_VALUE.ELEMENT;

const columnDefs = [
  {
    headerName: COLUMN_NAME.CATEGORY,
    valueGetter: (params) => valueGetterCategory(params.data.id),
  },
  {
    field: "label",
    headerName: COLUMN_NAME.NAME,
    flex: 1,
  },
];
</script>
