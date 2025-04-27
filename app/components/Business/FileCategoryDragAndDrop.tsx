import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileNameState } from "@/components/Upload";
import { File, Folder, Trash2 } from "lucide-react";

export const validFileCategories = [
  "Company Presentations",
  "Financials",
  "Industry Reports",
  "Competitors",
  "Call Transcripts",
  "Other",
];

type CategoryType = {
  id: string;
  name: string;
};

export function Item({
  item,
  isDragging,
}: {
  item: FileNameState;
  isDragging: boolean;
}) {
  return (
    <div className="grid grid-cols-5 items-center justify-between bg-gray-0 p-2 rounded">
      <div className=" col-span-4 flex flex-row  items-center">
        <File size={16} className="mr-2" />
        {item.fileName}
      </div>
      {!isDragging && (
        <div className="h-full flex flex-row gap-4 justify-end">
          <Button
            className="font-semibold text-md h-full bg-gray-100"
            variant="secondary"
          >
            <Trash2 size={16} />
          </Button>
          <Button
            className="font-semibold text-md h-full bg-gray-100"
            variant="secondary"
          >
            View
          </Button>
        </div>
      )}
    </div>
  );
}

export function FileCategoryDragAndDrop({
  fileStates,
}: {
  fileStates: FileNameState[];
}) {
  const [categories, setCategories] = useState<CategoryType[]>(
    validFileCategories.map(
      (i) =>
        ({
          id: i,
          name: i,
        }) as CategoryType,
    ),
  );
  const [items, setItems] = useState<FileNameState[]>(fileStates);
  const [isDragging, setIsDragging] = useState(false);
  const rearangeArr = (arr: any[], sourceIndex, destIndex) => {
    const arrCopy = [...arr];
    const [removed] = arrCopy.splice(sourceIndex, 1);
    arrCopy.splice(destIndex, 0, removed);

    return arrCopy;
  };

  const onDragEnd = (result) => {
    console.log(result);
    setIsDragging(false);
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === "Categories") {
      // a category was moved
      setCategories(rearangeArr(categories, source.index, destination.index));
    } else if (destination.droppableId !== source.droppableId) {
      // find the source in items array and change with destination droppable id
      setItems((items) =>
        items.map((item) =>
          item.fileId === result.draggableId
            ? {
                ...item,
                category: result.destination.droppableId,
              }
            : item,
        ),
      );
    } else {
      // rearange the array if it is in the same category

      setItems(rearangeArr(items, source.index, destination.index));
    }
  };
  const onDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className="container py-5">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div>
          {/* type="droppable" is very important here. Look at the docs. */}
          <Droppable droppableId="Categories" type="droppableItem">
            {(provided) => (
              <div ref={provided.innerRef}>
                {categories.map((category, index) => (
                  <Draggable
                    draggableId={`category-${category.id}`}
                    key={`category-${category.id}`}
                    index={index}
                    isDragDisabled={true}
                  >
                    {(parentProvider) => (
                      <div
                        ref={parentProvider.innerRef}
                        {...parentProvider.draggableProps}
                      >
                        <Droppable droppableId={category.id.toString()}>
                          {(provided) => (
                            <div ref={provided.innerRef}>
                              <ul className="list-unstyled p-3 mb-3 ">
                                {/* Category title is the drag handle for a category */}
                                <div className="flex flex-row items-center">
                                  <Folder size={16} className="mr-2" />
                                  <h6
                                    className="h6"
                                    {...parentProvider.dragHandleProps}
                                  >
                                    {category.name}
                                  </h6>
                                </div>
                                {items
                                  .filter(
                                    (item) => item.category === category.id,
                                  )
                                  .map((item, index) => (
                                    <Draggable
                                      draggableId={
                                        item.fileId?.toString() || ""
                                      }
                                      key={item.fileId}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <Item
                                            item={item}
                                            isDragging={isDragging}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </ul>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}
