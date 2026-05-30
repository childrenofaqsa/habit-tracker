import { ListTodo } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { buildTodoBuckets } from "@/store/todoSelectors";
import type { Todo } from "@/lib/schema";
import { EmptyState } from "@/common/components/EmptyState";
import { Badge } from "@/common/components/ui/data/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/common/components/ui/data/accordion";
import { AddTodo } from "@/features/todos/components/AddTodo";
import { TodoItem } from "@/features/todos/components/TodoItem";

export function TodoView() {
  const todos = useAppStore((state) => state.todos);
  const buckets = buildTodoBuckets(todos);

  const sections: { id: string; label: string; items: Todo[] }[] = [
    { id: "today", label: "Today / Overdue", items: buckets.todayOverdue },
    { id: "scheduled", label: "Scheduled", items: buckets.scheduled },
    { id: "inbox", label: "Inbox", items: buckets.inbox },
    { id: "completed", label: "Completed", items: buckets.completed },
  ];

  return (
    <div className="space-y-4">
      <AddTodo />
      {todos.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="Nothing to do"
          description="Add one-time tasks above. Assign a date or leave them in your inbox."
        />
      ) : (
        <Accordion type="multiple" defaultValue={["today", "scheduled", "inbox"]}>
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  {section.label}
                  <Badge variant="secondary">{section.items.length}</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {section.items.length === 0 ? (
                  <p className="px-1 text-sm text-muted-foreground">Empty.</p>
                ) : (
                  <div className="space-y-2">
                    {section.items.map((todo) => (
                      <TodoItem key={todo.id} todo={todo} />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
