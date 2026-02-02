export const DEFAULT_COL_DEF = {
  sortable: true,
  resizable: true,
};

export const COLUMN_NAME = {
  SERIAL_NUMBER: "№ п/п",
  CATEGORY: "Категория",
  NAME: "Наименование",
};

export const AUTO_GROUP_COLUMN_DEF = {
  headerName: COLUMN_NAME.SERIAL_NUMBER,
  minWidth: 200,
  // Используем специальный рендерер для нумерации
  cellRenderer: "agGroupCellRenderer",
  cellRendererParams: {
    suppressCount: true, // Показываем количество элементов в группе
    // Кастомная логика для нумерации
    innerRenderer: (params: any) => {
      // Создаем span для отображения номера
      const span = document.createElement("span");

      // Получаем все узлы с учетом видимости
      const visibleNodes: any[] = [];
      params.api.forEachNodeAfterFilterAndSort((node: any) => {
        visibleNodes.push(node);
      });

      // Находим индекс текущего узла
      const currentIndex = visibleNodes.findIndex(
        (node) => node.id === params.node.id,
      );

      if (currentIndex >= 0) {
        span.textContent = `${currentIndex + 1}`;
      }

      return span;
    },
  },
};

export const CATEGORY_VALUE = {
  GROUP: "Группа",
  ELEMENT: "Элемент",
};
