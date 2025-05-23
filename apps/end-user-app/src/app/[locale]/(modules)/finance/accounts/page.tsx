'use client'

import AutoLoadingButton from '@/components/AutoLoadingButton'
import DatetimeBlock from '@/components/DatetimeBlock'
import ModuleFunction, {
  ModuleFunctionBody,
  ModuleFunctionHeader,
} from '@/components/ModuleFunction'
import { TablePagination } from '@/components/Pagination'
import PlaceholderTypography from '@/components/PlaceholderTypography'
import ReferenceBlock from '@/components/ReferenceBlock'
import SidePanel, { useSidePanel } from '@/components/SidePanel'
import { NoWrapTableCell, StatefulTableBody } from '@/components/Table'
import { useTimezone } from '@/components/timezone'
import WithRef from '@/components/WithRef'
import { useOffsetPagination } from '@/hooks/useOffsetPagination'
import type {
  Account,
  Asset,
  CreateAccountFormInputs,
  UpdateAccountFormInputs,
} from '@/types/finance'
import choreMasterAPIAgent from '@/utils/apiAgent'
import { useNotification } from '@/utils/notification'
import { validateDatetimeField } from '@/utils/validation'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useTranslations } from 'next-intl'
import React from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

export default function Page() {
  const { enqueueNotification } = useNotification()
  const timezone = useTimezone()
  const t = useTranslations('modules.finance.pages.accounts')
  const tGlobal = useTranslations('global')
  const sidePanel = useSidePanel()

  // Asset
  const [settleableAssets, setSettleableAssets] = React.useState<Asset[]>([])
  const [isFetchingSettleableAssets, setIsFetchingSettleableAssets] =
    React.useState(false)

  // Account
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const accountsPagination = useOffsetPagination({})
  const [isFetchingAccounts, setIsFetchingAccounts] = React.useState(false)
  const createAccountForm = useForm<CreateAccountFormInputs>({ mode: 'all' })
  const [editingAccountReference, setEditingAccountReference] =
    React.useState<string>()
  const updateAccountForm = useForm<UpdateAccountFormInputs>({ mode: 'all' })

  const fetchSettleableAssets = React.useCallback(async () => {
    setIsFetchingSettleableAssets(true)
    await choreMasterAPIAgent.get('/v1/finance/users/me/assets', {
      params: {
        is_settleable: true,
      },
      onError: () => {
        enqueueNotification(`Unable to fetch settleable assets now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({ data }: any) => {
        setSettleableAssets(data)
      },
    })
    setIsFetchingSettleableAssets(false)
  }, [enqueueNotification])

  const fetchAccounts = React.useCallback(async () => {
    setIsFetchingAccounts(true)
    await choreMasterAPIAgent.get('/v1/finance/users/me/accounts', {
      params: {
        offset: accountsPagination.offset,
        limit: accountsPagination.rowsPerPage,
      },
      onError: () => {
        enqueueNotification(`Unable to fetch accounts now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({
        data,
        metadata,
      }: {
        data: Account[]
        metadata: any
      }) => {
        setAccounts(data)
        accountsPagination.setCount(metadata.offset_pagination.count)
      },
    })
    setIsFetchingAccounts(false)
  }, [accountsPagination.offset, accountsPagination.rowsPerPage])

  const handleSubmitCreateAccountForm: SubmitHandler<
    CreateAccountFormInputs
  > = async ({ opened_time, closed_time, ...data }) => {
    await choreMasterAPIAgent.post(
      '/v1/finance/users/me/accounts',
      {
        ...data,
        opened_time: new Date(
          timezone.getUTCTimestamp(opened_time)
        ).toISOString(),
        closed_time: closed_time
          ? new Date(timezone.getUTCTimestamp(closed_time)).toISOString()
          : null,
      },
      {
        onError: () => {
          enqueueNotification(`Unable to create account now.`, 'error')
        },
        onFail: ({ message }: { message: string }) => {
          enqueueNotification(message, 'error')
        },
        onSuccess: () => {
          sidePanel.close()
          createAccountForm.reset()
          fetchAccounts()
        },
      }
    )
  }

  const handleSubmitUpdateAccountForm: SubmitHandler<
    UpdateAccountFormInputs
  > = async ({ opened_time, closed_time, ...data }) => {
    await choreMasterAPIAgent.patch(
      `/v1/finance/users/me/accounts/${editingAccountReference}`,
      {
        ...data,
        opened_time: new Date(
          timezone.getUTCTimestamp(opened_time)
        ).toISOString(),
        closed_time: closed_time
          ? new Date(timezone.getUTCTimestamp(closed_time)).toISOString()
          : null,
      },
      {
        onError: () => {
          enqueueNotification(`Unable to update account now.`, 'error')
        },
        onFail: ({ message }: { message: string }) => {
          enqueueNotification(message, 'error')
        },
        onSuccess: () => {
          updateAccountForm.reset()
          setEditingAccountReference(undefined)
          sidePanel.close()
          fetchAccounts()
        },
      }
    )
  }

  const deleteAccount = React.useCallback(
    async (accountReference: string) => {
      const isConfirmed = confirm('此操作執行後無法復原，確定要繼續嗎？')
      if (!isConfirmed) {
        return
      }
      await choreMasterAPIAgent.delete(
        `/v1/finance/users/me/accounts/${accountReference}`,
        {
          onError: () => {
            enqueueNotification(`Unable to delete account now.`, 'error')
          },
          onFail: ({ message }: { message: string }) => {
            enqueueNotification(message, 'error')
          },
          onSuccess: () => {
            fetchAccounts()
          },
        }
      )
    },
    [enqueueNotification, fetchAccounts]
  )

  React.useEffect(() => {
    fetchSettleableAssets()
  }, [fetchSettleableAssets])

  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return (
    <React.Fragment>
      <ModuleFunction>
        <ModuleFunctionHeader
          title={t('titles.account')}
          actions={[
            <Tooltip key="refresh" title={tGlobal('refresh')}>
              <span>
                <IconButton
                  onClick={fetchAccounts}
                  disabled={isFetchingAccounts}
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
                createAccountForm.reset()
                sidePanel.open('createAccount')
              }}
            >
              {t('buttons.create')}
            </Button>,
          ]}
        />

        <ModuleFunctionBody loading={isFetchingAccounts}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <NoWrapTableCell align="right">
                    <PlaceholderTypography>#</PlaceholderTypography>
                  </NoWrapTableCell>
                  <NoWrapTableCell>{t('tables.headers.name')}</NoWrapTableCell>
                  <NoWrapTableCell>
                    {t('tables.headers.settlementAsset')}
                  </NoWrapTableCell>
                  <NoWrapTableCell>
                    {t('tables.headers.openedTime')}
                  </NoWrapTableCell>
                  <NoWrapTableCell>
                    {t('tables.headers.closedTime')}
                  </NoWrapTableCell>
                  <NoWrapTableCell>
                    {t('tables.headers.reference')}
                  </NoWrapTableCell>
                  <NoWrapTableCell align="right">
                    {t('tables.headers.action')}
                  </NoWrapTableCell>
                </TableRow>
              </TableHead>
              <StatefulTableBody
                isLoading={isFetchingAccounts}
                isEmpty={accounts.length === 0}
              >
                {accounts.map((account, index) => (
                  <TableRow key={account.reference} hover>
                    <NoWrapTableCell align="right">
                      <PlaceholderTypography>
                        {accountsPagination.offset + index + 1}
                      </PlaceholderTypography>
                    </NoWrapTableCell>
                    <NoWrapTableCell>{account.name}</NoWrapTableCell>
                    <NoWrapTableCell>
                      <ReferenceBlock
                        label={
                          settleableAssets.find(
                            (asset) =>
                              asset.reference ===
                              account.settlement_asset_reference
                          )?.name
                        }
                        foreignValue
                      />
                    </NoWrapTableCell>
                    <NoWrapTableCell>
                      <DatetimeBlock isoText={account.opened_time} />
                    </NoWrapTableCell>
                    <NoWrapTableCell>
                      {account.closed_time ? (
                        <DatetimeBlock isoText={account.closed_time} />
                      ) : (
                        <PlaceholderTypography>N/A</PlaceholderTypography>
                      )}
                    </NoWrapTableCell>
                    <NoWrapTableCell>
                      <ReferenceBlock
                        label={account.reference}
                        primaryKey
                        monospace
                      />
                    </NoWrapTableCell>
                    <NoWrapTableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          updateAccountForm.setValue('name', account.name)
                          updateAccountForm.setValue(
                            'opened_time',
                            timezone
                              .getLocalString(account.opened_time)
                              .slice(0, -5)
                          )
                          updateAccountForm.setValue(
                            'closed_time',
                            account.closed_time
                              ? timezone
                                  .getLocalString(account.closed_time)
                                  .slice(0, -5)
                              : ''
                          )
                          setEditingAccountReference(account.reference)
                          sidePanel.open('editAccount')
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteAccount(account.reference)}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </NoWrapTableCell>
                  </TableRow>
                ))}
              </StatefulTableBody>
            </Table>
          </TableContainer>
          <TablePagination offsetPagination={accountsPagination} />
        </ModuleFunctionBody>
      </ModuleFunction>

      <SidePanel id="createAccount">
        <CardHeader
          title={t('sidePanels.createAccount.title')}
          action={
            <IconButton onClick={() => sidePanel.close()}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
        <Stack
          component="form"
          spacing={3}
          p={2}
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <FormControl>
            <Controller
              name="name"
              control={createAccountForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label={t('sidePanels.createAccount.labels.name')}
                  variant="filled"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <FormControl>
            <WithRef
              render={(inputRef) => (
                <Controller
                  name="opened_time"
                  control={createAccountForm.control}
                  defaultValue={timezone
                    .getLocalDate(new Date())
                    .toISOString()
                    .slice(0, -5)}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      inputRef={inputRef}
                      required
                      label={t('sidePanels.createAccount.labels.openedTime')}
                      variant="filled"
                      type="datetime-local"
                      slotProps={{
                        htmlInput: {
                          step: 1,
                        },
                      }}
                      error={!!createAccountForm.formState.errors.opened_time}
                      helperText={
                        createAccountForm.formState.errors.opened_time?.message
                      }
                    />
                  )}
                  rules={{
                    validate: (value) =>
                      validateDatetimeField(value, inputRef, true),
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl>
            <WithRef
              render={(inputRef) => (
                <Controller
                  name="closed_time"
                  control={createAccountForm.control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      inputRef={inputRef}
                      label={t('sidePanels.createAccount.labels.closedTime')}
                      variant="filled"
                      type="datetime-local"
                      slotProps={{
                        htmlInput: {
                          step: 1,
                        },
                      }}
                      error={!!createAccountForm.formState.errors.closed_time}
                      helperText={
                        createAccountForm.formState.errors.closed_time?.message
                      }
                    />
                  )}
                  rules={{
                    validate: (value) =>
                      validateDatetimeField(value, inputRef, false),
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl fullWidth>
            <Controller
              name="settlement_asset_reference"
              control={createAccountForm.control}
              defaultValue=""
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={
                    settleableAssets.find(
                      (asset) => asset.reference === field.value
                    ) ?? null
                  }
                  onChange={(_event, value) => {
                    field.onChange(value?.reference ?? '')
                  }}
                  // onOpen={() => {
                  //   if (assets.length === 0) {
                  //     fetchAssets()
                  //   }
                  // }}
                  isOptionEqualToValue={(option, value) =>
                    option.reference === value.reference
                  }
                  getOptionLabel={(option) => option.name}
                  options={settleableAssets}
                  autoHighlight
                  loading={isFetchingSettleableAssets}
                  // loadingText="載入中..."
                  // noOptionsText="沒有符合的選項"
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props as {
                      key: React.Key
                    }
                    return (
                      <Box key={key} component="li" {...optionProps}>
                        <ReferenceBlock label={option.name} foreignValue />
                      </Box>
                    )
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t(
                        'sidePanels.createAccount.labels.settlementAsset'
                      )}
                      variant="filled"
                      size="small"
                      helperText={t(
                        'sidePanels.createAccount.helperTexts.immutable'
                      )}
                      required
                    />
                  )}
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <AutoLoadingButton
            type="submit"
            variant="contained"
            disabled={!createAccountForm.formState.isValid}
            onClick={createAccountForm.handleSubmit(
              handleSubmitCreateAccountForm
            )}
          >
            {t('sidePanels.createAccount.buttons.create')}
          </AutoLoadingButton>
        </Stack>
      </SidePanel>

      <SidePanel id="editAccount">
        <CardHeader
          title={t('sidePanels.editAccount.title')}
          action={
            <IconButton onClick={() => sidePanel.close()}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
        <Stack
          component="form"
          spacing={3}
          p={2}
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <FormControl>
            <Controller
              name="name"
              control={updateAccountForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label={t('sidePanels.editAccount.labels.name')}
                  variant="filled"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <FormControl>
            <WithRef
              render={(inputRef) => (
                <Controller
                  name="opened_time"
                  control={updateAccountForm.control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      inputRef={inputRef}
                      required
                      label={t('sidePanels.editAccount.labels.openedTime')}
                      variant="filled"
                      type="datetime-local"
                      slotProps={{
                        htmlInput: {
                          step: 1,
                        },
                      }}
                      error={!!updateAccountForm.formState.errors.opened_time}
                      helperText={
                        updateAccountForm.formState.errors.opened_time?.message
                      }
                    />
                  )}
                  rules={{
                    validate: (value) =>
                      validateDatetimeField(value, inputRef, true),
                  }}
                />
              )}
            />
          </FormControl>
          <FormControl>
            <WithRef
              render={(inputRef) => (
                <Controller
                  name="closed_time"
                  control={updateAccountForm.control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      inputRef={inputRef}
                      label={t('sidePanels.editAccount.labels.closedTime')}
                      variant="filled"
                      type="datetime-local"
                      slotProps={{
                        htmlInput: {
                          step: 1,
                        },
                      }}
                      error={!!updateAccountForm.formState.errors.closed_time}
                      helperText={
                        updateAccountForm.formState.errors.closed_time?.message
                      }
                    />
                  )}
                  rules={{
                    validate: (value) =>
                      validateDatetimeField(value, inputRef, false),
                  }}
                />
              )}
            />
          </FormControl>
          <AutoLoadingButton
            type="submit"
            variant="contained"
            disabled={!updateAccountForm.formState.isValid}
            onClick={updateAccountForm.handleSubmit(
              handleSubmitUpdateAccountForm
            )}
          >
            {t('sidePanels.editAccount.buttons.update')}
          </AutoLoadingButton>
        </Stack>
      </SidePanel>
    </React.Fragment>
  )
}
