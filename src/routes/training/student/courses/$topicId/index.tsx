import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/training/student/courses/$topicId/')({

  component: CourseContent,


})

function CourseContent(): JSX.Element {
  // const { courseId } = Route.useParams()
  // const { data: topics } = useSuspenseQuery({
  //   queryKey: ['topics', courseId],
  //   queryFn: () => fetchTopics(courseId),
  // })

  // if (!topics) {
  //   throw new Error('Topics not found')
  // }

  return   <div>Dummy Page!</div>
    // <ScaleRotateTransition>
    //   <motion.div
    //     initial={{ opacity: 0, y: 20 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ delay: 0.2, duration: 0.5 }}
    //   >
    //     <CourseDetail topics={topics} />
    //   </motion.div>
    // </ScaleRotateTransition>
  
}
