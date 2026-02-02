import { describe, it, expect, beforeEach } from "vitest";

import { TreeStore } from "./TreeStore";

import { ITEMS } from "@/data";

import type { ITreeItem } from "@/types";

let store: TreeStore;

beforeEach(() => {
  store = new TreeStore(ITEMS);
});

/* ======================================================
   getAll()
====================================================== */
describe("getAll()", () => {
  it("возвращает все элементы", () => {
    const all = store.getAll();
    expect(all).toHaveLength(ITEMS.length);
  });

  it("возвращает именно те же объекты (по ссылке)", () => {
    const all = store.getAll();
    expect(all[0]).toBe(ITEMS[0]);
  });

  it("изменение возвращённого массива не ломает хранилище", () => {
    const all = store.getAll();
    all.pop();

    expect(store.getAll()).toHaveLength(ITEMS.length);
  });
});

/* ======================================================
   getItem()
====================================================== */
describe("getItem()", () => {
  it("находит элемент по числовому id", () => {
    const item = store.getItem(1);
    expect(item?.label).toBe("Айтем 1");
  });

  it("находит элемент по строковому id", () => {
    const item = store.getItem("91064cee");
    expect(item?.label).toBe("Айтем 2");
  });

  it("возвращает undefined для несуществующего id", () => {
    expect(store.getItem(999)).toBeUndefined();
  });
});

/* ======================================================
   getChildren()
====================================================== */
describe("getChildren()", () => {
  it("возвращает прямых потомков", () => {
    const children = store.getChildren(1);
    expect(children.map((c) => c.id)).toEqual(
      expect.arrayContaining(["91064cee", 3]),
    );
  });

  it("НЕ возвращает вложенных потомков", () => {
    const children = store.getChildren(1);
    expect(children.map((c) => c.id)).not.toContain(4);
  });

  it("возвращает пустой массив если детей нет", () => {
    expect(store.getChildren(8)).toEqual([]);
  });

  it("возвращает новый массив при каждом вызове", () => {
    const a = store.getChildren(1);
    const b = store.getChildren(1);
    expect(a).not.toBe(b);
  });
});

/* ======================================================
   getAllParents()
====================================================== */
describe("getAllParents()", () => {
  it("возвращает цепочку родителей включая сам элемент", () => {
    const parents = store.getAllParents(7);
    expect(parents.map((p) => p.id)).toEqual([7, 4, "91064cee", 1]);
  });

  it("порядок элементов корректный (от потомка к корню)", () => {
    const parents = store.getAllParents(4);
    expect(parents.map((p) => p.id)).toEqual([4, "91064cee", 1]);
  });

  it("для корневого элемента возвращает массив из одного элемента", () => {
    const parents = store.getAllParents(1);
    expect(parents.map((p) => p.id)).toEqual([1]);
  });

  it("возвращает пустой массив для несуществующего id", () => {
    expect(store.getAllParents(999)).toEqual([]);
  });
});

/* ======================================================
   addItem()
====================================================== */
describe("addItem()", () => {
  const newItem: ITreeItem = {
    id: "new",
    parent: 3,
    label: "Новый элемент",
  };

  it("добавляет элемент в itemsById", () => {
    store.addItem(newItem);
    expect(store.getItem("new")).toEqual(newItem);
  });

  it("добавляет элемент в children родителя", () => {
    store.addItem(newItem);
    const children = store.getChildren(3);
    expect(children.map((c) => c.id)).toContain("new");
  });

  it("корректно работает если у родителя раньше не было детей", () => {
    const item: ITreeItem = { id: 200, parent: 8, label: "Leaf child" };
    store.addItem(item);

    expect(store.getChildren(8).map((i) => i.id)).toEqual([200]);
  });

  it("не ломает существующие связи", () => {
    store.addItem(newItem);
    expect(store.getChildren(1).length).toBeGreaterThan(0);
  });
});

/* ======================================================
   getAllChildren()
====================================================== */
describe("getAllChildren()", () => {
  it("возвращает всех потомков рекурсивно", () => {
    const children = store.getAllChildren("91064cee");
    const ids = children.map((i) => i.id);

    expect(ids).toEqual(expect.arrayContaining([4, 5, 6, 7, 8]));
  });

  it("не ломается если у элемента нет детей", () => {
    expect(store.getAllChildren(3)).toEqual([]);
  });

  it("работает для корневого элемента", () => {
    const children = store.getAllChildren(1);
    const ids = children.map((i) => i.id);
    expect(ids).toEqual(expect.arrayContaining(["91064cee", 3, 4, 5, 6, 7, 8]));
  });
});

/* ======================================================
   updateItem()
====================================================== */
describe("updateItem()", () => {
  it("обновляет поле элемента", () => {
    const updated = { ...store.getItem(3)!, label: "Обновлённый Айтем 3" };
    store.updateItem(updated);

    expect(store.getItem(3)?.label).toBe("Обновлённый Айтем 3");
  });

  it("обновляет родителя элемента", () => {
    // Переносим 3 под '91064cee'
    const updated = { ...store.getItem(3)!, parent: "91064cee" };
    store.updateItem(updated);

    expect(store.getItem(3)?.parent).toBe("91064cee");
    // Проверяем, что в старом родителе 1 больше нет 3
    expect(store.getChildren(1).map((i) => i.id)).not.toContain(3);
    // Проверяем, что в новом родителе есть 3
    expect(store.getChildren("91064cee").map((i) => i.id)).toContain(3);
  });

  it("ничего не делает, если элемента нет", () => {
    const fake = { id: 999, parent: null, label: "Fake" };
    store.updateItem(fake);
    expect(store.getItem(999)).toBeUndefined();
  });
});

/* ======================================================
   removeItem()
====================================================== */
describe("removeItem()", () => {
  it("удаляет элемент без детей", () => {
    store.removeItem(3);
    expect(store.getItem(3)).toBeUndefined();
    expect(store.getChildren(1).map((i) => i.id)).not.toContain(3);
  });

  it("удаляет элемент с дочерними элементами рекурсивно", () => {
    // Удаляем '91064cee' — вместе с 4,5,6,7,8
    store.removeItem("91064cee");

    expect(store.getItem("91064cee")).toBeUndefined();
    expect(store.getItem(4)).toBeUndefined();
    expect(store.getItem(5)).toBeUndefined();
    expect(store.getItem(6)).toBeUndefined();
    expect(store.getItem(7)).toBeUndefined();
    expect(store.getItem(8)).toBeUndefined();

    // Старый родитель больше не содержит удалённый элемент
    expect(store.getChildren(1).map((i) => i.id)).not.toContain("91064cee");
  });

  it("не ломает другие элементы", () => {
    store.removeItem("91064cee");
    expect(store.getItem(1)).toBeDefined();
  });
});
