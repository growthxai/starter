import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeletePipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  processing?: boolean;
}

export const DeletePipelineDialog = ({
  open,
  onOpenChange,
  pipelineName,
  onConfirm,
  onCancel,
  processing = false,
}: DeletePipelineDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Pipeline</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{pipelineName}"? This will remove this pipeline, all
            versions, and any duplicated tabs, plus their execution histories.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing} onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={processing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {processing ? 'Deleting...' : 'Delete Pipeline'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
