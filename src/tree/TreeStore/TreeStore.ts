import type { ITreeItem, TTreeItemId } from "@/types";

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

  getAllChildren(id: TTreeItemId): ITreeItem[] {
    const result: ITreeItem[] = [];
    const stack = Array.from(this.childrenByParent.get(id) ?? []);

    while (stack.length) {
      const currentId = stack.pop()!;
      const item = this.itemsById.get(currentId);
      if (!item) continue;

      result.push(item);

      const children = this.childrenByParent.get(currentId);

      if (children) {
        stack.push(...Array.from(children));
      }
    }

    return result;
  }

  /** Обновление элемента */
  updateItem(item: ITreeItem): void {
    const prev = this.itemsById.get(item.id);
    if (!prev) return;

    if (prev.parent !== item.parent) {
      this.childrenByParent.get(prev.parent)?.delete(item.id);

      if (!this.childrenByParent.has(item.parent)) {
        this.childrenByParent.set(item.parent, new Set());
      }
      this.childrenByParent.get(item.parent)!.add(item.id);
    }

    this.itemsById.set(item.id, item);
  }

  /** Удаление элемента и всего поддерева */
  removeItem(id: TTreeItemId): void {
    const toRemove = [id];

    for (let i = 0; i < toRemove.length; i++) {
      const currentId = toRemove[i];
      const children = this.childrenByParent.get(currentId);

      if (children) {
        toRemove.push(...Array.from(children));
      }
    }

    for (const removeId of toRemove) {
      const item = this.itemsById.get(removeId);

      if (!item) continue;

      this.childrenByParent.get(item.parent)?.delete(removeId);
      this.childrenByParent.delete(removeId);
      this.itemsById.delete(removeId);
    }
  }
}
