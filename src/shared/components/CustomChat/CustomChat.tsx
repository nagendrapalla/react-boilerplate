import React, { useState, useEffect } from 'react'
import { 
    Mic, MicOff, SendHorizonal } from 'lucide-react'
import { Input, Button } from "ti-react-template/components"
import type { ChatRequestOptions, Message } from 'ai'
import type { ChangeEvent, Dispatch, 
  SetStateAction } from 'react'
import clsx from 'clsx'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'


type CustomFooterProps = {
  messages: Message[]
  isMessageLoading: boolean
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => void
  input: string
  onInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => void
  setIsFetching: Dispatch<SetStateAction<boolean>>
  setIsWaiting: Dispatch<SetStateAction<boolean>>
  cError: Error | undefined

}

export function CustomChat({
  messages,
  onSubmit,
  input,
  onInputChange,
  isMessageLoading,
  setIsFetching,
  setIsWaiting,
  cError
}: CustomFooterProps): JSX.Element {
  const [isRecording, setIsRecording] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)

  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }


useEffect(() => {
  if (transcript  && !isUserTyping) {
    onInputChange({
      target: { value: transcript},
    } as React.ChangeEvent<HTMLInputElement>)
  }
 
}, [transcript])

  
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = [...messages].sort((a, b) => {
        const dateA = a.createdAt
          ? a.createdAt.getTime()
          : new Date(0).getTime()
        const dateB = b.createdAt
          ? b.createdAt.getTime()
          : new Date(0).getTime()
        return dateB - dateA
      })[0]

      if (cError === undefined && lastMessage && lastMessage.role !== 'user') {
        setIsWaiting(false)
      }
    }
  }, [cError, messages, setIsFetching,
     setIsWaiting])

  const handleMicClick = async () => {
    try {
      if (listening) {
        SpeechRecognition.stopListening()
        setIsRecording(false)
      } else {        
        setIsRecording(true)
        SpeechRecognition.startListening({ continuous: true })
      }
    } catch (error) {
      console.error('Microphone access error:', error)
      if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
        setPermissionDenied(true)
        alert('Microphone access was denied. Please allow microphone access in your browser settings to use speech recognition.')
      }
    }
  }
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setIsUserTyping(true)
    onInputChange(e)
    setTimeout(() => setIsUserTyping(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(e)
    setIsFetching(true)
    const wasListening = listening
    resetTranscript()
    if (wasListening) {
      setTimeout(() => {
        SpeechRecognition.startListening({ continuous: true })
      }, 100)
    }
    onInputChange({
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>)  
  }

  return (
    <section className="w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full"
      >
        <section className="flex w-full relative items-center">
          <Input
            value={input}
            disabled={
              isMessageLoading 
            
            }
            onChange={handleInputChange}
            placeholder={
              isRecording
                ? 'Recording'
                : 'Type your query...'
            }
            className="placeholder:text-gray-500 rounded-xl overflow-y-scroll text-lg border-2 border-black h-16 pr-20 whitespace-normal flex-grow m-2 no-scrollbar focus-visible:ring-0 focus:ring-0 " 
          />

          <div className="absolute right-0 flex items-center py-2 px-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleMicClick}
              disabled={isMessageLoading || permissionDenied}
              title={permissionDenied ? "Microphone access denied" : "Toggle speech recognition"}
              className="flex items-center hover:bg-white ml-2 border-none p-0"
            >
              <React.Fragment>
                {isRecording ?

                <Mic /> 
                : 
                <MicOff />
                }
              </React.Fragment>
            </Button>
            <Button
              type="submit"
              variant="ghost"
              className={clsx(
                `flex items-center hover:bg-white ml-2 border-none p-0`,
              )}
              disabled={
                isMessageLoading ||
                input.trim() === ''
              }
            >
              <SendHorizonal />
            </Button>
          </div>
        </section>
      </form>
    </section>
  )
}
