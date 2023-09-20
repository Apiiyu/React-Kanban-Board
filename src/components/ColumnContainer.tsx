import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Column, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import TrashIcon from "../assets/icons/TrashIcon";
import { useMemo, useState } from "react";
import PlusIcon from "../assets/icons/PlusIcon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  tasks: Task[];
  addTask: (columnId: string) => void;
  remove: (id: string) => void;
  removeTask: (id: string) => void;
  update: (id: string, title: string) => void;
  updateTask: (id: string, content: string) => void;
}

const ColumnContainer = (props: Props) => {
  const { column, tasks, addTask, remove, removeTask, update, updateTask } =
    props;
  const [editMode, setEditMode] = useState(false);
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });
  const customStyle = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // ? If the column is being dragged, return a overlay
  if (isDragging) {
    return (
      <section
        id="active column-container"
        className="bg-primary w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col opacity-40 border-2 border-rose-500"
        style={customStyle}
        ref={setNodeRef}
      ></section>
    );
  }

  return (
    <section
      id="column-container"
      className="bg-primary w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col"
      style={customStyle}
      ref={setNodeRef}
    >
      <section
        id="column-title"
        className="bg-primary text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-4 border-secondary flex items-center justify-between"
        onClick={() => setEditMode(true)}
        {...attributes}
        {...listeners}
      >
        <div className="flex gap-2">
          <div className="flex justify-center items-center bg-secondary px-2 py-1 text-sm rounded-full">
            0
          </div>

          {editMode ? (
            <input
              autoFocus
              className="bg-black focus:border-rose-500 border-rodunded outline-none px-2"
              onBlur={() => setEditMode(false)}
              onChange={(event) => update(column.id, event.target.value)}
              onKeyDown={(event) => {
                event.key === "Enter" && setEditMode(false);
              }}
              value={column.title}
            />
          ) : (
            column.title
          )}
        </div>

        <button
          className="stroke-gray-500 rounded px-1 py-2 hover:stroke-white hover:bg-secondary"
          onClick={() => remove("id")}
        >
          <TrashIcon />
        </button>
      </section>

      <section
        id="column-content"
        className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto bg-secondary"
      >
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              data={task}
              remove={removeTask}
              update={updateTask}
            />
          ))}
        </SortableContext>
      </section>

      <section id="column-footer" className="w-full">
        <button
          className="flex gap-2 items-center border-secondary border-2 rounded-md p-4 border-x-secondary hover:bg-primary hover:text-rose-500 active:bg-black w-full"
          onClick={() => addTask(column.id)}
        >
          <PlusIcon />
          Add Tasks
        </button>
      </section>
    </section>
  );
};

export default ColumnContainer;
