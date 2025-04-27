import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Input } from "./ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";

type Props<T extends string> = {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: { value: T; label: string }[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
};

export function AutoComplete<T extends string>({
  searchValue,
  onSearchValueChange,
  items,
  isLoading,
  emptyMessage = "No items.",
  placeholder = "Search...",
  onSubmit,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [itemsDisplayed, setItemsDisplayed] = useState<
    { value: T; label: string }[]
  >(items?.slice(0, 3) ?? []);
  const [firstTry, setFirstTry] = useState(true);
  useEffect(() => {
    if (searchValue.length > 0) {
      const filteredItems = items.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      );
      setItemsDisplayed(filteredItems);
      if (filteredItems.length === 0) setOpen(false);
      else setOpen(true);
    } else if (firstTry) {
      setItemsDisplayed(items.slice(0, 3));
      setFirstTry(false);
    } else {
      setItemsDisplayed([]);
      if (items.map((item) => item.label).includes(searchValue)) {
        setOpen(false);
      }
    }
  }, [searchValue]);

  const labels = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.value] = item.label;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [items],
  );

  // const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  //   setOpen(true);
  // };

  const onSelectItem = (inputValue: string) => {
    onSearchValueChange(inputValue);
    setOpen(false);
  };

  return (
    <div className="flex items-center w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={onSearchValueChange}
              onMouseDown={() => setOpen((open) => !!searchValue || !open)}
              onFocus={() => setOpen(false)}
              // onBlur={onInputBlur}
            >
              <Input
                placeholder={placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    console.log("searchValasdaue", searchValue);
                    const filteredItems = items.filter((item) =>
                      searchValue
                        .toLowerCase()
                        .includes(item.label.toLowerCase()),
                    );
                    if (filteredItems.length === 1) {
                      onSubmit(filteredItems[0].value);
                    } else {
                      console.log("searchVaaaalue", searchValue);
                      onSubmit(searchValue);
                    }
                  }
                }}
              />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden="true" className="hidden" />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute("cmdk-input")
              ) {
                e.preventDefault();
              }
            }}
            className="w-[--radix-popover-trigger-width] p-0"
          >
            <CommandList>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div className="p-1">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CommandPrimitive.Loading>
              )}
              {itemsDisplayed.length > 0 && !isLoading ? (
                <CommandGroup>
                  {itemsDisplayed.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        console.log("option", option);
                        onSearchValueChange(option.value);
                        onSubmit(option.value);
                      }}
                      onSelect={onSelectItem}
                      onClick={() => {
                        console.log("option", option);
                        onSearchValueChange(option.value);
                        onSubmit(option.value);
                      }}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {!isLoading ? (
                <CommandEmpty>{emptyMessage ?? "No items."}</CommandEmpty>
              ) : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
}
