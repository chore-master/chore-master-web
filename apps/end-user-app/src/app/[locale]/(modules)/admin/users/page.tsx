'use client'

import AutoLoadingButton from '@/components/AutoLoadingButton'
import ModuleFunction, {
  ModuleFunctionBody,
  ModuleFunctionHeader,
} from '@/components/ModuleFunction'
import { TablePagination } from '@/components/Pagination'
import PlaceholderTypography from '@/components/PlaceholderTypography'
import ReferenceBlock from '@/components/ReferenceBlock'
import SidePanel, { useSidePanel } from '@/components/SidePanel'
import { NoWrapTableCell, StatefulTableBody } from '@/components/Table'
import { useOffsetPagination } from '@/hooks/useOffsetPagination'
import type { CreateUserFormInputs, UserSummary } from '@/types/admin'
import choreMasterAPIAgent from '@/utils/apiAgent'
import { useNotification } from '@/utils/notification'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
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
import React from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'

export default function Page() {
  const { enqueueNotification } = useNotification()
  const sidePanel = useSidePanel()

  // User
  const [users, setUsers] = React.useState<UserSummary[]>([])
  const usersPagination = useOffsetPagination({})
  const [isFetchingUsers, setIsFetchingUsers] = React.useState(false)
  const createUserForm = useForm<CreateUserFormInputs>({ mode: 'all' })

  const fetchUsers = React.useCallback(async () => {
    setIsFetchingUsers(true)
    await choreMasterAPIAgent.get('/v1/admin/users', {
      params: {
        offset: usersPagination.offset,
        limit: usersPagination.rowsPerPage,
      },
      onError: () => {
        enqueueNotification(`Unable to fetch users now.`, 'error')
      },
      onFail: ({ message }: any) => {
        enqueueNotification(message, 'error')
      },
      onSuccess: async ({
        data,
        metadata,
      }: {
        data: UserSummary[]
        metadata: any
      }) => {
        setUsers(data)
        usersPagination.setCount(metadata.offset_pagination.count)
      },
    })
    setIsFetchingUsers(false)
  }, [usersPagination.offset, usersPagination.rowsPerPage])

  const handleSubmitCreateUserForm: SubmitHandler<
    CreateUserFormInputs
  > = async ({ reference, ...data }) => {
    await choreMasterAPIAgent.post(
      '/v1/admin/users',
      {
        reference: !!reference ? reference : undefined,
        ...data,
      },
      {
        onError: () => {
          enqueueNotification(`Unable to create user now.`, 'error')
        },
        onFail: ({ message }: { message: string }) => {
          enqueueNotification(message, 'error')
        },
        onSuccess: () => {
          sidePanel.close()
          createUserForm.reset()
          fetchUsers()
        },
      }
    )
  }

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <React.Fragment>
      <ModuleFunction>
        <ModuleFunctionHeader
          title="使用者"
          actions={[
            <Tooltip key="refresh" title="立即重整">
              <span>
                <IconButton onClick={fetchUsers} disabled={isFetchingUsers}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>,
            <Button
              key="create"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                createUserForm.reset()
                sidePanel.open('createUser')
              }}
            >
              新增
            </Button>,
          ]}
        />

        <ModuleFunctionBody loading={isFetchingUsers}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <NoWrapTableCell align="right">
                    <PlaceholderTypography>#</PlaceholderTypography>
                  </NoWrapTableCell>
                  <NoWrapTableCell>名字</NoWrapTableCell>
                  <NoWrapTableCell>使用者名稱</NoWrapTableCell>
                  <NoWrapTableCell>電子信箱</NoWrapTableCell>
                  <NoWrapTableCell>系統識別碼</NoWrapTableCell>
                </TableRow>
              </TableHead>
              <StatefulTableBody
                isLoading={isFetchingUsers}
                isEmpty={users.length === 0}
              >
                {users.map((user, index) => (
                  <TableRow key={user.reference} hover>
                    <NoWrapTableCell align="right">
                      <PlaceholderTypography>
                        {usersPagination.offset + index + 1}
                      </PlaceholderTypography>
                    </NoWrapTableCell>
                    <NoWrapTableCell>{user.name}</NoWrapTableCell>
                    <NoWrapTableCell>
                      {user.username ?? (
                        <PlaceholderTypography>無</PlaceholderTypography>
                      )}
                    </NoWrapTableCell>
                    <NoWrapTableCell>
                      {user.email ?? (
                        <PlaceholderTypography>無</PlaceholderTypography>
                      )}
                    </NoWrapTableCell>
                    <NoWrapTableCell>
                      <ReferenceBlock
                        label={user.reference}
                        primaryKey
                        monospace
                        href={`/admin/users/${user.reference}`}
                      />
                    </NoWrapTableCell>
                  </TableRow>
                ))}
              </StatefulTableBody>
            </Table>
          </TableContainer>
          <TablePagination offsetPagination={usersPagination} />
        </ModuleFunctionBody>
      </ModuleFunction>

      <SidePanel id="createUser">
        <CardHeader
          title="新增使用者"
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
              control={createUserForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} required label="名字" variant="filled" />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <FormControl>
            <Controller
              name="username"
              control={createUserForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="使用者名稱"
                  variant="filled"
                />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <FormControl>
            <Controller
              name="password"
              control={createUserForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} required label="密碼" variant="filled" />
              )}
              rules={{ required: '必填' }}
            />
          </FormControl>
          <FormControl>
            <Controller
              name="reference"
              control={createUserForm.control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="系統識別碼"
                  variant="filled"
                  helperText="建立後無法變更"
                />
              )}
            />
          </FormControl>
          <AutoLoadingButton
            type="submit"
            variant="contained"
            disabled={!createUserForm.formState.isValid}
            onClick={createUserForm.handleSubmit(handleSubmitCreateUserForm)}
          >
            新增
          </AutoLoadingButton>
        </Stack>
      </SidePanel>
    </React.Fragment>
  )
}
