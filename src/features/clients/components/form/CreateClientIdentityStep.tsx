import { RotateCcw, ShieldAlert, UserRoundX } from 'lucide-react'
import { useWatch, type Control, type FieldErrors, type UseFormClearErrors, type UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { Button } from '../../../../components/ui/primitives/Button'
import { InlineLink } from '../../../../components/ui/primitives/InlineLink'
import { formatDate } from '@/utils/utils'
import { CREATE_CLIENT_ENTITY_OPTIONS, getCreateClientEntityLabels } from '../../constants'
import type { ActiveClientSummary, DeletedClientSummary } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { stripNonDigits } from '../../utils/createClientFormUtils'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { CLIENTS_MESSAGES } from '../../messages'

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
      <p className="text-xs text-gray-500">{CLIENTS_MESSAGES.createIdentity.allFieldsRequired}</p>
      <Select
        label={CLIENTS_MESSAGES.createIdentity.entityTypeLabel}
        error={errors.entity_type?.message}
        disabled={disabled}
        options={[{ value: '', label: CLIENTS_MESSAGES.createIdentity.entityTypePlaceholder }, ...CREATE_CLIENT_ENTITY_OPTIONS]}
        value={entityTypeValue ?? ''}
        {...entityTypeField}
      />
      <Input label={`${nameLabel} *`} error={errors.full_name?.message} disabled={disabled} {...register('full_name')} />
      <Input
        label={`${idNumberLabel} *`}
        placeholder={idNumberPlaceholder}
        error={errors.id_number?.message}
        disabled={disabled}
        onInput={stripNonDigits}
        {...register('id_number')}
      />
      {deletedClient && (
        <div className="rounded-lg border border-warning-300 bg-warning-50 p-4">
          <div className="flex items-start gap-3">
            <UserRoundX className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="font-medium text-warning-950">{CLIENTS_MESSAGES.createIdentity.deletedClientTitle}</p>
                <p className="mt-1 text-sm text-warning-800">{CLIENTS_MESSAGES.createIdentity.deletedClientExplanation}</p>
              </div>
              <dl className="grid gap-2 rounded-md border border-warning-200 bg-white/70 p-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-warning-700">{CLIENTS_MESSAGES.createIdentity.clientNameField}</dt>
                  <dd className="font-medium text-gray-950">{deletedClient.full_name}</dd>
                </div>
                <div>
                  <dt className="text-warning-700">{CLIENTS_MESSAGES.createIdentity.deletedAtField}</dt>
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
                    loadingLabel={CLIENTS_MESSAGES.createIdentity.restoreLoadingLabel}
                    disabled={disabled}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {CLIENTS_MESSAGES.createIdentity.restore}
                  </Button>
                  <span className="text-sm text-warning-800">
                    {CLIENTS_MESSAGES.createIdentity.recordNumber(deletedClient.id)}
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-white/70 p-3 text-sm text-warning-800">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{CLIENTS_MESSAGES.createIdentity.advisorOnlyRestore}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeConflicts.length > 0 && (
        <div className="rounded-lg border border-negative-300 bg-negative-50 p-3 text-sm text-negative-700">
          <p className="font-medium mb-1">{CLIENTS_MESSAGES.createIdentity.activeConflict(idNumberLabel)}</p>
          <ul className="space-y-1">
            {activeConflicts.map((c) => (
              <li key={c.id}>
                <InlineLink href={CLIENT_ROUTES.detail(c.id)} target="_blank" rel="noreferrer">
                  {c.full_name}
                </InlineLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
