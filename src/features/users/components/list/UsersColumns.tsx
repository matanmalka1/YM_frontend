import { Badge } from '../../../../components/ui/primitives/Badge'
import { actionsColumn, textColumn, type Column } from '../../../../components/ui/table'
import type { UserResponse } from '../../api'
import { getRoleLabel } from '../../constants'
import { formatDateTime } from '../../../../utils/utils'
import { UserRowActions } from './UserRowActions'

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
    header: 'שם מלא',
    valueClassName: 'font-semibold text-gray-900',
    getValue: (user) => user.full_name,
  }),
  textColumn({
    key: 'email',
    header: 'אימייל',
    getValue: (user) => user.email,
  }),
  {
    key: 'role',
    header: 'תפקיד',
    render: (user) => <Badge variant={user.role === 'advisor' ? 'info' : 'neutral'}>{getRoleLabel(user.role)}</Badge>,
  },
  {
    key: 'is_active',
    header: 'סטטוס',
    render: (user) => <Badge variant={user.is_active ? 'success' : 'error'}>{user.is_active ? 'פעיל' : 'מושבת'}</Badge>,
  },
  textColumn({
    key: 'last_login_at',
    header: 'כניסה אחרונה',
    valueClassName: 'tabular-nums',
    getValue: (user) => formatDateTime(user.last_login_at),
  }),
  textColumn({
    key: 'created_at',
    header: 'נוצר בתאריך',
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
