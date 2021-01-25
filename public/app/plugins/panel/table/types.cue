package text

import {
  // import { TableSortByFieldState / TableCellDisplayMode } from '@grafana/ui';
}

Options: {
  frameIndex: number
  showHeader: boolean
  sortBy?: TableSortByFieldState[]
}

CustomFieldConfig: {
  width: number
  displayMode: "auto" | "color-text" | "color-background"  // ... TableCellDisplayMode
}


// export enum TableCellDisplayMode {
//   Auto = 'auto',
//   ColorText = 'color-text',
//   ColorBackground = 'color-background',
//   GradientGauge = 'gradient-gauge',
//   LcdGauge = 'lcd-gauge',
//   JSONView = 'json-view',
//   BasicGauge = 'basic',
//   Image = 'image',
// }