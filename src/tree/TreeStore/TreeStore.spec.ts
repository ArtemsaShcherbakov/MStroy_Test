import { describe, it, expect, beforeEach } from "vitest";

import { TreeStore } from "./TreeStore";

import { ITEMS } from "@/data/constants";

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
