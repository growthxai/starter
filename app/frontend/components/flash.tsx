import { usePage } from '@inertiajs/react';
import * as Toast from '@radix-ui/react-toast';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FlashProps {
  notice?: string;
  error?: string;
  alert?: string;
}

interface ToastProps {
  message: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'success' | 'error';
}

const ToastMessage = ({ message, open, onOpenChange, variant }: ToastProps) => {
  const styles = {
    success: {
      bg: 'bg-green-50 z-50',
      icon: <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />,
      text: 'text-green-800',
      button:
        'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50',
    },
    error: {
      bg: 'bg-red-50 z-50',
      icon: <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />,
      text: 'text-red-800',
      button: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50',
    },
  };

  return (
    <Toast.Root
      className={`rounded-md ${styles[variant].bg} fixed right-4 bottom-4 p-4 shadow-lg`}
      open={open}
      onOpenChange={onOpenChange}
      duration={5000}
    >
      <div className="flex">
        <div className="shrink-0">{styles[variant].icon}</div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${styles[variant].text}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={`inline-flex rounded-md p-1.5 focus:ring-2 focus:ring-offset-2 focus:outline-hidden ${styles[variant].button}`}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Toast.Root>
  );
};

const Flash = ({ notice, error, alert }: FlashProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const { flash } = usePage().props as unknown as { flash: FlashProps };

  useEffect(() => {
    // Check for new messages in this order: props, then flash from Inertia
    const newNotice = notice || flash?.notice;
    const newError = error || flash?.error || flash?.alert;

    if (newNotice || newError) {
      setMessage(newNotice || newError || '');
      setType(newNotice ? 'success' : 'error');
      setOpen(true);
    }
  }, [notice, error, alert, flash]);

  return (
    <Toast.Provider swipeDirection="right">
      <ToastMessage message={message} open={open} onOpenChange={setOpen} variant={type} />
      <Toast.Viewport />
    </Toast.Provider>
  );
};

export default Flash;
