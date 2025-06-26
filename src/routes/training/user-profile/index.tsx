import { UserProfile } from '@/domains/user-profile'
import { getAxios } from '@/shared/api/apiClient'
import { getItem } from '@/shared/utlis/localStorage'
import { useAuthCheck } from '@/utils/useAuthCheck'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const userAccountSchema = z
  .object({
    badges: z
      .array(
        z.object({
          badgeId: z.number(),
          name: z.string(),
          earnedAt: z.string(),
          badgeType: z.string(),
        }),
      )
      .readonly(),
    feedbacks: z
      .array(
        z.object({
          id: z.number(),
          comments: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          givenBy: z.string(),
        }),
      )
      .readonly(),
  })
  .readonly()

// type UserAccount = z.infer<typeof userAccountSchema>
export const Route = createFileRoute('/training/user-profile/')({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    useAuthCheck(location.pathname)
  },
  loader: async () => {
    try {
      const userId = getItem('userId')
      if (!userId) {
        console.error('UserId not found in localStorage')
        throw new Error('User ID not available')
      }

      const response = await getAxios(`/api/v0/user/${userId}/account`, {
        withCredentials: true,
      })

      console.log('Raw API Response:', response.data)

      const validatedData = userAccountSchema.parse(response.data)
      console.log('Validated User Account Data:', validatedData)

      // Transform API data to match the component's expected format
      const transformedBadges = validatedData.badges.map((badge) => ({
        id: badge.badgeId,
        title: badge.name,
        earnedDate: badge.earnedAt,
        badgeType: badge.badgeType,
        icon: 'https://c.animaapp.com/z2ODMQVf/img/frame-3.svg', // Using default icon
      }))

      const transformedFeedbacks = validatedData.feedbacks.map((feedback) => ({
        date: feedback.updatedAt,
        givenBy: feedback.givenBy,
        content: feedback.comments,
      }))

      return {
        userData: {
          badges: transformedBadges,
          feedbacks: transformedFeedbacks,
          name: getItem('name') as string,
          userName: getItem('userName') as string,
        },
      }
    } catch (error) {
      console.error('Error in loader:', error)
      return {
        userData: {
          badges: [],
          feedbacks: [],
          name: getItem('name') as string,
          userName: getItem('userName') as string,
        },
      }
    }
  },
})

function RouteComponent() {
  const { userData } = Route.useLoaderData()
  return <UserProfile initialData={userData} />
}
