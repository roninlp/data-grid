/* eslint-disable @typescript-eslint/ban-ts-comment */
import { InputFile } from "@/components/InputFile";
import { Button } from "@/components/ui/button";
import {
  DataEditor,
  DataEditorRef,
  EditableGridCell,
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
  Theme,
  useTheme,
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { WorkBook, read, utils, writeFileXLSX } from "xlsx-js-style";
import { ZodIssue, z } from "zod";

// this will store the raw data objects
let data: ExcelType[] = [];

// this will store the header names
let header: string[] = [];

const testSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  salary: z.number({
    invalid_type_error: "salary must be a number",
  }),
});

type ExcelType = z.infer<typeof testSchema>;

export function GlideDataGrid() {
  const [cols, setCols] = useState<GridColumn[]>([]); // gdg column objects
  const [rows, setRows] = useState<number>(0); // number of rows
  const [errors, setErrors] = useState<(ZodIssue | undefined)[][]>([]);
  const ref = useRef<DataEditorRef>(null); // gdg ref

  const theme = useTheme();

  const invalidTheme: Theme = { ...theme, bgCell: "red" };

  // read/write between gdg and the backing data store
  const getContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = data[row];
      const indexes: (keyof ExcelType)[] = ["name", "age", "email", "salary"];

      const dataErrors = errors[row]?.filter(
        (err) => err?.path[0] === indexes[col]
      );

      if (col === 0) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: String(dataRow.name ?? ""),
          themeOverride: dataErrors?.find((err) => err?.path[0] === "name")
            ? invalidTheme
            : theme,
          data: dataRow.name,
        };
      }
      if (col === 1) {
        return {
          kind: GridCellKind.Number,
          allowOverlay: true,
          readonly: false,
          displayData: String(dataRow.age ?? ""),
          themeOverride: dataErrors?.find((err) => err?.path[0] === "age")
            ? invalidTheme
            : theme,
          data: dataRow.age,
        };
      }
      if (col === 2) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: String(dataRow.email ?? ""),
          themeOverride: dataErrors?.find((err) => err?.path[0] === "email")
            ? invalidTheme
            : theme,
          data: dataRow.email,
        };
      }

      return {
        kind: GridCellKind.Number,
        allowOverlay: true,
        readonly: false,
        displayData: String(dataRow.salary ?? ""),
        themeOverride: dataErrors?.find((err) => err?.path[0] === "salary")
          ? invalidTheme
          : theme,
        data: dataRow.salary,
      };
    },
    [errors]
  );

  const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
    setErrors([]);
    const [col, row] = cell;
    const indexes: (keyof ExcelType)[] = ["name", "age", "email", "salary"];
    //@ts-ignore
    data[row][indexes[col]] = newValue.data;
    validateData();
  }, []);

  // update the data store from a workbook object
  const parse_wb = (wb: WorkBook) => {
    const sheet = wb.Sheets[wb.SheetNames[0]];

    data = utils.sheet_to_json<ExcelType>(sheet);
    const range = utils.decode_range(sheet["!ref"] ?? "A1");
    range.e.r = range.s.r;
    header = utils.sheet_to_json<string[]>(sheet, { header: 1, range })[0];
    setCols(header.map((h) => ({ title: h, id: h } as GridColumn)));
    setRows(data.length);

    validateData();

    if (data.length > 0) {
      const cells = data
        .map((_, R) =>
          Array.from({ length: header.length }, (_, C) => ({
            cell: [C, R] as Item,
          }))
        )
        .flat();
      ref.current?.updateCells(cells);
    }
  };

  // file input element onchange event handler
  const onChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    parse_wb(read(await e.target.files[0].arrayBuffer()));
  }, []);

  // export data
  const exportXLSX = useCallback(() => {
    // generate worksheet using data with the order specified in the columns array
    console.log(data);
    const ws = utils.json_to_sheet(data, {
      header: cols.map((c) => c.id ?? c.title),
    });

    ws["!cols"] = [
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
      { wch: 13 },
    ];

    for (const row in ws) {
      console.log(ws[row]);
      if (ws[row] && ws[row].v && typeof ws[row].v === "string") {
        ws[row].s = {
          fill: { patternType: "solid", bgColor: { rgb: "FF0000" } },
        };
        if (!ws[row].c) ws[row].c = [];
        ws[row].c.push({ a: "ali", t: "this is a comment" });
      }
    }

    console.log(ws);
    // rewrite header row with titles
    utils.sheet_add_aoa(ws, [cols.map((c) => c.title ?? c.id)], {
      origin: "A1",
    });

    // create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Export"); // replace with sheet name
    // download file
    writeFileXLSX(wb, "sheetjs-gdg.xlsx");
  }, [cols]);

  const validateData = () => {
    const sheetErrors = data.map((item) => {
      const result = testSchema.safeParse(item);
      if (!result.success) {
        const dat = Object.keys(item).map((key) =>
          result.error.errors.find((err) => err.path[0] === key)
        );
        return dat;
      } else return [];
    });
    console.log(sheetErrors);
    setErrors(sheetErrors);
  };

  return (
    <>
      <div className="flex justify-center items-center flex-col gap-8 py-10">
        {/* <input type="file" onChange={onChange} /> */}
        <InputFile onChange={onChange} />
        {/* <button onClick={exportXLSX}>
        <b>Export XLSX!</b>
      </button> */}
        <div className="App">
          <DataEditor
            getCellContent={getContent}
            columns={cols}
            rows={rows}
            onCellEdited={onCellEdited}
            ref={ref}
          />
        </div>
        <Button onClick={exportXLSX}>Export</Button>
        <div id="portal"></div>
      </div>
    </>
  );
}
