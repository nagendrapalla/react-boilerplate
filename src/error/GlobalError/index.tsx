import { AlertTriangle } from "lucide-react";
import { Card } from "ti-react-template/components";
import { Constant } from "@/shared/utlis/constants";
import { FallbackProps } from "react-error-boundary";

export function GlobalError({  resetErrorBoundary }: FallbackProps) {
  return (
    <main className="h-screen flex justify-center items-center">
      <Card
        className="w-[25%] border-0 shadow-lg flex flex-col justify-center items-center py-16 gap-y-6"
        data-testid="error-card"
      >
        <section className="flex flex-row items-center space-x-2">
          <AlertTriangle
            className="w-10 h-10 text-gray-500"
            data-testid="alert-icon"
          />
          <p className="text-xl text-gray-700 tracking-widest">
            {Constant.SomethingWentWrong}
          </p>
        </section>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </Card>
    </main>
  );
}
