import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorsProps {
  errors?: string[] | string;
  className?: string;
}

export default function ValidationErrors({ errors, className = '' }: ValidationErrorsProps) {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorList = Array.isArray(errors) ? errors : [errors];

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {errorList.length === 1 ? (
          <span>{errorList[0]}</span>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {errorList.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
