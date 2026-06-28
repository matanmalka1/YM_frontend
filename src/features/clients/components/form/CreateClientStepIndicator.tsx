import { CREATE_CLIENT_STEPS } from '../../utils/createClientSteps'
import { CLIENTS_MESSAGES } from '../../messages'

interface Props {
  stepIndex: number
}

export const CreateClientStepIndicator: React.FC<Props> = ({ stepIndex }) => (
  <div
    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    aria-label={CLIENTS_MESSAGES.createModal.stepIndicatorAriaLabel}
  >
    {CREATE_CLIENT_STEPS.map((step, index) => (
      <div
        key={step.key}
        className={`flex min-h-12 items-center justify-center rounded-md border px-2 py-2 text-center text-xs font-medium leading-tight sm:text-sm ${
          index === stepIndex
            ? 'border-primary-600 bg-primary-50 text-primary-700'
            : index < stepIndex
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-50 text-gray-500'
        }`}
      >
        <span className="whitespace-nowrap">
          {index + 1}. {step.label}
        </span>
      </div>
    ))}
  </div>
)
