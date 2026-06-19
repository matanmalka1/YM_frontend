import { useMemo, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi, usersQK } from '../api'
import type { CreateUserPayload, UpdateUserPayload, UserResponse } from '../api'
import { toast } from '../../../utils/toast'
import { getErrorMessage, showErrorToast } from '../../../utils/utils'
import { useSearchParamFilters } from '../../../hooks/useSearchParamFilters'
import { parsePositiveInt } from '../../../utils/utils'
import { useRole } from '../../../hooks/useRole'
import { useAuthStore } from '@/store/auth.store'
import { buildUserColumns } from '../components/list/UsersColumns'
import { PAGE_SIZE_SM as PAGE_SIZE } from '@/constants/pagination.constants'

const invalidateUsers = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: usersQK.all })

export const useUsersPage = () => {
  const queryClient = useQueryClient()
  const { isAdvisor } = useRole()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { searchParams, getParam, getPage, setFilter, setFilters, setPage } = useSearchParamFilters()

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
  const [pendingToggle, setPendingToggle] = useState<UserResponse | null>(null)

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

  const confirmToggleActive = () => {
    if (pendingToggle) {
      toggleActive(pendingToggle)
      setPendingToggle(null)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const handleFilterChange = (key: string, value: string) => setFilter(key, value)
  const resetFilters = () => setFilters({ search: '', is_active: '' })

  const users = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const isFiltered = Boolean(search || is_active)

  const columns = useMemo(
    () =>
      buildUserColumns({
        onEdit: setEditUser,
        onToggleActive: setPendingToggle,
        onResetPassword: setResetUser,
        currentUserId,
      }),
    [currentUserId],
  )

  return {
    status: {
      isLoading: listQuery.isPending,
      isFetching: listQuery.isFetching,
      error: listQuery.error ? getErrorMessage(listQuery.error, 'שגיאה בטעינת המשתמשים') : null,
      loadingMessage: 'טוען משתמשים...',
    },
    headerProps: {
      title: 'ניהול משתמשים',
      description: 'ניהול חשבונות משתמשים, תפקידים והרשאות',
    },
    filters: {
      values: filters,
      onFilterChange: handleFilterChange,
      resetFilters,
    },
    table: {
      data: users,
      columns,
      pagination: {
        page: filters.page,
        pageSize: filters.page_size,
        total,
        onPageChange: setPage,
        onPageSizeChange: (size: number) => handleFilterChange('page_size', String(size)),
      },
      emptyState: {
        isEmpty: users.length === 0,
        isFiltered,
        title: 'אין משתמשים להצגה',
        message: 'לא נמצאו משתמשים. הוסף משתמש חדש למערכת.',
        action: { label: 'משתמש חדש', onClick: () => setShowCreateModal(true) },
      },
    },
    modals: {
      openCreate: () => setShowCreateModal(true),
      openAuditLogs: () => setShowAuditLogs(true),
      createProps: {
        open: showCreateModal,
        onClose: () => setShowCreateModal(false),
        onSubmit: createUser,
        isLoading: createMutation.isPending,
      },
      editProps: {
        open: Boolean(editUser),
        user: editUser,
        onClose: () => setEditUser(null),
        onSubmit: updateUser,
        isLoading: updateMutation.isPending,
      },
      resetPasswordProps: {
        open: Boolean(resetUser),
        user: resetUser,
        onClose: () => setResetUser(null),
        onSubmit: resetPassword,
        isLoading: resetPasswordMutation.isPending,
      },
      auditLogsProps: {
        open: showAuditLogs,
        onClose: () => setShowAuditLogs(false),
      },
      toggleActiveProps: {
        open: Boolean(pendingToggle),
        title: pendingToggle?.is_active ? 'השבתת משתמש' : 'הפעלת משתמש',
        message: pendingToggle?.is_active
          ? `האם להשבית את המשתמש ${pendingToggle?.full_name}? המשתמש לא יוכל להתחבר למערכת.`
          : `האם להפעיל את המשתמש ${pendingToggle?.full_name}?`,
        confirmLabel: pendingToggle?.is_active ? 'השבת' : 'הפעל',
        cancelLabel: 'ביטול',
        isLoading: toggleActiveMutation.isPending,
        onConfirm: confirmToggleActive,
        onCancel: () => setPendingToggle(null),
      },
    },
    permissions: {
      isAdvisor,
    },
  }
}
