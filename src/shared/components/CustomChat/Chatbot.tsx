import clsx from 'clsx'
// import { X } from 'lucide-react'
import { CustomChat } from './CustomChat'
import { ChatBubble } from  './ChatBubble'  
import { useVercelChat } from './useVercelChat'
import { useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "ti-react-template/components"
type SidebarProps = {
  sidebarOpen: boolean
  handleSidebarChat: () => void
}

export function SidebarChat({ sidebarOpen, handleSidebarChat }: SidebarProps) {
  // const [profile, _setProfile] = useState('hctra')
  const [isFetching, setIsFetching] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const { 
    messages, error, input, handleInputChange, handleSubmit,  status } =
    useVercelChat({ setIsFetching })

  return (
    <section
      className={clsx('flex justify-around flex-col ', ' h-full bg-[#FFFFFF]', {
        'w-[36.5vw] transition-all duration-0 ease-in-out ': !sidebarOpen,
        'w-0 transition-all duration-0 ease-in-out': sidebarOpen,
      })}
    >
      <header className="flex justify-between items-center border-b-2 p-3 font-bold text-lg">
        Talk to Tutor
        {/* <LanguageDropdown profile={profile} setProfile={setProfile} /> */}
      </header>
      <ChatBubble
        messages={messages}
        isFetching={isFetching}
        isWaiting={isWaiting}
        toggleSidebar={handleSidebarChat}
        isSidebarOpen={sidebarOpen}
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
export function LanguageDropdown({
  setProfile,
  profile,
}: {
  profile: string
  setProfile: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <Select value={profile} onValueChange={setProfile}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="hctra">
            <div className="flex gap-1">
              {/* <img
                src="/united-states.png"
                alt="usFLag"
                width={20}
                height={30}
              /> */}
              English
            </div>
          </SelectItem>
          <SelectItem value="hctra-es">
            <div className="flex gap-1">
              {/* <img src="/spain.png" alt="spanFlag" width={20} height={30} /> */}
              Español
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
