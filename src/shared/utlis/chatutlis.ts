export function isLastItem<T>(array: T[], item: T) {
    const lastIndex = array.length > 0 ? array.length - 1 : 0
  
    return array.indexOf(item) === lastIndex
  }
  
  export const formatTime = (time: Date | undefined) => {
    return time?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  