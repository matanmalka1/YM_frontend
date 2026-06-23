interface HiddenFileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  ref?: React.Ref<HTMLInputElement>
}

export const HiddenFileInput: React.FC<HiddenFileInputProps> = ({ ref, ...props }) => (
  <input ref={ref} type="file" className="hidden" {...props} />
)
