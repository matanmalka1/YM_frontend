import type { ControllerRenderProps, FieldErrors, UseFormRegister } from 'react-hook-form'
import { DatePicker } from '../../../../components/ui/inputs/DatePicker'
import { Input } from '../../../../components/ui/inputs/Input'
import type { CreateClientFormValues } from '../../schemas'
import { stripNonDigits, stripNonPhone } from '../../utils/createClientFormUtils'
import { CLIENTS_MESSAGES } from '../../messages'

interface Props {
  businessOpenedAtField: ControllerRenderProps<CreateClientFormValues, 'business_opened_at'>
  disabled: boolean
  errors: FieldErrors<CreateClientFormValues>
  isCompany: boolean
  register: UseFormRegister<CreateClientFormValues>
}

export const CreateClientBusinessStep: React.FC<Props> = ({
  businessOpenedAtField,
  disabled,
  errors,
  isCompany,
  register,
}) => (
  <div className="space-y-4">
    <p className="text-xs text-gray-500">{CLIENTS_MESSAGES.createBusinessStep.requiredFieldsNote}</p>
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <p className="text-sm font-medium text-gray-700">
        {isCompany
          ? CLIENTS_MESSAGES.createBusinessStep.companyDetailsHeading
          : CLIENTS_MESSAGES.createBusinessStep.businessDetailsHeading}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {!isCompany && (
          <div>
            <Input
              label={CLIENTS_MESSAGES.createBusinessStep.nameLabel}
              placeholder={CLIENTS_MESSAGES.createBusinessStep.namePlaceholder}
              error={errors.business_name?.message}
              disabled={disabled}
              {...register('business_name')}
            />
            <p className="mt-1 text-xs text-gray-400">{CLIENTS_MESSAGES.createBusinessStep.nameFallbackNote}</p>
          </div>
        )}
        <div className={isCompany ? 'col-span-2' : undefined}>
          <DatePicker
            label={
              isCompany
                ? CLIENTS_MESSAGES.createBusinessStep.companyIncorporationDate
                : CLIENTS_MESSAGES.createBusinessStep.businessOpenedAtDate
            }
            error={errors.business_opened_at?.message}
            disabled={disabled}
            value={businessOpenedAtField.value ?? ''}
            onChange={businessOpenedAtField.onChange}
            onBlur={businessOpenedAtField.onBlur}
            name={businessOpenedAtField.name}
          />
        </div>
      </div>
    </div>
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <p className="text-sm font-medium text-gray-700">{CLIENTS_MESSAGES.createBusinessStep.contactHeading}</p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={CLIENTS_MESSAGES.createBusinessStep.phoneLabel}
          type="tel"
          placeholder="050-1234567"
          error={errors.phone?.message}
          disabled={disabled}
          onInput={stripNonPhone}
          {...register('phone')}
        />
        <Input
          label={CLIENTS_MESSAGES.createBusinessStep.emailLabel}
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          disabled={disabled}
          {...register('email')}
        />
      </div>
    </div>
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <p className="text-sm font-medium text-gray-700">{CLIENTS_MESSAGES.createBusinessStep.addressHeading}</p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={CLIENTS_MESSAGES.createBusinessStep.streetLabel}
          error={errors.address_street?.message}
          disabled={disabled}
          {...register('address_street')}
        />
        <Input
          label={CLIENTS_MESSAGES.createBusinessStep.buildingNumberLabel}
          error={errors.address_building_number?.message}
          disabled={disabled}
          {...register('address_building_number')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={CLIENTS_MESSAGES.createBusinessStep.apartmentLabel}
          error={errors.address_apartment?.message}
          disabled={disabled}
          {...register('address_apartment')}
        />
        <Input
          label={CLIENTS_MESSAGES.createBusinessStep.zipCodeLabel}
          placeholder="1234567"
          error={errors.address_zip_code?.message}
          disabled={disabled}
          onInput={stripNonDigits}
          {...register('address_zip_code')}
        />
      </div>
      <Input
        label={CLIENTS_MESSAGES.createBusinessStep.cityLabel}
        error={errors.address_city?.message}
        disabled={disabled}
        {...register('address_city')}
      />
    </div>
  </div>
)
