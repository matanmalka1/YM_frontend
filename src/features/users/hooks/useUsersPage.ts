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
import { USER_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { USERS_MESSAGES } from '../messages'
import { USERS_ERROR_MESSAGES } from '../errorMessages'

const USERS_FILTER_FIELDS = [
  {
    type: 'search' as const,
    key: 'search',
    label: USERS_MESSAGES.filters.searchLabel,
    placeholder: USER_SEARCH_PLACEHOLDER,
  },
  {
    type: 'select' as const,
    key: 'is_active',
    label: GLOBAL_UI_MESSAGES.common.status,
    options: [
      { value: '', label: USERS_MESSAGES.filters.allUsers },
      { value: 'true', label: USERS_MESSAGES.filters.activeOnly },
      { value: 'false', label: USERS_MESSAGES.filters.inactive },
    ],
  },
]

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

  const {
    data: listData,
    isPending: listPending,
    isFetching: listFetching,
    error: listError,
  } = useQuery({
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
      toast.success(USERS_MESSAGES.mutations.created)
      await invalidateUsers(queryClient)
    },
    onError: (err) => showErrorToast(err, USERS_ERROR_MESSAGES.mutations.createError),
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateUserPayload }) =>
      usersApi.update(userId, payload),
    onSuccess: async () => {
      toast.success(USERS_MESSAGES.mutations.updated)
      await invalidateUsers(queryClient)
    },
    onError: (err) => showErrorToast(err, USERS_ERROR_MESSAGES.mutations.updateError),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      isActive ? usersApi.deactivate(userId) : usersApi.activate(userId),
    onSuccess: async (_, { isActive }) => {
      toast.success(isActive ? USERS_MESSAGES.mutations.deactivated : USERS_MESSAGES.mutations.activated)
      await invalidateUsers(queryClient)
    },
    onError: (err) => showErrorToast(err, USERS_ERROR_MESSAGES.mutations.statusError),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      usersApi.resetPassword(userId, { new_password: newPassword }),
    onSuccess: () => toast.success(USERS_MESSAGES.mutations.passwordReset),
    onError: (err) => showErrorToast(err, USERS_ERROR_MESSAGES.mutations.passwordResetError),
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

  const users = listData?.items ?? []
  const total = listData?.total ?? 0
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
      isLoading: listPending,
      isFetching: listFetching,
      error: listError ? getErrorMessage(listError, USERS_ERROR_MESSAGES.page.loadError) : null,
      loadingMessage: USERS_MESSAGES.page.loadingUsers,
    },
    headerProps: {
      title: USERS_MESSAGES.page.title,
      description: USERS_MESSAGES.page.description,
    },
    filters: {
      fields: USERS_FILTER_FIELDS,
      values: { search: search ?? '', is_active: is_active ?? '' },
      onChange: handleFilterChange,
      onReset: resetFilters,
    },
    table: {
      data: users,
      columns,
      pagination: {
        page: filters.page,
        pageSize: filters.page_size,
        total,
        onPageChange: setPage,
      },
      emptyState: {
        isEmpty: users.length === 0,
        isFiltered,
        title: USERS_MESSAGES.page.emptyTitle,
        message: USERS_MESSAGES.page.emptyMessage,
        action: { label: USERS_MESSAGES.page.newUser, onClick: () => setShowCreateModal(true) },
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
        title: pendingToggle?.is_active
          ? USERS_MESSAGES.toggleActive.deactivateTitle
          : USERS_MESSAGES.toggleActive.activateTitle,
        message: pendingToggle?.is_active
          ? USERS_MESSAGES.toggleActive.deactivateMessage(pendingToggle?.full_name)
          : USERS_MESSAGES.toggleActive.activateMessage(pendingToggle?.full_name ?? ''),
        confirmLabel: pendingToggle?.is_active
          ? USERS_MESSAGES.toggleActive.deactivateConfirm
          : USERS_MESSAGES.toggleActive.activateConfirm,
        cancelLabel: GLOBAL_UI_MESSAGES.actions.cancel,
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
