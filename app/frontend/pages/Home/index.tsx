import { Button } from '@/components/ui/button';
import { root_path, sidekiq_web_path } from '@/rails/routes';
import { Link } from '@inertiajs/react';

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
          <Link href="https://rubyonrails.org/" target="_blank" rel="noopener noreferrer">
            Rails Docs
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://react.dev/" target="_blank" rel="noopener noreferrer">
            React Docs
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://inertiajs.com/" target="_blank" rel="noopener noreferrer">
            Inertia.js Docs
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer">
            Shadcn/UI
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <a href={sidekiq_web_path()} target="_blank" rel="noopener noreferrer">Sidekiq</a>
        </Button>

        <Button variant="outline" asChild>
          <Link href={root_path()}>Reload</Link>
        </Button>
      </div>
    </div>
  );
}
