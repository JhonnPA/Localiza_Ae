export type FormMessageData = { type: "success" | "error"; text: string };

const STYLE_BY_TYPE = {
  success: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  error: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export default function FormMessage({ message }: { message: FormMessageData | null }) {
  if (!message) return null;

  return (
    <div className={`rounded-md px-3 py-2 text-sm ${STYLE_BY_TYPE[message.type]}`}>
      {message.text}
    </div>
  );
}
