import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PdfViewer } from '@/shared/components/PdfViewer'

function PdfViewerComponent(): JSX.Element {
  // Add auth check in the component

  const pdfUrl =
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

  return (
    <div className="h-screen bg-white">
      <PdfViewer pdfUrl={pdfUrl} />
    </div>
  )
}

export const Route = createFileRoute(
  '/training/student/courses/$topicId/pdf-viewer',
)({
  component: PdfViewerComponent,
  // Add param validation through @tanstack/react-router's built-in validation
  parseParams: (params) => ({
    topicId: z.string().parse(params.topicId),
  }),
})
