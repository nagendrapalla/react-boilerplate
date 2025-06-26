import { AlertTriangle } from "lucide-react";
import { Constant } from "@/shared/utlis/constants";

export function ErrorElement({
  error,
}: {
  readonly error: Error;
}): JSX.Element {
  return (
    <main className="flex flex-col h-screen justify-center items-center">
      <section className="flex flex-row justify-center items-center gap-x-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
        <h1 className="font-extrabold text-2xl">
          {error?.message ?? Constant.SomethingWentWrong}
        </h1>
      </section>
    </main>
  );
}
