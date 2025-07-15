'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card } from '@/components/shared/Card'
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'

interface TaskItem {
  id: string
  title: string
  description: string
  assignee: string
  avatar: string
  priority: 'low' | 'medium' | 'high'
  comments: number
  attachments: number
  dueDate: string
}

interface Column {
  id: string
  title: string
  tasks: TaskItem[]
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: 't1',
        title: 'Implement authentication flow',
        description: 'Set up OAuth and user sessions',
        assignee: 'gitkartik21',
        avatar: '/avatars/gitkartik21.png',
        priority: 'high',
        comments: 3,
        attachments: 2,
        dueDate: '2025-07-18T08:31:27Z'
      },
      {
        id: 't2',
        title: 'Design system updates',
        description: 'Update component library',
        assignee: 'gitkartik21',
        avatar: '/avatars/gitkartik21.png',
        priority: 'medium',
        comments: 1,
        attachments: 0,
        dueDate: '2025-07-20T08:31:27Z'
      }
    ]
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    tasks: [
      {
        id: 't3',
        title: 'API integration',
        description: 'Connect dashboard with backend',
        assignee: 'gitkartik21',
        avatar: '/avatars/gitkartik21.png',
        priority: 'high',
        comments: 5,
        attachments: 3,
        dueDate: '2025-07-16T08:31:27Z'
      }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: 't4',
        title: 'Performance optimization',
        description: 'Optimize dashboard loading',
        assignee: 'gitkartik21',
        avatar: '/avatars/gitkartik21.png',
        priority: 'medium',
        comments: 2,
        attachments: 1,
        dueDate: '2025-07-15T08:31:27Z'
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: 't5',
        title: 'Setup project structure',
        description: 'Initialize Next.js project',
        assignee: 'gitkartik21',
        avatar: '/avatars/gitkartik21.png',
        priority: 'high',
        comments: 4,
        attachments: 2,
        dueDate: '2025-07-14T08:31:27Z'
      }
    ]
  }
]

export const ProjectBoard = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns)

  const onDragEnd = (result: any) => {
    const { destination, source } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceTasks = [...sourceColumn.tasks]
    const destTasks = source.droppableId === destination.droppableId
      ? sourceTasks
      : [...destColumn.tasks]

    const [removed] = sourceTasks.splice(source.index, 1)
    destTasks.splice(destination.index, 0, removed)

    setColumns(columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks }
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks }
      }
      return col
    }))
  }

  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {column.title}
                    <span className="ml-2 text-gray-500">
                      ({column.tasks.length})
                    </span>
                  </h3>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <PlusIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-2 flex flex-col gap-2 h-full min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-gray-50' : ''
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-white rounded-lg shadow-sm p-3 border border-gray-200
                              ${snapshot.isDragging ? 'shadow-md' : ''}
                            `}
                          >
                            <h4 className="text-sm font-medium text-gray-900">
                              {task.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500">
                              {task.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={task.avatar}
                                  alt={task.assignee}
                                  className="h-6 w-6 rounded-full"
                                />
                                <span className={`
                                  px-2 py-1 text-xs font-medium rounded-full
                                  ${getPriorityColor(task.priority)}
                                `}>
                                  {task.priority}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-500">
                                <div className="flex items-center">
                                  <ChatBubbleLeftIcon className="h-4 w-4" />
                                  <span className="ml-1 text-xs">{task.comments}</span>
                                </div>
                                <div className="flex items-center">
                                  <PaperClipIcon className="h-4 w-4" />
                                  <span className="ml-1 text-xs">{task.attachments}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
