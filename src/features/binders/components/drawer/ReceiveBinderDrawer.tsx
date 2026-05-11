import { DetailDrawer } from '@/components/ui/overlays/DetailDrawer'
import { BinderReceivePanel } from './BinderReceivePanel'
import type { BinderReceivePanelProps } from './BinderReceivePanel'

interface ReceiveBinderDrawerProps extends BinderReceivePanelProps {
  open: boolean
}

export const ReceiveBinderDrawer: React.FC<ReceiveBinderDrawerProps> = ({
  open,
  onClose,
  form,
  clientQuery,
  selectedClient,
  businesses,
  annualReports,
  hasActiveBinder,
  vatType,
  onClientSelect,
  onClientQueryChange,
  onSubmit,
  isSubmitting,
}) => (
  <DetailDrawer open={open} title="קליטת חומר מלקוח" onClose={onClose} isDirty={form.formState.isDirty}>
    <BinderReceivePanel
      form={form}
      clientQuery={clientQuery}
      selectedClient={selectedClient}
      businesses={businesses}
      annualReports={annualReports}
      hasActiveBinder={hasActiveBinder}
      vatType={vatType}
      onClientSelect={onClientSelect}
      onClientQueryChange={onClientQueryChange}
      onSubmit={onSubmit}
      onClose={onClose}
      isSubmitting={isSubmitting}
    />
  </DetailDrawer>
)

ReceiveBinderDrawer.displayName = 'ReceiveBinderDrawer'
