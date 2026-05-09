import { useEffect, useState } from 'react'
import { useController, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { useAdvisorOptions } from '@/features/users'
import type { ClientRecordResponse, CreateClientPayload } from '../../api'
import { useClientCreationImpact } from '../../hooks/useClientCreationImpact'
import { CREATE_CLIENT_DEFAULT_VALUES } from '../../constants'
import { createClientSchema, type CreateClientFormValues } from '../../schemas'
import { CreateClientModalFooter } from './CreateClientModalFooter'
import { CreateClientStepContent } from './CreateClientStepContent'
import { CreateClientStepIndicator } from './CreateClientStepIndicator'
import { buildCreateClientPayload } from './createClientFormUtils'
import { CREATE_CLIENT_STEPS } from './createClientSteps'
import { useIdNumberConflict } from './useIdNumberConflict'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateClientPayload) => Promise<void>
  onRestoreDeletedClient: (clientId: number) => Promise<ClientRecordResponse>
  isAdvisor: boolean
  isLoading?: boolean
  restoreLoading?: boolean
}

export const CreateClientModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  onRestoreDeletedClient,
  isAdvisor,
  isLoading = false,
  restoreLoading = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0)
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    mode: 'onBlur',
    defaultValues: CREATE_CLIENT_DEFAULT_VALUES,
  })
  const { field: businessOpenedAtField } = useController({ name: 'business_opened_at', control })

  const currentEntityType = watch('entity_type')
  const currentVatFrequency = watch('vat_reporting_frequency')
  const currentAdvancePaymentFrequency = watch('advance_payment_frequency')
  const currentAdvanceRate = watch('advance_rate')
  const currentIdNumber = watch('id_number')
  const { options: advisorOptions, isLoading: advisorsLoading } = useAdvisorOptions()
  const isCompany = currentEntityType === 'company_ltd'
  const isExempt = currentEntityType === 'osek_patur'
  const showVatFrequency = currentEntityType != null && !isExempt

  const { conflict } = useIdNumberConflict(currentIdNumber ?? '', stepIndex === 0)
  const hasActiveConflict = (conflict?.active_clients?.length ?? 0) > 0
  const deletedClient = conflict?.deleted_clients?.[0]
  const hasDeletedConflict = Boolean(deletedClient)

  const canPreviewImpact = Boolean(
    currentEntityType && (isExempt || (currentVatFrequency && currentAdvancePaymentFrequency)),
  )
  const impactQuery = useClientCreationImpact(
    canPreviewImpact
      ? {
          entity_type: currentEntityType,
          vat_reporting_frequency: isExempt ? 'exempt' : currentVatFrequency,
          advance_payment_frequency: currentAdvancePaymentFrequency,
          advance_rate: currentAdvanceRate,
        }
      : null,
  )
  const currentStep = CREATE_CLIENT_STEPS[stepIndex]
  const isLastStep = stepIndex === CREATE_CLIENT_STEPS.length - 1

  useEffect(() => {
    setValue('vat_reporting_frequency', null, { shouldValidate: false })
    setValue('advance_payment_frequency', null, { shouldValidate: false })
  }, [currentEntityType, setValue])

  useEffect(() => {
    if (!open) {
      reset()
      setStepIndex(0)
    }
  }, [open, reset])

  const handleClose = () => {
    if (!isLoading) {
      reset()
      setStepIndex(0)
      onClose()
    }
  }

  const goToNextStep = async () => {
    if (stepIndex === 0 && (hasActiveConflict || hasDeletedConflict)) return
    const isValid = await trigger([...currentStep.fields], { shouldFocus: true })
    if (isValid) setStepIndex((current) => Math.min(current + 1, CREATE_CLIENT_STEPS.length - 1))
  }

  const goToPreviousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  const onFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit(buildCreateClientPayload(data))
    } catch {
      return
    }
    reset()
    setStepIndex(0)
    onClose()
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="יצירת לקוח חדש"
      footer={
        <CreateClientModalFooter
          isLastStep={isLastStep}
          isLoading={isLoading}
          onClose={handleClose}
          onPrevious={goToPreviousStep}
          onSubmit={onFormSubmit}
          onNext={goToNextStep}
          stepIndex={stepIndex}
          nextDisabled={stepIndex === 0 && (hasActiveConflict || hasDeletedConflict)}
        />
      }
    >
      <form onSubmit={onFormSubmit} className="space-y-4">
        <CreateClientStepIndicator stepIndex={stepIndex} />
        <CreateClientStepContent
          advisorOptions={advisorOptions}
          advisorsLoading={advisorsLoading}
          businessOpenedAtField={businessOpenedAtField}
          control={control}
          activeConflicts={conflict?.active_clients ?? []}
          disabled={isLoading}
          deletedClient={deletedClient}
          errors={errors}
          isAdvisor={isAdvisor}
          isRestoreLoading={restoreLoading}
          clearErrors={clearErrors}
          impactData={impactQuery.data}
          impactError={impactQuery.isError}
          impactLoading={impactQuery.isLoading}
          isCompany={isCompany}
          isExempt={isExempt}
          register={register}
          onRestoreDeletedClient={onRestoreDeletedClient}
          showVatFrequency={showVatFrequency}
          stepIndex={stepIndex}
        />
      </form>
    </Modal>
  )
}
