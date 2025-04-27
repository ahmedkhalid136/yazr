import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { FileNameState } from "../Upload";
import { FileCategoryDragAndDrop } from "./FileCategoryDragAndDrop";

export default function FileUploadSortingDnd({
  open,
  setOpen,
  fileStates,
  savingCategories,
  saveCategories,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  fileStates: FileNameState[];
  savingCategories: boolean;
  saveCategories: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[1225px] bg-gray-100 h-[calc(100vh-100px)] flex flex-col">
        <DialogHeader className="">
          <DialogTitle>Sort Files</DialogTitle>
          <FileCategoryDragAndDrop
            fileStates={fileStates.filter((i) => i.state == "uploaded")}
          />
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={savingCategories}
            onClick={saveCategories}
            className="w-full text-md"
          >
            {savingCategories ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
