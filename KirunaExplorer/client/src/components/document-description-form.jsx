import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

const DocumentDescriptionForm = () => {
  const form = useForm({
    defaultValues: {
      document: "",
      description: "",
    },
  });

  const desc = {
    required: "A description is required",
    minLength: {
      value: 2,
      message: "Description must be at least 2 characters",
    },
    maxLength: {
      value: 200,
      message: "Description must be less than 200 characters",
    },
  };

  const doc = {
    required: "You have to select a document",
  };

  const onSubmit = (values) => {
    console.log(values);
    toast.success("Added document description", {
      description: "",
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });

    form.reset();
  };

  return (
    <div>
      <Card className="min-w-[280px] max-w-[600px]">
        <CardHeader>
          <CardTitle>Add document description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4">
            Here you can add a document description to the relating document.
            Choose the document from the dropdown menu and add you description
            in the text field.
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="document"
                rules={doc}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a document" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Exampled document #1">
                            Example document #1
                          </SelectItem>
                          <SelectItem value="Exampled document #2">
                            Example document #2
                          </SelectItem>
                          <SelectItem value="Exampled document #3">
                            Example document #3
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                rules={desc}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your document description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Add document</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default DocumentDescriptionForm;
