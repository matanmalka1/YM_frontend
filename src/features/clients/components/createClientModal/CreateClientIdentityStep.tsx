import { RotateCcw, ShieldAlert, UserRoundX } from 'lucide-react'
import {
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormClearErrors,
  type UseFormRegister,
} from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { Button } from '../../../../components/ui/primitives/Button'
import { formatDate } from '@/utils/utils'
import { CREATE_CLIENT_ENTITY_OPTIONS, getCreateClientEntityLabels } from '../../constants'
import type { ActiveClientSummary, DeletedClientSummary } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { stripNonDigits } from '../../utils/createClientFormUtils'
import { CLIENT_ROUTES } from '../../api/endpoints'

interface Props {
  control: Control<CreateClientFormValues>
  activeConflicts: ActiveClientSummary[]
  disabled: boolean
  deletedClient?: DeletedClientSummary
  errors: FieldErrors<CreateClientFormValues>
  isAdvisor: boolean
  isCompany: boolean
  isRestoreLoading: boolean
  clearErrors: UseFormClearErrors<CreateClientFormValues>
  onRestoreDeletedClient: (clientId: number) => void
  register: UseFormRegister<CreateClientFormValues>
}

export const CreateClientIdentityStep: React.FC<Props> = ({
  control,
  activeConflicts,
  disabled,
  deletedClient,
  errors,
  isAdvisor,
  isCompany,
  isRestoreLoading,
  clearErrors,
  onRestoreDeletedClient,
  register,
}) => {
  const { name: nameLabel, idNumber: idNumberLabel, idNumberPlaceholder } = getCreateClientEntityLabels(isCompany)

  const entityTypeValue = useWatch({ control, name: 'entity_type' })

  const entityTypeField = register('entity_type', {
    onChange: (event) => {
      if (event.target.value) clearErrors('entity_type')
    },
  })

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">כל השדות בשלב זה חובה.</p>
      <Select
        label="סוג ישות *"
        error={errors.entity_type?.message}
        disabled={disabled}
        options={[{ value: '', label: 'בחר סוג ישות' }, ...CREATE_CLIENT_ENTITY_OPTIONS]}
        value={entityTypeValue ?? ''}
        {...entityTypeField}
      />
      <Input
        label={`${nameLabel} *`}
        error={errors.full_name?.message}
        disabled={disabled}
        {...register('full_name')}
      />
      <Input
        label={`${idNumberLabel} *`}
        placeholder={idNumberPlaceholder}
        error={errors.id_number?.message}
        disabled={disabled}
        onInput={stripNonDigits}
        {...register('id_number')}
      />
      {deletedClient && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <UserRoundX className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="font-medium text-amber-950">לקוח זה נמחק בעבר</p>
                <p className="mt-1 text-sm text-amber-800">
                  כדי לשמור על ההיסטוריה הקיימת, יש לשחזר את הרשומה במקום לפתוח לקוח כפול.
                </p>
              </div>
              <dl className="grid gap-2 rounded-md border border-amber-200 bg-white/70 p-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-amber-700">שם לקוח</dt>
                  <dd className="font-medium text-gray-950">{deletedClient.full_name}</dd>
                </div>
                <div>
                  <dt className="text-amber-700">נמחק בתאריך</dt>
                  <dd className="font-medium text-gray-950">{formatDate(deletedClient.deleted_at)}</dd>
                </div>
              </dl>
              {isAdvisor ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onRestoreDeletedClient(deletedClient.id)}
                    isLoading={isRestoreLoading}
                    loadingLabel="משחזר לקוח"
                    disabled={disabled}
                  >
                    <RotateCcw className="h-4 w-4" />
                    שחזר לקוח
                  </Button>
                  <span className="text-sm text-amber-800">מספר רשומה: {deletedClient.id}</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-white/70 p-3 text-sm text-amber-800">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>שחזור לקוח זמין ליועצים בלבד. יש לפנות ליועץ לביצוע השחזור.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeConflicts.length > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium mb-1">{idNumberLabel} זה כבר קיים במערכת — לא ניתן לפתוח לקוח כפול.</p>
          <ul className="space-y-1">
            {activeConflicts.map((c) => (
              <li key={c.id}>
                <a href={CLIENT_ROUTES.detail(c.id)} className="underline font-medium" target="_blank" rel="noreferrer">
                  {c.full_name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
