import { BookOpenCheckIcon, HelpCircleIcon, CircleCheckBig, FileText,ChevronLeft, BadgeCheck, Badge, Bot } from "lucide-react";
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import { zoomPlugin } from '@react-pdf-viewer/zoom'
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { getPdf, savePdf } from '@/shared/utlis/idb'




import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  Input,
  
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger} from "ti-react-template/components";
import { Link } from "@tanstack/react-router";
import { getItem } from "@/shared/utlis/localStorage";
import { useEffect, useMemo, useState } from "react";
import { ReadonlyTopic } from "@/routes/training/student/all-courses/$courseId/topics";
// import { PageHeader } from '@/shared/components/page-header';
import { getAccessToken } from "@/shared/utlis/cookieUtils";
import clsx from "clsx";
import { VerticalbarChat } from "@/shared/components/CustomChat/VerticalChatbot";
// import { BackButton } from "@/shared/components/back-button";



interface CourseDetailProps {
  topics: ReadonlyTopic[];
  courseId: number;
  courseTitle: string;
}



export function CourseDetail({
  topics,
  courseId,
  courseTitle,
}: Readonly<CourseDetailProps>): JSX.Element {
  const role = getItem("role");
  const [topicFilter, setTopicFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [topicname, setTopicname] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState({
    "topicId": 0,
    "topicName": "",
    "sequence": 0,
    "completed": false,
    "scorePercent": 0.0,
    "averageScorePercent": 0.0,
    "metadata": ""
},)
  const [_pageNumbers, setPageNumbers] = useState<number[]>([]);
  const token = getAccessToken()
  const [pdfBlob, setBlob] = useState<string>()
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)
  const zoomPluginInstance = zoomPlugin()
  const  pageNavigationPluginInstance  =pageNavigationPlugin()
  const { GoToNextPageButton, GoToPreviousPageButton } = pageNavigationPluginInstance
  const { ZoomInButton, ZoomPopover, ZoomOutButton } = zoomPluginInstance
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modal,SetModal] = useState(false)

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

  const initialPage = useMemo(() => {
    return selectedTopic.metadata ? JSON.parse(selectedTopic.metadata).start_page : 1;
  }, [selectedTopic]);
  
  const filteredTopics = topics.filter(topic =>
    topicFilter === "all" ? true :
    topicFilter === "completed" ? topic.completed :
    !topic.completed
  ).filter(topic => topic.topicName.toLowerCase().includes(topicname.toLowerCase()));



return (
  
role === "ROLE_Student" ? 
<div className="flex min-h-screen w-full bg-gray-50 pb-1 pt-1 ">
<div className="flex flex-col min-h-full w-full gap-3">
  <div className="flex w-full justify-between items-center text-white p-3 gap-3">
  <Breadcrumb>
        <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/training/student/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/training/student/course/${courseId}`}>Course Stats</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Chat Bot</BreadcrumbPage>
        </BreadcrumbItem>
        </BreadcrumbList>
        </Breadcrumb>
    <h1 className="text-xl text-neutral-900 tracking-wider font-semibold">{courseTitle}</h1>
    <div></div>
    </div>

<div className="flex flex-row h-full w-full pr-3 p-3">
<div className={`flex flex-col h-full ${isCollapsed ? 'w-[4%] bg-gray-50' : 'w-[35%] bg-white '} gap-2 rounded-md p-2 transition-all duration-300 min-h-[95vh] max-h-[95vh]`}>
<div className="w-full flex justify-between items-center gap-2">
{isCollapsed?<></>:
!selectedTopic.topicId?<div className="  h-10 pl-1 py-2 font-semibold">Please Select a Topic for Quiz</div> : 
selectedTopic.topicId && selectedTopic.completed===false ?
  
 <Link 
  to="/training/student/courses/$topicId/quiz"  
  params={{ topicId: selectedTopic.topicId.toString() }}
  className={`${selectedTopic.topicId && selectedTopic.completed===false ?"bg-black text-white border-2 border-black ":"pointer-events-none  border-2 border-[#A9A9A9] text-[#A9A9A9]"} font-bold  hover:bg-gray-800 text-nowrap items-center justify-center text-xs h-10 p-3 py-2 rounded-md  mr-3` }>{`Take Quiz on ${selectedTopic.topicName}`}</Link>
              
:<div className="font-semibold h-10 pl-1 py-2 ">Quiz Already Completed for the Selected Topic</div>            }
<Button 
    variant="ghost" 
    size="icon"
    onClick={() => setIsCollapsed(prev => !prev)}
    className={` h-10 w-10  ${isCollapsed ? 'border-2 border-white bg-white' : 'border-2  bg-gray-50 border-gray-50'}`}
  >
    <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
  </Button>
</div>
  {!isCollapsed &&
  <>
    <div className="w-full">
    <Input placeholder="Search topics..."  className={"border-2 border-black focus-visible:ring-0"} value={topicname} onChange={(e) => setTopicname(e.target.value)}/>

    </div>
   <div className=" flex gap-3 py-3">
   <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button variant={"outline"} onClick={()=>setTopicFilter("all")} disabled={topicFilter === "all"} className="font-bold bg-gray-700 text-white hover:bg-gray-700 hover:text-white"><FileText /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm text-gray-500">All Topics</p>
                          
                            </TooltipContent>
                            
                          </Tooltip>
                          <Tooltip>
                          <TooltipTrigger>
                            <Button variant={"outline"} onClick={()=>setTopicFilter("completed")} disabled={topicFilter === "completed"} className="font-bold bg-gray-700 text-white hover:bg-gray-700 hover:text-white"><BadgeCheck /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm text-gray-500">Completed Topics</p>
                          
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                          <TooltipTrigger>
                            <Button variant={"outline"} onClick={()=>setTopicFilter("incomplete")} disabled={topicFilter === "incomplete"} className="font-bold bg-gray-700 text-white hover:bg-gray-700 hover:text-white"><Badge /></Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm text-gray-500">Incomplete Topics</p>
                          
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
   </div>

   <ScrollArea>
        {

          filteredTopics.length === 0 ? (
            <div className="flex w-full items-center justify-center p-4">
              <p className="text-sm text-gray-500">No topics to display</p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <div role="button" 
                key={topic.topicId} 
                className={`flex w-full items-center justify-start gap-1 ${selectedTopic.topicName === topic.topicName ? 'bg-gray-100' : 'hover:bg-gray-100'} rounded-md cursor-pointer p-1 m-1`} 
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="w-[10%]">
                  {topic.completed ? (
                    <BadgeCheck color="#006400" stroke="#006400" strokeWidth={3}/>
                  ) : (
                    <Badge color="#A9A9A9" />
                  )}
                </div>
                <p className="text-xs font-thin w-[90%]">{topic.topicName}</p>
              </div>
            ))
          )
        }
   </ScrollArea>
  </>}

  </div>
<div className={`flex  flex-col h-full ${isCollapsed ? 'w-[95%]' : 'w-[63%]'} mx-3 gap-2 transition-all duration-300 min-h-[95vh] max-h-[95vh] mb-1`}>

 <div className="flex flex-col  h-full w-full justify-start items-center rounded-md " > 


        
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          {isDocumentLoaded && (
            <div className="flex w-full bg-gray-100 rounded-t-md ">
            
              <div className="flex w-full justify-between items-center  ">
                <div></div>
                <div className="flex">
                <ZoomOutButton />
                <ZoomPopover />
                <ZoomInButton />
</div>
                <div className="flex">
                <GoToPreviousPageButton  />
                <GoToNextPageButton/>
                </div>
                
                
              </div>
             </div>
          )}
          <div
            className={clsx('w-full ', isDocumentLoaded ? 'h-[95.3%]' : 'h-full')}
          >
   
            {pdfBlob && (
              <Viewer              
                fileUrl={ pdfBlob}
                key={selectedTopic.topicId}
                httpHeaders={{
                  Authorization: `Bearer ${token}`,
                }}
                plugins={[zoomPluginInstance,pageNavigationPluginInstance]}
                withCredentials={true}
                defaultScale={SpecialZoomLevel.PageWidth}
                
                onDocumentLoad={() => setIsDocumentLoaded(true)}
                initialPage={initialPage}
              
              />
            )}
          </div>
        </Worker>
 </div>
 <Button className="fixed bottom-10 right-10" onClick={() => SetModal(true)}>
  
  <Bot />
  </Button>
 {
 
  modal && 
  <div className="absolute top-0 left-0 h-full w-full bg-gray-300 bg-opacity-70 z-50 flex justify-center items-center ">
  <div className="relative left-[28%] h-[80%]  w-[40%] top-[7%] justify-center items-center rounded-xl bg-white max-w-[50%] max-h-[95%] p-4">
    <VerticalbarChat onPageNumbersChange={setPageNumbers} SetModal={SetModal} />
  </div>
</div>
 }
</div>
</div>

</div>
</div>


:

  <div className="flex bg-[#f1f1f1] min-h-screen">
      {/* Main Content */}
      <main className="flex-1 p-7">
        {/* Header */}
        {/* <PageHeader className="mb-3" /> */}

        <div className="flex justify-between items-center gap-2.5 mb-5">
        <Breadcrumb>
        <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/training/student/all-courses">Courses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Topics</BreadcrumbPage>
        </BreadcrumbItem>
        </BreadcrumbList>
        </Breadcrumb>
          <div className="flex items-center gap-2">
            <BookOpenCheckIcon className="w-6 h-6" />
            <h1 className="text-xl font-semibold">
              {courseTitle}
            </h1>
          </div>
          <Link
                      to="/training/student/all-courses/$courseId/chat-bot"
                      params={{
                        courseId: courseId.toString()
                      }}
                      className="flex items-center gap-2"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-[#E7E7E7] text-black border-0 hover:bg-[#E7E7E7] hover:text-black"
                      >
                        <BookOpenCheckIcon className="w-5 h-5" />
                        Read
                      </Button>
                    </Link>

          {
            role !== "ROLE_Instructor" && (
              <Select value={topicFilter} onValueChange={(value: "all" | "completed" | "incomplete") => setTopicFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            )
          }
        </div>

        {/* Modules List */}
        <div className="space-y-5">
          {topics.filter(topic =>
            topicFilter === "all" ? true :
              topicFilter === "completed" ? topic.completed :
                !topic.completed
          ).map((topic) => {

            return (
              <Card
                key={topic.topicId}
                className="bg-white shadow-cards-long-default"
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {
                        role !== "ROLE_Instructor" && (
                          <CircleCheckBig strokeWidth={3} className={`w-6 h-6 ${topic.completed ? 'text-green-500' : 'text-gray-400'}`} />                          
                        
                        )
                      }
                      <h3 className="font-semibold text-sm">{topic.topicName}</h3>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    

                    <div className="w-[9.375rem] flex justify-center">
                      {topic.completed && role !== "ROLE_Instructor" ? (
                        <div className="flex items-center justify-center px-3 py-1.5 text-sm text-gray-700">
                          Completed
                        </div>
                      ) : (
                        <Link
                          to="/training/student/courses/$topicId/quiz"
                          params={{ topicId: topic.topicId.toString() }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-gray-50 gap-2 border-black"
                          >
                            <HelpCircleIcon className="w-5 h-5" />
                            {role === "ROLE_Instructor" ? "Preview Quiz" : "Quiz"}
                          </Button>
                        </Link>
                      )}
                    </div>
                    {role === "ROLE_Instructor" && (
                      <Link
                        to="/training/student/all-courses/$courseId/topics/$quiz-set"
                        params={{
                          courseId: courseId.toString(),
                          "quiz-set": topic.topicId.toString()
                        }}
                        className="flex items-center gap-2"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center hover:bg-gray-50 gap-2 border-black"
                        >
                          <HelpCircleIcon className="w-5 h-5" />
                          Compose Quiz
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  
)
}
// N0+_D!$(L0$3D2Y0U