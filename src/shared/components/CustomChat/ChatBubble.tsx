import { useEffect, useRef } from 'react'
import { formatTime, isLastItem } from "@/shared/utlis/chatutlis"
import { clsx } from 'clsx'
import { Loader } from 'lucide-react'
import type { Message } from 'ai'
import { useUserName } from '@/domains/auth/store/authAtom'
// import { useLoaderData } from 'react-router-dom'
// import { getUserStats } from '../landingpage/types'

type ChatBubbleProps = {
  messages: Message[]
  isFetching: boolean
  isWaiting: boolean
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export function ChatBubble({
  messages,
  isFetching,
  isWaiting,
  toggleSidebar,
  isSidebarOpen,
}: ChatBubbleProps): JSX.Element {
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
//   const { userName } = getUserStats.parse(useLoaderData())
const userName=useUserName()

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const onEscPress = (e: { key: string }) => {
    if (e.key === 'Escape' && isSidebarOpen) {
      toggleSidebar()
    }
  }

  return (
    <main
      ref={chatContainerRef}
      className={`flex-grow items-center p-2 pb-6 m-5 
      overflow-y-scroll no-scrollbar rounded-2xl`}
      onKeyDown={onEscPress}
    >
      {messages.map((m, index) => (
        <section key={index}>
          <article className="flex flex-col mb-3">
            <div
              className={clsx(
                'relative',
                m.role !== 'user'
                  ? 'flex flex-row'
                  : `flex flex-row-reverse gap-1`,
              )}
            >
              <div className="flex flex-col">
                {m.role === 'user' ? (
                  <div className="flex gap-2 justify-end items-end mr-3 mb-1 font-nunitosans mt-5">
                    <div className={`-mb-1 font-bold`}>
                      {userName}
                    </div>
                    <div className={`font-normal text-xs`}>
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 ml-3 font-nunitosans mb-1">
                    <div className={`font-bold -mb-1`}>Tutor</div>
                    <div className={`font-normal text-xs mt-auto`}>
                      {formatTime(m.createdAt)}
                    </div>
                  </div>
                )}
                <div
                  className={clsx(
                    'pt-4 pr-6 pb-4 pl-6 border-2',
                    m.role !== 'user'
                      ? `relative ml-3 text-sm rounded-r-xl 
                            rounded-bl-xl bg-slate-200 max-w-screen-2xl`
                      : `relative mr-3 bg-[#495057] text-white
                          shadow rounded-l-xl rounded-br-xl`,
                  )}
                >
                  <div className="whitespace-pre-line flex font-poppins">
                    {m.role !== 'user' &&
                    isLastItem(messages, m) &&
                    m.content === null ? (
                        <Loader />
                      ) : (
                        <div>{ isValidObject(m.content) ? JSON.parse(m.content)?.answer : m.content}</div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      ))}
      {isFetching && !isWaiting && <LoadingState />}
      {isWaiting && <WaitingState />}
    </main>
  )
}

function LoadingState() {
  return (
    <article className="flex flex-col mb-3">
      <div className={clsx('flex flex-row')}>
        <div className="flex flex-col">
          <div className="flex gap-2 ml-3 font-nunitosans mb-1">
            <div className={`font-bold -mb-1`}>Tutor</div>
          </div>
          <div
            className={clsx(
              `relative ml-3 text-sm rounded-r-xl 
                      rounded-bl-xl max-w-screen-2xl`,
              'pt-2 pr-8 pb-2 pl-8',
            )}
          >
            <Loader />
          </div>
        </div>
      </div>
    </article>
  )
}

function WaitingState() {
  return (
    <article className="flex flex-col items-center mb-3">
      <div className={clsx('flex flex-row')}>
        <div className="flex flex-col items-center">
          <div
            className={clsx(
              `relative text-sm rounded-xl max-w-screen-2xl`,
              'pt-2 pr-8 pb-2 pl-8',
            )}
          >
            <div className="flex items-center">
              <Loader className="mr-2 animate-spin" />
              <span>Waiting in queue...</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function isValidObject(obj: string) {
  try {
    const value=JSON.parse(obj)
    return typeof value==="object" &&  value!==null
  } catch (e) {
    return false
  }
}
