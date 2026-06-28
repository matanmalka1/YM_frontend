import type { Control, ControllerRenderProps, FieldErrors, UseFormClearErrors, UseFormRegister } from 'react-hook-form'
import type { ActiveClientSummary, ClientCreationImpactResponse, DeletedClientSummary } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { CreateClientBusinessStep } from './CreateClientBusinessStep'
import { CreateClientIdentityStep } from './CreateClientIdentityStep'
import { CreateClientReviewStep } from './CreateClientReviewStep'
import { CreateClientTaxStep } from './CreateClientTaxStep'

interface Props {
  advisorOptions: Array<{ value: string; label: string }>
  advisorsLoading: boolean
  businessOpenedAtField: ControllerRenderProps<CreateClientFormValues, 'business_opened_at'>
  control: Control<CreateClientFormValues>
  activeConflicts: ActiveClientSummary[]
  disabled: boolean
  deletedClient?: DeletedClientSummary
  errors: FieldErrors<CreateClientFormValues>
  isAdvisor: boolean
  isRestoreLoading: boolean
  clearErrors: UseFormClearErrors<CreateClientFormValues>
  impactData?: ClientCreationImpactResponse
  impactError: boolean
  impactLoading: boolean
  isCompany: boolean
  isExempt: boolean
  register: UseFormRegister<CreateClientFormValues>
  onRestoreDeletedClient: (clientId: number) => void
  showVatFrequency: boolean
  stepIndex: number
  formValues: CreateClientFormValues
}

export const CreateClientStepContent: React.FC<Props> = ({
  advisorOptions,
  advisorsLoading,
  businessOpenedAtField,
  control,
  activeConflicts,
  disabled,
  deletedClient,
  errors,
  isAdvisor,
  isRestoreLoading,
  clearErrors,
  impactData,
  impactError,
  impactLoading,
  isCompany,
  isExempt,
  register,
  onRestoreDeletedClient,
  showVatFrequency,
  stepIndex,
  formValues,
}) => {
  if (stepIndex === 0) {
    return (
      <CreateClientIdentityStep
        control={control}
        activeConflicts={activeConflicts}
        disabled={disabled}
        deletedClient={deletedClient}
        errors={errors}
        isAdvisor={isAdvisor}
        isCompany={isCompany}
        isRestoreLoading={isRestoreLoading}
        clearErrors={clearErrors}
        onRestoreDeletedClient={onRestoreDeletedClient}
        register={register}
      />
    )
  }

  if (stepIndex === 1) {
    return (
      <CreateClientBusinessStep
        businessOpenedAtField={businessOpenedAtField}
        disabled={disabled}
        errors={errors}
        isCompany={isCompany}
        register={register}
      />
    )
  }

  if (stepIndex === 2) {
    return (
      <CreateClientTaxStep
        advisorOptions={advisorOptions}
        advisorsLoading={advisorsLoading}
        control={control}
        disabled={disabled}
        errors={errors}
        impactData={impactData}
        impactError={impactError}
        impactLoading={impactLoading}
        isCompany={isCompany}
        isExempt={isExempt}
        register={register}
        showVatFrequency={showVatFrequency}
      />
    )
  }

  return (
    <CreateClientReviewStep
      values={formValues}
      advisorOptions={advisorOptions}
      impactData={impactData}
      impactLoading={impactLoading}
      impactError={impactError}
    />
  )
}
