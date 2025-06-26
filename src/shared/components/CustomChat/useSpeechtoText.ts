import { useState,useEffect,useRef } from "react";

export const useSpeechtoText = (options:{
    interimResults?: boolean;
    lang?: string;
    continuous?: boolean;
}) => {
 
    const[isListening, setIsListening] = useState(false);
    const[transcript, setTranscript] = useState('');
    const recognitionRef= useRef<SpeechRecognition | null>(null)

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
          alert('Speech recognition is not supported in this browser')
          return
        }
    
        
        recognitionRef.current = new  window.webkitSpeechRecognition()
        const recognition=recognitionRef.current
        recognition.interimResults=options.interimResults??true
        recognition.lang=options.lang??'en-US'
        recognition.continuous=options.continuous??true

        recognition.onresult=(event)=>{
        let text=''
        for(let i=0;i<event.results.length;i++){
            text+=event.results[i][0].transcript
        } 
        setTranscript(text)  
        }
        recognition.onerror=(event)=>{
            console.error('Speech recognition error:', event.error)
        }
        recognition.onend=()=>{
            setIsListening(false)
            setTranscript('')
        }

        return()=>recognition.stop()
        
    },[])

    const startListening=()=>{
        if(recognitionRef.current && !isListening){
            recognitionRef.current.start()
            setIsListening(true)
        } 
    }

    const stopListening=()=>{
        if(recognitionRef.current && isListening){
            recognitionRef.current.stop()
            setIsListening(false)
            setTranscript('')
        } 
    }

    return{ isListening,transcript,startListening,stopListening}

}