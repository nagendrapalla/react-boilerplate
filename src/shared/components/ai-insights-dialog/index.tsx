import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button
} from 'ti-react-template/components';

interface AIInsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: React.ReactNode;
  content: React.ReactNode;
  disclaimerText?: string;
  closeButtonText?: string;
}

/**
 * A reusable dialog component for displaying AI-generated performance insights
 */
export const AIInsightsDialog: React.FC<AIInsightsDialogProps> = ({
  open,
  onOpenChange,
  title = 'AI Performance Insights',
  description,
  content,
  // disclaimerText = 'AI-generated content may contain inaccuracies',
  closeButtonText = 'Close',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[36rem]">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] m-2 whitespace-pre-line text-gray-700 leading-relaxed">
          {content}
        </div>
        <DialogFooter className="border-t pt-4">
          {/* <div className="flex items-center gap-2 mr-auto text-xs text-gray-500">
            <AlertCircle className="h-3 w-3" />
            <span>{disclaimerText}</span>
          </div> */}
          <Button onClick={() => onOpenChange(false)}>{closeButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
