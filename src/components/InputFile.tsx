import { ChangeEventHandler } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function InputFile({
  onChange,
}: {
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="file">Upload File</Label>
      <Input id="file" type="file" onChange={onChange} />
    </div>
  );
}
