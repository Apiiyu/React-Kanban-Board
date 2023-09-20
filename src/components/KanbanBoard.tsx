import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Column, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import PlusIcon from "../assets/icons/PlusIcon";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

const KanbanBoard = () => {
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const columnIds = useMemo(
    () => columns.map((column) => column.id),
    [columns]
  );
  const onSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // ? It same as 4px
      },
    })
  );

  /**
   * @description Adds a new column to the board
   *
   * @returns {void}
   */
  const addColumn = () => {
    const newColumn: Column = {
      id: generateRandomUUID(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, newColumn]);
  };

  /**
   * @description Adds a new task to a column
   * @param {string} columnId The column id
   *
   * @returns {void}
   */
  const addTask = (columnId: string) => {
    const newTask: Task = {
      id: generateRandomUUID(),
      columnId,
      content: `Task ${tasks.length + 1}`,
    };

    setTasks([...tasks, newTask]);
  };

  /**
   * @description Generates a random UUID
   *
   * @returns {string} A random UUID
   */
  const generateRandomUUID = (): string => {
    return Math.random().toString(36).substring(2, 15);
  };

  /**
   * @description Handles the drag start event
   * @param event
   *
   * @returns {void}
   */
  const onDraggedComponent = (event: DragStartEvent) => {
    // ? We need to check if the active data is a column
    if (event.active.data.current?.type === "Column") {
      // ? Then, we should set the active column
      setActiveColumn(event.active.data.current.column);

      return;
    }

    // ? We need to check if the active data is a task
    if (event.active.data.current?.type === "Task") {
      // ? Then, we should set the active task
      setActiveTask(event.active.data.current.task);

      return;
    }
  };

  /**
   * @description Handles the drag end event
   * @param event
   *
   * @returns {void}
   */
  const onEndDraggedComponent = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  /**
   * @description Handles the drag over event
   * @param event
   *
   * @returns {void}
   */
  const onOverDraggedComponent = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    // ? We need to check if the active data is a task and the over data is a task
    if (isActiveTask && isOverTask) {
      // ? Then, we should set the active task
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex(
          (task) => task.id === activeColumnId
        );
        const overTaskIndex = tasks.findIndex(
          (task) => task.id === overColumnId
        );

        // ? Then, we also need to check if the active task is in the same column as the over task
        if (tasks[activeTaskIndex].columnId !== tasks[overTaskIndex].columnId) {
          // ? Then, we should update the active task column id
          tasks[activeTaskIndex].columnId = tasks[overTaskIndex].columnId;
        }

        return arrayMove(tasks, activeTaskIndex, overTaskIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    // ? We need to check if the active data is a task and the over data is a column
    if (isActiveTask && isOverColumn) {
      // ? Then, we should set the active task
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex(
          (task) => task.id === activeColumnId
        );
        tasks[activeTaskIndex].columnId = overColumnId + "";

        return arrayMove(tasks, activeTaskIndex, activeTaskIndex);
      });
    }
  };

  /**
   * @description Removes a column from the board
   * @param {String} id
   *
   * @returns {void}
   */
  const removeColumn = (id: string) => {
    const filteredColumns = columns.filter((column) => column.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((task) => task.columnId !== id);
    setTasks(newTasks);
  };

  /**
   * @description Removes a task from a column
   * @param {String} id
   *
   * @returns {void}
   */
  const removeTask = (id: string) => {
    const filteredTasks = tasks.filter((task) => task.id !== id);

    setTasks(filteredTasks);
  };

  /**
   * @description Updates a column
   * @param {String} id
   * @param {String} title
   *
   * @returns {void}
   */
  const updateColumn = (id: string, title: string) => {
    const updatedColumns = columns.map((column) => {
      if (column.id === id) {
        return {
          ...column,
          title,
        };
      }

      return column;
    });

    setColumns(updatedColumns);
  };

  /**
   * @description Updates a task
   * @param {String} id
   * @param {String} content
   *
   * @returns {void}
   */
  const updateTask = (id: string, content: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          content,
        };
      }

      return task;
    });

    setTasks(updatedTasks);
  };

  return (
    <section
      id="kanban-board"
      className="flex items-center min-h-screen w-full overflow-x-auto overflow-y-hidden m-auto px[40px]"
    >
      <DndContext
        onDragStart={onDraggedComponent}
        onDragEnd={onEndDraggedComponent}
        onDragOver={onOverDraggedComponent}
        sensors={onSensors}
      >
        <div className="m-auto flex gap-2">
          <div className="flex gap-4">
            <SortableContext items={columnIds}>
              {columns.map((data) => (
                <ColumnContainer
                  column={data}
                  tasks={tasks.filter((task) => task.columnId === data.id)}
                  addTask={addTask}
                  remove={() => removeColumn(data.id)}
                  removeTask={removeTask}
                  update={() => updateColumn(data.id, data.title)}
                  updateTask={updateTask}
                  key={`column-${data.id}`}
                />
              ))}
            </SortableContext>
          </div>
          <button
            className="flex gap-2w-[350px] h-[60px] min-w-[350px] cursor-pointer rounded-lg bg-primary border-2 border-secondary p-4 ring-rose-500 hover:ring-2"
            onClick={addColumn}
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
                addTask={addTask}
                remove={() => removeColumn(activeColumn.id)}
                removeTask={removeTask}
                update={() => updateColumn(activeColumn.id, activeColumn.title)}
                updateTask={updateTask}
              />
            )}
            {activeTask && (
              <TaskCard
                data={activeTask}
                remove={removeTask}
                update={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </section>
  );
};

export default KanbanBoard;
