import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

/** Error message under a field, with an icon so it doesn't rely on colour alone. */
export default function FieldError({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <span className="el-pay__error" id={id}>
      <CircleAlert aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}
