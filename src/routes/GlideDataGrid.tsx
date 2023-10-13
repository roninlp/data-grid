/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//   DataEditor,
//   DataEditorRef,
//   GridCell,
//   GridCellKind,
//   GridColumn,
//   Item,
// } from "@glideapps/glide-data-grid";
// import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
// import { WorkBook, WorkSheet, read, utils, writeFileXLSX } from "xlsx-js-style";

// import { InputFile } from "@/components/InputFile";
// import { SelectSheet } from "@/components/SelectSheet";
// import { Button } from "@/components/ui/button";
// import "react-data-grid/lib/styles.css";

// type DataSet = { [index: string]: WorkSheet };

// let header: string[] = [];

// export function GlideDataGrid() {
//   const [cols, setCols] = useState<GridColumn[]>([]);
//   const [rows, setRows] = useState<number>(0);
//   const [workBook, setWorkBook] = useState<DataSet>({} as DataSet);
//   const [sheets, setSheets] = useState<string[]>([]);
//   const [currentSheet, setCurrentSheet] = useState<string>("");

//   const ref = useRef<DataEditorRef>(null); // gdg ref

//   /* called when sheet dropdown is changed */
//   function selectSheet(name: string) {
//     /* update workbook cache in case the current worksheet was changed */
//     console.log(workBook[name]);

//     getRowCols(name);
//     setCurrentSheet(name);
//   }

//   function getRowCols(sheetName: string) {
//     const sheet = workBook[sheetName];
//     data = utils.sheet_to_json(sheet);

//     const range = utils.decode_range(sheet["!ref"] ?? "A1");
//     range.e.r = range.s.r;
//     header = utils.sheet_to_json<string[]>(sheet, { header: 1, range })[0];

//     setCols(header.map((h) => ({ title: h, id: h } as GridColumn)));
//     setRows(data.length);

//     if (data.length > 0) {
//       const cells = data
//         .map((_, R) =>
//           Array.from({ length: header.length }, (_, C) => ({
//             cell: [C, R] as Item,
//           }))
//         )
//         .flat();
//       ref.current?.updateCells(cells);
//     }
//   }

//   /* this method handles refreshing the state with new workbook data */
//   async function handleAB(file: ArrayBuffer): Promise<void> {
//     /* read file data */
//     const wb = read(file);

//     setWorkBook(wb.Sheets);
//     setSheets(wb.SheetNames);

//     const name = wb.SheetNames[0];
//     getRowCols(name);
//   }

//   const onChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;
//     const file = await e.target.files[0].arrayBuffer();
//     if (file) await handleAB(file);
//   }, []);

//   /* when page is loaded, fetch and processs worksheet */
//   useEffect(() => {
//     (async () => {
//       const f = await fetch("https://sheetjs.com/pres.numbers");
//       await handleAB(await f.arrayBuffer());
//     })();
//   }, []);

//   // const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
//   //   const [col, row] = cell;
//   //   const dataRow = data[row];
//   //   const indexes: (keyof ExcelType)[] = ["name", "age", "email", "salary"];
//   //   const d = dataRow[indexes[col]];

//   //   dataRow[indexes[col]] = newValue.data;
//   // }, []);

//   const exportXLSX = useCallback(() => {
//     // generate worksheet using data with the order specified in the columns array
//     const ws = utils.json_to_sheet(data, {
//       header: cols.map((c) => c.id ?? c.title),
//     });
//     // rewrite header row with titles
//     utils.sheet_add_aoa(ws, [cols.map((c) => c.title ?? c.id)], {
//       origin: "A1",
//     });
//     // create workbook
//     const wb = utils.book_new();
//     utils.book_append_sheet(wb, ws, "Export"); // replace with sheet name
//     // download file
//     writeFileXLSX(wb, "sheetjs-gdg.xlsx");
//   }, []);

//   const getContent = useCallback((cell: Item): GridCell => {
//     const [col, row] = cell;
//     const dataRow = data[row];
//     const indexes: (keyof ExcelType)[] = ["name", "age", "email", "salary"];
//     const d = dataRow[indexes[col]];

//     if (indexes[col] === "name") {
//       return {
//         kind: GridCellKind.Text,
//         allowOverlay: false,
//         displayData: String(d ?? ""),
//         data: String(d),
//       };
//     } else if (indexes[col] === "age") {
//       return {
//         kind: GridCellKind.Number,
//         allowOverlay: false,
//         displayData: String(d ?? ""),
//         data: Number(d),
//       };
//     } else if (indexes[col] === "salary") {
//       return {
//         kind: GridCellKind.Number,
//         allowOverlay: false,
//         displayData: String(d ?? ""),
//         data: Number(d),
//       };
//     } else {
//       return {
//         kind: GridCellKind.Text,
//         allowOverlay: false,
//         displayData: String(d ?? ""),
//         data: String(d),
//       };
//     }
//   }, []);

//   const update_backing_store = (wb: WorkBook) => {
//     // get first worksheet
//     const sheet = wb.Sheets[wb.SheetNames[0]];

//     // set data
//     data = utils.sheet_to_json(sheet);

//     const range = utils.decode_range(sheet["!ref"] ?? "A1");
//     range.e.r = range.s.r;

//     header = utils.sheet_to_json<string[]>(sheet, { header: 1, range })[0];
//   };

//   return (
//     <>
//       <InputFile onChange={onChange} />
//       <SelectSheet selectSheet={selectSheet} sheets={sheets} />
//       <DataEditor
//         getCellContent={getContent}
//         columns={cols}
//         rows={rows}
//         ref={ref}
//       />
//       <Button onClick={exportXLSX}>Export xlsx</Button>
//       <div id="portal"></div>
//     </>
//   );
// }

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
} from "@glideapps/glide-data-grid";
import "@glideapps/glide-data-grid/dist/index.css";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { WorkBook, read, utils, writeFileXLSX } from "xlsx-js-style";
import { z } from "zod";

// this will store the raw data objects
let data: ExcelType[] = [];
let validatedData: any[] = [];
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

type ExcelType = {
  name: string;
  age: number;
  email: string;
  salary: number;
};

// type ValidatedType = {
//   name: {}
// }

// let data: ExcelType[] = [];

export function GlideDataGrid() {
  const [cols, setCols] = useState<GridColumn[]>([]); // gdg column objects
  const [rows, setRows] = useState<number>(0); // number of rows
  const ref = useRef<DataEditorRef>(null); // gdg ref

  // read/write between gdg and the backing data store
  const getContent = useCallback((cell: Item): GridCell => {
    const [col, row] = cell;
    const dataRow = data[row];
    // console.log(dataRow);
    const indexes: (keyof ExcelType)[] = ["name", "age", "email", "salary"];
    const d = dataRow[indexes[col]];
    // console.log(d);
    let errorMessages: { col: string; message: string }[] = [];

    // if (dataRow.errors) {
    //   errorMessages = dataRow.errors.map(
    //     (err: { path: string[]; message: string }) => ({
    //       col: err.path[0],
    //       message: err.message,
    //     })
    //   );
    // }

    if (col === 0) {
      const error = errorMessages.find((error) => error.col === "name");
      let style: "faded" | "normal";
      if (error) {
        style = "faded";
      } else style = "normal";

      return {
        kind: GridCellKind.Text,
        allowOverlay: true,
        readonly: false,
        style: style,
        displayData: String(d ?? ""),
        data: String(d),
      };
    }
    if (col === 1) {
      const error = errorMessages.find((error) => error.col === "age");
      let style: "faded" | "normal";
      if (error) {
        style = "faded";
      } else style = "normal";

      return {
        kind: GridCellKind.Number,
        allowOverlay: true,
        readonly: false,
        style: style,
        displayData: String(d ?? ""),
        data: Number(d),
      };
    }
    if (col === 2) {
      const error = errorMessages.find((error) => error.col === "email");
      let style: "faded" | "normal";
      if (error) {
        style = "faded";
      } else style = "normal";

      return {
        kind: GridCellKind.Text,
        allowOverlay: true,
        readonly: false,
        style: style,
        displayData: String(d ?? ""),
        data: String(d),
      };
    }

    const error = errorMessages.find((error) => error.col === "salary");
    let style: "faded" | "normal";
    if (error) {
      style = "faded";
    } else style = "normal";

    return {
      kind: GridCellKind.Number,
      allowOverlay: true,
      readonly: false,
      style: style,
      displayData: String(d ?? ""),
      data: Number(d),
    };
  }, []);

  const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
    const [col, row] = cell;
    data[row][header[col]] = newValue.data;
  }, []);

  // update the data store from a workbook object
  const parse_wb = (wb: WorkBook) => {
    const sheet = wb.Sheets[wb.SheetNames[0]];

    data = utils.sheet_to_json<any>(sheet);
    const range = utils.decode_range(sheet["!ref"] ?? "A1");
    range.e.r = range.s.r;
    header = utils.sheet_to_json<string[]>(sheet, { header: 1, range })[0];
    setCols(header.map((h) => ({ title: h, id: h } as GridColumn)));
    setRows(data.length);

    validatedData = data.map((row) => {
      const result = testSchema.safeParse(row);
      if (!result.success) {
        const errors = result.error.errors;

        let validRow = {};
        validRow = Object.keys(row).map((key) => {
          console.log(validRow);
          return {
            [key]: {
              title: key,
              errors: errors
                .filter((err) => err.path.filter((er) => er === key))
                .map((item) => item.message),
            },
          };
        });
        // console.log(validRow);
        return validRow;
        // result.error.errors.forEach((err) => {
        //   console.log(row, err.message);
        // });
      } else {
        return row;
      }
    });

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

  // when the component loads, fetch and display a sample workbook
  useEffect(() => {
    (async () => {
      parse_wb(
        read(
          await (await fetch("https://sheetjs.com/pres.numbers")).arrayBuffer()
        )
      );
    })();
  }, []);

  // export data
  const exportXLSX = useCallback(() => {
    // generate worksheet using data with the order specified in the columns array
    const ws = utils.json_to_sheet(data, {
      header: cols.map((c) => c.id ?? c.title),
    });
    // rewrite header row with titles
    utils.sheet_add_aoa(ws, [cols.map((c) => c.title ?? c.id)], {
      origin: "A1",
    });
    // create workbook
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Export"); // replace with sheet name
    // download file
    writeFileXLSX(wb, "sheetjs-gdg.xlsx");
  }, []);

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
