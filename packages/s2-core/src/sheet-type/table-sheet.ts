import type { FederatedPointerEvent as CanvasEvent } from '@antv/g';
import { TableDataCell, TableSeriesCell } from '../cell';
import {
  getTooltipOperatorTableSortMenus,
  InterceptType,
  S2Event,
} from '../common/constant';
import type {
  SortMethod,
  SortParam,
  TooltipOperatorOptions,
  ViewMeta,
} from '../common/interface';
import { BaseDataSet, TableDataSet } from '../data-set';
import { TableFacet } from '../facet';
import type { Node } from '../facet/layout/node';
import { SpreadSheet } from './spread-sheet';

export class TableSheet extends SpreadSheet {
  public isCustomRowFields() {
    return false;
  }

  public isCustomColumnFields() {
    return false;
  }

  public isCustomHeaderFields() {
    return false;
  }

  public getDataSet(): BaseDataSet {
    const { dataSet } = this.options;

    if (dataSet) {
      return dataSet(this);
    }

    return new TableDataSet(this);
  }

  public enableFrozenHeaders(): boolean {
    const {
      rowCount: frozenRowCount = 0,
      trailingRowCount: frozenTrailingRowCount = 0,
      colCount: frozenColCount = 0,
      trailingColCount: frozenTrailingColCount = 0,
    } = this.options.frozen!;

    return (
      frozenRowCount > 0 ||
      frozenTrailingRowCount > 0 ||
      frozenColCount > 0 ||
      frozenTrailingColCount > 0
    );
  }

  /**
   * Check if is pivot mode
   */
  public isPivotMode(): boolean {
    return false;
  }

  /**
   * Check if is pivot mode
   */
  public isTableMode(): boolean {
    return true;
  }

  /**
   * tree type must be in strategy mode
   */
  public isHierarchyTreeType(): boolean {
    return false;
  }

  /**
   * Check whether scroll contains row header
   * For now contains row header in ListSheet mode by default
   */
  public isScrollContainsRowHeader(): boolean {
    return false;
  }

  /**
   * Scroll Freeze Row Header
   */
  public isFrozenRowHeader(): boolean {
    return false;
  }

  public clearDrillDownData(): void {}

  /**
   * Check if the value is in the columns
   */
  public isValueInCols(): boolean {
    return false;
  }

  protected bindEvents() {}

  protected buildFacet() {
    const defaultCell = (facet: ViewMeta) => {
      if (this.options.showSeriesNumber && facet.colIndex === 0) {
        return new TableSeriesCell(facet, this);
      }

      return new TableDataCell(facet, this);
    };

    this.setOptions({
      dataCell: this.options.dataCell ?? defaultCell,
    });
    this.facet?.destroy();
    this.facet = new TableFacet(this);
    this.facet.render();
  }

  public destroy() {
    super.destroy();
    this.off(S2Event.RANGE_SORT);
    this.off(S2Event.RANGE_FILTER);
  }

  public onSortTooltipClick = (sortMethod: SortMethod, meta: Node) => {
    const { field } = meta;

    const sortParam: SortParam = {
      sortFieldId: field,
      sortMethod,
    };

    this.updateSortMethodMap(meta.id, sortMethod);
    // 触发排序事件
    this.emit(S2Event.RANGE_SORT, [sortParam]);
  };

  public handleGroupSort(event: CanvasEvent, meta: Node) {
    event.stopPropagation();
    this.interaction.addIntercepts([InterceptType.HOVER]);

    const defaultSelectedKeys = this.getMenuDefaultSelectedKeys(meta?.id);
    const operator: TooltipOperatorOptions = {
      onClick: ({ key: sortMethod }) => {
        this.onSortTooltipClick(sortMethod, meta);
      },
      menus: getTooltipOperatorTableSortMenus(),
      defaultSelectedKeys,
    };

    this.showTooltipWithInfo(event, [], {
      operator,
      onlyMenu: true,
      forceRender: true,
    });
  }
}
