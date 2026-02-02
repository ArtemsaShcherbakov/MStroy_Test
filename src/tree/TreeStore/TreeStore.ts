import { ITreeItem, TTreeItemId } from "@/types";

export class TreeStore {
  private itemsById = new Map<TTreeItemId, ITreeItem>();
  private childrenByParent = new Map<TTreeItemId | null, Set<TTreeItemId>>();

  constructor(items: ITreeItem[]) {
    for (const item of items) {
      this.addItem(item);
    }
  }

  /** Возвращает исходный массив */
  getAll(): ITreeItem[] {
    return Array.from(this.itemsById.values());
  }

  /** Возвращает элемент по id */
  getItem(id: TTreeItemId): ITreeItem {
    return this.itemsById.get(id);
  }

  /** Цепочка родителей */
  getAllParents(id: TTreeItemId): ITreeItem[] {
    const result: ITreeItem[] = [];
    let current = this.itemsById.get(id);

    while (current) {
      result.push(current);

      if (current.parent == null) break;

      current = this.itemsById.get(current.parent);
    }

    return result;
  }

  /** Прямые дети */
  getChildren(id: TTreeItemId): ITreeItem[] {
    const children = this.childrenByParent.get(id);

    if (!children) return [];

    return Array.from(children).map((childId) => this.itemsById.get(childId)!);
  }

  /** Добавление элемента */
  addItem(item: ITreeItem): void {
    this.itemsById.set(item.id, item);

    if (!this.childrenByParent.has(item.parent)) {
      this.childrenByParent.set(item.parent, new Set());
    }

    this.childrenByParent.get(item.parent)!.add(item.id);
  }
}
