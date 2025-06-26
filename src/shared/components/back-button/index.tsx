import { ArrowLeftIcon } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = "" }: Readonly<BackButtonProps>): JSX.Element {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div
      onClick={handleBack}
      className={`cursor-pointer bg-white p-2 rounded-md flex items-center gap-1.5 text-sm text-black hover:bg-gray-50 ${className}`}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      Back
    </div>
  );
}
