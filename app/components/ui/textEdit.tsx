import * as React from "react";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

import { ArrowRight, Check, Loader2, Pencil, Sparkles, X } from "lucide-react";
import { Form, useSubmit } from "@remix-run/react";
import { Badge } from "./badge";

const sources = ["web", "docs", "linkedin"];
interface InputProps extends React.ComponentProps<"input"> {
  display?: string;
  actionName: string;
  name: string;
}
const TextEdit = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, actionName, name, ...props }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [value, setValue] = useState<string>(props.defaultValue as string);
    const [initialValue, setInitialValue] = useState<string>(
      props.defaultValue as string,
    );
    const [isAIEditing, setIsAIEditing] = useState(false);
    const submit = useSubmit();
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedSources, setSelectedSources] = useState<string[]>(sources);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>("");
    const [animatedChars, setAnimatedChars] = useState<React.ReactNode[]>([]);

    // create a listener for enter and escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          setIsEditing(false);
          if (value !== initialValue) {
            const formData = new FormData();
            formData.append("action", actionName);
            formData.append("value", value as string);
            submit(formData, {
              method: "post",
            });
            setInitialValue(value);
          }
        }
        if (e.key === "Escape") {
          setValue(initialValue);
          setIsEditing(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [value, initialValue, actionName, submit]);

    // Effect to focus input when editing starts
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    // Effect to animate characters
    useEffect(() => {
      if (aiResponse) {
        const chars = aiResponse.split("").map((char, index) => (
          <span
            key={index}
            style={{
              opacity: 0, // Start invisible
              animation: `fade-in 0.5s ease-out forwards`,
              animationDelay: `${index * 0.02}s`, // Stagger the animation start
            }}
          >
            {char}
          </span>
        ));
        setAnimatedChars(chars);
      } else {
        setAnimatedChars([]); // Clear animation when response is empty
      }
    }, [aiResponse]);

    // Function to merge refs
    const mergeRefs = (...refs: any[]) => {
      return (instance: HTMLInputElement) => {
        refs.forEach((r) => {
          if (typeof r === "function") {
            r(instance);
          } else if (r != null) {
            r.current = instance;
          }
        });
      };
    };

    const handleAIEdit = () => {
      setIsAILoading(true);
      console.log(selectedSources);
      //timeout to fake an api call
      setTimeout(() => {
        setIsAILoading(false);
        setAiResponse("This is a response from the AI");
      }, 1000);
    };

    const handleAiSave = () => {
      setIsAILoading(true);
      //timeout to fake an api call
      setTimeout(() => {
        setIsAILoading(false);
      }, 1000);
    };

    return (
      <Form
        method="post"
        className="relative w-fit"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onSubmit={() => setIsEditing(false)}
      >
        {!isEditing && isHovering && !isAIEditing && (
          <div className="absolute right-1 top-1">
            <button
              className=""
              type="button"
              onClick={() => {
                setIsEditing((prev) => !prev);
              }}
            >
              <Pencil className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="ml-2"
              type="button"
              onClick={() => {
                setIsAIEditing((prev) => !prev);
              }}
            >
              <Sparkles className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
        {isEditing && (
          <>
            <button
              className="absolute right-1 top-1"
              type={value === initialValue ? "button" : "submit"}
              onClick={
                value === initialValue ? () => setIsEditing(false) : undefined
              }
              name="action"
              value={actionName}
            >
              <Check className="w-4 h-4 text-gray-500" />
            </button>
            <button
              className="absolute right-6 top-1"
              onClick={() => {
                setValue(initialValue);
                setIsEditing(false);
              }}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </>
        )}
        {isAIEditing && (
          <div className="absolute right-1 bottom-[-86px] border border-slate-300 rounded-md p-2 w-[400px] bg-white/90">
            <div className="gap-2">
              <input
                className="w-full text-gray-500"
                type="text"
                placeholder="Enter your prompt"
              />
              <div className="flex items-center justify-start gap-2 mt-2">
                {sources.map((source) => (
                  <Badge
                    key={source}
                    variant={
                      selectedSources.includes(source) ? "default" : "outline"
                    }
                    onClick={() => {
                      setSelectedSources((prev) =>
                        prev.includes(source)
                          ? prev.filter((s) => s !== source)
                          : [...prev, source],
                      );
                    }}
                  >
                    {source}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-1 w-full">
                {isAILoading ? (
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                ) : aiResponse === "" ? (
                  <>
                    <button
                      className="w-4 h-4 text-gray-500"
                      type="button"
                      onClick={() => {
                        setIsAIEditing(false);
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      className="w-4 h-4 text-gray-500"
                      type="button"
                      onClick={() => {
                        handleAIEdit();
                      }}
                    >
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="text-purple-700 py-2">{animatedChars}</p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="w-4 h-4 text-gray-500"
                        type="button"
                        onClick={() => {
                          setIsAIEditing(false);
                          setAiResponse("");
                        }}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="w-4 h-4 text-gray-500"
                        type="button"
                        onClick={() => {
                          handleAiSave();
                          setIsAIEditing(false);
                          setAiResponse("");
                        }}
                      >
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <input
          disabled={!isEditing}
          type={type}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            `flex min-h-9 w-full rounded-md ${
              isEditing
                ? "border border-input shadow-sm"
                : " border border-input border-white shadow-none"
            } bg-transparent px-3 py-1 cursor-text transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-text disabled:opacity-100 `,
            className,
          )}
          ref={mergeRefs(ref, inputRef)}
          {...props}
        />
      </Form>
    );
  },
);
TextEdit.displayName = "TextEdit";

export { TextEdit };
