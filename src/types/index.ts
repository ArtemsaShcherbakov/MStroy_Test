export type TTreeItemId = string | number;

export interface ITreeItem {
  id: TTreeItemId;
  parent: TTreeItemId | null;
  label?: string;
  [key: string]: any;
}
