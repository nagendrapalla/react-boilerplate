import { createFileRoute } from '@tanstack/react-router'
import { UserMinus } from 'lucide-react'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Separator, ScrollArea } from 'ti-react-template/components'
import { z } from 'zod'
import { useQuery, useMutation, QueryClient, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import { deleteAxios, getAxios, postAxios, putAxios } from '@/shared/api/apiClient'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useStorePath } from '@/shared/hooks/useStorePath'

// API schemas
const apiUserSchema = z
  .object({
    id: z.number().nullable(),
    userName: z.string(),
    fullName: z.string()
  })
  .readonly()

const cohortSchema = z
  .object({
    id: z.number(),
    cohortName: z.string(),
  })
  .readonly()

type Cohort = z.infer<typeof cohortSchema>
const cohortArraySchema = z.array(cohortSchema).readonly()

const createCohortSchema = z.object({
  cohortName: z.string().min(1, 'Classroom name is required'),
}).readonly()

type CreateCohortInput = z.infer<typeof createCohortSchema>

const courseSchema = z.object({
  courseId: z.number(),
  coursesName: z.string(),
}).readonly()

type Course = z.infer<typeof courseSchema>
const courseArraySchema = z.array(courseSchema).readonly()

const topicSchema = z.object({
  id: z.number(),
  topicName: z.string(),
}).readonly()

type Topic = z.infer<typeof topicSchema>
const topicArraySchema = z.array(topicSchema).readonly()

const updateMetadataSchema = z.object({
  topicId: z.number(),
  startPage: z.number(),
  endPage: z.number(),
}).readonly()

type UpdateMetadataInput = z.infer<typeof updateMetadataSchema>

// Our UI schema
const userSchema = z
  .object({
    id: z.string(),
    fullName: z.string(),
    avatar: z.string(),
  })
  .readonly()

type User = z.infer<typeof userSchema>
// const userArraySchema = z.array(userSchema).readonly()

// Query key factory for type safety
const queryKeys = {
  students: ['students'] as const,
  cohorts: ['cohorts'] as const,
  admins: ['admins'] as const,
  courses: ['courses'] as const,
  topics: (courseId: string | number) => ['topics', courseId] as const,
}

// Transform API data to UI format
const transformApiUser = (apiUser: z.infer<typeof apiUserSchema>): User => ({
  id: apiUser.id?.toString() ?? 'system',
  fullName: apiUser.fullName,
  avatar: '/placeholder-avatar.png',
})

// API services with type safety
const fetchStudents = async (): Promise<readonly User[]> => {
  try {
    const response: AxiosResponse = await getAxios(
      '/api/v0/admin/config/students',
    )
    if (response.status !== 200) {
      throw new Error(`Failed to fetch students: ${response.statusText}`)
    }
    const apiUsers = z.array(apiUserSchema).parse(response.data)
    return apiUsers.map(transformApiUser)
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

const fetchCohorts = async (): Promise<readonly Cohort[]> => {
  try {
    const response: AxiosResponse = await getAxios('/api/v0/cohorts')
    if (response.status !== 200) {
      throw new Error(`Failed to fetch cohorts: ${response.statusText}`)
    }
    return cohortArraySchema.parse(response.data)
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

const fetchAdmins = async (): Promise<readonly User[]> => {
  try {
    const response: AxiosResponse = await getAxios(
      '/api/v0/admin/config/admins',
    )
    if (response.status !== 200) {
      throw new Error(`Failed to fetch admins: ${response.statusText}`)
    }
    const apiUsers = z.array(apiUserSchema).parse(response.data)
    return apiUsers.map(transformApiUser)
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

const fetchCourses = async (): Promise<readonly Course[]> => {
  try {
    const response: AxiosResponse = await getAxios('/api/v0/courses')
    if (response.status !== 200) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`)
    }
    return courseArraySchema.parse(response.data)
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

const fetchTopics = async (courseId: string | number): Promise<readonly Topic[]> => {
  if (!courseId) {
    console.log('No courseId provided to fetchTopics')
    return []
  }
  try {
    const url = `/api/v0/topics/${courseId}`
    const response: AxiosResponse = await getAxios(url)
    if (response.status !== 200) {
      throw new Error(`Failed to fetch topics: ${response.statusText}`)
    }
    const parsedData = topicArraySchema.parse(response.data)
    return parsedData
  } catch (error) {
    console.error('Fetch topics error:', error)
    throw error
  }
}

const createCohort = async (input: CreateCohortInput) => {
  const response = await postAxios('/api/v0/cohorts', input)
  if (response.status !== 200 && response.status !== 201) {
    throw new Error('Failed to create classroom')
  }
  return response.data
}

const addAdmin = async (userId: number) => {
  try {
    const response = await postAxios(`/api/v0/admin/config/user/${userId}`, {})
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Failed to add admin: ${response.statusText}`)
    }
    return response.data
  } catch (error) {
    console.error('Error adding admin:', error)
    throw error
  }
}

const removeAdmin = async (userId: number) => {
  try {
    const response = await deleteAxios(`/api/v0/admin/config/user/${userId}`)
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Failed to remove admin: ${response.statusText}`)
    }
    return response.data
  } catch (error) {
    console.error('Error removing admin:', error)
    throw error
  }
}

// Mutation function to add user to cohort
const addUserToCohort = async ({ cohortId, userId }: { cohortId: number; userId: number }) => {
  try {
    const response = await postAxios('/api/v0/cohorts/users', {
      cohortId,
      userId,
    })
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Failed to add user to cohort: ${response.status}`)
    }
    return response.data
  } catch (error) {
    console.error('Error adding user to cohort:', error)
    throw error
  }
}

const updateTopicMetadata = async (input: UpdateMetadataInput) => {
  try {
    const response = await putAxios('/api/v0/topics/update-metadata', input)
    if (response.status !== 200) {
      throw new Error(`Failed to update topic metadata: ${response.statusText}`)
    }
    return response.data
  } catch (error) {
    console.error('Error updating topic metadata:', error)
    throw error
  }
}

const fetchTopicPageNumbers = async (courseId: string | number) => {
  if (!courseId) return [];

  try {
    const response: AxiosResponse = await getAxios(`/api/v0/topics/pagenumbers/${courseId}`);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch topic page numbers: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

const modifyCohort = async (cohortId: number, modifyCohortDTO: { cohortName: string; userIds: number[] }) => {
  try {
    const response = await putAxios(`/api/v0/cohorts/${cohortId}`, modifyCohortDTO);
    if (response.status !== 200) {
      throw new Error(`Failed to modify cohort: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error("Error modifying cohort:", error);
    throw error;
  }
};

const removeUserFromCohort = async ({ cohortId, userId }: { cohortId: number; userId: number }) => {
  try {
    const response = await putAxios(`/api/v0/cohorts/${cohortId}/user/${userId}/remove`, null);
    if (response.status !== 204) {
      throw new Error(`Failed to remove user from cohort: ${response.statusText}`);
    }
    return response.data;
  } catch (error) {
    console.error('Error removing user from cohort:', error);
    throw error
  }
};

const fetchUsersByCohort = async (cohortId: string | number): Promise<readonly User[]> => {
  if (!cohortId) return [];

  try {
    const response: AxiosResponse = await getAxios(`/api/v0/cohorts/${cohortId}/users`);
    if (response.status !== 200) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const cohortUserSchema = z.object({
      id: z.number().nullable(),
      fullName: z.string(),
      avatar: z.string().nullable(),
    });

    const parsedUsers = z.array(cohortUserSchema).parse(response.data);

    return parsedUsers.map((user) => ({
      id: user.id?.toString() ?? 'system',
      fullName: user.fullName,
      avatar: user.avatar ?? '/placeholder-avatar.png',
    }));
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Create route with loader
export const Route = createFileRoute('/training/config/')({  
  beforeLoad: ({ context }) => {
    // Store the current path before loading the component
    // This will be used for redirects if a user tries to access a restricted page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previousPath', '/training/config');
    }
    
    // Return the context to satisfy TypeScript
    return context;
  },
  loader: ({ context }) => {
    const queryClient = (context as { queryClient: QueryClient }).queryClient;
    return Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.students,
        queryFn: fetchStudents,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.cohorts,
        queryFn: fetchCohorts,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.admins,
        queryFn: fetchAdmins,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.courses,
        queryFn: fetchCourses,
      })
    ])
  },
  component: AdminConfigComponent,
})

function AdminConfigComponent() {
  // Store the current path for redirects
  useStorePath();

  const [classroomName, setClassroomName] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchAdmins, setSearchAdmins] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [highlightedAdminIndex, setHighlightedAdminIndex] = useState<number>(-1)
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchingAdmin, setIsSearchingAdmin] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<string>('')
  // const [newClassroomName, setNewClassroomName] = useState('')
  const [startPage, setStartPage] = useState('')
  const [endPage, setEndPage] = useState('')

  const queryClient = useQueryClient()
  const [selectedModifyCohort, setSelectedModifyCohort] = useState<string>('');
  const [modifyCohortName, setModifyCohortName] = useState('');
  const [modifyCohortUsers, setModifyCohortUsers] = useState<number[]>([]);

  const [searchRemoveUserInput, setSearchRemoveUserInput] = useState("");
  const [selectedRemoveUser, setSelectedRemoveUser] = useState<User | null>(null);
  const [selectedRemoveCohort, setSelectedRemoveCohort] = useState<string>('');
  const [highlightedRemoveIndex] = useState<number>(-1);
  const [selectedCohortId] = useState<number | null>(null);

  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showAdminDropdown, setShowAdminDropdown] = useState(false)
  const [showRemoveUserDropdown, setShowRemoveUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const adminDropdownRef = useRef<HTMLDivElement>(null)
  const removeUserDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch students with React Query
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: queryKeys.students,
    queryFn: fetchStudents,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Fetch cohorts with React Query
  const {
    data: cohorts = [],
    isLoading: isLoadingCohorts,
    error: cohortsError,
  } = useQuery({
    queryKey: queryKeys.cohorts,
    queryFn: fetchCohorts,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Fetch admins with React Query
  const {
    data: admins = [],
    isLoading: isLoadingAdmins,
    error: adminsError,
  } = useQuery({
    queryKey: queryKeys.admins,
    queryFn: fetchAdmins,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Fetch courses with React Query
  const {
    data: courses = [],
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: fetchCourses,
  })

  // Fetch topics with React Query
  const {
    data: topics = [],
    isLoading: isLoadingTopics,
    error: topicsError,
    refetch: refetchTopics
  } = useQuery({
    queryKey: ['topics', selectedCourse],
    queryFn: () => fetchTopics(selectedCourse),
    enabled: !!selectedCourse,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  // Fetch page numbers when a course is selected
  const {
    data: topicPageNumbers = [],
  } = useQuery({
    queryKey: ['topicPageNumbers', selectedCourse],
    queryFn: () => fetchTopicPageNumbers(selectedCourse),
    enabled: !!selectedCourse, // Fetch only when course is selected
  });

  const {
    data: removeUsers = [],
    isLoading: isLoadingRemoveUsers,
    refetch: refetchUsersByCohort,
  } = useQuery({
    queryKey: ['removeUsers', selectedRemoveCohort],
    queryFn: () => fetchUsersByCohort(selectedRemoveCohort),
    enabled: !!selectedRemoveCohort,
  });

    const modifyCohortMutation = useMutation({
      mutationFn: ({ cohortId, modifyCohortDTO }: { cohortId: number; modifyCohortDTO: { cohortName: string; userIds: number[] } }) =>
        modifyCohort(cohortId, modifyCohortDTO),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cohorts });
        toast.success("Cohort modified successfully");
        setModifyCohortName('');
        setModifyCohortUsers([]);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to modify cohort");
      }
    });

    const handleModifyCohort = () => {
      if (!selectedModifyCohort || !modifyCohortName.trim()) {
        toast.error("Please select a cohort and provide a name");
        return;
      }

      modifyCohortMutation.mutate({
        cohortId: Number(selectedModifyCohort),
        modifyCohortDTO: { cohortName: modifyCohortName, userIds: modifyCohortUsers }
      });
    };

    const handleCohortSelection = (cohortId: string) => {
      setSelectedRemoveCohort(cohortId);

      if (cohortId) {
        refetchUsersByCohort();
      }
    };

    const removeUserMutation = useMutation({
      mutationFn: removeUserFromCohort,
      onSuccess: () => {
        setSelectedRemoveUser(null);
        setSearchRemoveUserInput("");
        queryClient.invalidateQueries({ queryKey: queryKeys.students });
        queryClient.invalidateQueries({ queryKey: queryKeys.cohorts });
        toast.success("User removed from classroom");
        refetchUsersByCohort();
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to remove user");
      }
    });

  // Add user to cohort mutation
  const addUserMutation = useMutation({
    mutationFn: addUserToCohort,
    onSuccess: () => {
      // Reset selection after successful addition
      setSelectedUser(null)
      setSearchInput('')
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.students })
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts })
      
      // Show success toast
      toast.success('User added to classroom')
    },
    onError: (error) => {
      // Show error toast
      toast.error(error instanceof Error ? error.message : 'Failed to add user', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored'
      })
    }
  })

  // Create classroom mutation
  const createClassroomMutation = useMutation({
    mutationFn: createCohort,
    onSuccess: () => {
      // Reset form
      setClassroomName('')
      
      // Invalidate cohorts query to refresh list
      queryClient.invalidateQueries({ queryKey: queryKeys.cohorts })
      
      // Show success message
      toast.success('Classroom created successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create classroom')
    }
  })

  // Add admin mutation
  const addAdminMutation = useMutation({
    mutationFn: addAdmin,
    onSuccess: () => {
      setSelectedAdmin(null)
      setSearchAdmins('')
      setHighlightedAdminIndex(-1)
      queryClient.invalidateQueries({ queryKey: queryKeys.admins })
      toast.success('Admin added successfully')
    },
    onError: (error) => {
      // Show error toast
      toast.error(error instanceof Error ? error.message : 'Failed to add admin', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored'
      })
    }
  })

  // Remove admin mutation
  const removeAdminMutation = useMutation({
    mutationFn: removeAdmin,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.admins })
      
      // Show success toast
      toast.success('Admin removed successfully')
    },
    onError: (error) => {
      // Show error toast
      toast.error(error instanceof Error ? error.message : 'Failed to remove admin', {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored'
      })
    }
  })

  // Update metadata mutation
  const updateMetadataMutation = useMutation({
    mutationFn: updateTopicMetadata,
    onSuccess: () => {
      toast.success('Topic metadata updated successfully')
      // Reset form
      setStartPage('')
      setEndPage('')
    },
    onError: (error) => {
      toast.error(`Failed to update topic metadata: ${error.message}`)
    }
  })

  // Get the selected topic object
  const selectedTopicDetails = useMemo(() => {
    return Array.isArray(topics) ? topics.find(topic => topic.id.toString() === selectedTopic) : undefined
  }, [topics, selectedTopic])

  // Debounce search input with a 300ms delay
  const debouncedSearch = useDebounce(searchInput, 300)

  // Debounce admin search input with a 300ms delay
  const debouncedAdminSearch = useDebounce(searchAdmins, 300)

  // Filter users locally based on search input
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch.trim()) return []
    const searchTerm = debouncedSearch.toLowerCase()
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm),
    )
  }, [users, debouncedSearch])

  const filteredUsersForRemove = useMemo(() => {
    if (!searchRemoveUserInput.trim()) return removeUsers;

    return removeUsers.filter((user) =>
      user.fullName?.toLowerCase().includes(searchRemoveUserInput.toLowerCase())
    );
  }, [removeUsers, searchRemoveUserInput]);

  // Filter users locally based on admin search input
  const filteredAdmins = useMemo(() => {
    if (!debouncedAdminSearch.trim()) return []
    const searchTerm = debouncedAdminSearch.toLowerCase()
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm),
    )
  }, [users, debouncedAdminSearch])

  // Handle search state
  useEffect(() => {
    if (searchInput !== debouncedSearch) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }

    // Show dropdown when searching
    if (searchInput.trim() !== '') {
      setShowUserDropdown(true)
    }
  }, [searchInput, debouncedSearch])

  // Handle admin search state
  useEffect(() => {
    if (searchAdmins !== debouncedAdminSearch) {
      setIsSearchingAdmin(true)
    } else {
      setIsSearchingAdmin(false)
    }

    // Show dropdown when searching
    if (searchAdmins.trim() !== '') {
      setShowAdminDropdown(true)
    }
  }, [searchAdmins, debouncedAdminSearch])

  // Handle remove user search state
  useEffect(() => {
    if (searchRemoveUserInput.trim() !== '') {
      setShowRemoveUserDropdown(true)
    }
  }, [searchRemoveUserInput])

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // User dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
      
      // Admin dropdown
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false)
      }
      
      // Remove user dropdown
      if (removeUserDropdownRef.current && !removeUserDropdownRef.current.contains(event.target as Node)) {
        setShowRemoveUserDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (selectedTopic && Array.isArray(topicPageNumbers) && topicPageNumbers.length > 0) {
      const topicData = topicPageNumbers.find((t) => t.topicId.toString() === selectedTopic);
      if (topicData) {
        setStartPage(topicData.startPage.toString());
        setEndPage(topicData.endPage.toString());
      } else {
        setStartPage('');
        setEndPage('');
      }
    }
  }, [selectedTopic, topicPageNumbers]);

  useEffect(() => {
    if (selectedCohortId) fetchUsersByCohort(selectedCohortId);
  }, [selectedCohortId]);

  useEffect(() => {
    if (selectedCourse) {
      setSelectedTopic('');
      setStartPage('');
      setEndPage('');
      refetchTopics();
    }
  }, [selectedCourse, refetchTopics]);

  const handleSelectUser = useCallback((user: User) => {
    setSelectedUser(user)
    setSearchInput('')
    setHighlightedIndex(-1)
  }, [])

  const handleRemoveUser = () => {
    if (!selectedRemoveCohort || !selectedRemoveUser) {
      toast.error("Please select a classroom and a user");
      return;
    }

    removeUserMutation.mutate(
      {
        cohortId: Number(selectedRemoveCohort),
        userId: Number(selectedRemoveUser.id),
      },
      {
        onSuccess: () => {
          setSelectedRemoveUser(null);
          setSearchInput("");
          fetchUsersByCohort(selectedRemoveCohort);
        },
        onError: (error) => {
          console.error("Error removing user:", error);
          toast.error("Failed to remove user. Please try again.");
        },
      }
    );
  };

  const handleSelectAdmin = useCallback((user: User) => {
    setSelectedAdmin(user)
    setSearchAdmins('')
    setHighlightedAdminIndex(-1)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredUsers.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < filteredUsers.length - 1 ? prev + 1 : 0,
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredUsers.length - 1,
          )
          break
        case 'Enter':
          e.preventDefault()
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredUsers.length
          ) {
            handleSelectUser(filteredUsers[highlightedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setSearchInput('')
          setHighlightedIndex(-1)
          break
      }
    },
    [filteredUsers, highlightedIndex, handleSelectUser],
  )

  const handleAdminKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!filteredAdmins.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedAdminIndex((prev) =>
            prev < filteredAdmins.length - 1 ? prev + 1 : 0,
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedAdminIndex((prev) =>
            prev > 0 ? prev - 1 : filteredAdmins.length - 1,
          )
          break
        case 'Enter':
          e.preventDefault()
          if (
            highlightedAdminIndex >= 0 &&
            highlightedAdminIndex < filteredAdmins.length
          ) {
            handleSelectAdmin(filteredAdmins[highlightedAdminIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setSearchAdmins('')
          setHighlightedAdminIndex(-1)
          break
      }
    },
    [filteredAdmins, highlightedAdminIndex, handleSelectAdmin],
  )

  // Reset highlighted index when search input changes
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [searchInput])

  // Reset highlighted admin index when search input changes
  useEffect(() => {
    setHighlightedAdminIndex(-1)
  }, [searchAdmins])

  const handleAddUser = useCallback(() => {
    if (!selectedCohort || !selectedUser) {
      console.log('Missing required fields:', { selectedCohort, selectedUser })
      return
    }
    
    console.log('Adding user to cohort:', {
      userId: selectedUser.id,
      cohortId: selectedCohort
    })
    
    addUserMutation.mutate({
      cohortId: Number(selectedCohort),
      userId: Number(selectedUser.id),
    })
  }, [selectedCohort, selectedUser, addUserMutation])

  const handleCreateClassroom = useCallback(() => {
    if (!classroomName.trim()) {
      toast.error('Please enter a classroom name')
      return
    }

    try {
      // Validate input
      createCohortSchema.parse({ cohortName: classroomName })
      
      // Submit mutation
      createClassroomMutation.mutate({ cohortName: classroomName })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      }
    }
  }, [classroomName, createClassroomMutation])

  const handleAddAdmin = useCallback(() => {
    if (!selectedAdmin) {
      console.log('No admin selected')
      return
    }
    
    addAdminMutation.mutate(Number(selectedAdmin.id))
  }, [selectedAdmin, addAdminMutation])

  const handleRemoveAdmin = useCallback((userId: string) => {
    // Don't allow removing system admin
    if (userId === 'system') {
      toast.warning('Cannot remove system admin')
      return
    }
    
    removeAdminMutation.mutate(Number(userId))
  }, [removeAdminMutation])

  const handleSave = useCallback(() => {
    if (!selectedTopic || !startPage || !endPage) {
      toast.error('Please fill in all fields')
      return
    }

    const input: UpdateMetadataInput = {
      topicId: parseInt(selectedTopic),
      startPage: parseInt(startPage),
      endPage: parseInt(endPage)
    }

    updateMetadataMutation.mutate(input)
  }, [selectedTopic, startPage, endPage, updateMetadataMutation])

  return (
    <div className="mx-3 my-4 px-4 py-5 bg-white min-h-screen rounded-md border border-gray-100 overflow-auto w-[97%]">
      <h1 className="text-2xl font-semibold mb-4">Admin Configurations</h1>
      <p className="text-gray-600 mb-8">
        Manage classrooms, teachers, and course topic navigations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classroom Management */}
        <Card className="shadow-none border border-gray-200 ">
          <CardHeader className="pb-0 mb-6">
            <CardTitle className="text-lg">Classroom Management</CardTitle>
            <p className="text-sm text-gray-500">Manage classrooms and students</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Create New Classroom</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={classroomName}
                  onChange={(e) => setClassroomName(e.target.value)}
                  placeholder="Classroom name"
                  className="w-[80%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateClassroom()
                    }
                  }}
                />
                <button 
                  className="w-[20%] bg-[#0F172A] text-white px-1 py-1 rounded-md hover:bg-[#1E293B] text-sm font-medium disabled:opacity-50"
                  onClick={handleCreateClassroom}
                  disabled={createClassroomMutation.isPending || classroomName.trim() === ''}
                >
                  Create
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Rename Classroom</h3>
              
              <select
                value={selectedModifyCohort}
                onChange={(e) => {
                  setSelectedModifyCohort(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="">Select a classroom</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id.toString()}>
                    {cohort.cohortName}
                  </option>
                ))}
              </select>
              <div></div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={modifyCohortName}
                  onChange={(e) => setModifyCohortName(e.target.value)}
                  className="w-[80%] px-3 py-2 border border-gray-300 rounded-md text-sm mt-2"
                  disabled={!selectedModifyCohort}
                  placeholder="Enter new classroom name"
                />

                <button
                    onClick={handleModifyCohort}
                    className="w-[20%] bg-black text-white px-1 py-1 rounded-md hover:bg-[#1E293B] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-3 ml-auto block"
                    disabled={modifyCohortMutation.isPending || !selectedModifyCohort || !modifyCohortName.trim()}>
                      Rename
                </button>
              </div>
            </div>

             <div>
                <h3 className="text-sm font-medium mb-2">Assign Students to Classroom</h3>
                <select
                  id="classroom"
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  disabled={isLoadingCohorts}
                >
                  <option value="">Select a classroom</option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id.toString()}>
                      {cohort.cohortName}
                    </option>
                  ))}
                </select>
              {isLoadingCohorts && (
                <div className="mt-1 text-sm text-gray-500">
                  Loading classrooms...
                </div>
              )}
              {cohortsError && (
                <div className="mt-1 text-sm text-red-500">
                  {cohortsError instanceof Error
                    ? cohortsError.message
                    : 'Failed to load classrooms. Please try again later.'}
                </div>
              )}
            </div>

            <div className="relative">
            <div className="flex gap-2">
              {selectedUser ? (
                <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.5px]">
                      {getInitials(
                        selectedUser.fullName,
                      )}
                    </div>
                    <span className="text-sm">
                      {selectedUser.fullName}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <UserMinus size={18} className="fill-current" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search students..."
                    className="w-[80%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    disabled={isLoadingUsers}
                  />
                  {isLoadingUsers && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    </div>
                  )}
                </>
              )}
              {usersError && (
                <div className="mt-1 text-sm text-red-500">
                  {usersError instanceof Error
                    ? usersError.message
                    : 'Failed to load users. Please try again later.'}
                </div>
              )}
              {searchInput.trim() !== '' && !selectedUser && showUserDropdown && (
                <div 
                  ref={userDropdownRef}
                  className="absolute z-10 w-[78%] mt-10 border border-gray-200 rounded-md overflow-hidden max-h-[150px] overflow-y-auto bg-white shadow-lg"
                >
                  {isLoadingUsers || isSearching ? (
                    <div className="px-3 py-2.5 text-sm text-gray-500">
                      Loading students...
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer first:rounded-t-md last:rounded-b-md ${
                          index === highlightedIndex
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.5px]">
                          {getInitials(user.fullName)}
                        </div>
                        <span className="text-sm">
                          {user.fullName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2.5 text-sm text-gray-500">
                      No students found
                    </div>
                  )}
                </div>
              )}
             
                <button
                  onClick={handleAddUser}
                  disabled={!selectedCohort || !selectedUser}
                  className="w-[20%] items-center px-1 py-1 bg-[#0F172A] text-white text-sm font-medium rounded-md hover:bg-[#1E293B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              
              </div>
            </div>
            

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Remove Students from Classroom</h3>

              {/* Select Classroom Dropdown */}
              <select
                value={selectedRemoveCohort}
                onChange={(e) => handleCohortSelection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 mb-2"
              >
                <option value="">Select a classroom</option>
                {cohorts.map((cohort) => (
                  <option key={cohort.id} value={cohort.id.toString()}>
                    {cohort.cohortName}
                  </option>
                ))}
              </select>

              {/* Searchable User Selection */}
              <div className="relative">
                <div className="flex gap-2">
                  {selectedRemoveUser ? (
                    <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.5px]">
                          {getInitials(
                            selectedRemoveUser.fullName,
                          )}
                        </div>
                        <span className="text-sm">
                          {selectedRemoveUser.fullName}
                        </span>
                      </div>
                      <button onClick={() => setSelectedRemoveUser(null)} className="text-gray-400 hover:text-gray-600">
                        <UserMinus size={18} className="fill-current" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={searchRemoveUserInput}
                        onChange={(e) => setSearchRemoveUserInput(e.target.value)}
                        placeholder="Search students..."
                        className="w-[80%] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />

                      {isLoadingRemoveUsers && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                        </div>
                      )}
                    </>
                  )}

                  {searchRemoveUserInput.trim() !== "" && showRemoveUserDropdown && (
                      <div 
                        ref={removeUserDropdownRef}
                        className="absolute z-10 w-[78%] mt-10 border border-gray-200 rounded-md overflow-hidden max-h-[100px] overflow-y-auto bg-white shadow-lg"
                      >
                        {filteredUsersForRemove.length > 0 ? (
                          filteredUsersForRemove.map((user) => (
                            <div key={user.id} onClick={() => {
                                                           setSelectedRemoveUser(user);
                                                           setSearchRemoveUserInput('');
                                                           highlightedRemoveIndex;}} className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                              <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold">
                                {getInitials(
                                  user.fullName,
                                )}
                              </div>
                              <span className="text-sm">{user.fullName}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2.5 text-sm text-gray-500">No students found</div>
                        )}
                      </div>
                    )}
                  
                  <button
                    onClick={handleRemoveUser}
                    className="w-[20%] px-1 py-1 bg-black text-white text-sm font-medium rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedRemoveCohort || !selectedRemoveUser}
                  >
                    Remove
                  </button>
                </div>

                
                  
                  
               
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Admin Management */}
        <Card className="shadow-none border border-gray-200">
          <CardHeader className="pb-0 mb-6">
            <CardTitle className="text-lg ">
              Teacher Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Add Teacher</h3>
              <div className="relative">
                {selectedAdmin ? (
                  <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.5px]">
                        {getInitials(
                          selectedAdmin.fullName,
                        )}
                      </div>
                      <span className="text-sm">
                        {selectedAdmin.fullName}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedAdmin(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <UserMinus size={18} className="fill-current" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={searchAdmins}
                      onChange={(e) => setSearchAdmins(e.target.value)}
                      onKeyDown={handleAdminKeyDown}
                      placeholder="Search teachers..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      disabled={isLoadingUsers}
                    />
                    {isLoadingUsers && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                      </div>
                    )}
                  </div>
                )}
                {usersError && (
                  <div className="mt-1 text-sm text-red-500">
                    {usersError instanceof Error
                      ? usersError.message
                      : 'Failed to load users. Please try again later.'}
                  </div>
                )}
                {searchAdmins.trim() !== '' && !selectedAdmin && showAdminDropdown && (
                  <div 
                    ref={adminDropdownRef}
                    className="absolute z-10 w-full mt-1 border border-gray-200 rounded-md overflow-hidden max-h-[150px] overflow-y-auto bg-white shadow-lg"
                  >
                    {isLoadingUsers || isSearchingAdmin ? (
                      <div className="px-3 py-2.5 text-sm text-gray-500">
                        Loading teachers...
                      </div>
                    ) : filteredAdmins.length > 0 ? (
                      filteredAdmins.map((user, index) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer first:rounded-t-md last:rounded-b-md ${
                            index === highlightedAdminIndex
                              ? 'bg-gray-100'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectAdmin(user)}
                        >
                          <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.5px]">
                            {getInitials(user.fullName)}
                          </div>
                          <span className="text-sm">
                            {user.fullName}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2.5 text-sm text-gray-500">
                        No teachers found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button 
                className="w-full bg-black text-white px-4 py-2.5 rounded-md hover:bg-[#1E293B] flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedAdmin || addAdminMutation.isPending}
                onClick={handleAddAdmin}
              >
                <div className="flex items-center gap-2 mx-auto">
                  
                  {addAdminMutation.isPending ? 'Adding...' : 'Add Teacher'}
                </div>
              </button>

              <Separator className="my-6" />

              <div>
                <h3 className="text-sm font-medium mb-2">Teachers</h3>
                {isLoadingAdmins ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                  </div>
                ) : adminsError ? (
                  <div className="text-sm text-red-500 py-2">
                    {adminsError instanceof Error
                      ? adminsError.message
                      : 'Failed to load teachers. Please try again later.'}
                  </div>
                ) : admins.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">
                    No teachers found
                  </div>
                ) : (
                  <ScrollArea className="h-[10.25rem] rounded-md">
                    <div className="space-y-1 pr-4">
                      {admins.map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[11px] font-semibold tracking-[0.5px]">
                              {getInitials(admin.fullName)}
                            </div>
                            <span className="text-sm">
                              {admin.fullName}
                            </span>
                          </div>
                          <button 
                            className="text-gray-500 hover:text-gray-700 group disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleRemoveAdmin(admin.id)}
                            disabled={removeAdminMutation.isPending || admin.id === 'system'}
                            title={admin.id === 'system' ? 'Cannot remove system admin' : 'Remove admin'}
                          >
                            <UserMinus
                              size={18}
                              className="fill-gray-500 group-hover:fill-gray-700"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Topics Management */}
        <Card className="shadow-none border border-gray-200">
          <CardHeader className="pb-0 mb-6">
            <CardTitle className="text-lg ">
              Course Topics Navigation Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                disabled={isLoadingCourses}
              >
                <option value="">
                  {isLoadingCourses 
                    ? 'Loading courses...' 
                    : coursesError 
                      ? 'Error loading courses' 
                      : 'Select Course'
                  }
                </option>
                {!coursesError && courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.coursesName}
                  </option>
                ))}
              </select>

              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                disabled={!selectedCourse || isLoadingTopics}
              >
                <option value="">
                  {isLoadingTopics 
                    ? 'Loading topics...' 
                    : topicsError 
                      ? `Error loading topics: ${topicsError instanceof Error ? topicsError.message : 'Unknown error'}` 
                      : 'Select Topic'
                  }
                </option>
                {Array.isArray(topics) && topics.length > 0 ? topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.topicName}
                  </option>
                )) : null}
              </select>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">
                    {selectedTopicDetails ? selectedTopicDetails.topicName : 'Select a topic'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Start Page"
                      value={startPage}
                      onChange={(e) => setStartPage(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="End Page"
                      value={endPage}
                      onChange={(e) => setEndPage(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSave}
                    disabled={updateMetadataMutation.isPending || !selectedTopic || !startPage || !endPage}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-[#1E293B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMetadataMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getInitials(fullName: string): string {
  return `${fullName.charAt(0)}`.toUpperCase()
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
