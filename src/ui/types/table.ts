import type { VNode } from 'vue'

export interface DataTableColumn<T = any> {
  title?: string
  key?: string
  align?: 'left' | 'center' | 'right'
  width?: string | number
  render?: (row: T, index: number) => VNode | undefined
}

export type DataTableColumns<T = any> = DataTableColumn<T>[]
