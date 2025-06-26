// import { getAxios } from "@/shared/api/apiClient";

// import { useQuery } from "@tanstack/react-query";
// import { Link } from "@tanstack/react-router";
// import { BookOpenCheckIcon } from "lucide-react";
// import {
//   Badge,
//   Card,
//   CardContent,
//   Progress,
// } from "ti-react-template/components";

// // Course data structure
// interface Course {
//   id: number;
//   image: string;
//   category: string;
//   title: string;
//   progress: number;
//   description:string;
//   duration: string;
//   instructor: number;
//   topics: number[];
//   status: string;
// }




// export const AllCourses = (): JSX.Element => {

//   const { data,isLoading } = useQuery({
//     queryKey: ["todos"],
//     queryFn: async ()=>{
//       const res=await getAxios("http://localhost:6003/trainings/api/v0/courses")
//       return res.data
//     },
//   });
// const courses: Course[] = data;





// return isLoading?<>Loading...</>:
//     <div className="bg-[#f1f1f1] min-h-screen">
//       <div className="mx-auto p-7">
//         {/* Main Content */}
//         <div>
//           {/* Breadcrumb */}
//           {/* TODO: implement Breadcrumb */}
//           {/* <Breadcrumb className="mb-6">
//             <BreadcrumbItem>
//               <BreadcrumbLink href="/" className="text-[#aeaeae]">
//                 Home
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbItem>
//               <BreadcrumbLink className="text-black font-semibold">
//                 All Courses
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//           </Breadcrumb> */}

//           {/* Page Title */}
//           <div className="flex items-center gap-2.5 mb-6">
//             <BookOpenCheckIcon className="w-6 h-6" />
//             <h1 className="text-xl font-semibold">All Courses</h1>
//           </div>

//           {/* Course Grid */}
//           <div className="grid grid-cols-3 gap-[18px]">
//             {courses.map((course) => (
//              <Link to={`http://localhost:6003/student/course/${course.id}`}><Card
//              key={course.id}
//              className="bg-white shadow-cards-long-default"
//            >
//              <CardContent className="p-3 space-y-2.5">
//                <img
//                  src={course.image}
//                  alt={course.title}
//                  className="w-full h-[75px] object-cover"
//                />
//                <Badge variant="secondary" className="rounded-2xl">
//                  {course.category}
//                </Badge>
//                <p className="font-medium text-sm text-black">
//                  {course.title}
//                </p>
//                <Progress
//                  value={course.progress}
//                  className="h-1.5 bg-gray-100"
//                />
//              </CardContent>
//            </Card></Link> 
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
  
// };
