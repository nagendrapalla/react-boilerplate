import React from 'react';
import { AlertCircle, Sparkles, Wand } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  ScrollArea
} from 'ti-react-template/components';

interface PerformanceInsightsCardProps {
  /** Summary data to display in the card */
  summaryData?: string;
  /** Display summary (truncated version for card) */
  displaySummary?: string;
  /** Whether the summary is being loaded */
  isLoading?: boolean;
  /** Error message if summary failed to load */
  errorMessage?: string;
  /** Title for the card */
  title?: string;
  /** Name of the subject (person, cohort, etc.) */
  subjectName?: string;
  /** Whether to show a scroll area */
  showScrollArea?: boolean;
  /** Whether to force showing the placeholder message instead of loading state */
  showPlaceholder?: boolean;
  /** Maximum height of the card */
  maxHeight?: string;
  /** Callback for when the "Read more" button is clicked */
  onReadMoreClick?: () => void;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom loading secondary message */
  loadingSecondaryMessage?: string;
  /** Placeholder message when no data is available */
  placeholderMessage?: string;
}

/**
 * A reusable component for displaying AI-generated performance insights
 */
export const PerformanceInsightsCard: React.FC<PerformanceInsightsCardProps> = ({
  summaryData,
  displaySummary = '',
  isLoading = false,
  errorMessage,
  title = 'Performance Insights',
  // subjectName,
  showScrollArea = false,
  showPlaceholder = false,
  maxHeight = 'max-h-52',
  onReadMoreClick,
  loadingMessage = 'Generating insights...',
  loadingSecondaryMessage = 'This may take a moment',
  placeholderMessage = 'Please select an option to view summary',
}) => {
  const hasError = !!errorMessage;
  const hasData = !!summaryData;
  const showReadMore = summaryData && displaySummary && summaryData.length > displaySummary.length;
  
  const content = (
    <CardContent className="pb-0">
      {showPlaceholder ? (
        <div className="flex items-center justify-center p-3 text-gray-500">
          {placeholderMessage}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center items-center py-4 gap-2 animate-pulse">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500">{loadingMessage}</p>
          <p className="text-xs text-gray-400">{loadingSecondaryMessage}</p>
        </div>
      ) : hasError ? (
        <div className="flex flex-col justify-center items-center py-4 gap-2 animate-fadeIn">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="text-center max-w-md">
            <p className="text-red-500 font-medium">Unable to generate insights</p>
            <p className="text-sm text-gray-500 mt-1 break-words">
              {errorMessage || "No performance data available. The AI service may be unavailable."}
            </p>
            {import.meta.env.DEV && errorMessage && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-left overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap break-words">{errorMessage}</pre>
              </div>
            )}
          </div>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center p-3 text-gray-500">
          {placeholderMessage}
        </div>
      ) : (
        <div className="p-3">
          <div className="whitespace-pre-line text-gray-700 animate-fadeIn text-sm">
            {displaySummary}
          </div>
          {showReadMore && onReadMoreClick && (
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-blue-600"
              onClick={onReadMoreClick}
            >
              Read more
            </Button>
          )}
        </div>
      )}
    </CardContent>
  );

  return (
    <Card className={`${maxHeight} overflow-hidden border border-blue-100`}>
      <CardHeader className="py-3 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">{title}</h2>
            {/* {subjectName && (
              <span className="text-sm text-gray-500">{subjectName}</span>
            )} */}
          </div>
          {hasData && !isLoading && !hasError && (
            <Badge variant="outline" className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
              AI Generated <Wand />
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {showScrollArea ? (
        <ScrollArea className="h-[15vh] rounded-md">
          {content}
        </ScrollArea>
      ) : (
        content
      )}
    </Card>
  );
};
