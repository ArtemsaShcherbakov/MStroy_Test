import { computed } from "vue";

import { TreeStore } from "@/tree/TreeStore/TreeStore";

import { ITEMS } from "@/data";
import { COLUMN_NAME, CATEGORY_VALUE } from "../TreeGrid.constants";

import type { ITreeItem, TTreeItemId } from "@/types";

export const useTreeGrid = () => {
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

  const columnDefs = computed(() => [
    {
      headerName: COLUMN_NAME.CATEGORY,
      valueGetter: (params: any) => valueGetterCategory(params.data.id),
    },
    {
      field: "label",
      headerName: COLUMN_NAME.NAME,
      flex: 1,
    },
  ]);

  return {
    store,
    rowData,
    columnDefs,
    getDataPath,
    valueGetterCategory,
  };
};
