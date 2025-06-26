import clsx from 'clsx'
import { CustomChat } from './CustomChat'
import { useVercelChat } from './useVercelChat'
import {  useState } from 'react'
import {
  Button,
} from "ti-react-template/components"
import { VerticalChatBubble } from './VerticalChatBubble'
import { X } from 'lucide-react'

export function VerticalbarChat({ onPageNumbersChange,SetModal }: { onPageNumbersChange?: (pageNumbers: number[]) => void,SetModal: (modal: boolean) => void}) {
  const [isFetching, setIsFetching] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const { 
    messages, error, input, handleInputChange, handleSubmit, status } =
    useVercelChat({ 
      setIsFetching,
      onPageNumbersChange
    })

  return (
    <section
      className={clsx('flex justify-around flex-col ', ' h-full bg-[#FFFFFF]','w-full'
    )}
    >
      <header className="flex justify-between items-center border-b-2 p-3 font-bold text-lg">
        Miles AI
        <Button  type="button" variant="ghost" onClick={() => SetModal(false)} ><X /></Button>
      </header>
      <VerticalChatBubble
        messages={messages}
        isFetching={isFetching}
        isWaiting={isWaiting}
      />
      <footer>
        <CustomChat
          // profile={profile}
          messages={messages}
          onSubmit={handleSubmit}
          input={input}
          onInputChange={handleInputChange}
          isMessageLoading={status==="streaming"}
          setIsFetching={setIsFetching}
          setIsWaiting={setIsWaiting}
          cError={error}
        />
      </footer>
    </section>
  )
}

