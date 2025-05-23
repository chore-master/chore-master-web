'use client'

import AutoLoadingButton from '@/components/AutoLoadingButton'
import CodeBlock from '@/components/CodeBlock'
import ModuleFunction, {
  ModuleFunctionBody,
  ModuleFunctionHeader,
} from '@/components/ModuleFunction'
import { TablePagination } from '@/components/Pagination'
import PlaceholderTypography from '@/components/PlaceholderTypography'
import ReferenceBlock from '@/components/ReferenceBlock'
import SidePanel, { useSidePanel } from '@/components/SidePanel'
import { NoWrapTableCell, StatefulTableBody } from '@/components/Table'
import { integrationOperatorDiscriminators } from '@/constants'
import { useOffsetPagination } from '@/hooks/useOffsetPagination'
import type {
  CreateOperatorFormInputs,
  Operator,
  UpdateOperatorFormInputs,
} from '@/types/integration'
import choreMasterAPIAgent from '@/utils/apiAgent'
import { useNotification } from '@/utils/notification'
import AddIcon from '@mui/icons-material/Add'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

export default function Page() {
  const { enqueueNotification } = useNotification()
  const sidePanel = useSidePanel()

  // Operators
  const [operators, setOperators] = React.useState<Operator[]>([])
  const operatorsPagination = useOffsetPagination({})
  const [isFetchingOperators, setIsFetchingOperators] = React.useState(false)
  const [editingOperatorReference, setEditingOperatorReference] =
    React.useState<string>()
  const createOperatorForm = useForm<CreateOperatorFormInputs>()
  const updateOperatorForm = useForm<UpdateOperatorFormInputs>()

  const fetchOperators = React.useCallback(async () => {
    setIsFetchingOperators(true)
    await choreMasterAPIAgent.get('/v1/integration/users/me/operators', {
      params: {
        offset: operatorsPagination.offset,
        limit: operatorsPagination.rowsPerPage,
      },
      onError: () => {
        enqueueNotification(`Unable to fetch operators now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({
        data,
        metadata,
      }: {
        data: Operator[]
        metadata: any
      }) => {
        setOperators(data)
        operatorsPagination.setCount(metadata.offset_pagination.count)
      },
    })
    setIsFetchingOperators(false)
  }, [enqueueNotification])

  const handleSubmitCreateOperatorForm: SubmitHandler<
    CreateOperatorFormInputs
  > = async (data) => {
    await choreMasterAPIAgent.post('/v1/integration/users/me/operators', data, {
      onError: () => {
        enqueueNotification(`Unable to create operator now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: () => {
        sidePanel.close()
        createOperatorForm.reset()
        fetchOperators()
      },
    })
  }

  const handleSubmitUpdateOperatorForm: SubmitHandler<
    UpdateOperatorFormInputs
  > = async (data) => {
    await choreMasterAPIAgent.patch(
      `/v1/integration/users/me/operators/${editingOperatorReference}`,
      data,
      {
        onError: () => {
          enqueueNotification(`Unable to update operator now.`, 'error')
        },
        onFail: ({ message }: any) => {
          enqueueNotification(message, 'error')
        },
        onSuccess: () => {
          sidePanel.close()
          updateOperatorForm.reset()
          setEditingOperatorReference(undefined)
          fetchOperators()
        },
      }
    )
  }

  const deleteOperator = React.useCallback(
    async (operatorReference: string) => {
      const isConfirmed = confirm('此操作執行後無法復原，確定要繼續嗎？')
      if (!isConfirmed) {
        return
      }
      await choreMasterAPIAgent.delete(
        `/v1/integration/users/me/operators/${operatorReference}`,
        {
          onError: () => {
            enqueueNotification(`Unable to delete operator now.`, 'error')
          },
          onFail: ({ message }: any) => {
            enqueueNotification(message, 'error')
          },
          onSuccess: () => {
            fetchOperators()
          },
        }
      )
    },
    [enqueueNotification, fetchOperators]
  )

  React.useEffect(() => {
    void fetchOperators()
  }, [fetchOperators])

  return (
    <React.Fragment>
      <ModuleFunction>
        <ModuleFunctionHeader
          title="運算器"
          actions={[
            <Tooltip key="refresh" title="立即重整">
              <span>
                <IconButton
                  onClick={fetchOperators}
                  disabled={isFetchingOperators}
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
                createOperatorForm.reset()
                sidePanel.open('createOperator')
              }}
            >
              新增
            </Button>,
          ]}
        />
        <ModuleFunctionBody loading={isFetchingOperators}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <NoWrapTableCell align="right">
                    <PlaceholderTypography>#</PlaceholderTypography>
                  </NoWrapTableCell>
                  <NoWrapTableCell>名字</NoWrapTableCell>
                  <NoWrapTableCell>鑑別器</NoWrapTableCell>
                  <NoWrapTableCell>值</NoWrapTableCell>
                  <NoWrapTableCell>系統識別碼</NoWrapTableCell>
                  <NoWrapTableCell align="right">操作</NoWrapTableCell>
                </TableRow>
              </TableHead>
              <StatefulTableBody
                isLoading={isFetchingOperators}
                isEmpty={operators.length === 0}
              >
                {operators.map((operator, index) => (
                  <TableRow key={operator.reference} hover>
                    <NoWrapTableCell align="right">
                      <PlaceholderTypography>
                        {operatorsPagination.offset + index + 1}
                      </PlaceholderTypography>
                    </NoWrapTableCell>
                    <NoWrapTableCell>{operator.name}</NoWrapTableCell>
                    <NoWrapTableCell>{operator.discriminator}</NoWrapTableCell>
                    <NoWrapTableCell>
                      <CodeBlock
                        language="json"
                        code={JSON.stringify(operator.value, null, 2)}
                      />
                    </NoWrapTableCell>
                    <NoWrapTableCell>
                      <ReferenceBlock
                        label={operator.reference}
                        primaryKey
                        monospace
                      />
                    </NoWrapTableCell>
                    <NoWrapTableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          updateOperatorForm.setValue('name', operator.name)
                          updateOperatorForm.setValue(
                            'discriminator',
                            operator.discriminator
                          )
                          updateOperatorForm.setValue(
                            'value',
                            JSON.stringify(operator.value)
                          )
                          setEditingOperatorReference(operator.reference)
                          sidePanel.open('editOperator')
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => void deleteOperator(operator.reference)}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </NoWrapTableCell>
                  </TableRow>
                ))}
              </StatefulTableBody>
            </Table>
          </TableContainer>
          <TablePagination offsetPagination={operatorsPagination} />
        </ModuleFunctionBody>

        <ModuleFunctionBody>
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Stack spacing={1} direction="row" alignItems="center">
                <InfoOutlinedIcon fontSize="small" />
                <Typography>範本</Typography>
              </Stack>
            </AccordionSummary>
            <TableContainer component={AccordionDetails}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <NoWrapTableCell>鑑別器</NoWrapTableCell>
                    <NoWrapTableCell>值</NoWrapTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <NoWrapTableCell>yahoo_finance_feed</NoWrapTableCell>
                    <NoWrapTableCell>
                      <CodeBlock
                        language="json"
                        code={JSON.stringify({}, null, 2)}
                      />
                    </NoWrapTableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Accordion>
        </ModuleFunctionBody>
      </ModuleFunction>

      <SidePanel id="createOperator">
        <CardHeader
          title="新增運算器"
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
              control={createOperatorForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="名稱"
                  variant="filled"
                  size="small"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <Controller
            name="discriminator"
            control={createOperatorForm.control}
            defaultValue=""
            render={({ field }) => (
              <FormControl required fullWidth size="small" variant="filled">
                <InputLabel>鑑別器</InputLabel>
                <Select {...field}>
                  {integrationOperatorDiscriminators.map((discriminator) => (
                    <MenuItem key={discriminator} value={discriminator}>
                      {discriminator}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            rules={{ required: '必填' }}
          />
          <FormControl>
            <Controller
              name="value"
              control={createOperatorForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  multiline
                  minRows={3}
                  maxRows={20}
                  size="small"
                  label="值"
                  variant="filled"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <AutoLoadingButton
            type="submit"
            variant="contained"
            disabled={!createOperatorForm.formState.isValid}
            onClick={createOperatorForm.handleSubmit(
              handleSubmitCreateOperatorForm
            )}
          >
            新增
          </AutoLoadingButton>
        </Stack>
      </SidePanel>

      <SidePanel id="editOperator">
        <CardHeader
          title="編輯運算器"
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
              control={updateOperatorForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="名稱"
                  variant="filled"
                  size="small"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <Controller
            name="discriminator"
            control={updateOperatorForm.control}
            defaultValue=""
            render={({ field }) => (
              <FormControl required fullWidth size="small" variant="filled">
                <InputLabel>鑑別器</InputLabel>
                <Select {...field}>
                  {integrationOperatorDiscriminators.map((discriminator) => (
                    <MenuItem key={discriminator} value={discriminator}>
                      {discriminator}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            rules={{ required: '必填' }}
          />
          <FormControl>
            <Controller
              name="value"
              control={updateOperatorForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  multiline
                  minRows={3}
                  maxRows={20}
                  size="small"
                  label="值"
                  variant="filled"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <AutoLoadingButton
            type="submit"
            variant="contained"
            disabled={!updateOperatorForm.formState.isValid}
            onClick={updateOperatorForm.handleSubmit(
              handleSubmitUpdateOperatorForm
            )}
          >
            儲存
          </AutoLoadingButton>
        </Stack>
      </SidePanel>
    </React.Fragment>
  )
}
