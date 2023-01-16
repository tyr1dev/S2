import * as mockDataConfig from 'tests/data/simple-data.json';
import * as mockTableDataConfig from 'tests/data/simple-table-data.json';
import { getContainer } from 'tests/util/helpers';
import { PivotSheet, TableSheet } from '@/sheet-type';
import type { S2DataConfig, S2Options } from '@/common';

const s2options: S2Options = {
  width: 800,
  height: 600,
};

describe('Col width Test', () => {
  describe('Grid Mode', () => {
    let s2: PivotSheet;

    beforeEach(() => {
      s2 = new PivotSheet(
        getContainer(),
        {
          ...mockDataConfig,
          data: [
            {
              province: '浙江',
              city: '义乌',
              type: '笔',
              // long text
              price: 123456789,
              cost: 2,
            },
          ],
        },
        s2options,
      );
      s2.render();
    });

    test('get correct width in layoutWidthType adaptive mode', () => {
      const { colLeafNodes } = s2.facet.layoutResult;

      expect(colLeafNodes[0].width).toBe(200);
    });

    test('get correct width in layoutWidthType adaptive mode when enable series number', () => {
      s2.setOptions({
        showSeriesNumber: true,
      });
      s2.render();
      const { colLeafNodes } = s2.facet.layoutResult;

      expect(colLeafNodes[0].width).toBe(180);
    });

    test('get correct width in layoutWidthType adaptive tree mode', () => {
      s2.setOptions({
        hierarchyType: 'tree',
      });
      s2.render();
      const { colLeafNodes } = s2.facet.layoutResult;

      expect(Math.round(colLeafNodes[0].width)).toBe(339);
    });

    test('get correct width in layoutWidthType adaptive tree mode when enable series number', () => {
      s2.setOptions({
        hierarchyType: 'tree',
        showSeriesNumber: true,
      });
      s2.render();
      const { colLeafNodes } = s2.facet.layoutResult;

      expect(Math.round(colLeafNodes[0].width)).toBe(299);
    });

    test('get correct width in layoutWidthType compact mode', () => {
      s2.setOptions({
        style: {
          layoutWidthType: 'compact',
        },
      });
      s2.render();

      // 无 formatter
      const { colLeafNodes } = s2.facet.layoutResult;

      expect(Math.round(colLeafNodes[0].width)).toBe(78);
    });

    test('get correct width in layoutWidthType compact mode when apply formatter', () => {
      s2.setDataCfg({
        fields: undefined as unknown as S2DataConfig['fields'],
        data: undefined as unknown as S2DataConfig['data'],
        meta: [
          {
            field: 'price',
            formatter: (v) => `${((v as number) / 1000000).toFixed(0)}百万`,
          },
        ],
      });
      s2.setOptions({
        style: {
          layoutWidthType: 'compact',
        },
      });
      s2.render();

      // 有formatter
      const { colLeafNodes } = s2.facet.layoutResult;

      expect(Math.round(colLeafNodes[0].width)).toBe(62);
    });
  });

  describe('Table Mode', () => {
    let s2: TableSheet;

    beforeEach(() => {
      s2 = new TableSheet(
        getContainer(),
        {
          ...mockTableDataConfig,
          meta: [
            {
              field: 'cost',
              formatter: (s) => `我是一个很长的格式化标签${s}`,
            },
          ],
        },
        s2options,
      );
      s2.render();
    });

    test('get correct width in layoutWidthType compact mode', () => {
      s2.setOptions({
        style: {
          layoutWidthType: 'compact',
        },
      });
      s2.render();

      const { colLeafNodes } = s2.facet.layoutResult;

      // price 列，列头标签比表身数据更长
      expect(Math.round(colLeafNodes[0].width)).toBe(46);
      // cost 列，表身数据比列头更长（格式化）
      expect(Math.round(colLeafNodes[1].width)).toBe(168);
    });
  });
});
