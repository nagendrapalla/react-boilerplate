import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { zoomPlugin } from '@react-pdf-viewer/zoom'
import { getPdf, savePdf } from '@/shared/utlis/idb'
// import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { ArrowBigLeft, ArrowBigRight
  // , ArrowLeft
 } from 'lucide-react'
import { getAccessToken } from '@/shared/utlis/cookieUtils'
import { Link, useParams,
  //  useRouter,
    useSearch } from '@tanstack/react-router'
// import { Button } from 'ti-react-template/components'
import { SidebarChat } from '@/shared/components/CustomChat/Chatbot'

const { PageFit } = SpecialZoomLevel
export function Pdf(): JSX.Element {
  const [toggle, sidebarToggle] = useState(false)  
  const { courseId,topicId } = useParams({ from: '/training/student/topics/$courseId/$topicId/' })
  const { initialPage } = useSearch({ from: '/training/student/topics/$courseId/$topicId/' })
  // const router = useRouter()

  const [pdfBlob, setBlob] = useState<string>()

  const handleSidebarChat = () => {
    sidebarToggle(!toggle)
  }

  // const handleBack = () => {
  //   router.history.back()
  // }

  const token = getAccessToken()
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)

  const zoomPluginInstance = zoomPlugin()
  const { ZoomInButton, ZoomPopover, ZoomOutButton } = zoomPluginInstance
  useEffect(() => {
    const fetchandcachepdf = async () => {
      const cachepdf = await getPdf(courseId.toString())
      if (cachepdf) {
        const pdfURL = URL.createObjectURL(cachepdf)
        setBlob(pdfURL)
      } else {

      console.log(token)
        const res = await fetch(`${process.env.VITE_API_URL}/api/v0/download/course?courseId=${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        console.log(res.body)
        const blob = await res.blob()
        await savePdf(courseId.toString(), blob)
        const pdfURL = URL.createObjectURL(blob)

        setBlob(pdfURL)
      }
    }
    void fetchandcachepdf()
  }, [ token, courseId ])

  return (
    <div
      className={clsx(
        'flex relative h-full w-full justify-between overflow-hidden transition-all duration-200 delay-200 ease-in-out',
        toggle && ' overflow-hidden ',
      )}
    >
      
     
      <div
        className={clsx(
          'flex flex-col h-full',
          toggle ? 'ml-4 w-full  h-[90vh]' : 'ml-4 w-[52vw] h-[90vh]',
        )}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          {isDocumentLoaded && (
            <div className="flex bg-gray-200 shadow ">
              <div className="mx-1.5 flex justify-center items-center ">
                <Link
                  to={"/training/student/courses/$topicId/quiz"}
                  params={{topicId:topicId.toString()}}
                
                  className="font-normal w-[3vw] border border-[black] transition-transform duration-200 ease-in-out rounded-xl hover:scale-105  hover:bg-black text-[black] hover:text-white  "
                >
                  <div className="flex justify-center ">
                    <div>Quiz</div>
                  </div>
                </Link>
              </div>
              <div className="flex w-full justify-center p-1 ">
                <ZoomOutButton />
                <ZoomPopover />
                <ZoomInButton />
              </div>
            </div>
          )}
          <div
            className={clsx('w-full ', isDocumentLoaded ? 'h-[91%]' : 'h-full')}
          >
            {pdfBlob && (
              <Viewer
                fileUrl={pdfBlob}
                httpHeaders={{
                  Authorization: `Bearer ${token}`,
                }}
                plugins={[zoomPluginInstance]}
                withCredentials={true}
                defaultScale={PageFit}
                onDocumentLoad={() => setIsDocumentLoaded(true)}
                initialPage={initialPage}
              />
            )}
          </div>
        </Worker>
        {isDocumentLoaded && (
          <div className="flex bg-gray-200 shadow py-4"></div>
        )}
      </div>
      <div className="flex justify-center items-center">
        <button onClick={handleSidebarChat}>
          {toggle ? <ArrowBigLeft /> : <ArrowBigRight />}
        </button>
      </div>
      <div
        className={clsx(
          'rounded-full w-[34.4vw]  flex items-center justify-center border',
          toggle && 'absolute',
          { invisible: toggle },
        )}
      >
        <SidebarChat
          sidebarOpen={toggle}
          handleSidebarChat={handleSidebarChat}
        /> 
      {/* <div className="flex  justify-end p-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div> */}
    </div>
      </div>
  )
}
