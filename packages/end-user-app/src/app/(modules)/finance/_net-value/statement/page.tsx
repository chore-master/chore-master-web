'use client'

import DatetimeBlock from '@/components/DatetimeBlock'
import ModuleFunction, {
  ModuleFunctionBody,
  ModuleFunctionHeader,
} from '@/components/ModuleFunction'
import { NoWrapTableCell } from '@/components/Table'
import TablePaginationActions from '@/components/TablePaginationActions'
import choreMasterAPIAgent from '@/utils/apiAgent'
import {
  dateToLocalString,
  localStringToUTCString,
  UTCStringToDate,
} from '@/utils/datetime'
import { useNotification } from '@/utils/notification'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

interface Account {
  reference: string
  name: string
}

interface Asset {
  reference: string
  symbol: string
}

interface NetValue {
  reference: string
  account_reference: string
  settlement_asset_reference: string
  amount: string
  settled_time: string
  account: Account
  settlement_asset: Asset
}

type CreateNetValueFormInputs = {
  account_reference: string
  settlement_asset_reference: string
  amount: number
  settled_time: string
  shouldCreateAnother: boolean
}

type UpdateNetValueFormInputs = {
  account_reference: string
  settlement_asset_reference: string
  amount: number
  settled_time: string
}

export default function Page() {
  const { enqueueNotification } = useNotification()

  // Net Value
  const [netValues, setNetValues] = React.useState<NetValue[]>([])
  const [netValuesCount, setNetValuesCount] = React.useState(0)
  const [isFetchingNetValues, setIsFetchingNetValues] = React.useState(false)
  const [netValuesPage, setNetValuesPage] = React.useState(0)
  const [netValueRowsPerPage, setNetValueRowsPerPage] = React.useState(50)
  const [isCreateNetValueDrawerOpen, setIsCreateNetValueDrawerOpen] =
    React.useState(false)
  const createNetValueForm = useForm<CreateNetValueFormInputs>()
  const [editingNetValueReference, setEditingNetValueReference] =
    React.useState<string>()
  const updateNetValueForm = useForm<UpdateNetValueFormInputs>()

  // Account
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [isFetchingAccounts, setIsFetchingAccounts] = React.useState(false)
  const accountReferenceToAccountMap = React.useMemo(() => {
    return accounts.reduce((acc: Record<string, Account>, account) => {
      acc[account.reference] = account
      return acc
    }, {})
  }, [accounts])

  // Asset
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [isFetchingAssets, setIsFetchingAssets] = React.useState(false)
  const assetReferenceToAssetMap = React.useMemo(() => {
    return assets.reduce((acc: Record<string, Asset>, asset) => {
      acc[asset.reference] = asset
      return acc
    }, {})
  }, [assets])

  const fetchNetValues = React.useCallback(async () => {
    setIsFetchingNetValues(true)
    await choreMasterAPIAgent.get('/v1/financial_management/net_values', {
      params: {
        offset: netValuesPage * netValueRowsPerPage,
        limit: netValueRowsPerPage,
      },
      onError: () => {
        enqueueNotification(`Unable to fetch net values now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({ data, metadata }: any) => {
        setNetValues(data)
        setNetValuesCount(metadata.offset_pagination.count)
      },
    })
    setIsFetchingNetValues(false)
  }, [netValuesPage, netValueRowsPerPage, enqueueNotification])

  const handleSubmitCreateNetValueForm: SubmitHandler<
    CreateNetValueFormInputs
  > = async ({ shouldCreateAnother, settled_time, ...data }) => {
    await choreMasterAPIAgent.post(
      '/v1/financial_management/net_values',
      { ...data, settled_time: localStringToUTCString(settled_time) },
      {
        onFail: ({ message }: any) => {
          enqueueNotification(message, 'error')
        },
        onSuccess: () => {
          if (shouldCreateAnother) {
            createNetValueForm.reset()
            createNetValueForm.setValue(
              'settlement_asset_reference',
              data.settlement_asset_reference
            )
            createNetValueForm.setValue('settled_time', settled_time)
            createNetValueForm.setValue(
              'shouldCreateAnother',
              shouldCreateAnother
            )
          } else {
            setIsCreateNetValueDrawerOpen(false)
            fetchNetValues()
          }
        },
      }
    )
  }

  const handleSubmitUpdateNetValueForm: SubmitHandler<
    UpdateNetValueFormInputs
  > = async ({ settled_time, ...data }) => {
    await choreMasterAPIAgent.patch(
      `/v1/financial_management/net_values/${editingNetValueReference}`,
      { ...data, settled_time: localStringToUTCString(settled_time) },
      {
        onFail: ({ message }: any) => {
          enqueueNotification(message, 'error')
        },
        onSuccess: () => {
          updateNetValueForm.reset()
          setEditingNetValueReference(undefined)
          fetchNetValues()
        },
      }
    )
  }

  const deleteNetValue = React.useCallback(
    async (netValueReference: string) => {
      const isConfirmed = confirm('此操作執行後無法復原，確定要繼續嗎？')
      if (!isConfirmed) {
        return
      }
      await choreMasterAPIAgent.delete(
        `/v1/financial_management/net_values/${netValueReference}`,
        {
          onFail: ({ message }: any) => {
            enqueueNotification(message, 'error')
          },
          onSuccess: () => {
            fetchNetValues()
          },
        }
      )
    },
    [enqueueNotification, fetchNetValues]
  )

  const fetchAccounts = React.useCallback(async () => {
    setIsFetchingAccounts(true)
    await choreMasterAPIAgent.get('/v1/financial_management/accounts', {
      params: {},
      onError: () => {
        enqueueNotification(`Unable to fetch accounts now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({ data }: any) => {
        setAccounts(data)
      },
    })
    setIsFetchingAccounts(false)
  }, [enqueueNotification])

  const fetchAssets = React.useCallback(async () => {
    setIsFetchingAssets(true)
    await choreMasterAPIAgent.get('/v1/financial_management/assets', {
      params: {},
      onError: () => {
        enqueueNotification(`Unable to fetch assets now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({ data }: any) => {
        setAssets(data)
      },
    })
    setIsFetchingAssets(false)
  }, [enqueueNotification])

  React.useEffect(() => {
    fetchNetValues()
  }, [fetchNetValues])

  return (
    <React.Fragment>
      <Box sx={{ p: 2 }}>
        <Breadcrumbs>
          <Typography color="text.secondary">權益</Typography>
          <Typography color="text.primary">明細</Typography>
        </Breadcrumbs>
      </Box>

      <ModuleFunction>
        <ModuleFunctionHeader
          title="權益明細"
          actions={[
            <Tooltip key="refresh" title="立即重整">
              <span>
                <IconButton
                  onClick={fetchNetValues}
                  disabled={isFetchingNetValues}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>,
            <Button
              key="create"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                createNetValueForm.reset()
                setIsCreateNetValueDrawerOpen(true)
              }}
            >
              新增
            </Button>,
          ]}
        />

        <ModuleFunctionBody loading={isFetchingNetValues}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <NoWrapTableCell>系統識別碼</NoWrapTableCell>
                  <NoWrapTableCell>帳戶名稱</NoWrapTableCell>
                  <NoWrapTableCell>快照名義價值</NoWrapTableCell>
                  <NoWrapTableCell>快照資產代號</NoWrapTableCell>
                  <NoWrapTableCell>快照時間</NoWrapTableCell>
                  <NoWrapTableCell align="right">操作</NoWrapTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {netValues.map((netValue) => {
                  return (
                    <TableRow key={netValue.reference} hover>
                      <NoWrapTableCell>
                        <Chip size="small" label={netValue.reference} />
                      </NoWrapTableCell>
                      <NoWrapTableCell>
                        <Chip
                          size="small"
                          label={netValue.account.name}
                          color="info"
                          variant="outlined"
                        />
                      </NoWrapTableCell>
                      <NoWrapTableCell>
                        {parseFloat(netValue.amount)}
                      </NoWrapTableCell>
                      <NoWrapTableCell>
                        <Chip
                          size="small"
                          label={netValue.settlement_asset.symbol}
                          color="info"
                          variant="outlined"
                        />
                      </NoWrapTableCell>
                      <NoWrapTableCell>
                        <DatetimeBlock isoText={netValue.settled_time} />
                      </NoWrapTableCell>
                      <NoWrapTableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            updateNetValueForm.setValue(
                              'account_reference',
                              netValue.account_reference
                            )
                            updateNetValueForm.setValue(
                              'settlement_asset_reference',
                              netValue.settlement_asset_reference
                            )
                            updateNetValueForm.setValue(
                              'amount',
                              parseFloat(netValue.amount)
                            )
                            updateNetValueForm.setValue(
                              'settled_time',
                              dateToLocalString(
                                UTCStringToDate(netValue.settled_time)
                              )
                            )
                            setEditingNetValueReference(netValue.reference)
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteNetValue(netValue.reference)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </NoWrapTableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            labelRowsPerPage="每頁數量："
            labelDisplayedRows={({ from, to, count }: any) =>
              `第 ${from} 筆至第 ${to} 筆／共 ${
                count !== -1 ? count : `超過 ${to}`
              } 筆`
            }
            rowsPerPageOptions={[10, 50, 100]}
            count={netValuesCount}
            rowsPerPage={netValueRowsPerPage}
            page={netValuesPage}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              setNetValuesPage(newPage)
            }}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              setNetValueRowsPerPage(parseInt(event.target.value, 10))
              setNetValuesPage(0)
            }}
            ActionsComponent={TablePaginationActions}
          />
        </ModuleFunctionBody>
      </ModuleFunction>

      <Drawer
        anchor="right"
        open={isCreateNetValueDrawerOpen}
        onClose={() => setIsCreateNetValueDrawerOpen(false)}
      >
        <Box sx={{ minWidth: 320 }}>
          <CardHeader title="新增權益快照" />
          <Stack
            component="form"
            spacing={3}
            p={2}
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault()
              createNetValueForm.handleSubmit(handleSubmitCreateNetValueForm)()
            }}
          >
            <FormControl>
              <Controller
                name="account_reference"
                control={createNetValueForm.control}
                defaultValue=""
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={accountReferenceToAccountMap[field.value]}
                    onChange={(_event, value) => {
                      if (value) {
                        field.onChange(value.reference)
                      }
                    }}
                    onOpen={() => {
                      if (accounts.length === 0) {
                        fetchAccounts()
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.reference === value.reference
                    }
                    getOptionLabel={(option) => option.name}
                    options={accounts}
                    autoHighlight
                    loading={isFetchingAccounts}
                    loadingText="載入中..."
                    noOptionsText="沒有匹配的選項"
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props
                      return (
                        <Box key={key} component="li" {...optionProps}>
                          <Chip
                            size="small"
                            label={option.name}
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      )
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="帳戶名稱"
                        variant="filled"
                      />
                    )}
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="amount"
                control={createNetValueForm.control}
                defaultValue={0}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    label="快照名義價值"
                    variant="filled"
                    type="number"
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="settlement_asset_reference"
                control={createNetValueForm.control}
                defaultValue=""
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={assetReferenceToAssetMap[field.value]}
                    onChange={(_event, value) => {
                      if (value) {
                        field.onChange(value.reference)
                      }
                    }}
                    onOpen={() => {
                      if (assets.length === 0) {
                        fetchAssets()
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.reference === value.reference
                    }
                    getOptionLabel={(option) => option.symbol}
                    options={assets}
                    autoHighlight
                    loading={isFetchingAssets}
                    loadingText="載入中..."
                    noOptionsText="沒有匹配的選項"
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props
                      return (
                        <Box key={key} component="li" {...optionProps}>
                          <Chip
                            size="small"
                            label={option.symbol}
                            color="info"
                            variant="outlined"
                          />
                        </Box>
                      )
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="快照資產代號"
                        variant="filled"
                      />
                    )}
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="settled_time"
                control={createNetValueForm.control}
                defaultValue={new Date().toISOString().slice(0, -5)}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    label="快照時間（瀏覽器時區）"
                    variant="filled"
                    type="datetime-local"
                    slotProps={{
                      htmlInput: {
                        step: 1,
                      },
                    }}
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="shouldCreateAnother"
                control={createNetValueForm.control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    {...field}
                    label="繼續新增另一筆"
                    control={<Checkbox {...field} />}
                  />
                )}
              />
            </FormControl>
            <Button
              variant="contained"
              type="submit"
              loading={createNetValueForm.formState.isSubmitting}
            >
              新增
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={editingNetValueReference !== undefined}
        onClose={() => setEditingNetValueReference(undefined)}
      >
        <Box sx={{ minWidth: 320 }}>
          <CardHeader title="編輯權益快照" />
          <Stack
            component="form"
            spacing={3}
            p={2}
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault()
              updateNetValueForm.handleSubmit(handleSubmitUpdateNetValueForm)()
            }}
          >
            <FormControl>
              <Controller
                name="account_reference"
                control={updateNetValueForm.control}
                defaultValue=""
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={accountReferenceToAccountMap[field.value]}
                    onChange={(_event, value) => {
                      if (value) {
                        field.onChange(value.reference)
                      }
                    }}
                    onOpen={() => {
                      if (accounts.length === 0) {
                        fetchAccounts()
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.reference === value.reference
                    }
                    getOptionLabel={(option) => option.name}
                    options={accounts}
                    autoHighlight
                    loading={isFetchingAccounts}
                    loadingText="載入中..."
                    noOptionsText="沒有匹配的選項"
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props
                      return (
                        <Box key={key} component="li" {...optionProps}>
                          <Chip size="small" label={option.name} color="info" />
                        </Box>
                      )
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="帳戶名稱"
                        variant="filled"
                      />
                    )}
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="amount"
                control={updateNetValueForm.control}
                defaultValue={0}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    label="快照名義價值"
                    variant="filled"
                    type="number"
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="settlement_asset_reference"
                control={updateNetValueForm.control}
                defaultValue=""
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={assetReferenceToAssetMap[field.value]}
                    onChange={(_event, value) => {
                      if (value) {
                        field.onChange(value.reference)
                      }
                    }}
                    onOpen={() => {
                      if (assets.length === 0) {
                        fetchAssets()
                      }
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.reference === value.reference
                    }
                    getOptionLabel={(option) => option.symbol}
                    options={assets}
                    autoHighlight
                    loading={isFetchingAssets}
                    loadingText="載入中..."
                    noOptionsText="沒有匹配的選項"
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props
                      return (
                        <Box key={key} component="li" {...optionProps}>
                          <Chip
                            size="small"
                            label={option.symbol}
                            color="info"
                          />
                        </Box>
                      )
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="快照資產代號"
                        variant="filled"
                      />
                    )}
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <FormControl>
              <Controller
                name="settled_time"
                control={updateNetValueForm.control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    label="快照時間（瀏覽器時區）"
                    variant="filled"
                    type="datetime-local"
                    slotProps={{
                      htmlInput: {
                        step: 1,
                      },
                    }}
                  />
                )}
                rules={{ required: '必填' }}
              />
            </FormControl>
            <Button
              variant="contained"
              type="submit"
              loading={updateNetValueForm.formState.isSubmitting}
            >
              儲存
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </React.Fragment>
  )
}
