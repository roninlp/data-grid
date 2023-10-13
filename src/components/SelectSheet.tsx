import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function SelectSheet({
  sheets,
  selectSheet,
}: {
  sheets: string[];
  selectSheet: (value: string) => void;
}) {
  return (
    <Select onValueChange={selectSheet}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a Sheet" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sheets</SelectLabel>
          {sheets.length > 0
            ? sheets.map((sheet) => (
                <SelectItem key={sheet} value={sheet}>
                  {sheet}
                </SelectItem>
              ))
            : null}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
