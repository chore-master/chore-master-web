'use client'

import ModuleFunction, {
  ModuleFunctionBody,
  ModuleFunctionHeader,
} from '@/components/ModuleFunction'
import Button from '@mui/material/Button'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import React from 'react'

const rows: GridRowsProp = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 3, col1: 'MUI', col2: 'is Amazing' },
  { id: 4, col1: 'XYZ', col2: 'is Amazing' },
  { id: 5, col1: 'ABCD', col2: 'is Amazing' },
]

const columns: GridColDef[] = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
  { field: 'col3', headerName: 'Column 3', width: 150 },
  { field: 'col4', headerName: 'Column 4', width: 150 },
  { field: 'col5', headerName: 'Column 5', width: 150 },
]

export default function Page() {
  return (
    <React.Fragment>
      <ModuleFunction>
        <ModuleFunctionHeader
          title="帳戶列表"
          actions={<Button size="small">Learn More</Button>}
        />
        <ModuleFunctionBody>
          <DataGrid rows={rows} columns={columns} autoHeight />
        </ModuleFunctionBody>
      </ModuleFunction>

      <ModuleFunction>
        <ModuleFunctionHeader
          title="資產配置"
          actions={<Button variant="contained">新增</Button>}
        />
        <ModuleFunctionBody>
          <DataGrid rows={rows} columns={columns} autoHeight />
        </ModuleFunctionBody>
      </ModuleFunction>
    </React.Fragment>
  )
}
