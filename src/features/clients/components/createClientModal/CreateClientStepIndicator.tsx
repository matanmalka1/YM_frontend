import { CREATE_CLIENT_STEPS } from './createClientSteps'

interface Props {
  stepIndex: number
}

export const CreateClientStepIndicator: React.FC<Props> = ({ stepIndex }) => (
  <div className="grid grid-cols-4 gap-2" aria-label="שלבי יצירת לקוח">
    {CREATE_CLIENT_STEPS.map((step, index) => (
      <div
        key={step.key}
        className={`rounded-md border px-3 py-2 text-center text-sm font-medium ${
          index === stepIndex
            ? 'border-primary-600 bg-primary-50 text-primary-700'
            : index < stepIndex
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-gray-200 bg-gray-50 text-gray-500'
        }`}
      >
        {index + 1}. {step.label}
      </div>
    ))}
  </div>
)
