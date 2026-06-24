import { Badge } from '../../../../components/ui/primitives/Badge'
import { actionsColumn, textColumn, type Column } from '../../../../components/ui/table'
import type { UserResponse } from '../../api'
import { getRoleLabel } from '../../constants'
import { formatDateTime } from '../../../../utils/utils'
import { UserRowActions } from './UserRowActions'
import { USERS_MESSAGES } from '../../messages'

interface BuildUserColumnsParams {
  onEdit: (user: UserResponse) => void
  onToggleActive: (user: UserResponse) => void
  onResetPassword: (user: UserResponse) => void
  currentUserId: number | undefined
}

export const buildUserColumns = ({
  onEdit,
  onToggleActive,
  onResetPassword,
  currentUserId,
}: BuildUserColumnsParams): Column<UserResponse>[] => [
  textColumn({
    key: 'full_name',
    header: USERS_MESSAGES.columns.fullName,
    valueClassName: 'font-semibold text-gray-900',
    getValue: (user) => user.full_name,
  }),
  textColumn({
    key: 'email',
    header: USERS_MESSAGES.columns.email,
    getValue: (user) => user.email,
  }),
  {
    key: 'role',
    header: USERS_MESSAGES.columns.role,
    render: (user) => <Badge variant={user.role === 'advisor' ? 'info' : 'neutral'}>{getRoleLabel(user.role)}</Badge>,
  },
  {
    key: 'is_active',
    header: USERS_MESSAGES.columns.status,
    render: (user) => (
      <Badge variant={user.is_active ? 'positive' : 'negative'}>
        {user.is_active ? USERS_MESSAGES.columns.active : USERS_MESSAGES.columns.inactive}
      </Badge>
    ),
  },
  textColumn({
    key: 'last_login_at',
    header: USERS_MESSAGES.columns.lastLogin,
    valueClassName: 'tabular-nums',
    getValue: (user) => formatDateTime(user.last_login_at),
  }),
  textColumn({
    key: 'created_at',
    header: USERS_MESSAGES.columns.createdAt,
    valueClassName: 'tabular-nums',
    getValue: (user) => formatDateTime(user.created_at),
  }),
  actionsColumn({
    header: '',
    render: (user) => (
      <UserRowActions
        user={user}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onResetPassword={onResetPassword}
        onToggleActive={onToggleActive}
      />
    ),
  }),
]
