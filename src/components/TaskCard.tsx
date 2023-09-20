import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Task } from "../types";
import TrashIcon from "../assets/icons/TrashIcon";

interface Props {
  data: Task;
  remove: (id: string) => void;
  update: (id: string, content: string) => void;
}

const TaskCard = ({ data, remove, update }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: data.id,
    data: {
      type: "Task",
      data,
    },
    disabled: editMode,
  });
  const customStyle = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // ? If the task is being dragged, return a overlay
  if (isDragging) {
    return (
      <section
        id="task-card"
        className="bg-primary p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500 cursor-grab relative opacity-30"
        ref={setNodeRef}
        style={customStyle}
      ></section>
    );
  }

  /**
   * @description Toggles edit mode
   *
   * @returns {void}
   */
  const toggleEditMode = () => {
    setEditMode((previousValue) => !previousValue);
    setIsMouseOver(false);
  };

  if (editMode) {
    return (
      <section
        id="task-card"
        className="bg-primary p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
        ref={setNodeRef}
        style={customStyle}
        {...attributes}
        {...listeners}
      >
        <textarea
          name=""
          id="textarea-content"
          cols={30}
          rows={10}
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
          value={data.content}
          autoFocus
          placeholder="Task content will be here"
          onBlur={toggleEditMode}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) toggleEditMode();
          }}
          onChange={(event) => update(data.id, event.target.value)}
        ></textarea>
      </section>
    );
  }

  return (
    <section
      id="task-card"
      className="bg-primary p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
      onClick={toggleEditMode}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      ref={setNodeRef}
      style={customStyle}
      {...attributes}
      {...listeners}
    >
      <p className="my-auto h-[90%] w-full overflow-x-hidden overflow-y-hidden whitespace-pre-wrap">
        {data.content}
      </p>

      {isMouseOver && (
        <button
          className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-primary p-2 rounded opacity-60 hover:opacity-100"
          onClick={() => remove(data.id)}
        >
          <TrashIcon />
        </button>
      )}
    </section>
  );
};

export default TaskCard;
