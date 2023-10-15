/* eslint-disable @typescript-eslint/ban-ts-comment */
import { InputFile } from "@/components/InputFile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
import { WorkBook, WorkSheet, read, utils, writeFileXLSX } from "xlsx-js-style";
import { ZodIssue, z } from "zod";

type DataSet = { [index: string]: WorkSheet };
// this will store the raw data objects
let userData: UserType[] = [];

let billData: BillType[] = [];

let jobData: JobType[] = [];

// this will store the header names
let header: string[] = [];

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  salary: z.number({
    invalid_type_error: "salary must be a number",
  }),
});

const billSchema = z.object({
  name: z.string(),
  bill: z.number(),
  share: z.number().max(2, { message: "number needs to be smaller" }),
});

const jobSchema = z.object({
  name: z.string(),
  job: z.string(),
  experience: z.number().min(2, { message: "minimum 2 years experience" }),
});

type UserType = z.infer<typeof userSchema>;
type BillType = z.infer<typeof billSchema>;
type JobType = z.infer<typeof jobSchema>;

export function GlideDataGrid() {
  const [cols, setCols] = useState<GridColumn[]>([]); // gdg column objects
  const [rows, setRows] = useState<number>(0); // number of rows
  const [userErrors, setUserErrors] = useState<(ZodIssue | undefined)[][]>([]);
  const ref = useRef<DataEditorRef>(null); // gdg ref

  const [workBook, setWorkBook] = useState<DataSet>({} as DataSet); // workbook
  const [sheets, setSheets] = useState<string[]>([]); // list of sheet names
  const [current, setCurrent] = useState<string>(""); // selected sheet

  const { toast } = useToast();

  const theme = useTheme();

  const invalidTheme: Theme = { ...theme, bgCell: "red" };

  // read/write between gdg and the backing data store
  const getUserContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = userData[row];
      const indexes: (keyof UserType)[] = ["name", "age", "email", "salary"];

      const dataErrors = userErrors[row]?.filter(
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
    [userErrors]
  );

  const getBillContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = billData[row];
      const indexes: (keyof BillType)[] = ["name", "bill", "share"];

      const dataErrors = userErrors[row]?.filter(
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
          displayData: String(dataRow.bill ?? ""),
          themeOverride: dataErrors?.find((err) => err?.path[0] === "bill")
            ? invalidTheme
            : theme,
          data: dataRow.bill,
        };
      }

      return {
        kind: GridCellKind.Number,
        allowOverlay: true,
        readonly: false,
        displayData: String(dataRow.share ?? ""),
        themeOverride: dataErrors?.find((err) => err?.path[0] === "share")
          ? invalidTheme
          : theme,
        data: dataRow.share,
      };
    },
    [userErrors]
  );

  const getJobContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = jobData[row];
      const indexes: (keyof JobType)[] = ["name", "job", "experience"];

      const dataErrors = userErrors[row]?.filter(
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
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: String(dataRow.job ?? ""),
          themeOverride: dataErrors?.find((err) => err?.path[0] === "job")
            ? invalidTheme
            : theme,
          data: dataRow.job,
        };
      }

      return {
        kind: GridCellKind.Number,
        allowOverlay: true,
        readonly: false,
        displayData: String(dataRow.experience ?? ""),
        themeOverride: dataErrors?.find((err) => err?.path[0] === "experience")
          ? invalidTheme
          : theme,
        data: dataRow.experience,
      };
    },
    [userErrors]
  );

  // const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
  //   setErrors([]);
  //   const [col, row] = cell;
  //   const indexes: (keyof ExcelType)[] = ["name", "age", "email", "salary"];
  //   //@ts-ignore
  //   data[row][indexes[col]] = newValue.data;
  //   validateData();
  // }, []);

  function selectSheet(name: string) {
    /* update workbook cache in case the current worksheet was changed */
    // workBook[current] = utils.aoa_to_sheet(arrayify(rows));

    const sheet = workBook[name];

    // getUserColRows(sheet);

    // /* get data for desired sheet and update state */
    // const { rows: new_rows, columns: new_columns } = getRowsCols(workBook, name);
    // setRows(new_rows);
    // setColumns(new_columns);
    setCurrent(name);
  }

  // update the data store from a workbook object
  const parse_wb = (wb: WorkBook) => {
    const userSheet = wb.Sheets[wb.SheetNames[0]];
    const billSheet = wb.Sheets[wb.SheetNames[1]];
    const jobSheet = wb.Sheets[wb.SheetNames[2]];

    setWorkBook(wb.Sheets);
    setSheets(wb.SheetNames);
    setCurrent(wb.SheetNames[0]);

    getColRows(userSheet);

    validateData();

    if (userData.length > 0) {
      const cells = userData
        .map((_, R) =>
          Array.from({ length: header.length }, (_, C) => ({
            cell: [C, R] as Item,
          }))
        )
        .flat();
      ref.current?.updateCells(cells);
    }
  };

  const getColRows = (sheet: WorkSheet) => {
    userData = utils.sheet_to_json<UserType>(sheet);
    const range = utils.decode_range(sheet["!ref"] ?? "A1");
    range.e.r = range.s.r;
    header = utils.sheet_to_json<string[]>(sheet, { header: 1, range })[0];
    setCols(header.map((h) => ({ title: h, id: h } as GridColumn)));
    setRows(userData.length);
  };

  // file input element onchange event handler
  const onChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files) return;
    parse_wb(read(await e.target.files[0].arrayBuffer()));
  }, []);

  function generateErrorMap() {
    const columnMap = ["A", "B", "C", "D"];

    const errorList = userErrors
      .map((row, rowIndex) =>
        row.map((error, columnIndex) => {
          const cellName = columnMap[columnIndex] + (rowIndex + 2); // Assuming rowIndex starts from 0 and Excel rows start from 1
          if (error) {
            return [cellName, error.message];
          }
          return [cellName, ""];
        })
      )
      .flat()
      .filter((item) => item[1] !== "");

    return Object.fromEntries(errorList);
  }

  // export data
  const exportXLSX = useCallback(() => {
    const errorMap = generateErrorMap();
    // generate worksheet using data with the order specified in the columns array
    const ws = utils.json_to_sheet(userData, {
      header: cols.map((c) => c.id ?? c.title),
    });

    ws["!cols"] = [{ wch: 13 }, { wch: 13 }, { wch: 20 }, { wch: 13 }];

    for (const row in ws) {
      if (ws[row] && ws[row].v && errorMap[row]) {
        ws[row].s = {
          fill: { patternType: "solid", bgColor: { rgb: "FF0000" } },
        };
        if (!ws[row].c) ws[row].c = [];
        ws[row].c.hidden = true;
        ws[row].c.push({ a: "ali", t: errorMap[row] });
      }
    }

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
    const sheetErrors = userData.map((item) => {
      const result = userSchema.safeParse(item);
      if (!result.success) {
        const dat = Object.keys(item).map((key) =>
          result.error.errors.find((err) => err.path[0] === key)
        );
        return dat;
      } else return [];
    });
    setUserErrors(sheetErrors);
  };

  return (
    <>
      <div className="flex justify-center items-center flex-col gap-8 py-10">
        {/* <input type="file" onChange={onChange} /> */}
        <InputFile onChange={onChange} />
        {/* <button onClick={exportXLSX}>
        <b>Export XLSX!</b>
      </button> */}
        {sheets.length > 0 && (
          <>
            <p>
              Use the dropdown to switch to a worksheet:&nbsp;
              <select
                onChange={async (e) => selectSheet(sheets[+e.target.value])}
              >
                {sheets.map((sheet, idx) => (
                  <option key={sheet} value={idx}>
                    {sheet}
                  </option>
                ))}
              </select>
            </p>
            <div className="flex-cont">
              <b>Current Sheet: {current}</b>
            </div>
          </>
        )}
        <div className="App">
          <DataEditor
            getCellContent={
              current === "users"
                ? getUserContent
                : current === "bills"
                ? getBillContent
                : getJobContent
            }
            columns={cols}
            rows={rows}
            // onCellEdited={onCellEdited}
            onCellClicked={(cell) => {
              const [col, row] = cell;
              const cellError = userErrors[row][col];
              if (cellError) {
                toast({
                  title: "Error",
                  description: cellError.message,
                  variant: "destructive",
                });
              }
            }}
            ref={ref}
          />
        </div>
        <Button onClick={exportXLSX}>Export</Button>

        <div id="portal"></div>
      </div>
    </>
  );
}
