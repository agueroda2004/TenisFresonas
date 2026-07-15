import toast from "react-hot-toast";

type NotifyKind = "success" | "error" | "loading" | "info";

interface NotifyOptions {
  success?: boolean;
  error?: boolean;
  loading?: boolean;
  info?: boolean;
  message: string;
  duration?: number;
}

function resolveKind(options: NotifyOptions): NotifyKind {
  if (options.success) return "success";
  if (options.error) return "error";
  if (options.loading) return "loading";
  if (options.info) return "info";
  return "info";
}

export function notify(options: NotifyOptions): string {
  const kind = resolveKind(options);
  const duration = options.duration ?? 4000;

  switch (kind) {
    case "success":
      return toast.success(options.message, { duration });
    case "error":
      return toast.error(options.message, { duration });
    case "loading":
      return toast.loading(options.message, { duration: duration || Infinity });
    case "info":
    default:
      return toast(options.message, { duration });
  }
}

export const notifySuccess = (message: string, duration?: number) =>
  notify({ success: true, message, duration });

export const notifyError = (message: string, duration?: number) =>
  notify({ error: true, message, duration });

export const notifyInfo = (message: string, duration?: number) =>
  notify({ info: true, message, duration });

export const notifyPromise = <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
): Promise<T> =>
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });

export function dismissNotify(id?: string) {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}