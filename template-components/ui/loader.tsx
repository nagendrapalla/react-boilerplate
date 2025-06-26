import { type ComponentProps } from "react";
import { Loader } from "lucide-react";
import { cn } from "../lib/utils";

export interface GlobalLoaderProps extends ComponentProps<"main"> {
  readonly message?: string;
}

export function GlobalLoader({ message, className, ...props }: GlobalLoaderProps): JSX.Element {
  return (
    <main
      className={cn(
        "flex h-screen flex-col items-center justify-center gap-y-2 bg-background",
        className
      )}
      role="main"
      {...props}
    >
      <Loader
        className="h-10 w-14 animate-spin text-primary"
        data-testid="loader-icon"
      />
      {message && (
        <p className="text-sm text-muted-foreground" data-testid="loader-message">
          {message}
        </p>
      )}
    </main>
  );
}
