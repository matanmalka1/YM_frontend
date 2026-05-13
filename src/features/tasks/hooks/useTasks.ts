import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, tasksQK, type TaskListParams, type TaskCreateRequest, type TaskUpdateRequest } from '../api'
import { workQueueQK } from '@/features/workQueue/api'

export const useTasks = (params?: TaskListParams, enabled = true) =>
  useQuery({
    queryKey: tasksQK.list(params),
    queryFn: () => tasksApi.list(params),
    enabled,
  })

export const useCreateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskCreateRequest) => tasksApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksQK.all })
      qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
  })
}

export const useStartTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.start(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksQK.all })
      qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
  })
}

export const useCompleteTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksQK.all })
      qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
  })
}

export const useCancelTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksQK.all })
      qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
  })
}

export const useUpdateTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdateRequest }) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksQK.all })
      qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
  })
}

export const useDeleteTask = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tasksQK.all })
      qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
  })
}
