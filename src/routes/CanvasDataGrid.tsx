import "canvas-datagrid";
import { useEffect, useRef, useState } from "react";

function CanvasDatagridWrapper({ onCellMouseOver, data }) {
  const gridRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.style.width = "1000px";
      // gridRef.current.style.height = "400px";

      gridRef.current.data = data;

      if (onCellMouseOver) {
        gridRef.current.addEventListener("cellmouseover", onCellMouseOver);
      }
    }

    return () => {
      gridRef.current?.removeEventListener("cellmouseover", onCellMouseOver);
    };
  }, []);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.data = data;
    }
  }, [data]);

  return <canvas-datagrid ref={gridRef} />;
}

export function CanvasDataGrid() {
  const [cell, setCell] = useState(null);

  const [data, setData] = useState([
    { a: 123, b: 2, c: "Foo" },
    { a: 456, b: 4, c: "Bar" },
    { a: 789, b: 6, c: "Baz" },
    { a: 100, b: 8, c: "Quux" },
  ]);

  const handleAddRow = () =>
    setData((data) =>
      data.concat({ a: data[data.length - 1].a + 1, b: 2, c: "a" })
    );

  return (
    <>
      <CanvasDatagridWrapper
        data={data}
        onCellMouseOver={(ctx) => setCell(ctx.cell)}
      />
      <div>
        {cell ? (
          <>
            Cell: {cell.rowIndex}x{cell.columnIndex}
          </>
        ) : null}
      </div>
      <div>
        <button onClick={handleAddRow}>Add row</button>
      </div>
    </>
  );
}
