import { useChat, } from '@ai-sdk/react'
import { getAccessToken } from '../../utlis/cookieUtils'

export function useVercelChat({
  setIsFetching,
  onPageNumbersChange
}: {
  setIsFetching: (check: boolean) => void
  onPageNumbersChange?: ((pageNumbers: number[]) => void) | undefined
}): ReturnType<typeof useChat> {
  const authToken = getAccessToken() 





  
  return useChat({
    streamProtocol: 'text',
    api: `${process.env.VITE_API_URL}/api/v0/gen-ai/chat`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
   experimental_prepareRequestBody({messages}) {
    const latestMessage = messages[messages.length - 1];
    return {
      question: latestMessage.content
    };     
   },
   sendExtraMessageFields:true,
    onResponse: (response) => {
      if (response.ok) {
        setIsFetching(false)
        }
      }
    ,
    onFinish(message) {
      onPageNumbersChange?.(JSON.parse(message.content).pageNumbers)
    },
    onError(error) {
      console.log(error)
    }
  })
}

