import { Button } from '@/components/ui/button';
import { home_show_path, mission_control_jobs_path, root_path } from '@/rails/routes';
import { Link } from '@inertiajs/react';
import { ModalLink } from '@inertiaui/modal-react';

interface Props {
  message: string;
}

export default function Index({ message }: Props) {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">{message}</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        A modern full-stack starter kit featuring Rails 8, React 19, TypeScript, Inertia.js, and
        Shadcn/UI.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild>
          <a href="https://rubyonrails.org/" target="_blank" rel="noopener noreferrer">
            Rails Docs
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
            React Docs
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://inertiajs.com/" target="_blank" rel="noopener noreferrer">
            Inertia.js Docs
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
            Shadcn/UI
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={mission_control_jobs_path()} target="_blank" rel="noopener noreferrer">
            Jobs
          </a>
        </Button>
        <Button variant="outline" asChild>
          <Link href={root_path()}>Reload</Link>
        </Button>

        <Button variant="outline" asChild>
          <ModalLink href={home_show_path()}>Open Modal</ModalLink>
        </Button>
      </div>
    </div>
  );
}
