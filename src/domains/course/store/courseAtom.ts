import { getItem, removeItem, setItem } from '@/shared/utlis/localStorage';
import { atom, useAtom } from 'jotai';

// Atom to store the current course ID
export const courseIdAtom = atom<number | null>(getItem("courseId") as number | null);

// Custom hook to access and update the course ID
export function useCourseId() {
  const [courseId, setCourseId] = useAtom(courseIdAtom);

  // Function to update the course ID
  const updateCourseId = (id: number) => {
if(getItem("courseId")){
removeItem("courseId");
setItem("courseId", id);
}
else{
  setItem("courseId", id);
}
    setCourseId(getItem("courseId"));
  };
  return {
    courseId,
    updateCourseId,
  };
}
