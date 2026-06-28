import { GLOBAL_UI_MESSAGES } from '@/messages'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { actionsColumn, dateTimeColumn, textColumn, type Column } from '../../../../components/ui/table'
import type { UserResponse } from '../../api'
import { getRoleLabel } from '../../constants'
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
    tone: 'strong',
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
    header: GLOBAL_UI_MESSAGES.common.status,
    render: (user) => (
      <Badge variant={user.is_active ? 'positive' : 'negative'}>
        {user.is_active ? USERS_MESSAGES.columns.active : USERS_MESSAGES.columns.inactive}
      </Badge>
    ),
  },
  dateTimeColumn({
    key: 'last_login_at',
    header: USERS_MESSAGES.columns.lastLogin,
    getValue: (user) => user.last_login_at,
  }),
  dateTimeColumn({
    key: 'created_at',
    header: USERS_MESSAGES.columns.createdAt,
    getValue: (user) => user.created_at,
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
