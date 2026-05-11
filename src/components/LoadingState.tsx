interface LoadingStateProps {
  message: string
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  )
}
