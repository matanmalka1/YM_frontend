import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi, usersQK } from '../api'
import type { CreateUserPayload, UpdateUserPayload, UserResponse } from '../api'
import { toast } from '../../../utils/toast'
import { showErrorToast } from '../../../utils/utils'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { parsePositiveInt } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'

const invalidateUsers = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: usersQK.all })

export const useUsersPage = () => {
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()
  const { searchParams, getParam, getPage, setFilter, setPage } = useSearchParamFilters()

  const page = getPage()
  const page_size = parsePositiveInt(searchParams.get('page_size'), PAGE_SIZE)
  const isActiveParam = searchParams.get('is_active')
  const search = getParam('search')
  const is_active = (isActiveParam === 'true' || isActiveParam === 'false' ? isActiveParam : undefined) as
    | 'true'
    | 'false'
    | undefined
  const filters = { page, page_size, is_active, search }

  const listQuery = useQuery({
    queryKey: usersQK.list(filters),
    queryFn: () => usersApi.list(filters),
    placeholderData: keepPreviousData,
  })

  // ── Modal state ──────────────────────────────────────────────────────────────

  const [editUser, setEditUser] = useState<UserResponse | null>(null)
  const [resetUser, setResetUser] = useState<UserResponse | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAuditLogs, setShowAuditLogs] = useState(false)

  // ── Mutations ────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: async () => {
      toast.success('משתמש נוצר בהצלחה')
      await invalidateUsers(queryClient)
    },
    onError: (err) => showErrorToast(err, 'שגיאה ביצירת משתמש'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateUserPayload }) =>
      usersApi.update(userId, payload),
    onSuccess: async () => {
      toast.success('פרטי המשתמש עודכנו')
      await invalidateUsers(queryClient)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בעדכון המשתמש'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      isActive ? usersApi.deactivate(userId) : usersApi.activate(userId),
    onSuccess: async (_, { isActive }) => {
      toast.success(isActive ? 'המשתמש הושבת בהצלחה' : 'המשתמש הופעל בהצלחה')
      await invalidateUsers(queryClient)
    },
    onError: (err) => showErrorToast(err, 'שגיאה בשינוי סטטוס המשתמש'),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      usersApi.resetPassword(userId, { new_password: newPassword }),
    onSuccess: () => toast.success('הסיסמה אופסה בהצלחה'),
    onError: (err) => showErrorToast(err, 'שגיאה באיפוס הסיסמה'),
  })

  // ── Actions ──────────────────────────────────────────────────────────────────

  const createUser = async (payload: CreateUserPayload) => {
    await createMutation.mutateAsync(payload)
    setShowCreateModal(false)
  }

  const updateUser = async (userId: number, payload: UpdateUserPayload) => {
    await updateMutation.mutateAsync({ userId, payload })
    setEditUser(null)
  }

  const toggleActive = (user: UserResponse) => {
    toggleActiveMutation.mutate({ userId: user.id, isActive: user.is_active })
  }

  const resetPassword = async (userId: number, newPassword: string) => {
    await resetPasswordMutation.mutateAsync({ userId, newPassword })
    setResetUser(null)
  }

  return {
    // Data
    users: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    loading: listQuery.isPending,
    error: listQuery.isError ? 'שגיאה בטעינת המשתמשים' : null,
    filters,
    handleFilterChange: (key: string, value: string) => setFilter(key, value),
    setPage,

    // Modal state
    editUser,
    setEditUser,
    resetUser,
    setResetUser,
    showCreateModal,
    setShowCreateModal,
    showAuditLogs,
    setShowAuditLogs,

    // Actions
    createUser,
    createLoading: createMutation.isPending,

    updateUser,
    updateLoading: updateMutation.isPending,

    toggleActive,
    toggleActiveLoading: toggleActiveMutation.isPending,

    resetPassword,
    resetPasswordLoading: resetPasswordMutation.isPending,

    // Permissions
    isAdvisor,
  }
}
