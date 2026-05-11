import { Pencil, KeyRound, UserX, UserCheck } from 'lucide-react'
import { RowActionItem, RowActionsMenu } from '@/components/ui/table'
import type { UserResponse } from '../api'
import { Button } from '@/components/ui/primitives/Button'

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
}) => (
  <div className="flex items-center justify-center gap-0.5">
    <Button
      variant="ghost"
      size="sm"
      tooltip="עריכה"
      aria-label="עריכה"
      className="p-1.5 text-gray-400 hover:text-gray-700"
      onClick={(e) => {
        e.stopPropagation()
        onEdit(user)
      }}
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      tooltip="איפוס סיסמה"
      aria-label="איפוס סיסמה"
      className="p-1.5 text-gray-400 hover:text-gray-700"
      onClick={(e) => {
        e.stopPropagation()
        onResetPassword(user)
      }}
    >
      <KeyRound className="h-4 w-4" />
    </Button>
    {user.id !== currentUserId && (
      <RowActionsMenu ariaLabel={`פעולות נוספות למשתמש ${user.full_name}`}>
        <RowActionItem
          label={user.is_active ? 'השבתה' : 'הפעלה'}
          onClick={() => onToggleActive(user)}
          icon={user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          danger={user.is_active}
        />
      </RowActionsMenu>
    )}
  </div>
)

UserRowActions.displayName = 'UserRowActions'
