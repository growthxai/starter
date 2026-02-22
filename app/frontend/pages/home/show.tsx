import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { root_path } from '@/rails/routes';
import { Link } from '@inertiajs/react';
import { HeadlessModal } from '@inertiaui/modal-react';

interface Props {
  title: string;
  content: string;
  timestamp: string;
}

export default function Show({ title, content, timestamp }: Props) {
  return (
    <HeadlessModal>
      {({ isOpen, close }) => (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{content}</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="mb-2 text-sm font-medium">Technical Details:</p>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Using HeadlessModal with shadcn Dialog</li>
                  <li>• Props come from jbuilder view</li>
                  <li>• Timestamp: {timestamp}</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" asChild>
                <Link href={root_path()}>Navigate Home</Link>
              </Button>
              <Button onClick={close}>Close Modal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </HeadlessModal>
  );
}
