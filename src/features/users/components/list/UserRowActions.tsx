import { Pencil, KeyRound, UserX, UserCheck } from 'lucide-react'
import { RowActionGroup, RowActionItem, RowActionsMenu } from '@/components/ui/table'
import type { UserResponse } from '../../api'
import { USERS_MESSAGES } from '../../messages'

interface UserRowActionsProps {
  user: UserResponse
  currentUserId: number | undefined
  onEdit: (user: UserResponse) => void
  onResetPassword: (user: UserResponse) => void
  onToggleActive: (user: UserResponse) => void
}

export const UserRowActions: React.FC<UserRowActionsProps> = ({
  user,
  currentUserId,
  onEdit,
  onResetPassword,
  onToggleActive,
}) => {
  const canToggleActive = user.id !== currentUserId

  return (
    <RowActionsMenu ariaLabel={USERS_MESSAGES.rowActions.ariaLabel(user.full_name)}>
      <RowActionGroup>
        <RowActionItem
          label={USERS_MESSAGES.rowActions.edit}
          onClick={() => onEdit(user)}
          icon={<Pencil className="h-4 w-4" />}
        />
        <RowActionItem
          label={USERS_MESSAGES.rowActions.resetPassword}
          onClick={() => onResetPassword(user)}
          icon={<KeyRound className="h-4 w-4" />}
        />
      </RowActionGroup>
      <RowActionGroup>
        {canToggleActive && (
          <RowActionItem
            label={user.is_active ? USERS_MESSAGES.rowActions.deactivate : USERS_MESSAGES.rowActions.activate}
            onClick={() => onToggleActive(user)}
            icon={user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            danger={user.is_active}
          />
        )}
      </RowActionGroup>
    </RowActionsMenu>
  )
}

UserRowActions.displayName = 'UserRowActions'
